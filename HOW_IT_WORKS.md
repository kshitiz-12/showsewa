# 🎭 How ShowSewa Works - Complete System Overview

## 📋 **Table of Contents**
1. [User Journey](#user-journey)
2. [Admin Workflow](#admin-workflow)
3. [Event/Movie Update Flow](#eventmovie-update-flow)
4. [Authentication System](#authentication-system)
5. [Booking Process](#booking-process)

---

## 🚶 **User Journey**

### **1. Visitor (Not Logged In)**

```
┌─────────────┐
│   Homepage  │ → Browse events, movies
└──────┬──────┘
       │
       ├─→ View Events → Event Details
       ├─→ View Movies → Movie Details
       ├─→ Search/Filter content
       ├─→ Newsletter signup
       │
       └─→ Want to book? → Must Sign In
```

### **2. Registered User (Logged In)**

```
┌─────────────┐
│   Sign In   │
└──────┬──────┘
       │
       ├─→ Browse Events/Movies
       ├─→ Select Event/Movie
       ├─→ Choose Seats
       ├─→ Fill Details
       ├─→ Payment
       ├─→ Booking Confirmation
       │
       └─→ View "My Bookings"
```

### **3. Admin User**

```
┌─────────────┐
│ Admin Login │
└──────┬──────┘
       │
       ├─→ Dashboard
       ├─→ Create Event/Movie
       ├─→ Edit Event/Movie
       ├─→ Delete Event/Movie
       ├─→ View All Bookings
       ├─→ Manage Users
       └─→ View Statistics
```

---

## 👨‍💼 **Admin Workflow**

### **Creating a New Event**

```
Step 1: Admin logs in
   ↓
Step 2: POST /api/events with JWT token
   ↓
Step 3: Backend validates admin role
   ↓
Step 4: Event saved to MongoDB
   ↓
Step 5: Event immediately queryable via GET /api/events
   ↓
Step 6: Frontend fetches events
   ↓
Step 7: Users see the new event!
```

### **Example API Call**

```bash
# Create Event
curl -X POST http://localhost:5000/api/events \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Sajjan Raj Vaidya Live",
    "category": "concert",
    "event_date": "2024-12-25T18:00:00Z",
    "price_min": 1500,
    "price_max": 5000,
    "total_seats": 2000,
    ...
  }'
```

---

## 🔄 **Event/Movie Update Flow**

### **How Updates Reach Users**

```
╔════════════════════════════════════════════════════════════╗
║                    ADMIN MAKES CHANGE                      ║
╚════════════════════════════════════════════════════════════╝
                            ↓
╔════════════════════════════════════════════════════════════╗
║         Backend API (Express + MongoDB)                    ║
║  - Validates admin permission                              ║
║  - Updates/Creates/Deletes in database                     ║
╚════════════════════════════════════════════════════════════╝
                            ↓
╔════════════════════════════════════════════════════════════╗
║                MongoDB Database                            ║
║  Collections: events, movies, showtimes                    ║
╚════════════════════════════════════════════════════════════╝
                            ↓
╔════════════════════════════════════════════════════════════╗
║              Frontend Fetches Data                         ║
║  When:                                                     ║
║  - Component mounts (useEffect)                            ║
║  - User refreshes page                                     ║
║  - User navigates to page                                  ║
║  - Optional: Auto-refresh every 30s                        ║
╚════════════════════════════════════════════════════════════╝
                            ↓
╔════════════════════════════════════════════════════════════╗
║                 USERS SEE CHANGES                          ║
╚════════════════════════════════════════════════════════════╝
```

### **Timeline Example**

| Time | Action | What Users See |
|------|--------|----------------|
| 10:00 AM | Admin creates event | Old event list |
| 10:00 AM | Event saved to DB | Old event list |
| 10:01 AM | User opens Events page | **NEW event appears!** |
| 10:05 AM | Admin updates price | Old price (until refresh) |
| 10:06 AM | User refreshes page | **NEW price shows!** |

### **Real-time Updates (Optional)**

You can implement real-time updates using:

#### Option 1: Auto-Refresh (Simple)
```typescript
// In Events.tsx
useEffect(() => {
  const interval = setInterval(fetchEvents, 30000); // Every 30s
  return () => clearInterval(interval);
}, []);
```

#### Option 2: Server-Sent Events
```typescript
// Backend
app.get('/api/events/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  // Send updates when events change
});

// Frontend
const eventSource = new EventSource('/api/events/stream');
eventSource.onmessage = (e) => {
  const newEvent = JSON.parse(e.data);
  setEvents(prev => [...prev, newEvent]);
};
```

#### Option 3: WebSockets (Most Real-time)
```typescript
// Backend (Socket.io)
io.on('connection', (socket) => {
  socket.on('eventCreated', (event) => {
    io.emit('newEvent', event);
  });
});

// Frontend
socket.on('newEvent', (event) => {
  setEvents(prev => [...prev, event]);
});
```

---

## 🔐 **Authentication System**

### **Registration with OTP**

```
User enters email + password
    ↓
Frontend: POST /api/auth/send-otp
    ↓
Backend generates 6-digit OTP
    ↓
Email sent to user (OTP: 123456)
    ↓
User enters OTP
    ↓
Frontend: POST /api/auth/verify-otp
    ↓
OTP verified ✓
    ↓
Frontend: POST /api/auth/register
    ↓
Account created + JWT token issued
    ↓
User logged in automatically
    ↓
Token stored in localStorage
```

### **Login Process**

```
User enters email + password
    ↓
Frontend: POST /api/auth/login
    ↓
Backend validates credentials
    ↓
JWT token generated
    ↓
Token sent to frontend
    ↓
Frontend stores in localStorage
    ↓
All future API calls include token:
Authorization: Bearer eyJhbGc...
```

### **Protected Routes**

```typescript
// How it works in your app
const { isAuthenticated, user } = useAuth();

// In Navbar
{isAuthenticated ? (
  <UserMenu user={user} />
) : (
  <SignInButton />
)}

// In Booking page
if (!isAuthenticated) {
  navigate('/login');
}
```

---

## 🎫 **Booking Process**

### **Complete Flow**

```
1. User browses events/movies
   └─> Clicks "Book Now"
        ↓
2. Check if logged in?
   ├─> No → Redirect to /login
   └─> Yes → Continue
        ↓
3. Booking Page
   ├─> Select seats (A1, A2, A3)
   ├─> Enter customer details
   └─> Choose payment method
        ↓
4. Frontend: POST /api/bookings
   {
     "item_id": "event123",
     "seats": ["A1", "A2", "A3"],
     "total_amount": 4500,
     "payment_method": "esewa"
   }
        ↓
5. Backend creates booking
   ├─> Validates seat availability
   ├─> Generates booking reference (SS12ABC3)
   ├─> Updates available_seats
   └─> Sends confirmation email
        ↓
6. Payment redirect (eSewa/Khalti/Stripe)
        ↓
7. Payment success webhook
   └─> Update booking status: "completed"
        ↓
8. User sees confirmation
   └─> Booking reference: SS12ABC3
```

### **Seat Management**

```javascript
// When booking is created
Event Before: available_seats = 100
User books 3 seats
Event After: available_seats = 97

// In MongoDB update
db.events.updateOne(
  { _id: eventId },
  { $inc: { available_seats: -3 } }
)
```

---

## 📊 **Data Flow Architecture**

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                     │
│  - Components fetch data on mount                       │
│  - Display events, movies, bookings                     │
│  - Handle user interactions                             │
└────────────┬──────────────────────────┬─────────────────┘
             │                          │
    ┌────────▼────────┐        ┌────────▼────────┐
    │  GET /events    │        │ POST /bookings  │
    │  GET /movies    │        │ POST /events    │
    └────────┬────────┘        └────────┬────────┘
             │                          │
┌────────────▼──────────────────────────▼─────────────────┐
│              BACKEND API (Node.js/Express)              │
│  - Authentication & Authorization                       │
│  - Business Logic                                       │
│  - Validation                                           │
└────────────┬────────────────────────────────────────────┘
             │
┌────────────▼──────────────────────────────────────────┐
│                 MongoDB Database                       │
│  - users (authentication)                              │
│  - events (concerts, festivals, etc.)                  │
│  - movies (movie catalog)                              │
│  - showtimes (movie schedules)                         │
│  - bookings (ticket purchases)                         │
│  - newsletter (email subscriptions)                    │
└────────────────────────────────────────────────────────┘
```

---

## 🚀 **Making Changes Live**

### **Scenario 1: New Event Tomorrow**

```
Today 5:00 PM - Admin creates event
Today 5:00 PM - Event saved to database
Today 5:01 PM - Anyone visiting /events sees it
Today 6:00 PM - Featured on homepage
Tomorrow - Event happens!
```

### **Scenario 2: Price Change**

```
Event has price: Rs. 1000
Admin updates: Rs. 1200
Immediately in database
Next page load → Users see Rs. 1200
```

### **Scenario 3: Event Cancellation**

```
Admin sets: is_active = false
Event hidden from listings
Past bookings still in database
Users can't book anymore
```

### **Scenario 4: Sold Out**

```
Event has 10 seats left
10 people book simultaneously
Backend handles race condition:
- First 10 get confirmed
- Others get "Sold Out" message
available_seats = 0
```

---

## 🎯 **Key Points**

### ✅ **Events/Movies ARE Updated When:**
- Admin creates/updates via API
- Change is immediately in database
- Frontend fetches fresh data

### ❌ **Events/Movies NOT Updated Until:**
- User refreshes page
- User navigates to page
- Component re-mounts
- Auto-refresh interval (if implemented)

### 💡 **Best Practices:**
1. **Implement auto-refresh** for live updates
2. **Show loading states** during fetch
3. **Cache data** to reduce API calls
4. **Handle errors** gracefully
5. **Validate data** on both frontend & backend

---

## 📞 **Quick Reference**

### **API Endpoints**

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `/api/events` | GET | No | Get all events |
| `/api/events` | POST | Admin | Create event |
| `/api/events/:id` | PUT | Admin | Update event |
| `/api/events/:id` | DELETE | Admin | Delete event |
| `/api/movies` | GET | No | Get all movies |
| `/api/bookings` | POST | User | Create booking |
| `/api/bookings` | GET | User | Get my bookings |
| `/api/admin/dashboard` | GET | Admin | Dashboard stats |

### **User Roles**

| Role | Permissions |
|------|-------------|
| **Guest** | Browse events/movies, signup |
| **User** | Browse + book tickets + view bookings |
| **Admin** | Everything + create/edit/delete events/movies |

---

**Need Help?** Check `ADMIN_GUIDE.md` for detailed admin instructions!

