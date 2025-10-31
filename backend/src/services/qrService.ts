/**
 * QR Code Service - Real QR Generation with Verification
 * Generates QR codes with encoded booking data that can be verified
 */

import crypto from 'crypto';
import prisma from '../lib/prisma';

interface QRPayload {
  bookingId: string;
  bookingReference: string;
  eventId?: string;
  showtimeId?: string;
  ticketTypeId?: string;
  quantity: number;
  seats?: string[];
  customerName: string;
  timestamp: string;
  hash: string; // Cryptographic hash for verification
}

/**
 * Generate a secure hash for QR verification
 */
function generateQRHash(data: Partial<QRPayload>, secret: string = process.env.JWT_SECRET || 'showsewa-secret'): string {
  const payload = `${data.bookingId}|${data.bookingReference}|${data.timestamp}|${secret}`;
  return crypto.createHash('sha256').update(payload).digest('hex').substring(0, 16);
}

/**
 * Generate QR code data for a booking
 * Returns structured data that can be encoded as QR
 */
export async function generateQRCode(bookingId: string): Promise<QRPayload | null> {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        event: true,
        showtime: true,
      },
    });

    if (!booking) {
      return null;
    }

    const timestamp = new Date().toISOString();
    const payload: Partial<QRPayload> = {
      bookingId: booking.id,
      bookingReference: booking.bookingReference,
      eventId: booking.eventId || undefined,
      showtimeId: booking.showtimeId || undefined,
      quantity: booking.seatCount,
      seats: booking.seats.length > 0 ? booking.seats : undefined,
      customerName: booking.customerName,
      timestamp,
    };

    const hash = generateQRHash(payload);
    const qrPayload: QRPayload = {
      ...payload,
      hash,
    } as QRPayload;

    // Store QR code data in booking
    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        qrCode: JSON.stringify(qrPayload),
      },
    });

    return qrPayload;
  } catch (error) {
    console.error('Error generating QR code:', error);
    return null;
  }
}

/**
 * Generate QR code URL/string (returns JSON string to be encoded as QR)
 * This is what gets encoded in the QR code image
 */
export async function generateQRCodeString(bookingId: string): Promise<string | null> {
  const qrData = await generateQRCode(bookingId);
  if (!qrData) return null;
  
  // Return compact JSON string for QR encoding
  return JSON.stringify(qrData);
}

/**
 * Verify QR code data
 * Validates the hash and checks if booking is valid
 */
export async function verifyQRCode(qrDataString: string): Promise<{
  valid: boolean;
  booking?: any;
  error?: string;
}> {
  try {
    const qrData: QRPayload = JSON.parse(qrDataString);
    
    // Verify hash
    const expectedHash = generateQRHash(qrData);
    if (qrData.hash !== expectedHash) {
      return { valid: false, error: 'Invalid QR code - hash verification failed' };
    }

    // Check if booking exists and is confirmed
    const booking = await prisma.booking.findUnique({
      where: { id: qrData.bookingId },
      include: {
        event: true,
        showtime: {
          include: {
            movie: true,
            screen: {
              include: {
                theater: true,
              },
            },
          },
        },
      },
    });

    if (!booking) {
      return { valid: false, error: 'Booking not found' };
    }

    // Verify booking reference matches
    if (booking.bookingReference !== qrData.bookingReference) {
      return { valid: false, error: 'Booking reference mismatch' };
    }

    // Check if booking is confirmed
    if (booking.paymentStatus !== 'COMPLETED' || booking.bookingStatus !== 'CONFIRMED') {
      return { valid: false, error: 'Booking not confirmed' };
    }

    return { valid: true, booking };
  } catch (error) {
    console.error('Error verifying QR code:', error);
    return { valid: false, error: 'Invalid QR code format' };
  }
}

/**
 * Mark booking as checked in
 */
export async function checkInBooking(bookingId: string, checkedInBy?: string): Promise<boolean> {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) return false;

    // Check if already checked in
    if (booking.checkedInAt) {
      console.log(`⚠️ Booking ${bookingId} already checked in at ${booking.checkedInAt}`);
      return false;
    }

    // Update booking with check-in timestamp
    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        checkedInAt: new Date(),
        checkedInBy: checkedInBy || 'staff',
      },
    });

    console.log(`✅ Booking ${bookingId} checked in by ${checkedInBy || 'staff'}`);
    
    return true;
  } catch (error) {
    console.error('Error checking in booking:', error);
    return false;
  }
}

