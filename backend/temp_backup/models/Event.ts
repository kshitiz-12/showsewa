import mongoose, { Schema } from 'mongoose';
import { IEvent } from '../types';

const eventSchema = new Schema<IEvent>({
  title: {
    type: String,
    required: [true, 'Event title is required'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters'],
  },
  title_ne: {
    type: String,
    required: [true, 'Event title in Nepali is required'],
    trim: true,
    maxlength: [100, 'Nepali title cannot be more than 100 characters'],
  },
  description: {
    type: String,
    required: [true, 'Event description is required'],
    trim: true,
    maxlength: [1000, 'Description cannot be more than 1000 characters'],
  },
  description_ne: {
    type: String,
    required: [true, 'Event description in Nepali is required'],
    trim: true,
    maxlength: [1000, 'Nepali description cannot be more than 1000 characters'],
  },
  category: {
    type: String,
    required: [true, 'Event category is required'],
    enum: ['concert', 'festival', 'sports', 'theater', 'other'],
  },
  image_url: {
    type: String,
    required: [true, 'Event image is required'],
  },
  venue: {
    type: String,
    required: [true, 'Venue is required'],
    trim: true,
    maxlength: [100, 'Venue name cannot be more than 100 characters'],
  },
  venue_ne: {
    type: String,
    required: [true, 'Venue in Nepali is required'],
    trim: true,
    maxlength: [100, 'Nepali venue name cannot be more than 100 characters'],
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true,
    maxlength: [200, 'Location cannot be more than 200 characters'],
  },
  location_ne: {
    type: String,
    required: [true, 'Location in Nepali is required'],
    trim: true,
    maxlength: [200, 'Nepali location cannot be more than 200 characters'],
  },
  event_date: {
    type: Date,
    required: [true, 'Event start date is required'],
  },
  end_date: {
    type: Date,
    required: [true, 'Event end date is required'],
    validate: {
      validator: function (value: Date) {
        return value >= this.event_date;
      },
      message: 'Event end date must be after or equal to start date',
    },
  },
  status: {
    type: String,
    enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
    default: 'upcoming',
  },
  price_min: {
    type: Number,
    required: [true, 'Minimum price is required'],
    min: [0, 'Price cannot be negative'],
  },
  price_max: {
    type: Number,
    required: [true, 'Maximum price is required'],
    min: [0, 'Price cannot be negative'],
    validate: {
      validator: function (value: number) {
        return value >= this.price_min;
      },
      message: 'Maximum price must be greater than or equal to minimum price',
    },
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
  is_featured: {
    type: Boolean,
    default: false,
  },
  is_active: {
    type: Boolean,
    default: true,
  },
  created_by: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true,
});

// Index for better query performance
eventSchema.index({ event_date: 1, is_active: 1 });
eventSchema.index({ category: 1, is_active: 1 });
eventSchema.index({ is_featured: 1, is_active: 1 });

export default mongoose.model<IEvent>('Event', eventSchema);
