# 🚀 ShowSewa Setup Instructions

## ✅ What's Already Done:
- ✅ Prisma installed
- ✅ Complete schema created (691 lines!)
- ✅ All 12 features in schema:
  - Interactive seat map
  - Multiple ticket types
  - Session timeout (seat holds)
  - Advanced filters
  - Location-based search
  - eSewa + Khalti payments
  - Movie trailers & gallery
  - Ratings & reviews
  - Event categories
  - Loyalty program
  - Gamification
  - Theme customization

---

## 🎯 Next Steps (Follow These):

### **Step 1: Create Supabase Account**

1. Go to https://supabase.com
2. Click "Start your project"
3. Sign in with GitHub (recommended)
4. Click "New Project"

Fill in:
```
Organization: Create new (or select existing)
Name: ShowSewa
Database Password: [CREATE STRONG PASSWORD - SAVE IT!]
Region: Singapore (closest to Nepal)
Pricing Plan: Free
```

Wait 2-3 minutes for project creation ⏳

---

### **Step 2: Get Database Connection Strings**

1. In your Supabase project dashboard
2. Click "Settings" (⚙️ icon in left sidebar)
3. Click "Database"
4. Scroll down to "Connection string"
5. You'll see two URLs:

**Transaction pooler (copy this one):**
```
postgresql://postgres.xxxxx:[YOUR-PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres
```

**Session pooler (copy this too):**
```
postgresql://postgres.xxxxx:[YOUR-PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres
```

---

### **Step 3: Configure Environment**

Create `backend/.env` file:

```env
# Supabase Database
# Replace [YOUR-PASSWORD] with your actual password
# Replace xxxxx with your project reference

# For Prisma migrations (use Session pooler - port 6543)
DATABASE_URL="postgresql://postgres.xxxxx:YOUR_PASSWORD@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"

# For Prisma queries (use Transaction pooler - port 5432)
DIRECT_URL="postgresql://postgres.xxxxx:YOUR_PASSWORD@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres"

# Supabase API (for storage, realtime, etc)
SUPABASE_URL="https://xxxxx.supabase.co"
SUPABASE_ANON_KEY="your_anon_key"

# Server
PORT=5000
NODE_ENV=development

# JWT
JWT_SECRET=showsewa_super_secret_jwt_key_2024_change_this
JWT_EXPIRE=7d

# eSewa Payment
ESEWA_MERCHANT_ID=EPAYTEST
ESEWA_SECRET_KEY=8gBm/:&EnhH.1/q
ESEWA_URL=https://uat.esewa.com.np/epay/main
# Production: https://esewa.com.np/epay/main

# Khalti Payment
KHALTI_SECRET_KEY=test_secret_key_your_khalti_key
KHALTI_PUBLIC_KEY=test_public_key_your_khalti_key
KHALTI_URL=https://a.khalti.com/api/v2
# Production: https://khalti.com/api/v2

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password

# Redis (for seat holds)
REDIS_URL=redis://localhost:6379

# Frontend
FRONTEND_URL=http://localhost:5174
```

---

### **Step 4: Get Supabase API Keys**

1. In Supabase Dashboard → "Settings" → "API"
2. Copy these values:

```
Project URL: https://xxxxx.supabase.co
anon public key: eyJhbGc...
```

Add to your `.env`:
```env
SUPABASE_URL="https://xxxxx.supabase.co"
SUPABASE_ANON_KEY="eyJhbGc..."
```

---

### **Step 5: Generate Prisma Client**

```bash
npx prisma generate
```

This creates TypeScript types for your database! ✨

---

### **Step 6: Run Database Migration**

```bash
npx prisma migrate dev --name init
```

This will:
- ✅ Create all 30+ tables in Supabase
- ✅ Set up all relationships
- ✅ Create indexes for performance
- ✅ Generate migration history

You should see:
```
✔ Generated Prisma Client
✔ The migration has been created
✔ Applied migration init
```

---

### **Step 7: Verify Setup**

Open Prisma Studio (visual database editor):
```bash
npx prisma studio
```

Opens at: http://localhost:5555

