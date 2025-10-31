# City and Theater Data Implementation

## Overview
This document describes the comprehensive city and theater data structure implemented in ShowSewa.

## Features Implemented

### 1. City Selection with Province Filter
- **Complete City List**: All 7 provinces of Nepal with 100+ cities
- **Province-based Filtering**: Filter cities by province
- **Search Functionality**: Search by city name or province
- **Popular Cities**: Quick access to major cities
- **Geolocation**: Auto-detect user location

### 2. Theater Database
- **Real Theater Data**: Actual theaters in Nepal with contact information
- **25+ Theaters**: Across major cities including:
  - Kathmandu (QFX Civil Mall, Labim Mall, Cine de Chef, FCube, Big Movies)
  - Lalitpur (QFX Jai Nepal, Movie Time)
  - Pokhara (QFX Lakeside, Pokhara Multiplex)
  - Biratnagar (Ashirwad, Ratna Cinema)
  - Butwal (Gold Cinema, Rama Cinema)
  - Nepalgunj (Gold Multiplex, Central Cinema)
  - And many more cities

### 3. Theater Information Includes:
- Name (English & Nepali)
- City and Area
- Full Address
- Contact: Phone & Email
- Number of Screens
- Amenities (Dolby Atmos, IMAX, Premium Seats, etc.)
- Active Status

## Data Files

### `frontend/src/data/nepalCities.ts`
- Complete list of cities organized by province
- Province filtering functionality
- Helper functions:
  - `popularCities` - Get popular cities only
  - `getAllCities()` - Get all cities
  - `getCitiesByProvince(province)` - Filter by province
  - `getProvinces()` - Get all provinces

### `frontend/src/data/nepalTheaters.ts`
- Complete list of real theaters in Nepal
- Helper functions:
  - `getTheatersByCity(city)` - Get theaters in a city
  - `getTheaterById(id)` - Get specific theater
  - `getAllTheaters()` - Get all theaters

## Showtime Conflict Prevention

### Backend Implementation
Located in: `backend/src/controllers/adminController.ts`

**Conflict Detection Logic:**
1. Fetch movie duration from database
2. Parse showtime hours and minutes
3. Calculate new showtime end time (start + duration + 30 min buffer)
4. Fetch all existing showtimes for the same screen on the same date
5. Check for time overlaps between new and existing showtimes
6. Return 409 Conflict if overlap detected

**Features:**
- Uses actual movie duration (not fixed 3 hours)
- 30-minute buffer between showtimes
- Accurate time overlap calculation
- Returns detailed conflict information

**Example Conflict Response:**
```json
{
  "success": false,
  "message": "Screen conflict: This screen is already booked for 'Movie Title' at 14:30",
  "conflict": {
    "existingShowtime": "showtime-id",
    "movie": "Movie Title",
    "time": "14:30",
    "duration": 150
  }
}
```

## Usage

### Frontend: City Selection Modal
```typescript
import { CitySelectionModal } from './components/CitySelectionModal';

<CitySelectionModal
  isOpen={isCityModalOpen}
  onClose={() => setIsCityModalOpen(false)}
  onSelectCity={(city) => {
    setSelectedCity(city);
    localStorage.setItem('selectedCity', city);
  }}
  currentCity={selectedCity}
/>
```

### Backend: Creating Showtime with Conflict Check
```typescript
// Automatically checks for conflicts
POST /api/admin/showtimes
{
  "movieId": "movie-id",
  "screenId": "screen-id",
  "showDate": "2024-01-15",
  "showTime": "14:30",
  "price": 500,
  "language": "English"
}
```

## Benefits

1. **Better UX**: Users can easily find theaters in their city
2. **Accurate Data**: Real theater information with contacts
3. **No Double Booking**: Prevents scheduling conflicts
4. **Scalable**: Easy to add more cities and theaters
5. **User-Friendly**: Province-based filtering makes it easier to find cities

## Future Enhancements

1. Add more theaters to the database
2. Make theater creation easier by selecting from dropdown
3. Add theater ratings and reviews
4. Implement location-based theater recommendations
5. Add theater amenities filtering in booking flow
