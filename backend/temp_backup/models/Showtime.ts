import mongoose, { Schema } from 'mongoose';
import { IShowtime } from '../types';

const showtimeSchema = new Schema<IShowtime>({
  movie_id: {
    type: Schema.Types.ObjectId,
    ref: 'Movie',
    required: [true, 'Movie ID is required'],
  },
  theater: {
    type: String,
    required: [true, 'Theater name is required'],
    trim: true,
    maxlength: [100, 'Theater name cannot be more than 100 characters'],
  },
  theater_ne: {
    type: String,
    required: [true, 'Theater name in Nepali is required'],
    trim: true,
    maxlength: [100, 'Nepali theater name cannot be more than 100 characters'],
  },
  show_date: {
    type: Date,
    required: [true, 'Show date is required'],
    validate: {
      validator: function (value: Date) {
        return value >= new Date(new Date().setHours(0, 0, 0, 0));
      },
      message: 'Show date must be today or in the future',
    },
  },
  show_time: {
    type: String,
    required: [true, 'Show time is required'],
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please provide a valid time format (HH:MM)'],
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative'],
  },
  total_seats: {
    type: Number,
    required: [true, 'Total seats is required'],
    min: [1, 'Total seats must be at least 1'],
  },
  available_seats: {
    type: Number,
    required: [true, 'Available seats is required'],
    min: [0, 'Available seats cannot be negative'],
    validate: {
      validator: function (value: number) {
        return value <= this.total_seats;
      },
      message: 'Available seats cannot exceed total seats',
    },
  },
  is_active: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

// Index for better query performance
showtimeSchema.index({ movie_id: 1, show_date: 1, is_active: 1 });
showtimeSchema.index({ show_date: 1, show_time: 1 });

export default mongoose.model<IShowtime>('Showtime', showtimeSchema);
