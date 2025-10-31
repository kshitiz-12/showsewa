import mongoose, { Schema } from 'mongoose';
import { IBooking } from '../types';

const bookingSchema = new Schema<IBooking>({
  booking_type: {
    type: String,
    required: [true, 'Booking type is required'],
    enum: ['event', 'movie'],
  },
  item_id: {
    type: Schema.Types.ObjectId,
    required: [true, 'Item ID is required'],
    refPath: 'booking_type',
  } as any,
  showtime_id: {
    type: Schema.Types.ObjectId,
    ref: 'Showtime',
    required: function() {
      return this.booking_type === 'movie';
    },
  },
  user_id: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
  } as any,
  customer_name: {
    type: String,
    required: [true, 'Customer name is required'],
    trim: true,
    maxlength: [100, 'Customer name cannot be more than 100 characters'],
  },
  customer_email: {
    type: String,
    required: [true, 'Customer email is required'],
    lowercase: true,
    trim: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email',
    ],
  },
  customer_phone: {
    type: String,
    required: [true, 'Customer phone is required'],
    trim: true,
    match: [/^[0-9+\-\s()]+$/, 'Please provide a valid phone number'],
  },
  seats: [{
    type: String,
    required: [true, 'Seats are required'],
  }],
  total_amount: {
    type: Number,
    required: [true, 'Total amount is required'],
    min: [0, 'Total amount cannot be negative'],
  },
  payment_method: {
    type: String,
    required: [true, 'Payment method is required'],
    enum: ['esewa', 'khalti', 'stripe', 'cash'],
  },
  payment_status: {
    type: String,
    required: [true, 'Payment status is required'],
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending',
  },
  booking_status: {
    type: String,
    required: [true, 'Booking status is required'],
    enum: ['pending', 'confirmed', 'cancelled'],
    default: 'pending',
  },
  transaction_id: {
    type: String,
    trim: true,
  },
  booking_reference: {
    type: String,
    required: [true, 'Booking reference is required'],
    unique: true,
    uppercase: true,
  },
}, {
  timestamps: true,
});

// Generate booking reference before saving
bookingSchema.pre('save', async function (next) {
  if (!this.booking_reference) {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    this.booking_reference = `SS${timestamp}${random}`.toUpperCase();
  }
  next();
});

// Index for better query performance
bookingSchema.index({ user_id: 1, createdAt: -1 });
bookingSchema.index({ booking_reference: 1 });
bookingSchema.index({ payment_status: 1, booking_status: 1 });
bookingSchema.index({ item_id: 1, booking_type: 1 });

export default mongoose.model<IBooking>('Booking', bookingSchema);
