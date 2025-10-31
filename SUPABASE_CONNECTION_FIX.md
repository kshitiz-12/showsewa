# Supabase Connection Fix for Render

## Problem
Render's free tier uses IPv4, but the current DATABASE_URL uses a pooler that may not be accessible from Render's IPv4 network.

## Solution

You need to get the correct connection string from Supabase. Follow these steps:

### Step 1: Open Supabase Dashboard
Go to: https://supabase.com/dashboard/project/sekplvmoorurpxwpxuuv

### Step 2: Navigate to Database Settings
1. Click on "Settings" in the left sidebar
2. Click on "Database"

### Step 3: Get the Pooler Connection String
Look for the **"Connection string"** section with tabs:
- Transaction mode
- Session mode

### Step 4: Copy the Pooler Connection String
You need the connection string from the **"Transaction mode"** tab (or Session mode if Transaction doesn't work).

It should look like:
```
postgresql://postgres.sekplvmoorurpxwpxuuv:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
```

**Important:**
- Port should be **6543** for the pooler, NOT 5432
- The host should be pooler-specific (usually has `pooler` in the name)

### Step 5: Update Render Environment Variables

In Render dashboard:
1. Go to your service settings
2. Navigate to "Environment" section
3. Update **DATABASE_URL** with the pooler connection string from Supabase
4. Keep **DIRECT_URL** as is (it should already work)

### Alternative: Use Direct Connection

If pooler doesn't work, try using the DIRECT_URL as DATABASE_URL temporarily:

```
postgresql://postgres:[YOUR-PASSWORD]@db.sekplvmoorurpxwpxuuv.supabase.co:5432/postgres
```

**Note:** Direct connections have connection limits, but should work for testing.

### Step 6: Verify

After updating DATABASE_URL:
1. Manually redeploy in Render
2. Check logs for successful database connection
3. Test login endpoint

## Expected Log

You should see:
```
✅ Database connected successfully
```

Instead of:
```
Can't reach database server at...
```

