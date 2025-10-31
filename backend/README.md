# ShowSewa Backend API

A comprehensive Node.js/Express backend for the ShowSewa entertainment booking platform.

## 🚀 Features

- **Authentication & Authorization** - JWT-based auth with role-based access
- **Event Management** - CRUD operations for events with multi-language support
- **Movie Management** - Movie catalog with showtimes
- **Booking System** - Complete booking workflow with seat selection
- **File Upload** - Image upload for events and movies
- **Admin Panel** - Dashboard and management APIs
- **Email Notifications** - Newsletter and booking confirmations
- **Payment Integration** - Ready for eSewa, Khalti, and Stripe
- **Database** - MongoDB with Mongoose ODM
- **Security** - Helmet, CORS, rate limiting, input validation

## 📁 Project Structure

```
backend/
├── src/
│   ├── controllers/     # Route controllers
│   ├── models/         # Database models
│   ├── routes/         # API routes
│   ├── middleware/     # Custom middleware
│   ├── config/         # Database configuration
│   ├── types/          # TypeScript type definitions
│   └── index.ts        # Application entry point
├── uploads/            # File upload directory
├── package.json
├── tsconfig.json
└── .env.example
```

## 🛠️ Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **TypeScript** - Type safety
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **Multer** - File uploads
- **Nodemailer** - Email service
- **Express Validator** - Input validation
- **Helmet** - Security headers
- **CORS** - Cross-origin requests
- **Morgan** - HTTP logging

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Environment setup:**
   ```bash
   cp .env.example .env
   ```
   
   Update the `.env` file with your configuration:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/showsewa
   JWT_SECRET=your_super_secret_jwt_key
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_app_password
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

4. **Build for production:**
   ```bash
   npm run build
   npm start
   ```

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/change-password` - Change password

### Events
- `GET /api/events` - Get all events (with filters)
- `GET /api/events/:id` - Get single event
- `POST /api/events` - Create event (Admin)
- `PUT /api/events/:id` - Update event (Admin)
- `DELETE /api/events/:id` - Delete event (Admin)

### Movies
- `GET /api/movies` - Get all movies (with filters)
- `GET /api/movies/:id` - Get single movie
- `POST /api/movies` - Create movie (Admin)
- `PUT /api/movies/:id` - Update movie (Admin)
- `DELETE /api/movies/:id` - Delete movie (Admin)

### Bookings
- `POST /api/bookings` - Create booking
- `GET /api/bookings` - Get user bookings
- `GET /api/bookings/:id` - Get single booking
- `PUT /api/bookings/:id/status` - Update booking status (Admin)

### Admin
- `GET /api/admin/dashboard` - Dashboard statistics
- `GET /api/admin/bookings` - All bookings
- `GET /api/admin/users` - All users
- `GET /api/admin/events` - All events
- `GET /api/admin/movies` - All movies

### Upload
- `POST /api/upload` - Upload image (Admin)

### Health Check
- `GET /api/health` - API health status

## 🔐 Authentication

The API uses JWT tokens for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## 📊 Database Models

### User
- name, email, password, phone, role, isVerified, avatar

### Event
- title, title_ne, description, description_ne, category, image_url, venue, venue_ne, location, location_ne, event_date, price_min, price_max, total_seats, available_seats, is_featured, is_active, created_by

### Movie
- title, title_ne, description, description_ne, poster_url, genre, duration, language, rating, release_date, is_trending, is_active, created_by

### Showtime
- movie_id, theater, theater_ne, show_date, show_time, price, total_seats, available_seats, is_active

### Booking
- booking_type, item_id, showtime_id, user_id, customer_name, customer_email, customer_phone, seats, total_amount, payment_method, payment_status, booking_status, transaction_id, booking_reference

### Newsletter
- email, is_active, subscribed_at

## 🛡️ Security Features

- **Helmet** - Security headers
- **CORS** - Cross-origin resource sharing
- **Rate Limiting** - Prevent abuse
- **Input Validation** - Express validator
- **Password Hashing** - bcryptjs
- **JWT Authentication** - Secure tokens
- **File Upload Security** - Type and size validation

## 🔧 Environment Variables

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/showsewa

# JWT
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRE=7d

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# File Upload
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880

# Frontend
FRONTEND_URL=http://localhost:5174

# Admin
ADMIN_EMAIL=admin@showsewa.com
ADMIN_PASSWORD=admin123
```

## 📝 API Response Format

```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... },
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "pages": 10
  }
}
```

## 🚀 Deployment

1. **Build the application:**
   ```bash
   npm run build
   ```

2. **Set production environment variables**

3. **Start the server:**
   ```bash
   npm start
   ```

## 📞 Support

For support, email info@showsewa.com or create an issue in the repository.

## 📄 License

This project is licensed under the MIT License.

---

**ShowSewa Backend** - Built with ❤️ for Nepal's entertainment industry
