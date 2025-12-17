import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';
import { emailService } from '../services/emailService';
import redis from '../lib/redis';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const SALT_ROUNDS = 12;

// OTP data interface
interface OTPData {
  otp: string;
  type: 'registration' | 'password_reset';
  registrationData?: {
    name: string;
    email: string;
    password: string;
    phone?: string;
  };
}

// Redis key prefix for OTPs
const OTP_KEY_PREFIX = 'otp:';
const OTP_TTL_SECONDS = 10 * 60; // 10 minutes

// Generate OTP
const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Store OTP in Redis with expiration (10 minutes)
const storeOTP = async (
  email: string,
  otp: string,
  type: 'registration' | 'password_reset' = 'registration',
  registrationData?: any
): Promise<void> => {
  const key = `${OTP_KEY_PREFIX}${email}`;
  const data: OTPData = {
    otp,
    type,
    ...(registrationData && { registrationData })
  };

  try {
    // Store in Redis with TTL (Time To Live) - auto-expires after 10 minutes
    await redis.setex(key, OTP_TTL_SECONDS, JSON.stringify(data));
  } catch (error) {
    console.error('Error storing OTP in Redis:', error);
    throw error;
  }
};

// Get OTP data from Redis
const getOTPData = async (email: string): Promise<OTPData | null> => {
  const key = `${OTP_KEY_PREFIX}${email}`;

  try {
    const data = await redis.get(key);
    if (!data) {
      return null;
    }
    return JSON.parse(data) as OTPData;
  } catch (error) {
    console.error('Error getting OTP from Redis:', error);
    return null;
  }
};

// Delete OTP from Redis (used after successful verification)
const deleteOTP = async (email: string): Promise<void> => {
  const key = `${OTP_KEY_PREFIX}${email}`;

  try {
    await redis.del(key);
  } catch (error) {
    console.error('Error deleting OTP from Redis:', error);
    // Don't throw - OTP will expire anyway
  }
};

const sendEmailOTP = async (email: string, otp: string, type: 'registration' | 'password_reset' = 'registration') => {
  try {
    await emailService.sendOTP(email, otp, type);
  } catch (error) {
    console.error('Failed to send OTP email:', error);
    throw error;
  }
};

/**
 * Register user and send OTP
 */
export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, phone, password } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required'
      });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // Generate OTP
    const otp = generateOTP();

    // Store OTP with registration data in Redis (don't create user yet)
    await storeOTP(email, otp, 'registration', {
      name,
      email,
      password: hashedPassword,
      phone: phone || undefined
    });
    
    // Send OTP via email (fire and forget - don't block the response)
    sendEmailOTP(email, otp, 'registration').catch(error => {
      console.error('Background OTP email sending failed:', error);
      // Log OTP in console for development/testing
      console.log(`📧 OTP for ${email}: ${otp}`);
    });

    return res.status(200).json({
      success: true,
      message: 'OTP sent to your email. Please verify to complete registration.',
      data: {
        email
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Verify OTP and complete registration
 */
export const verifyOTP = async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Email and OTP are required'
      });
    }

    // Validate OTP format
    if (otp.length !== 6 || !/^\d+$/.test(otp)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP format'
      });
    }

    // Get OTP data from Redis (auto-expires after TTL)
    const storedData = await getOTPData(email);
    
    if (!storedData) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP. Please request a new one.'
      });
    }

    // Verify OTP matches
    if (storedData.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP'
      });
    }

    // OTP is valid, delete it from Redis (consume it)
    await deleteOTP(email);

    // If it's a registration, create the user now
    let user;
    if (storedData.type === 'registration' && storedData.registrationData) {
      user = await prisma.user.create({
        data: {
          name: storedData.registrationData.name,
          email: storedData.registrationData.email,
          password: storedData.registrationData.password,
          ...(storedData.registrationData.phone && { phone: storedData.registrationData.phone }),
          role: 'USER',
          isVerified: true
        },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          isVerified: true
        }
      });
    } else {
      // For existing users, just verify them
      user = await prisma.user.findUnique({
        where: { email }
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      if (user.isVerified) {
        await deleteOTP(email);
        return res.status(400).json({
          success: false,
          message: 'User already verified'
        });
      }

      await prisma.user.update({
        where: { id: user.id },
        data: { isVerified: true }
      });

      user.isVerified = true;
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      success: true,
      message: 'Email verified successfully',
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          isVerified: user.isVerified
        }
      }
    });

  } catch (error) {
    console.error('OTP verification error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Request login OTP
 */
export const requestLoginOTP = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      // Don't reveal if user exists
      return res.json({
        success: true,
        message: 'If user exists, login OTP has been sent'
      });
    }

    if (!user.isVerified) {
      return res.status(401).json({
        success: false,
        message: 'Please verify your email first'
      });
    }

    const otp = generateOTP();
    await storeOTP(email, otp, 'registration'); // Reuse registration OTP type
    sendEmailOTP(email, otp, 'registration').catch(error => {
      console.error('Background OTP email sending failed:', error);
      // Log OTP in console for development/testing
      console.log(`📧 Login OTP for ${email}: ${otp}`);
    });

    return res.json({
      success: true,
      message: 'Login OTP sent'
    });

  } catch (error) {
    console.error('Login OTP request error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Login user
 */
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    if (!user.isVerified) {
      return res.status(401).json({
        success: false,
        message: 'Please verify your email first'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          isVerified: user.isVerified
        }
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Get current user profile
 */
export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        isVerified: true,
        avatar: true,
        createdAt: true
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    return res.json({
      success: true,
      message: 'Profile retrieved successfully',
      data: { user }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Update user profile
 */
export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const { name, phone } = req.body;

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        ...(name && { name }),
        ...(phone && { phone })
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        isVerified: true,
        avatar: true
      }
    });

    return res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { user }
    });

  } catch (error) {
    console.error('Update profile error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Request password reset OTP
 */
export const requestPasswordReset = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      // Don't reveal if user exists
      return res.json({
        success: true,
        message: 'If user exists, password reset OTP has been sent'
      });
    }

    const otp = generateOTP();
    await storeOTP(email, otp, 'password_reset');
    sendEmailOTP(email, otp, 'password_reset').catch(error => {
      console.error('Background OTP email sending failed:', error);
      // Log OTP in console for development/testing
      console.log(`📧 Password Reset OTP for ${email}: ${otp}`);
    });

    return res.json({
      success: true,
      message: 'Password reset OTP sent'
    });

  } catch (error) {
    console.error('Password reset request error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Reset password with OTP
 */
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Email, OTP, and new password are required'
      });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Validate OTP format
    if (otp.length !== 6 || !/^\d+$/.test(otp)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP format'
      });
    }

    // Verify OTP from Redis
    const storedData = await getOTPData(email);
    
    if (!storedData || storedData.type !== 'password_reset') {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP. Please request a new one.'
      });
    }

    if (storedData.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP'
      });
    }

    // OTP is valid, delete it from Redis and update password
    await deleteOTP(email);

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);

    // Update user password
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword }
    });

    return res.json({
      success: true,
      message: 'Password reset successfully'
    });

  } catch (error) {
    console.error('Password reset error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
