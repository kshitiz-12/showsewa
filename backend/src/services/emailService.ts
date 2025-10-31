import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

interface BookingEmailData {
  bookingReference: string;
  customerName: string;
  customerEmail: string;
  movieTitle: string;
  theaterName: string;
  showDate: string;
  showTime: string;
  seats: string[];
  totalAmount: number;
  qrCode?: string;
}

class EmailService {
  private readonly transporter: nodemailer.Transporter;

  constructor() {
    // Configure email transporter
    // In production, use real SMTP settings
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: Number.parseInt(process.env.SMTP_PORT || '587'),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER || 'your-email@gmail.com',
        pass: process.env.SMTP_PASS || 'your-app-password'
      }
    });
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      // Always try to send emails, but log in development
      if (process.env.NODE_ENV === 'development') {
        console.log('📧 SENDING EMAIL:');
        console.log('To:', options.to);
        console.log('Subject:', options.subject);
        console.log('From:', process.env.SMTP_USER);
      }

      const info = await this.transporter.sendMail({
        from: `"ShowSewa" <${process.env.SMTP_USER}>`,
        ...options
      });

      console.log('✅ Email sent successfully:', info.messageId);
      console.log('📧 Email delivered to:', options.to);
      return true;
    } catch (error) {
      console.error('❌ Email sending failed:', error);
      console.error('📧 Failed to send to:', options.to);
      console.error('📧 Subject was:', options.subject);
      return false;
    }
  }

  async sendBookingConfirmation(data: BookingEmailData): Promise<boolean> {
    const html = this.generateBookingConfirmationHTML(data);
    const text = this.generateBookingConfirmationText(data);

    console.log('🎬 Sending booking confirmation email for:', data.movieTitle);
    console.log('📧 Customer:', data.customerName, '<' + data.customerEmail + '>');
    console.log('🎫 Booking Reference:', data.bookingReference);

    const result = await this.sendEmail({
      to: `${data.customerName} <${data.customerEmail}>`,
      subject: `🎬 Booking Confirmed - ${data.movieTitle} | ShowSewa`,
      html,
      text
    });

    if (result) {
      console.log('✅ Booking confirmation email sent successfully!');
    } else {
      console.log('❌ Failed to send booking confirmation email');
    }

    return result;
  }

  async sendBookingReminder(data: BookingEmailData & { reminderHours: number }): Promise<boolean> {
    const html = this.generateBookingReminderHTML(data);
    const text = this.generateBookingReminderText(data);

    return this.sendEmail({
      to: `${data.customerName} <${data.customerEmail}>`,
      subject: `Reminder: Your movie booking in ${data.reminderHours} hours - ${data.movieTitle}`,
      html,
      text
    });
  }

  async sendOTP(email: string, otp: string, type: 'registration' | 'password_reset' = 'registration'): Promise<boolean> {
    const html = this.generateOTPHTML(otp, type);
    const text = this.generateOTPText(otp, type);

    return this.sendEmail({
      to: email,
      subject: type === 'registration' ? 'Verify your ShowSewa account' : 'Reset your ShowSewa password',
      html,
      text
    });
  }

  private generateBookingConfirmationHTML(data: BookingEmailData): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Booking Confirmation - ShowSewa</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #dc2626, #b91c1c); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .booking-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626; }
        .seats { background: #f0f9ff; padding: 15px; border-radius: 5px; margin: 10px 0; }
        .qr-code { text-align: center; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        .amount { font-size: 24px; font-weight: bold; color: #059669; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎬 Booking Confirmed!</h1>
            <p>Your movie tickets are ready</p>
        </div>
        
        <div class="content">
            <h2>Hello ${data.customerName}!</h2>
            <p>Great news! Your booking has been confirmed. Here are your ticket details:</p>
            
            <div class="booking-details">
                <h3>📝 Booking Reference: <strong>${data.bookingReference}</strong></h3>
                
                <p><strong>🎭 Movie:</strong> ${data.movieTitle}</p>
                <p><strong>🏢 Theater:</strong> ${data.theaterName}</p>
                <p><strong>📅 Date:</strong> ${data.showDate}</p>
                <p><strong>🕐 Time:</strong> ${data.showTime}</p>
                
                <div class="seats">
                    <p><strong>💺 Seats:</strong> ${data.seats.join(', ')}</p>
                </div>
                
                <p class="amount">💰 Total Amount: ₹${data.totalAmount}</p>
            </div>
            
            ${data.qrCode ? `
            <div class="qr-code">
                <p><strong>📱 Show this QR code at the theater:</strong></p>
                <img src="${data.qrCode}" alt="Booking QR Code" style="max-width: 200px;">
            </div>
            ` : ''}
            
            <div style="background: #fef3cd; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #f59e0b;">
                <p><strong>⏰ Important Reminders:</strong></p>
                <ul>
                    <li>Please arrive at least 15 minutes before showtime</li>
                    <li>Bring a valid ID for verification</li>
                    <li>Keep this email handy for reference</li>
                </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="https://showsewa.com" style="background: #dc2626; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                    Visit ShowSewa
                </a>
            </div>
        </div>
        
        <div class="footer">
            <p>Thank you for choosing ShowSewa! 🎬</p>
            <p>If you have any questions, contact us at support@showsewa.com</p>
        </div>
    </div>
</body>
</html>`;
  }

  private generateBookingConfirmationText(data: BookingEmailData): string {
    return `
Booking Confirmed - ${data.movieTitle}

Hello ${data.customerName}!

Your booking has been confirmed. Here are your ticket details:

Booking Reference: ${data.bookingReference}
Movie: ${data.movieTitle}
Theater: ${data.theaterName}
Date: ${data.showDate}
Time: ${data.showTime}
Seats: ${data.seats.join(', ')}
Total Amount: ₹${data.totalAmount}

Important Reminders:
- Please arrive at least 15 minutes before showtime
- Bring a valid ID for verification
- Keep this email handy for reference

Thank you for choosing ShowSewa!
If you have any questions, contact us at support@showsewa.com
    `;
  }

  private generateBookingReminderHTML(data: BookingEmailData & { reminderHours: number }): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Movie Reminder - ShowSewa</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .booking-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6; }
        .reminder { background: #fef3cd; padding: 15px; border-radius: 5px; margin: 10px 0; border-left: 4px solid #f59e0b; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>⏰ Show Time Reminder!</h1>
            <p>Your movie starts in ${data.reminderHours} hours</p>
        </div>
        
        <div class="content">
            <h2>Hello ${data.customerName}!</h2>
            <p>Don't forget! Your movie booking is coming up soon:</p>
            
            <div class="booking-details">
                <p><strong>🎭 Movie:</strong> ${data.movieTitle}</p>
                <p><strong>🏢 Theater:</strong> ${data.theaterName}</p>
                <p><strong>📅 Date:</strong> ${data.showDate}</p>
                <p><strong>🕐 Time:</strong> ${data.showTime}</p>
                <p><strong>💺 Seats:</strong> ${data.seats.join(', ')}</p>
                <p><strong>📝 Reference:</strong> ${data.bookingReference}</p>
            </div>
            
            <div class="reminder">
                <p><strong>🚗 Plan your journey:</strong> Leave early to avoid traffic and get parking!</p>
                <p><strong>📱 Bring:</strong> This email and a valid ID</p>
            </div>
        </div>
    </div>
</body>
</html>`;
  }

  private generateBookingReminderText(data: BookingEmailData & { reminderHours: number }): string {
    return `
Show Time Reminder - ${data.movieTitle}

Hello ${data.customerName}!

Don't forget! Your movie booking is coming up in ${data.reminderHours} hours:

Movie: ${data.movieTitle}
Theater: ${data.theaterName}
Date: ${data.showDate}
Time: ${data.showTime}
Seats: ${data.seats.join(', ')}
Reference: ${data.bookingReference}

Plan your journey and arrive early!
    `;
  }

  private generateOTPHTML(otp: string, type: 'registration' | 'password_reset'): string {
    const title = type === 'registration' ? 'Verify Your Account' : 'Reset Your Password';
    const message = type === 'registration' 
      ? 'Please verify your email address to complete your registration.' 
      : 'Please use this OTP to reset your password.';

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} - ShowSewa</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 500px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #dc2626, #b91c1c); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .otp-code { background: white; padding: 30px; text-align: center; border-radius: 8px; margin: 20px 0; border: 2px dashed #dc2626; }
        .otp { font-size: 36px; font-weight: bold; color: #dc2626; letter-spacing: 10px; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔐 ${title}</h1>
        </div>
        
        <div class="content">
            <p>${message}</p>
            
            <div class="otp-code">
                <p>Your verification code is:</p>
                <div class="otp">${otp}</div>
                <p><small>This code will expire in 10 minutes</small></p>
            </div>
            
            <p><strong>Note:</strong> Please do not share this code with anyone. ShowSewa will never ask for your verification code.</p>
        </div>
        
        <div class="footer">
            <p>Thank you for using ShowSewa!</p>
            <p>If you didn't request this, please ignore this email.</p>
        </div>
    </div>
</body>
</html>`;
  }

  private generateOTPText(otp: string, type: 'registration' | 'password_reset'): string {
    const message = type === 'registration' 
      ? 'Please verify your email address to complete your registration.' 
      : 'Please use this OTP to reset your password.';

    return `
${type === 'registration' ? 'Verify Your Account' : 'Reset Your Password'} - ShowSewa

${message}

Your verification code is: ${otp}

This code will expire in 10 minutes.

Note: Please do not share this code with anyone. ShowSewa will never ask for your verification code.

Thank you for using ShowSewa!
If you didn't request this, please ignore this email.
    `;
  }

  // Test email functionality
  async sendTestEmail(to: string): Promise<boolean> {
    const testData: BookingEmailData = {
      bookingReference: 'TEST-' + Date.now(),
      customerName: 'Test User',
      customerEmail: to,
      movieTitle: 'Test Movie',
      theaterName: 'Test Theater',
      showDate: new Date().toLocaleDateString(),
      showTime: '12:00 PM',
      seats: ['A1', 'A2'],
      totalAmount: 800
    };

    console.log('🧪 Sending test email to:', to);
    return this.sendBookingConfirmation(testData);
  }
}

export const emailService = new EmailService();
export default emailService;
