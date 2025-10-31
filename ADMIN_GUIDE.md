# 🎯 ShowSewa Admin Guide

## How Events & Movies are Managed

### 📊 **System Architecture**

```
┌─────────────────┐
│  Admin Creates  │
│  Event/Movie    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Backend API   │
│  POST /events   │
│  POST /movies   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│    MongoDB      │
│   Database      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Frontend Fetch │
│  GET /events    │
│  GET /movies    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Users See It   │
│   Immediately   │
└─────────────────┘
```

---

## 🔐 **Admin Access**

### Creating an Admin Account

#### Method 1: Via Registration (Then Manual DB Update)
1. Register normally at `/login`
2. Connect to MongoDB
3. Update user document:
```javascript
db.users.updateOne(
  { email: "admin@showsewa.com" },
  { $set: { role: "admin" } }
)
```

#### Method 2: Via MongoDB Directly
```javascript
db.users.insertOne({
  name: "Admin User",
  email: "admin@showsewa.com",
  password: "$2a$12$...", // hashed password
  role: "admin",
  isVerified: true,
  createdAt: new Date(),
  updatedAt: new Date()
})
```

#### Method 3: Create Admin Seeder Script
```bash
cd backend
npm run seed:admin
```

---

## 📝 **Managing Events**

### **1. Create New Event**

**API Endpoint:**
```
POST http://localhost:5000/api/events
Authorization: Bearer YOUR_JWT_TOKEN
```

**Request Body:**
```json
{
  "title": "Metallica Live in Kathmandu",
  "title_ne": "काठमाडौंमा मेटालिका लाइभ",
  "description": "Experience the legendary Metallica live in concert!",
  "description_ne": "पौराणिक मेटालिका लाइभ कन्सर्टको अनुभव गर्नुहोस्!",
  "category": "concert",
  "image_url": "https://example.com/metallica.jpg",
  "venue": "Dasharath Stadium",
  "venue_ne": "दशरथ रंगशाला",
  "location": "Tripureshwor, Kathmandu",
  "location_ne": "त्रिपुरेश्वर, काठमाडौं",
  "event_date": "2024-12-31T18:00:00Z",
  "price_min": 2000,
  "price_max": 10000,
  "total_seats": 5000,
  "available_seats": 5000,
  "is_featured": true,
  "is_active": true
}
```

**What Happens:**
1. ✅ Event is created in MongoDB
2. ✅ Immediately available via `GET /api/events`
3. ✅ Frontend refreshes → Users see it instantly
4. ✅ Featured events appear on homepage

### **2. Update Existing Event**

**API Endpoint:**
```
PUT http://localhost:5000/api/events/:eventId
Authorization: Bearer YOUR_JWT_TOKEN
```

**Example - Update Price:**
```json
{
  "price_min": 2500,
  "price_max": 12000
}
```

**Example - Mark as Sold Out:**
```json
{
  "available_seats": 0
}
```

**Example - Cancel Event:**
```json
{
  "is_active": false
}
```

### **3. Delete Event**

**API Endpoint:**
```
DELETE http://localhost:5000/api/events/:eventId
Authorization: Bearer YOUR_JWT_TOKEN
```

**What Happens:**
- Event is permanently removed from database
- No longer appears in frontend
- Existing bookings remain in database for records

---

## 🎬 **Managing Movies**

### **1. Add New Movie**

**API Endpoint:**
```
POST http://localhost:5000/api/movies
Authorization: Bearer YOUR_JWT_TOKEN
```

**Request Body:**
```json
{
  "title": "Chhakka Panja 5",
  "title_ne": "छक्का पन्जा ५",
  "description": "The latest installment in the beloved comedy series",
  "description_ne": "प्रिय कमेडी श्रृंखलाको नवीनतम किस्ता",
  "poster_url": "https://example.com/chhakka-panja-5.jpg",
  "genre": "Comedy",
  "duration": 135,
  "language": "Nepali",
  "rating": "U/A",
  "release_date": "2024-11-15",
  "is_trending": true,
  "is_active": true
}
```

### **2. Add Showtimes for Movie**

**API Endpoint:**
```
POST http://localhost:5000/api/showtimes (you'll need to create this)
Authorization: Bearer YOUR_JWT_TOKEN
```

**Request Body:**
```json
{
  "movie_id": "movieId123",
  "theater": "QFX Cinemas Civil Mall",
  "theater_ne": "QFX सिनेमा सिभिल मल",
  "show_date": "2024-11-16",
  "show_time": "15:30",
  "price": 450,
  "total_seats": 200,
  "available_seats": 200,
  "is_active": true
}
```

### **3. Remove Movie from Listings**

```json
{
  "is_active": false
}
```

---

## 🔄 **How Frontend Updates Work**

### **Real-time Updates**

Your frontend components use **React state** and **fetch API** to get data:

```typescript
// In Events.tsx or Movies.tsx
useEffect(() => {
  const fetchData = async () => {
    const response = await fetch('http://localhost:5000/api/events');
    const data = await response.json();
    setEvents(data.data);
  };
  
  fetchData();
}, []); // Runs on component mount
```

### **When Updates Appear:**

