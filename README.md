# 🎭 ShowSewa - Entertainment Booking Platform

A full-stack entertainment booking platform built for Nepal's growing entertainment industry. Book events, movies, and shows with ease!

## 🌟 Features

### Frontend (React + TypeScript + Vite)
- 🎨 **Modern UI/UX** - Beautiful, responsive design with Tailwind CSS
- 🌓 **Dark/Light Mode** - Toggle between themes
- 🌍 **Multi-language Support** - English and Nepali
- 📱 **Fully Responsive** - Works on all devices
- 🎫 **Event Booking** - Browse and book events
- 🎬 **Movie Tickets** - Book movie showtimes
- 📧 **Newsletter** - Stay updated with latest events
- 📞 **Contact Form** - Get in touch with us

### Backend (Node.js + Express + TypeScript)
- 🔐 **Authentication** - JWT-based auth with role management
- 🎪 **Event Management** - CRUD operations for events
- 🎬 **Movie Management** - Movie catalog with showtimes
- 🎫 **Booking System** - Complete booking workflow
- 📁 **File Upload** - Image upload for events/movies
- 👨‍💼 **Admin Panel** - Dashboard and management APIs
- 📧 **Email Notifications** - Newsletter and confirmations
- 💳 **Payment Ready** - Integration ready for eSewa, Khalti, Stripe
- 🛡️ **Security** - Helmet, CORS, rate limiting, validation

## 🏗️ Project Structure

```
showsewa/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── contexts/        # React contexts
│   │   ├── lib/            # Utilities and configurations
│   │   ├── App.tsx         # Main app component
│   │   └── main.tsx        # Entry point
│   ├── package.json
│   └── vite.config.ts
├── backend/                 # Node.js backend API
│   ├── src/
│   │   ├── controllers/    # Route controllers
│   │   ├── models/        # Database models
│   │   ├── routes/        # API routes
│   │   ├── middleware/    # Custom middleware
│   │   ├── config/        # Database configuration
│   │   ├── types/         # TypeScript definitions
│   │   └── index.ts       # Application entry point
│   ├── uploads/           # File upload directory
│   ├── package.json
│   └── tsconfig.json
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### 1. Clone and Setup
```bash
git clone <repository-url>
cd showsewa
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Frontend will be available at: http://localhost:5174

### 3. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev
```
Backend API will be available at: http://localhost:5000

### 4. Database Setup
- Install MongoDB locally or use MongoDB Atlas
- Update `MONGODB_URI` in backend `.env` file
- The application will create collections automatically

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **Context API** - State management

### Backend
- **Node.js** - Runtime
- **Express.js** - Web framework
- **TypeScript** - Type safety
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **Multer** - File uploads
- **Nodemailer** - Email service
- **Express Validator** - Input validation
- **Helmet** - Security
- **CORS** - Cross-origin requests

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile

### Event Endpoints
- `GET /api/events` - Get all events (with filters)
- `GET /api/events/:id` - Get single event
- `POST /api/events` - Create event (Admin)
- `PUT /api/events/:id` - Update event (Admin)
- `DELETE /api/events/:id` - Delete event (Admin)

### Movie Endpoints
- `GET /api/movies` - Get all movies (with filters)
- `GET /api/movies/:id` - Get single movie
- `POST /api/movies` - Create movie (Admin)
- `PUT /api/movies/:id` - Update movie (Admin)
- `DELETE /api/movies/:id` - Delete movie (Admin)

### Booking Endpoints
- `POST /api/bookings` - Create booking
- `GET /api/bookings` - Get user bookings
- `GET /api/bookings/:id` - Get single booking
- `PUT /api/bookings/:id/status` - Update booking status (Admin)

### Admin Endpoints
- `GET /api/admin/dashboard` - Dashboard statistics
- `GET /api/admin/bookings` - All bookings
- `GET /api/admin/users` - All users

## 🔧 Environment Variables

### Frontend (.env)
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Backend (.env)
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/showsewa
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRE=7d
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880
FRONTEND_URL=http://localhost:5174
ADMIN_EMAIL=admin@showsewa.com
ADMIN_PASSWORD=admin123
```

## 🎯 Key Features

### For Users
- Browse events and movies
- Search and filter content
- Book tickets with seat selection
- Multi-language support (English/Nepali)
- Dark/light theme toggle
- Newsletter subscription
- Contact form

### For Admins
- Dashboard with statistics
- Manage events and movies
- Handle bookings
- User management
- File upload for images
- Email notifications

### For Developers
- TypeScript for type safety
- RESTful API design
- Comprehensive error handling
- Input validation
- Security best practices
- Modular architecture
- Detailed documentation

## 🚀 Deployment

### Frontend (Vercel/Netlify)
```bash
cd frontend
npm run build
# Deploy dist/ folder
```

### Backend (Railway/Heroku/DigitalOcean)
```bash
cd backend
npm run build
npm start
```

### Database
- Use MongoDB Atlas for production
- Set up proper environment variables
- Configure CORS for production domain

## 🛡️ Security Features

- **JWT Authentication** - Secure token-based auth
- **Password Hashing** - bcryptjs for password security
- **Input Validation** - Express validator
- **Rate Limiting** - Prevent API abuse
- **CORS Protection** - Cross-origin security
- **Helmet** - Security headers
- **File Upload Security** - Type and size validation

## 📱 Mobile Responsiveness

The application is fully responsive and works seamlessly on:
- 📱 Mobile phones
- 📱 Tablets
- 💻 Laptops
- 🖥️ Desktop computers

## 🌍 Internationalization

Currently supports:
- 🇺🇸 English
- 🇳🇵 Nepali

Easy to extend for additional languages.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

- Email: info@showsewa.com
- Website: https://showsewa.com
- GitHub Issues: Create an issue for bugs or feature requests

## 🎉 Acknowledgments

- Built with ❤️ for Nepal's entertainment industry
- Inspired by the need for a unified booking platform
- Thanks to the open-source community for amazing tools

---

**ShowSewa** - Your Gateway to Entertainment in Nepal! 🎭🎬🎪