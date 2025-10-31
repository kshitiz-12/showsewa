# 🤖 Automated Event Lifecycle System

## 📋 Overview

Your ShowSewa platform now has a **semi-automated event management system** that automatically handles event lifecycle transitions based on start and end dates.

---

## 🎯 **How It Works**

### **Event Lifecycle**

```
┌─────────────────────────────────────────────────────────┐
│  ADMIN CREATES EVENT                                    │
│  - Sets event_date (start)                              │
│  - Sets end_date (end)                                  │
│  - Status: "upcoming"                                   │
│  - is_active: true                                      │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│  BEFORE EVENT START                                     │
│  Status: "upcoming"                                     │
│  - Visible on website ✓                                 │
│  - Users can book ✓                                     │
│  - Featured on homepage ✓                               │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼ event_date reached
┌─────────────────────────────────────────────────────────┐
│  EVENT STARTED (Automatic)                              │
│  Status: "ongoing"                                      │
│  - Still visible ✓                                      │
│  - Booking available ✓                                  │
│  - Shows "Event in Progress" badge                      │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼ end_date reached
┌─────────────────────────────────────────────────────────┐
│  EVENT ENDED (Automatic)                                │
│  Status: "completed"                                    │
│  - is_active: false                                     │
│  - is_featured: false                                   │
│  - REMOVED from website ✓                               │
│  - No longer bookable ✗                                 │
└─────────────────────────────────────────────────────────┘
```

---

## ⚙️ **Automated Jobs**

### **1. Hourly Status Update** (Runs every hour)

```javascript
// Updates event statuses automatically
- upcoming → ongoing (when event_date passes)
- ongoing → completed (when end_date passes)
- Hides completed events from listings
```

**Schedule:** `0 * * * *` (Every hour at :00)

**What it does:**
- ✅ Marks events as "ongoing" if started
- ✅ Marks events as "completed" if ended
- ✅ Hides completed events automatically
- ✅ Removes featured flag from completed events

### **2. Daily Reminders** (Runs at 9 AM)

```javascript
// Sends reminders for events starting in 24 hours
```

**Schedule:** `0 9 * * *` (Every day at 9:00 AM)

**What it does:**
- 📧 Finds events starting tomorrow
- 📧 Sends email reminders to users with bookings
- 📧 Prepares event notifications

### **3. Weekly Cleanup** (Runs Sunday 2 AM)

```javascript
// Archives old completed events
```

**Schedule:** `0 2 * * 0` (Sunday at 2:00 AM)

**What it does:**
- 🗑️ Archives events completed > 90 days ago
- 🗑️ Removes trending flag from old movies
- 🗑️ Database cleanup

---

## 📝 **Creating an Event with Automation**

### **Admin Input Required:**

```json
{
  "title": "Metallica Live in Kathmandu",
  "title_ne": "काठमाडौंमा मेटालिका लाइभ",
  "event_date": "2024-12-31T18:00:00Z",   // START DATE & TIME
  "end_date": "2024-12-31T23:00:00Z",     // END DATE & TIME
  "category": "concert",
  "venue": "Dasharath Stadium",
  "location": "Kathmandu",
  "price_min": 2000,
  "price_max": 10000,
  "total_seats": 5000,
  "available_seats": 5000,
  "is_featured": true
}
```

### **System Automatically Handles:**

1. ✅ Sets initial `status: "upcoming"`
2. ✅ Sets `is_active: true`
3. ✅ On Dec 31, 6:00 PM → Changes to `status: "ongoing"`
4. ✅ On Dec 31, 11:00 PM → Changes to `status: "completed"`
5. ✅ Automatically hides from website
6. ✅ Removes from featured listings

---

## 🎛️ **Admin Controls**

### **Manual Trigger (Testing)**

Admins can manually trigger the automation system:

```bash
POST http://localhost:5000/api/admin/scheduler/trigger
Authorization: Bearer YOUR_JWT_TOKEN
```

**Use cases:**
- Testing automation
- Force status update
- Immediate cleanup

### **Get Event Statistics**

```bash
GET http://localhost:5000/api/admin/scheduler/stats
Authorization: Bearer YOUR_JWT_TOKEN
```

**Returns:**
```json
{
  "success": true,
  "data": {
    "upcoming": 15,
    "ongoing": 3,
    "completed": 48,
    "cancelled": 2,
    "total": 68,
    "endingToday": 2,
    "startingToday": 1
  }
}
```

---

## 📅 **Event Status Guide**

| Status | Description | Visible? | Bookable? | Auto-transition |
|--------|-------------|----------|-----------|-----------------|
| `upcoming` | Before start date | ✅ Yes | ✅ Yes | → ongoing (at event_date) |
| `ongoing` | Between start & end | ✅ Yes | ✅ Yes | → completed (at end_date) |
| `completed` | After end date | ❌ No | ❌ No | None |
| `cancelled` | Admin cancelled | ❌ No | ❌ No | None (manual only) |

---

## 🕐 **Timeline Examples**

### **Example 1: Single Day Event**

```
Event: "Concert Night"
Start: Dec 25, 2024 7:00 PM
End: Dec 25, 2024 11:00 PM

Timeline:
├─ Dec 1-24: Status = "upcoming" (Visible, Bookable)
├─ Dec 25, 7:00 PM: Status → "ongoing" (Still visible, Still bookable)
├─ Dec 25, 11:00 PM: Status → "completed" (Hidden, Not bookable)
└─ Auto-removed from website ✓
```