| Action | When Users See It |
|--------|------------------|
| Admin creates event | **Next page refresh** or **next component mount** |
| Admin updates event | **When page is reloaded** |
| Admin deletes event | **Immediately on next fetch** |
| User books ticket | **Seat count updates on next fetch** |

### **Making Updates Real-time (Optional Enhancements)**

#### Option 1: Auto-refresh with Polling
```typescript
useEffect(() => {
  const interval = setInterval(() => {
    fetchEvents();
  }, 30000); // Refresh every 30 seconds
  
  return () => clearInterval(interval);
}, []);
```

#### Option 2: WebSocket (Advanced)
```typescript
// Backend
import { Server } from 'socket.io';

io.on('connection', (socket) => {
  socket.on('eventCreated', (event) => {
    socket.broadcast.emit('newEvent', event);
  });
});

// Frontend
socket.on('newEvent', (event) => {
  setEvents(prev => [...prev, event]);
});
```

#### Option 3: React Query (Recommended)
```typescript
import { useQuery } from '@tanstack/react-query';

const { data, refetch } = useQuery({
  queryKey: ['events'],
  queryFn: fetchEvents,
  refetchInterval: 30000, // Auto-refetch every 30s
});
```

---

## 📱 **Admin Dashboard (To Be Built)**

### Suggested Features:

```typescript
// AdminDashboard.tsx
function AdminDashboard() {
  return (
    <div>
      {/* Statistics */}
      <StatsCards />
      
      {/* Quick Actions */}
      <button onClick={() => navigate('/admin/events/new')}>
        Add New Event
      </button>
      <button onClick={() => navigate('/admin/movies/new')}>
        Add New Movie
      </button>
      
      {/* Recent Bookings */}
      <RecentBookings />
      
      {/* Active Events/Movies Table */}
      <EventsTable 
        onEdit={handleEdit}
        onDelete={handleDelete}
        onToggleActive={handleToggleActive}
      />
    </div>
  );
}
```

---

## 🛠️ **Testing the System**

### **1. Create Admin User**

```bash
# Using your backend API
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "email": "admin@showsewa.com",
    "password": "admin123"
  }'

# Then update in MongoDB
db.users.updateOne(
  { email: "admin@showsewa.com" },
  { $set: { role: "admin" } }
)
```

### **2. Login as Admin**

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@showsewa.com",
    "password": "admin123"
  }'

# Save the returned JWT token
```

### **3. Create Test Event**

```bash
curl -X POST http://localhost:5000/api/events \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "Test Concert",
    "title_ne": "परीक्षण कन्सर्ट",
    "description": "Test event description",
    "description_ne": "परीक्षण घटना विवरण",
    "category": "concert",
    "image_url": "https://picsum.photos/400/300",
    "venue": "Test Venue",
    "venue_ne": "परीक्षण स्थल",
    "location": "Kathmandu",
    "location_ne": "काठमाडौं",
    "event_date": "2024-12-31T18:00:00Z",
    "price_min": 1000,
    "price_max": 5000,
    "total_seats": 1000,
    "available_seats": 1000,
    "is_featured": true,
    "is_active": true
  }'
```

### **4. Check Frontend**

1. Open http://localhost:5174
2. Navigate to Events page
3. **Your new event should appear!**

---

## 🔍 **Filtering & Search**

Users can find events using query parameters:

### **Filter by Category**
```
GET /api/events?category=concert
GET /api/events?category=sports
```

### **Search by Name**
```
GET /api/events?search=metallica
```

### **Get Featured Events**
```
GET /api/events?featured=true
```

### **Pagination**
```
GET /api/events?page=1&limit=10
```

### **Combined Filters**
```
GET /api/events?category=concert&featured=true&search=rock&page=1&limit=20
```

---

## 📊 **Database Collections**

### **events**
- Stores all event information
- `is_active`: Controls visibility
- `is_featured`: Shows on homepage
- `available_seats`: Updates on bookings

### **movies**
- Stores all movie information
- `is_trending`: Shows in trending section
- `is_active`: Controls visibility

### **showtimes**
- Links movies to theaters
- Multiple showtimes per movie
- Each showtime has its own seat count

### **bookings**
- Records all ticket purchases
- Links to events or movies
- Updates available_seats

---

## 🚀 **Production Deployment**

### **Database Considerations:**

1. **MongoDB Atlas** (Recommended)
   - Automatic backups
   - Scalable
   - Global distribution

2. **Regular Backups**
   ```bash
   mongodump --uri="mongodb://..." --out=backup-$(date +%Y%m%d)
   ```

3. **Indexes for Performance**
   ```javascript
   db.events.createIndex({ event_date: 1, is_active: 1 });
   db.events.createIndex({ is_featured: 1 });
   db.movies.createIndex({ is_trending: 1, is_active: 1 });
   ```

---

## 📞 **Support**

For admin-related issues:
- Backend API: http://localhost:5000/api/health
- MongoDB: Check connection in backend logs
- Email: admin@showsewa.com

---

**Remember:** All changes to events/movies are **immediate** on the backend. Frontend updates depend on when the component re-fetches data (page refresh, component mount, or auto-refresh if implemented).