You should see all tables:
- users
- theaters
- screens
- seat_categories
- events
- movies
- showtimes
- seats
- bookings
- reviews
- loyalty_points
- achievements
- promo_codes
- ... and more!

---

### **Step 8: Seed Sample Data (Optional)**

I'll create a seed script next to populate:
- Admin user (admin@showsewa.com / admin123)
- Sample theater (QFX Civil Mall)
- Sample screen with seats
- Sample movie
- Promo codes
- Achievements

---

## 🎯 After Setup Complete:

You'll have:
- ✅ Supabase PostgreSQL database (free tier: 500MB)
- ✅ All 30+ tables created
- ✅ Type-safe Prisma client
- ✅ Ready for development!

---

## 🏗️ What We're Building (Phase 1 - Week 1 & 2):

### Week 1:
- Interactive seat map with visual selection
- Session timeout (10-min cart hold)
- Multiple ticket types (Premium/Regular/Economy)

### Week 2:
- eSewa payment integration
- Khalti payment integration
- Advanced search filters
- Location-based theater selection

---

## ⚡ Payment Gateway Setup:

### eSewa:
1. Test Mode: Already configured in .env
2. Production: Register at https://esewa.com.np
3. Get merchant ID and secret key

### Khalti:
1. Test Mode: Already configured in .env
2. Production: Register at https://khalti.com
3. Get secret and public keys

---

## 📊 Database Structure:

```
ShowSewa Database (Supabase)
├── Users & Auth
│   ├── users (authentication)
│   ├── user_themes (customization)
│   └── notifications
├── Venues
│   ├── theaters (venues)
│   ├── screens (audis)
│   └── seat_categories (pricing)
├── Content
│   ├── events (concerts, festivals)
│   ├── movies (film catalog)
│   └── showtimes (schedules)
├── Booking System
│   ├── seats (inventory)
│   ├── seat_holds (10-min locks)
│   └── bookings (tickets)
├── Engagement
│   ├── reviews (ratings)
│   ├── loyalty_points (rewards)
│   ├── achievements (gamification)
│   └── user_achievements
├── Business
│   ├── promo_codes (discounts)
│   ├── food_items (F&B)
│   └── points_history
└── Communication
    └── newsletters
```

---

## 🔥 Key Features Already in Schema:

1. **Seat Map System** ✅
   - Theaters → Screens → Seat Categories → Individual Seats
   - Visual layout configuration
   - Multiple pricing tiers per screen

2. **Booking Flow** ✅
   - Temporary seat holds (10 minutes)
   - QR code generation
   - Food & beverage add-ons
   - Promo code support

3. **Payment Integration** ✅
   - eSewa (Nepal)
   - Khalti (Nepal)
   - Transaction tracking
   - Refund support

4. **Reviews & Ratings** ✅
   - 5-star ratings
   - Written reviews
   - Helpful voting
   - Verified bookings

5. **Loyalty Program** ✅
   - 4 tiers (Bronze/Silver/Gold/Platinum)
   - Points on bookings
   - Rewards & perks
   - Points history

6. **Gamification** ✅
   - Achievements system
   - Badges & icons
   - Progressive unlocking
   - Points rewards

7. **Advanced Search** ✅
   - Filters ready
   - Location-based
   - Category filters
   - Date range

---

## 🎨 What Makes This Better:

### vs BookMyShow:
- ✅ Open source (they're proprietary)
- ✅ Nepal-first (English + Nepali)
- ✅ Better UX (modern React)
- ✅ Type-safe (Prisma + TypeScript)
- ✅ Real-time ready (Supabase)
- ✅ Automated events (our unique feature!)

---

## 📞 Need Help?

Common issues:

**Can't connect to database?**
- Check DATABASE_URL in .env
- Ensure password is correct
- Verify project is not paused

**Prisma errors?**
- Run: `npx prisma generate`
- Then: `npx prisma migrate dev`

**Port already in use?**
- Change PORT=5001 in .env
- Or kill process on port 5000

---

**Ready? Follow the steps above and let me know when you reach Step 8!** 🚀

I'll then:
1. Create the seed script
2. Build Prisma service layer
3. Start implementing Phase 1 features!

