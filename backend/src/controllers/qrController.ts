/**
 * QR Code Controller
 * Handles QR generation, verification, and check-in
 */

import { Request, Response } from 'express';
import { generateQRCodeString, verifyQRCode, checkInBooking } from '../services/qrService';

/**
 * Generate QR code for a booking
 * GET /api/qr/generate/:bookingId
 */
export const generateQR = async (req: Request, res: Response): Promise<void> => {
  try {
    const { bookingId } = req.params;
    
    const qrString = await generateQRCodeString(bookingId);
    
    if (!qrString) {
      res.status(404).json({
        success: false,
        message: 'Booking not found or QR generation failed'
      });
      return;
    }

    res.json({
      success: true,
      data: {
        qrString,
        bookingId,
        message: 'QR code data generated successfully. Encode this string as QR image.'
      }
    });
    return;
  } catch (error) {
    console.error('Error generating QR:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate QR code'
    });
    return;
  }
};

/**
 * Verify and check in using QR code
 * POST /api/qr/verify
 * Body: { qrString: string, checkedInBy?: string }
 */
export const verifyAndCheckIn = async (req: Request, res: Response): Promise<void> => {
  try {
    const { qrString, checkedInBy } = req.body;
    
    if (!qrString) {
      res.status(400).json({
        success: false,
        message: 'QR code data required'
      });
      return;
    }

    const verification = await verifyQRCode(qrString);
    
    if (!verification.valid) {
      res.status(400).json({
        success: false,
        message: verification.error || 'Invalid QR code',
        verified: false
      });
      return;
    }

    // Check in the booking
    const checkedIn = await checkInBooking(verification.booking!.id, checkedInBy || 'staff');
    
    if (!checkedIn) {
      res.status(500).json({
        success: false,
        message: 'Failed to check in booking'
      });
      return;
    }

    res.json({
      success: true,
      verified: true,
      checkedIn: true,
      data: {
        booking: verification.booking,
        message: 'QR code verified and checked in successfully'
      }
    });
    return;
  } catch (error) {
    console.error('Error verifying QR:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify QR code'
    });
    return;
  }
};

/**
 * Verify QR code without checking in
 * POST /api/qr/verify-only
 */
export const verifyOnly = async (req: Request, res: Response): Promise<void> => {
  try {
    const { qrString } = req.body;
    
    if (!qrString) {
      res.status(400).json({
        success: false,
        message: 'QR code data required'
      });
      return;
    }

    const verification = await verifyQRCode(qrString);
    
    if (!verification.valid) {
      res.status(400).json({
        success: false,
        verified: false,
        message: verification.error || 'Invalid QR code'
      });
      return;
    }

    res.json({
      success: true,
      verified: true,
      data: {
        booking: verification.booking,
        message: 'QR code verified successfully'
      }
    });
    return;
  } catch (error) {
    console.error('Error verifying QR:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify QR code'
    });
    return;
  }
};

