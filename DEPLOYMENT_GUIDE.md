# 🚀 ShowSewa Deployment Guide

## Overview
- **Frontend**: Vercel (React/Vite)
- **Backend**: Render (Node.js/Express)
- **Database**: Supabase PostgreSQL (already configured)
- **File Storage**: Supabase Storage

---

## 📋 Prerequisites

1. **Accounts needed:**
   - ✅ Supabase account (already set up)
   - 🔲 Vercel account (free)
   - 🔲 Render account (free tier available)
   - 🔲 GitHub account (optional, for Git deployment)

2. **Environment variables prepared:**
   - Backend `.env.example` in `backend/` folder
   - Frontend uses environment variables for API endpoints

---

## 🔧 Part 1: Deploy Backend on Render

### Step 1: Create Render Account
1. Go to [render.com](https://render.com)
2. Sign up with GitHub (recommended) or email
3. Verify email if required

### Step 2: Create New Web Service
1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository (or use public Git URL)
3. Select the repository containing ShowSewa

### Step 3: Configure Backend Service

**Basic Settings:**
- **Name**: `showsewa-backend`
- **Region**: Singapore (or closest to Nepal)
- **Branch**: `main` (or your deployment branch)
- **Root Directory**: (leave empty)

**Build & Deploy:**
- **Build Command**: `cd backend && npm install && npm run build`
- **Start Command**: `cd backend && npm start`
- **Environment**: `Node`

### Step 4: Add Environment Variables

Click "Advanced" → "Add Environment Variable" and add:

```bash
# Database (from Supabase)
DATABASE_URL=postgresql://postgres.sekplvmoorurpxwpxuuv:Showsewa12xyz@aws-1-us-east-2.pooler.supabase.com:5432/postgres
DIRECT_URL=postgresql://postgres:Showsewa12xyz@db.sekplvmoorurpxwpxuuv.supabase.co:5432/postgres

# Supabase
SUPABASE_URL=https://sekplvmoorurpxwpxuuv.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNla3Bsdm1vb3J1cnB4d3B4dXV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2ODAwMDgsImV4cCI6MjA3NjI1NjAwOH0.DZktFf0G6xzQJbbU1-PGmkAGVaMPWp__WeX2x-m-FpI

# Server
NODE_ENV=production
PORT=5000

# JWT
JWT_SECRET=showsewa-super-secret-jwt-key-2024-production

# Email (Gmail SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=showsewa@gmail.com
SMTP_PASS=jepv ceon wxfx jerz

# Payment (update with real secrets)
ESEWA_SECRET=your-esewa-secret
KHALTI_SECRET=your-khalti-secret
```

### Step 5: Deploy
1. Click **"Create Web Service"**
2. Wait 5-10 minutes for first deployment
3. Copy your backend URL (e.g., `https://showsewa-backend.onrender.com`)

### Step 6: Add Frontend URL to CORS

After deployment, add your Vercel URL to backend CORS:

1. In Render dashboard → Environment variables
2. Add/Update:
   ```bash
   FRONTEND_URL=https://your-vercel-app.vercel.app
   ```
3. Redeploy

---

## ⚡ Part 2: Deploy Frontend on Vercel

### Step 1: Create Vercel Account
1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub (recommended) or email

### Step 2: Import Project
1. Click **"Add New"** → **"Project"**
2. Import your GitHub repository (or upload code)
3. Select the ShowSewa repository

### Step 3: Configure Frontend

**Framework Preset:**
- **Framework**: `Vite`
- **Root Directory**: `frontend`
- **Build Command**: `npm run build` (auto-detected)
- **Output Directory**: `dist` (auto-detected)

**Environment Variables:**
Click "Environment Variables" and add:

```bash
# Supabase (for newsletter/storage)
VITE_SUPABASE_URL=https://sekplvmoorurpxwpxuuv.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNla3Bsdm1vb3J1cnB4d3B4dXV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2ODAwMDgsImV4cCI6MjA3NjI1NjAwOH0.DZktFf0G6xzQJbbU1-PGmkAGVaMPWp__WeX2x-m-FpI

# Backend API URL (from Render)
VITE_API_URL=https://showsewa-backend.onrender.com
```

### Step 4: Deploy
1. Click **"Deploy"**
2. Wait 2-5 minutes
3. Vercel will provide a URL (e.g., `https://showsewa-frontend.vercel.app`)

---

## 🔗 Part 3: Update API Endpoints

You need to update the frontend to use the Render backend URL instead of localhost.

### Option A: Use VITE_API_URL Environment Variable (Recommended)

Update `frontend/src/App.tsx` or create an API client:

```typescript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
```

### Option B: Manual Search & Replace

Search all frontend files for `http://localhost:5000` and replace with your Render URL.

---

## 📝 Part 4: Database Setup

### Run Prisma Migrations

1. SSH into Render or run locally:
   ```bash
   cd backend
   npx prisma migrate deploy
   ```

2. Generate Prisma Client:
   ```bash
   npx prisma generate
   ```

3. (Optional) Seed database:
   ```bash
   npm run prisma:seed
   ```

---

## ✅ Part 5: Verify Deployment

### Backend Health Check
Visit: `https://your-backend.onrender.com/api/health`

Expected response:
```json
{
  "status": "success",
  "message": "ShowSewa API is running!",
  "timestamp": "2025-01-XX..."
}
```

### Frontend Check
Visit: `https://your-frontend.vercel.app`

Should load the homepage with carousels.

### Test Booking Flow
1. Select a city
2. Browse movies/events
3. Try booking a ticket
4. Check if API calls succeed

---

## 🔒 Part 6: Security & Production Settings

### Backend (Render)
- ✅ CORS configured
- ✅ Helmet security headers
- ✅ Rate limiting enabled
- ✅ Environment variables secured
- ⚠️ **Update JWT_SECRET** to a strong random value
- ⚠️ **Update payment gateway secrets**

### Frontend (Vercel)
- ✅ HTTPS enabled (automatic)
- ✅ Environment variables secured
- ✅ Static file optimization

### Supabase
- ✅ Row Level Security (RLS) enabled
- ✅ API keys restricted to app URL

---

## 🎯 Part 7: Optional - Custom Domain

### Vercel (Frontend)
1. Go to Project Settings → Domains
2. Add your domain (e.g., `showsewa.com`)
3. Update DNS records as instructed

### Render (Backend)
1. Go to Service Settings → Custom Domains
2. Add your domain (e.g., `api.showsewa.com`)
3. Update DNS records

### Update Environment Variables
Update `FRONTEND_URL` in Render to use your custom domain.

---

## 📊 Part 8: Monitoring & Logs

### Render Logs
- View live logs in Render dashboard
- Check for errors during deployment
- Monitor application health

### Vercel Analytics
- Enable Vercel Analytics in dashboard
- Track page views and performance

### Supabase Dashboard
- Monitor database usage
- Check API requests
- View storage usage

---

## 🐛 Common Issues & Fixes

### Issue 1: "Cannot find module"
**Fix**: Ensure `backend/node_modules` is in `.gitignore`, Render will install dependencies

### Issue 2: CORS errors
**Fix**: Add Vercel URL to `FRONTEND_URL` environment variable in Render

### Issue 3: Database connection error
**Fix**: Verify `DATABASE_URL` is correct in Supabase → Settings → Database

### Issue 4: Build timeout
**Fix**: Render free tier has 10-min timeout. Upgrade to paid or optimize build

### Issue 5: "Prisma Client not generated"
**Fix**: Add `prisma generate` to build command or run separately

---

## 🎉 Success Checklist

- [ ] Backend deployed on Render
- [ ] Frontend deployed on Vercel
- [ ] Database migrations run
- [ ] Health check working
- [ ] CORS configured
- [ ] Environment variables set
- [ ] Booking flow tested
- [ ] Mobile responsive checked
- [ ] Dark mode working
- [ ] Payment gateways configured (if needed)
- [ ] Custom domain added (optional)

---

## 📞 Support

- Render Docs: https://render.com/docs
- Vercel Docs: https://vercel.com/docs
- Supabase Docs: https://supabase.com/docs
- ShowSewa Issues: GitHub Issues

---

**Congratulations! Your ShowSewa platform is now live! 🎉**

