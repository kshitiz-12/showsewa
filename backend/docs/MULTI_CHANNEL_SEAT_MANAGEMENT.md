# Multi-Channel Seat Management System

## Overview

This system handles seat management across multiple booking channels:
- ShowSewa platform (our website/app)
- Walk-in customers (theater counter)
- Other booking platforms (BookMyShow, etc.)
- Theater's own POS system

## Core Concepts

### 1. Single Source of Truth
- The database is the **authoritative source** for seat availability
- All booking systems must update seat status immediately
- Real-time synchronization prevents double bookings

### 2. Booking Sources
We track where each booking comes from:
- `SHOWSEWA` - Our platform bookings
- `WALK_IN` - Theater counter sales
- `OTHER_PLATFORM` - External booking sites
- `POS_SYSTEM` - Theater's point-of-sale system

### 3. Seat Status Lifecycle
```
AVAILABLE → (User selects) → HELD → (Payment completes) → BOOKED
     ↓                           ↓                        ↓
BLOCKED (maintenance)     EXPIRED (timeout)        CANCELLED
```

## API Endpoints

### Get Real-Time Seat Availability
```http
GET /api/seat-sync/availability/:showtimeId
```
Returns current seat status including:
- Available seats
- Booked seats (from all sources)
- Temporarily held seats
- Blocked seats

### Bulk Seat Updates (For Theater Systems)
```http
POST /api/seat-sync/bulk-update
Authorization: Bearer <admin-token>
```
Body:
```json
{
  "showtimeId": "showtime-id",
  "seatUpdates": [
    {
      "seatNumber": "A1",
      "status": "BOOKED",
      "bookingSource": "WALK_IN",
      "bookingReference": "POS-12345",
      "timestamp": "2024-01-15T10:30:00Z"
    }
  ]
}
```

### Block Seats (Theater Management)
```http
POST /api/seat-sync/block
Authorization: Bearer <admin-token>
```
Body:
```json
{
  "seatIds": ["seat-id-1", "seat-id-2"],
  "reason": "Maintenance"
}
```

## Integration Examples

### 1. Theater POS System Integration
```javascript
// When theater sells ticket at counter
const updateSeats = async (showtimeId, seatNumbers) => {
  const response = await fetch('/api/seat-sync/bulk-update', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${theaterToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      showtimeId,
      seatUpdates: seatNumbers.map(seatNumber => ({
        seatNumber,
        status: 'BOOKED',
        bookingSource: 'WALK_IN',
        bookingReference: `POS-${Date.now()}`,
        timestamp: new Date().toISOString()
      }))
    })
  });
};
```

### 2. External Platform Integration
```javascript
// When BookMyShow or other platform books seats
const syncBooking = async (externalBooking) => {
  await fetch('/api/seat-sync/bulk-update', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${platformToken}` },
    body: JSON.stringify({
      showtimeId: externalBooking.showtimeId,
      seatUpdates: externalBooking.seats.map(seat => ({
        seatNumber: seat.number,
        status: 'BOOKED',
        bookingSource: 'OTHER_PLATFORM',
        bookingReference: externalBooking.reference,
        timestamp: new Date().toISOString()
      }))
    })
  });
};
```

## Data Flow

### 1. User Books on ShowSewa
1. User selects seats on our website
2. Seats marked as HELD (temporary)
3. User completes payment
4. Seats marked as BOOKED with source: SHOWSEWA
5. All other systems see updated availability

### 2. Walk-in Customer at Theater
1. Theater staff sells ticket at counter
2. Theater POS calls our bulk-update API
3. Seats immediately marked as BOOKED with source: WALK_IN
4. Our platform shows seats as unavailable

### 3. External Platform Booking
1. Customer books on BookMyShow
2. BookMyShow calls our sync API
3. Seats marked as BOOKED with source: OTHER_PLATFORM
4. All systems updated in real-time

## Benefits

### ✅ Prevents Double Bookings
- Single source of truth eliminates conflicts
- Real-time synchronization across all channels

### ✅ Complete Booking History
- Track all sales regardless of source
- Analytics and reporting capabilities

### ✅ Flexible Integration
- Works with any POS system
- Easy integration with external platforms

### ✅ Real-Time Updates
- Users always see current availability
- No stale data issues

## Security

- All bulk updates require authentication
- Theater tokens for POS systems
- Platform tokens for external integrations
- Audit trail for all seat changes

## Monitoring

- Real-time seat availability tracking
- Booking source analytics
- Revenue tracking by channel
- Conflict detection and resolution
