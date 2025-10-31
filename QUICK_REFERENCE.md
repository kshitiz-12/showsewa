# ⚡ ShowSewa Quick Reference Guide

## 🎯 **Event Automation - TL;DR**

```
Admin enters: Start Date + End Date
System does: Everything else automatically!
```

---

## 📝 **Creating an Event (Admin)**

### **Required Fields Now:**

```json
{
  "event_date": "2024-12-31T18:00:00Z",    ← START
  "end_date": "2024-12-31T23:00:00Z",      ← END (NEW!)
  // ... other fields
}
```

### **What Happens:**

| Time | Status | Visible? | Action |
|------|--------|----------|--------|
| Before start | `upcoming` | ✅ Yes | Users can book |
| At start time | `ongoing` | ✅ Yes | Auto-updated hourly |
| At end time | `completed` | ❌ No | **Auto-removed!** |

---

## 🔄 **Automated Schedule**

```
⏰ Every Hour (0:00)     → Update event statuses
⏰ Daily at 9 AM         → Send event reminders  
⏰ Sunday at 2 AM        → Cleanup old data
```

---

## 🎛️ **Admin API Endpoints**

### **Manual Trigger**
```bash
POST /api/admin/scheduler/trigger
Headers: Authorization: Bearer YOUR_JWT_TOKEN
```

### **Get Stats**
```bash
GET /api/admin/scheduler/stats
```

**Response:**
```json
{
  "upcoming": 15,
  "ongoing": 3,
  "completed": 48,
  "endingToday": 2
}
```

---

## 📅 **Example Scenarios**

### **1-Hour Concert**
```
Start: 7:00 PM
End: 11:00 PM
Result: Auto-removed at 11 PM ✓
```

### **3-Day Festival**
```
Start: March 14
End: March 16
Result: Visible for 3 days, removed after ✓
```

### **All-Day Event**
```
Start: 10:00 AM
End: 10:00 PM
Result: Full day visible, removed at night ✓
```

---

## 🚀 **Quick Setup**

1. **Backend already configured!** ✓
2. **Scheduler auto-starts** ✓
3. **Just add `end_date` when creating events** ✓

---

## 🔍 **Checking If It Works**

```bash
# 1. Check logs
Backend shows: "✅ Event Status Update Complete"

# 2. Create test event (ends in 1 hour)
POST /api/events with end_date = now + 1 hour

# 3. Wait 1 hour or trigger manually
POST /api/admin/scheduler/trigger

# 4. Check if event is hidden
GET /api/events
# Your test event should be gone!
```

---

## 📊 **Event Status Flow**

```
upcoming → ongoing → completed
   ↓         ↓          ↓
 Visible  Visible    HIDDEN
 Bookable Bookable   Not Bookable
```

---

## ⚠️ **Important**

- ✅ System updates **every hour**
- ✅ Events with `end_date` in the past = **auto-hidden**
- ✅ `status` field is automatic (don't set manually)
- ✅ Times are **UTC** (Nepal is UTC+5:45)

---

## 🎨 **Nepal Time Conversion**

```javascript
// Nepal: 6:00 PM
const nepalTime = new Date('2024-12-31T18:00:00+05:45');

// UTC: 12:15 PM
const utcTime = new Date('2024-12-31T12:15:00Z');
```

---

## 🔧 **Configuration Files**

| File | Purpose |
|------|---------|
| `backend/src/services/eventScheduler.ts` | Automation logic |
| `backend/src/models/Event.ts` | Added `end_date` & `status` |
| `backend/src/controllers/schedulerController.ts` | Admin controls |

---

## 📞 **Troubleshooting**

| Problem | Solution |
|---------|----------|
| Events not updating | Wait for next hour or trigger manually |
| Event gone too soon | Check `end_date` value |
| Status not changing | Check server logs for errors |

---

## 🎯 **Testing Command**

```bash
# Create event ending in 5 minutes
curl -X POST http://localhost:5000/api/events \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "event_date": "2024-11-20T10:00:00Z",
    "end_date": "2024-11-20T10:05:00Z",
    ...
  }'

# After 5 minutes, trigger:
curl -X POST http://localhost:5000/api/admin/scheduler/trigger \
  -H "Authorization: Bearer ADMIN_TOKEN"

# Event should be hidden now!
```

---

**That's it! Admin sets dates, system handles lifecycle.** 🎉

See `AUTOMATED_SYSTEM.md` for detailed documentation.