### **Example 2: Multi-Day Festival**

```
Event: "Holi Festival 2025"
Start: Mar 14, 2025 10:00 AM
End: Mar 16, 2025 8:00 PM

Timeline:
├─ Feb 1 - Mar 13: Status = "upcoming"
├─ Mar 14, 10:00 AM: Status → "ongoing"
├─ Mar 14-16: Status = "ongoing" (3 days)
├─ Mar 16, 8:00 PM: Status → "completed"
└─ Auto-removed from website ✓
```

### **Example 3: Movie Screening**

```
Event: "Special Movie Screening"
Start: Nov 20, 2024 3:00 PM
End: Nov 20, 2024 5:30 PM

Timeline:
├─ Nov 1-19: Status = "upcoming"
├─ Nov 20, 3:00 PM: Status → "ongoing"
├─ Nov 20, 5:30 PM: Status → "completed"
└─ Auto-removed immediately ✓
```

---

## 🔧 **Configuration**

### **Scheduler Settings**

Located in: `backend/src/services/eventScheduler.ts`

```typescript
// Change update frequency
cron.schedule('0 * * * *', updateEventStatuses); // Every hour

// Change to every 15 minutes
cron.schedule('*/15 * * * *', updateEventStatuses);

// Change to every 5 minutes (for testing)
cron.schedule('*/5 * * * *', updateEventStatuses);
```

### **Archive Settings**

```typescript
// Archive events after 7 days (default)
const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

// Change to 1 day
const oneDayAgo = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000);

// Change to 30 days
const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
```

---

## 📊 **Database Changes**

### **New Fields in Event Model**

```javascript
{
  event_date: Date,      // START date & time
  end_date: Date,        // END date & time (NEW!)
  status: String,        // 'upcoming' | 'ongoing' | 'completed' | 'cancelled' (NEW!)
  is_active: Boolean,    // Visibility control
  is_featured: Boolean   // Homepage featured
}
```

### **Automatic Updates**

```javascript
// When end_date passes:
{
  status: 'completed',
  is_active: false,
  is_featured: false
}
```

---

## 🎮 **Testing the System**

### **1. Create a Test Event (Ends in 1 hour)**

```bash
curl -X POST http://localhost:5000/api/events \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Event",
    "title_ne": "परीक्षण कार्यक्रम",
    "event_date": "2024-11-20T15:00:00Z",
    "end_date": "2024-11-20T16:00:00Z",   # 1 hour duration
    "category": "concert",
    ...
  }'
```

### **2. Manually Trigger Scheduler**

```bash
curl -X POST http://localhost:5000/api/admin/scheduler/trigger \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### **3. Check Event Status**

```bash
curl http://localhost:5000/api/events/:eventId
```

---

## 🚨 **Important Notes**

### **✅ What Happens Automatically:**
- Status updates (upcoming → ongoing → completed)
- Event visibility changes
- Featured status removal
- Booking prevention after end_date

### **❌ What Requires Manual Action:**
- Creating events
- Setting prices
- Cancelling events
- Refunding bookings
- Sending custom notifications

### **⚠️ Things to Remember:**
1. **Always set both dates**: `event_date` and `end_date`
2. **End date must be after start date**
3. **Times are in UTC** - adjust for Nepal timezone
4. **Scheduler runs hourly** - updates aren't instant
5. **Completed events are hidden** - but stay in database

---

## 📞 **Troubleshooting**

### **Events not updating?**

```bash
# Check scheduler logs
tail -f backend/logs/scheduler.log

# Manually trigger
POST /api/admin/scheduler/trigger

# Check event status
GET /api/admin/scheduler/stats
```

### **Event disappeared too early?**

- Check `end_date` is correct
- Verify timezone settings
- Check if manually cancelled

### **Event still visible after end_date?**

- Wait for next hourly run
- Manually trigger scheduler
- Check `is_active` flag

---

## 🎯 **Best Practices**

1. **Set realistic end dates**
   - Add buffer time (e.g., cleanup time)
   - Account for delays

2. **Use status for display**
   ```typescript
   if (event.status === 'ongoing') {
     return <Badge>LIVE NOW</Badge>
   }
   ```

3. **Handle timezone properly**
   ```javascript
   // Convert Nepal time to UTC
   const nepalTime = new Date('2024-12-31 18:00');
   const utcTime = new Date(nepalTime.getTime() - (5.75 * 60 * 60 * 1000));
   ```

4. **Monitor scheduler health**
   - Check logs daily
   - Review statistics weekly
   - Test with dummy events

---

## 🔄 **Migration from Old System**

If you have existing events without `end_date`:

```javascript
// Add default end_date (1 day after event_date)
db.events.updateMany(
  { end_date: { $exists: false } },
  [{
    $set: {
      end_date: {
        $add: ["$event_date", 24 * 60 * 60 * 1000] // +1 day
      },
      status: "upcoming"
    }
  }]
);
```

---

## 📈 **Future Enhancements**

Possible additions:
- Email notifications before event starts
- SMS reminders
- Auto-refund for cancelled events
- Dynamic pricing based on availability
- Waitlist for sold-out events
- Real-time seat updates via WebSocket

---

**Your event management is now semi-automated! Admin sets the dates, system handles the rest.** 🎉

