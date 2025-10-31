import mongoose, { Schema } from 'mongoose';
import { IMovie } from '../types';

const movieSchema = new Schema<IMovie>({
  title: {
    type: String,
    required: [true, 'Movie title is required'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters'],
  },
  title_ne: {
    type: String,
    required: [true, 'Movie title in Nepali is required'],
    trim: true,
    maxlength: [100, 'Nepali title cannot be more than 100 characters'],
  },
  description: {
    type: String,
    required: [true, 'Movie description is required'],
    trim: true,
    maxlength: [1000, 'Description cannot be more than 1000 characters'],
  },
  description_ne: {
    type: String,
    required: [true, 'Movie description in Nepali is required'],
    trim: true,
    maxlength: [1000, 'Nepali description cannot be more than 1000 characters'],
  },
  poster_url: {
    type: String,
    required: [true, 'Movie poster is required'],
  },
  genre: {
    type: String,
    required: [true, 'Movie genre is required'],
    trim: true,
    maxlength: [50, 'Genre cannot be more than 50 characters'],
  },
  duration: {
    type: Number,
    required: [true, 'Movie duration is required'],
    min: [1, 'Duration must be at least 1 minute'],
    max: [300, 'Duration cannot be more than 300 minutes'],
  },
  language: {
    type: String,
    required: [true, 'Movie language is required'],
    trim: true,
    maxlength: [50, 'Language cannot be more than 50 characters'],
  },
  rating: {
    type: String,
    required: [true, 'Movie rating is required'],
    enum: ['G', 'PG', 'PG-13', 'R', 'NC-17', 'U/A'],
  },
  release_date: {
    type: Date,
    required: [true, 'Release date is required'],
  },
  is_trending: {
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
movieSchema.index({ release_date: -1, is_active: 1 });
movieSchema.index({ is_trending: 1, is_active: 1 });
movieSchema.index({ genre: 1, is_active: 1 });

export default mongoose.model<IMovie>('Movie', movieSchema);
