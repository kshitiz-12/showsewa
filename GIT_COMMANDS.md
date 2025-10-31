# 📦 Git Commands to Push ShowSewa to GitHub

## Step 1: Initialize Git Repository

```bash
# Initialize git repo
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: ShowSewa platform complete"
```

---

## Step 2: Create GitHub Repository

1. Go to [github.com](https://github.com)
2. Click **"New"** (or the "+" icon)
3. Fill in:
   - **Repository name**: `showsewa`
   - **Description**: Entertainment booking platform for Nepal
   - **Visibility**: Private (recommended for business) or Public
   - **DON'T** check "Initialize with README" (we already have one)
4. Click **"Create repository"**

---

## Step 3: Connect and Push

GitHub will show you commands. Use these:

```bash
# Add GitHub as remote
git remote add origin https://github.com/YOUR_USERNAME/showsewa.git

# Verify remote added
git remote -v

# Push to GitHub
git branch -M main
git push -u origin main
```

---

## Alternative: Using SSH (if you have SSH keys set up)

```bash
# Add GitHub as remote (SSH)
git remote add origin git@github.com:YOUR_USERNAME/showsewa.git

# Push
git push -u origin main
```

---

## Step 4: After First Push

Now you can deploy to Render/Vercel by connecting your GitHub repo!

**For Render:**
1. Render → New Web Service
2. Connect GitHub
3. Select `showsewa` repository

**For Vercel:**
1. Vercel → Add Project
2. Import from GitHub
3. Select `showsewa` repository

---

## 🔐 Important Security Notes

⚠️ **DO NOT** commit sensitive data:
- ✅ `.env` files are already in `.gitignore`
- ✅ `node_modules/` are ignored
- ✅ Secrets are stored separately

⚠️ **Update secrets** before deploying:
- Database passwords
- JWT secrets
- Payment gateway keys
- SMTP credentials

---

## 📝 Quick Reference

**Check status:**
```bash
git status
```

**View changes:**
```bash
git diff
```

**Add specific file:**
```bash
git add filename.ts
```

**Commit changes:**
```bash
git commit -m "Your commit message"
```

**Push updates:**
```bash
git push
```

**Pull updates:**
```bash
git pull
```

---

## 🎯 Next Steps After Push

1. ✅ Connect to Render (backend)
2. ✅ Connect to Vercel (frontend)
3. ✅ Add environment variables
4. ✅ Deploy!

See `DEPLOY_QUICK_START.md` for deployment instructions.

