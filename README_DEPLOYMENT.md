# 🚀 ShowSewa - Deployment Instructions

## ⚡ Quick Start

### 1. Push to GitHub
```powershell
git init
git add .
git commit -m "Initial commit: ShowSewa platform"
git remote add origin https://github.com/YOUR_USERNAME/showsewa.git
git push -u origin main
```

### 2. Deploy Backend (Render)
- Go to [render.com](https://render.com) → New Web Service
- Root Directory: (empty)
- Build Command: `cd backend && npm install && npx prisma generate && npm run build`
- Start Command: `cd backend && npm start`
- Add env vars (see DEPLOY_QUICK_START.md)

### 3. Deploy Frontend (Vercel)
- Go to [vercel.com](https://vercel.com) → New Project
- Root Directory: `frontend`
- ✅ Settings auto-detect from `frontend/vercel.json`
- Add env vars (see DEPLOY_QUICK_START.md)

---

## 📚 Complete Documentation

- **DEPLOY_QUICK_START.md** - 5-minute deployment guide
- **VERCEL_FIX.md** - Fix for "cd frontend" error
- **DEPLOYMENT_GUIDE.md** - Comprehensive guide with troubleshooting
- **GIT_COMMANDS.md** - Git/GitHub instructions

---

## ⚠️ IMPORTANT: Vercel Fix

If you see this error:
```
sh: cd: frontend: No such file or directory
```

**Fix**: In Vercel Settings → General → Build Settings:
- **Install Command**: Leave **empty** (not `cd frontend && npm install`)

See `VERCEL_FIX.md` for details!

---

## 🎉 Done!

After deployment:
1. Test: `https://your-backend.onrender.com/api/health`
2. Add `FRONTEND_URL` to Render env vars
3. Deploy and enjoy! 🚀

