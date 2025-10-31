# ShowSewa - Entertainment Booking Platform

Welcome to ShowSewa, Nepal's premier entertainment booking platform for movies, events, and more!

## 🚀 Quick Start

### Backend (Render)
- **URL:** https://showsewa.onrender.com
- **Status:** Deployed and running
- **Build Command:** `cd backend && npm install --include=dev && npx prisma generate && npm run build`

### Frontend (Vercel)
- **URL:** https://showsewa.vercel.app
- **Status:** Deployed and running
- **Root Directory:** `frontend`

## 📋 Features

- 🎬 Movie Booking System
- 🎪 Event Ticket Booking
- 🏙️ Multi-City Support
- 🎭 Theater Management
- 💳 Payment Integration (Khalti, eSewa)
- 📧 Email Notifications
- 🌙 Dark Mode Support
- 📱 Responsive Design

## 🛠️ Tech Stack

### Frontend
- React 18
- TypeScript
- Tailwind CSS
- Vite
- React Router
- Lucide Icons

### Backend
- Node.js
- Express
- Prisma ORM
- PostgreSQL (Supabase)
- JWT Authentication
- bcrypt for password hashing
- NodeMailer for emails
- Cron jobs for scheduled tasks

## 🔧 Development

### Prerequisites
- Node.js 18+
- PostgreSQL database
- npm or yarn

### Setup

1. Clone the repository:
```bash
git clone https://github.com/kshitiz-12/showsewa.git
cd showsewa
```

2. Backend setup:
```bash
cd backend
npm install
cp envexample .env
# Edit .env with your database credentials
npm run dev
```

3. Frontend setup:
```bash
cd frontend
npm install
cp .env.example .env
# Edit .env with your backend URL
npm run dev
```

## 📝 Environment Variables

See `backend/envexample` and `frontend/.env.example` for required environment variables.

## 🤝 Contributing

Contributions are welcome! Please follow the existing code style and submit pull requests.

## 📄 License

MIT License

## 🎯 Support

For issues or questions, please create an issue on GitHub.

---

Made with ❤️ in Nepal 🇳🇵

