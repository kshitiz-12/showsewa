# 🚀 Supabase Setup Guide for ShowSewa

## 📋 **Step-by-Step Setup**

### **Step 1: Create Supabase Project**

1. Go to [https://supabase.com](https://supabase.com)
2. Sign in or create account
3. Click "New Project"
4. Fill in details:
   ```
   Name: ShowSewa
   Database Password: [Choose strong password - SAVE THIS!]
   Region: Singapore (closest to Nepal)
   Pricing Plan: Free (to start)
   ```
5. Wait 2-3 minutes for project creation

---

### **Step 2: Get Database Credentials**

1. Go to Project Dashboard
2. Click "Settings" (⚙️ icon in sidebar)
3. Click "Database"
4. Scroll to "Connection string"

You'll see:
```
Connection pooling (recommended for serverless):
postgresql://postgres:[YOUR-PASSWORD]@db.xxxxxx.supabase.co:5432/postgres?pgbouncer=true

Direct connection:
postgresql://postgres:[YOUR-PASSWORD]@db.xxxxxx.supabase.co:5432/postgres
```

---

### **Step 3: Configure Environment Variables**

Create `backend/.env` file:

```env
# Replace [YOUR-PASSWORD] and [YOUR-PROJECT-REF] with actual values

# Connection pooling (for Prisma queries)
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@db.YOUR_PROJECT_REF.supabase.co:5432/postgres?pgbouncer=true&connection_limit=1"

# Direct connection (for migrations)
DIRECT_URL="postgresql://postgres:YOUR_PASSWORD@db.YOUR_PROJECT_REF.supabase.co:5432/postgres"

# Supabase API
SUPABASE_URL="https://YOUR_PROJECT_REF.supabase.co"
SUPABASE_ANON_KEY="your_anon_key_from_api_settings"
SUPABASE_SERVICE_KEY="your_service_role_key"
```

**How to get API keys:**
1. Settings → API
2. Copy "Project URL" → `SUPABASE_URL`
3. Copy "anon public" key → `SUPABASE_ANON_KEY`
4. Copy "service_role secret" key → `SUPABASE_SERVICE_KEY`

---

### **Step 4: Run Prisma Migrations**

```bash
# Generate Prisma Client
npx prisma generate

# Create initial migration
npx prisma migrate dev --name init

# This will:
# ✓ Create all tables in Supabase
# ✓ Set up relationships
# ✓ Create indexes
# ✓ Generate Prisma Client
```

---

### **Step 5: Verify Setup**

```bash
# Open Prisma Studio (database GUI)
npx prisma studio

# This opens: http://localhost:5555
# You can now:
# - View all tables
# - Add test data
# - Check relationships
```

---

### **Step 6: Seed Initial Data (Optional)**

Create `backend/prisma/seed.ts`:

```typescript
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 12);
  
  const admin = await prisma.user.create({
    data: {
      email: 'admin@showsewa.com',
      name: 'Admin User',
      password: hashedPassword,
      role: 'ADMIN',
      isVerified: true,
    },
  });

  console.log('✅ Created admin user:', admin.email);

  // Create sample theater
  const theater = await prisma.theater.create({
    data: {
      name: 'QFX Civil Mall',
      nameNe: 'QFX सिभिल मल',
      city: 'Kathmandu',
      area: 'Sundhara',
      address: 'Civil Mall, Sundhara, Kathmandu',
      latitude: 27.7172,
      longitude: 85.3240,
      phone: '+977-01-5970140',
      amenities: ['Parking', 'Food Court', '3D', 'Dolby Atmos'],
    },
  });

  console.log('✅ Created theater:', theater.name);

  // Create screen
  const screen = await prisma.screen.create({
    data: {
      theaterId: theater.id,
      screenNumber: 1,
      name: 'Audi 1',
      capacity: 200,
      screenType: '2D',
      layoutConfig: {
        rows: 10,
        columns: 20,
        aisles: [5, 15],
      },
    },
  });

  console.log('✅ Created screen:', screen.name);

  // Create seat categories
  const categories = await prisma.seatCategory.createMany({
    data: [
      {
        screenId: screen.id,
        categoryId: 'premium',
        name: 'Premium',
        nameNe: 'प्रिमियम',
        price: 800,
        color: '#FFD700',
        features: ['Recliner Seats', 'Best View', 'Extra Legroom'],
        rowMapping: ['A', 'B', 'C'],
      },
      {
        screenId: screen.id,
        categoryId: 'regular',
        name: 'Regular',
        nameNe: 'नियमित',
        price: 500,
        color: '#4169E1',
        features: ['Standard Seats', 'Good View'],
        rowMapping: ['D', 'E', 'F', 'G'],
      },
      {
        screenId: screen.id,
        categoryId: 'economy',
        name: 'Economy',
        nameNe: 'इकोनॉमी',
        price: 350,
        color: '#808080',
        features: ['Standard Seats', 'Budget Friendly'],
        rowMapping: ['H', 'I', 'J'],
      },
    ],
  });

  console.log('✅ Created seat categories');

  // Create sample movie
  const movie = await prisma.movie.create({
    data: {
      title: 'Avatar: The Way of Water',
      titleNe: 'अवतार: द वे अफ वाटर',
      description: 'Set more than a decade after the events of the first film...',
      descriptionNe: 'पहिलो चलचित्रको घटनाक्रम पछि एक दशक भन्दा बढी...',
      posterUrl: 'https://image.tmdb.org/t/p/w500/avatar2.jpg',
      genre: ['Action', 'Adventure', 'Sci-Fi'],
      duration: 192,
      language: ['English', 'Nepali'],
      rating: 'PG-13',
      releaseDate: new Date('2024-12-01'),
      trailerUrl: 'https://youtube.com/watch?v=trailer',
      director: 'James Cameron',
      cast: ['Sam Worthington', 'Zoe Saldana'],
      isTrending: true,
      createdBy: admin.id,
    },
  });

  console.log('✅ Created movie:', movie.title);

  // Create achievements
  const achievements = await prisma.achievement.createMany({
    data: [
      {
        name: 'First Booking',
        nameNe: 'पहिलो बुकिङ',
        description: 'Complete your first booking',
        category: 'BOOKING',
        icon: '🎉',
        points: 100,
        criteria: { bookings: 1 },
      },
      {
        name: 'Movie Buff',
        nameNe: 'चलचित्र प्रेमी',
        description: 'Book 10 movies',
        category: 'BOOKING',
        icon: '🎬',
        points: 500,
        criteria: { bookings: 10, type: 'movie' },
      },
      {
        name: 'Social Butterfly',
        nameNe: 'सामाजिक',
        description: 'Share 5 bookings',
        category: 'SOCIAL',
        icon: '🦋',
        points: 200,
        criteria: { shares: 5 },
      },
    ],
  });

  console.log('✅ Created achievements');

  // Create promo codes
  const promos = await prisma.promoCode.createMany({
    data: [
      {
        code: 'FIRST20',
        description: 'First booking discount',
        discountType: 'PERCENTAGE',
        discountValue: 20,
        minAmount: 500,
        maxDiscount: 200,
        usageLimit: 1000,
        perUserLimit: 1,
        validFrom: new Date(),
        validUntil: new Date('2025-12-31'),
        applicableFor: ['movies', 'events'],
      },
      {
        code: 'WEEKEND50',
        description: 'Weekend special',
        discountType: 'FIXED',
        discountValue: 50,
        minAmount: 300,
        validFrom: new Date(),
        validUntil: new Date('2025-12-31'),
        applicableFor: ['movies'],
      },
    ],
  });

  console.log('✅ Created promo codes');

  console.log('\n🎉 Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

Run seed:
```bash
npx prisma db seed
```

---

## 📊 **Database Structure**

Your Supabase database now has:

### **Core Tables**
- `users` - User accounts & authentication
- `theaters` - Theater/venue information
- `screens` - Theater screens/audis
- `seat_categories` - Seat pricing tiers
- `events` - Concerts, festivals, etc.
- `movies` - Movie catalog
- `showtimes` - Movie schedules
- `seats` - Individual seat inventory
- `seat_holds` - Temporary 10-min holds
- `bookings` - Ticket bookings

### **Engagement Tables**
- `reviews` - User ratings & reviews
- `loyalty_points` - Rewards program
- `points_history` - Points transactions
- `achievements` - Gamification badges
- `user_achievements` - Unlocked badges

### **Business Tables**
- `promo_codes` - Discount codes
- `food_items` - F&B menu
- `notifications` - User notifications
- `newsletters` - Email subscriptions
- `user_themes` - Theme preferences

---

## 🎯 **Using Prisma Client in Code**

```typescript
// backend/src/lib/prisma.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Usage in controllers:
import { prisma } from '../lib/prisma';

// Get all movies
const movies = await prisma.movie.findMany({
  where: { isActive: true },
  include: {
    showtimes: true,
    reviews: true,
  },
});

// Create booking
const booking = await prisma.booking.create({
  data: {
    bookingType: 'MOVIE',
    userId: user.id,
    showtimeId: showtime.id,
    seats: ['A1', 'A2'],
    totalAmount: 1600,
    // ...
  },
});
```

---

## 🔍 **Useful Prisma Commands**

```bash
# Generate Prisma Client (after schema changes)
npx prisma generate

# Create migration
npx prisma migrate dev --name feature_name

# Apply migrations to production
npx prisma migrate deploy

# Reset database (CAUTION: Deletes all data!)
npx prisma migrate reset

# Open Prisma Studio
npx prisma studio

# Format schema file
npx prisma format

# Validate schema
npx prisma validate

# Pull schema from existing database
npx prisma db pull

# Push schema to database (without migration)
npx prisma db push
```

---

## 🎨 **Supabase Dashboard Features**

### **Table Editor**
- View data in spreadsheet format
- Add/edit/delete rows
- Filter and sort
- Export to CSV

### **SQL Editor**
- Run custom SQL queries
- Create views
- Analyze data

### **Authentication** (Optional)
- User management
- OAuth providers
- Email templates

### **Storage** (For images)
- Upload event/movie posters
- CDN delivery
- Image transformations

---

## 🚀 **Next Steps**

1. ✅ Setup complete!
2. Run migrations: `npx prisma migrate dev`
3. Seed data: `npx prisma db seed`
4. Start building features!

---

## 🆘 **Troubleshooting**

### **Connection Error**
```
Error: P1001: Can't reach database server
```
**Solution:** Check DATABASE_URL in .env file

### **Migration Failed**
```
Error: Migration failed to apply
```
**Solution:** 
```bash
npx prisma migrate reset
npx prisma migrate dev
```

### **Prisma Client Not Generated**
```
Error: @prisma/client did not initialize yet
```
**Solution:**
```bash
npx prisma generate
```

---

**Your Supabase + Prisma setup is ready!** 🎉

