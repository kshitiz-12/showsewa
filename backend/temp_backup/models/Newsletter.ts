import mongoose, { Schema } from 'mongoose';
import { INewsletter } from '../types';

const newsletterSchema = new Schema<INewsletter>({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email',
    ],
  },
  is_active: {
    type: Boolean,
    default: true,
  },
  subscribed_at: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Index for better query performance
newsletterSchema.index({ email: 1 });
newsletterSchema.index({ is_active: 1 });

export default mongoose.model<INewsletter>('Newsletter', newsletterSchema);
