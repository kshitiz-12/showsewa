# 🐛 Vercel Deployment Fix

## The Issue

You're seeing:
```
sh: line 1: cd: frontend: No such file or directory
Error: Command "cd frontend && npm install" exited with 1
```

This happens when Vercel's dashboard has **incorrect Build Settings** saved.

---

## ✅ The Fix

### Step 1: Go to Vercel Dashboard

1. Open your project in Vercel: https://vercel.com/dashboard
2. Click on your **showsewa** project
3. Go to **Settings** tab
4. Click **General** in the left sidebar

### Step 2: Update Build & Development Settings

In the **Build & Development Settings** section:

**Root Directory**: `frontend` ✅

**Framework Preset**: Should auto-detect as "Vite"

**Build Command**: Should be `npm run build` (auto-detected)

**Output Directory**: Should be `dist` (auto-detected)

**Install Command**: Should be empty or just `npm install`

**⚠️ IMPORTANT**: If you see `cd frontend && npm install` in the Install Command, DELETE IT! Leave it empty!

### Step 3: Save and Redeploy

1. Click **Save** at the bottom
2. Go to **Deployments** tab
3. Click the three dots (⋮) on the failed deployment
4. Click **Redeploy**

---

## 📸 Correct Settings Screenshot Reference

Your Vercel settings should look like this:

```
Root Directory:     frontend
Framework Preset:   Vite
Build Command:      npm run build
Output Directory:   dist
Install Command:    (empty - auto-detected)
```

---

## 🔍 Verify Your vercel.json

Make sure your `frontend/vercel.json` looks like this:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

**Location**: `frontend/vercel.json` ✅

---

## ⚡ Quick Alternative: Manual Override

If the dashboard keeps showing wrong settings, you can override in `vercel.json`:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

---

## ✅ After Fixing

Once you update the settings and redeploy, you should see:

```
✓ Cloning completed
✓ Running "npm install"  
✓ Running "npm run build"
✓ Build completed
✓ Deployment ready
```

---

## 🆘 Still Having Issues?

1. **Clear cache**: In Vercel Settings → General → Advanced, toggle "Remove Cache" on next deployment
2. **Check Root Directory**: Make sure it's exactly `frontend` (lowercase)
3. **Verify structure**: Ensure `frontend/package.json` exists in your GitHub repo
4. **Check logs**: Expand the build logs to see exact error

---

**After fixing, your ShowSewa should deploy successfully! 🚀**

