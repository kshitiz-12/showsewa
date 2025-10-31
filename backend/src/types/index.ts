import { Request } from 'express';

// User Types
export interface IUser {
  _id: string;
  name: string;
  email: string;
  password: string;
  phone?: string;
  role: 'user' | 'admin';
  isVerified: boolean;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// Event Types
export interface IEvent {
  _id: string;
  title: string;
  title_ne: string;
  description: string;
  description_ne: string;
  category: 'concert' | 'festival' | 'sports' | 'theater' | 'other';
  image_url: string;
  venue: string;
  venue_ne: string;
  location: string;
  location_ne: string;
  event_date: Date;
  end_date: Date;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  price_min: number;
  price_max: number;
  total_seats: number;
  available_seats: number;
  is_featured: boolean;
  is_active: boolean;
  created_by: string;
  createdAt: Date;
  updatedAt: Date;
}

// Movie Types
export interface IMovie {
  _id: string;
  title: string;
  title_ne: string;
  description: string;
  description_ne: string;
  poster_url: string;
  genre: string;
  duration: number;
  language: string;
  rating: string;
  release_date: Date;
  is_trending: boolean;
  is_active: boolean;
  created_by: string;
  createdAt: Date;
  updatedAt: Date;
}

// Showtime Types
export interface IShowtime {
  _id: string;
  movie_id: string;
  theater: string;
  theater_ne: string;
  show_date: Date;
  show_time: string;
  price: number;
  total_seats: number;
  available_seats: number;
  is_active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Booking Types
export interface IBooking {
  _id: string;
  booking_type: 'event' | 'movie';
  item_id: string;
  showtime_id?: string;
  user_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  seats: string[];
  total_amount: number;
  payment_method: 'esewa' | 'khalti' | 'stripe' | 'cash';
  payment_status: 'pending' | 'completed' | 'failed' | 'refunded';
  booking_status: 'pending' | 'confirmed' | 'cancelled';
  transaction_id?: string;
  booking_reference: string;
  createdAt: Date;
  updatedAt: Date;
}

// Newsletter Types
export interface INewsletter {
  _id: string;
  email: string;
  is_active: boolean;
  subscribed_at: Date;
}

// Request Types
export interface AuthRequest extends Request {
  user?: IUser;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Payment Types
export interface PaymentData {
  amount: number;
  currency: string;
  description: string;
  booking_id: string;
  customer_email: string;
  customer_name: string;
}

// File Upload Types
export interface UploadedFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  destination: string;
  filename: string;
  path: string;
  size: number;
}
