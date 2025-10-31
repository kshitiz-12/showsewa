# 🚀 Quick Deploy Guide - ShowSewa

## Overview
- **Frontend**: Vercel ⚡
- **Backend**: Render 🔧  
- **Database**: Supabase PostgreSQL (already configured) ✅

---

## ⚡ 5-Minute Deploy Steps

### 1️⃣ Backend on Render (3 minutes)

1. Go to [render.com](https://render.com) and sign up
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repo
4. Configure:
   - **Name**: `showsewa-backend`
   - **Root Directory**: (leave empty)
   - **Build Command**: `cd backend && npm install && npx prisma generate && npm run build`
   - **Start Command**: `cd backend && npm start`

5. Add Environment Variables:
   ```
   DATABASE_URL=postgresql://postgres.sekplvmoorurpxwpxuuv:Showsewa12xyz@aws-1-us-east-2.pooler.supabase.com:5432/postgres
   DIRECT_URL=postgresql://postgres:Showsewa12xyz@db.sekplvmoorurpxwpxuuv.supabase.co:5432/postgres
   SUPABASE_URL=https://sekplvmoorurpxwpxuuv.supabase.co
   SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNla3Bsdm1vb3J1cnB4d3B4dXV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2ODAwMDgsImV4cCI6MjA3NjI1NjAwOH0.DZktFf0G6xzQJbbU1-PGmkAGVaMPWp__WeX2x-m-FpI
   NODE_ENV=production
   JWT_SECRET=showsewa-super-secret-jwt-key-2024-production
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=showsewa@gmail.com
   SMTP_PASS=jepv ceon wxfx jerz
   ```

6. Click **"Create Web Service"** ⏳

7. Wait 5-10 minutes, copy your backend URL (e.g., `https://showsewa-backend.onrender.com`)

---

### 2️⃣ Frontend on Vercel (2 minutes)

1. Go to [vercel.com](https://vercel.com) and sign up
2. Click **"Add New"** → **"Project"**
3. Import your GitHub repo
4. Configure:
   - **Framework**: Vite (auto-detected)
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build` (auto)
   - **Output Directory**: `dist` (auto)

5. Add Environment Variables:
   ```
   VITE_API_URL=https://showsewa-backend.onrender.com
   VITE_SUPABASE_URL=https://sekplvmoorurpxwpxuuv.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNla3Bsdm1vb3J1cnB4d3B4dXV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2ODAwMDgsImV4cCI6MjA3NjI1NjAwOH0.DZktFf0G6xzQJbbU1-PGmkAGVaMPWp__WeX2x-m-FpI
   ```

6. Click **"Deploy"** ⏳

7. Wait 2-5 minutes, Vercel will give you a URL!

---

### 3️⃣ Update CORS in Render

After frontend deploys:
1. Go to Render dashboard
2. Add environment variable:
   ```
   FRONTEND_URL=https://your-vercel-app.vercel.app
   ```
3. Manual deploy → "Deploy latest commit"

---

## ✅ Test Deployment

1. **Backend Health**: `https://your-backend.onrender.com/api/health`
2. **Frontend**: Visit your Vercel URL
3. Try booking a ticket!

---

## 🐛 Common Issues

**CORS Error**: Add `FRONTEND_URL` to Render env vars

**Build Failed**: Check logs in Render/Vercel dashboard

**Database Error**: Verify `DATABASE_URL` in Supabase → Settings → Database

**API 404**: Check `VITE_API_URL` is set correctly in Vercel

---

## 📝 Next Steps

1. ✅ Set up custom domains (optional)
2. ✅ Enable Vercel Analytics
3. ✅ Configure payment gateways (production keys)
4. ✅ Set up monitoring/alerts
5. ✅ Run database seed: `npm run prisma:seed`

---

**🎉 That's it! Your ShowSewa is live!**

Need help? Check `DEPLOYMENT_GUIDE.md` for detailed instructions.

