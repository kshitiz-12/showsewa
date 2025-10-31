# How City Selection Modal Works (BookMyShow Style)

## Purpose
The city selection modal filters **theaters and showtimes** based on the selected city, just like BookMyShow.

## How It Works

### 1. **City Selection Triggers Filtering**
When a user selects a city:
- Movies page only shows movies that have showtimes in theaters of that city
- Theater listings filter to that city
- Showtimes are filtered by city

### 2. **Backend City Filtering**
```typescript
// GET /api/movies?city=Kathmandu
// Returns only movies that have showtimes in Kathmandu theaters

if (city) {
  movies = await prisma.movie.findMany({
    where: {
      showtimes: {
        some: {
          screen: {
            theater: {
              city: { equals: city, mode: 'insensitive' }
            }
          }
        }
      }
    },
    include: {
      showtimes: {
        where: {
          screen: {
            theater: {
              city: { equals: city, mode: 'insensitive' }
            }
          }
        }
      }
    }
  });
}
```

### 3. **Frontend City Context**
```typescript
// CityContext provides global city state
const { selectedCity, setSelectedCity } = useCity();

// Movies component automatically filters by city
useEffect(() => {
  loadMovies(); // Reloads when city changes
}, [selectedCity]);
```

### 4. **User Flow Example**

1. **User visits Movies page** → Shows all movies
2. **User clicks "Kathmandu ▼"** → City selection modal opens
3. **User selects "Pokhara"** → Modal closes, city updates to "Pokhara"
4. **Movies page automatically reloads** → Only shows movies with showtimes in Pokhara theaters
5. **User clicks on a movie** → Movie detail page shows only Pokhara showtimes

### 5. **Real Example**

**Before city selection:**
- Movie A: Showtimes in Kathmandu, Pokhara, Biratnagar
- Movie B: Showtimes in Kathmandu, Butwal
- Movie C: Showtimes in Pokhara only

**After selecting "Pokhara":**
- Movie A: Only Pokhara showtimes shown
- Movie B: Not shown (no Pokhara showtimes)
- Movie C: Only Pokhara showtimes shown

### 6. **Components Affected**

- **Movies Page**: Filters movies by city
- **Movie Detail**: Shows only city-specific showtimes
- **Theater Listings**: Shows only city theaters
- **Booking Page**: Only city theaters available
- **Admin Dashboard**: Can filter by city

### 7. **Data Flow**

```
User selects city
↓
CityContext updates selectedCity
↓
Movies component detects city change
↓
API call: GET /api/movies?city=Pokhara
↓
Backend filters movies with Pokhara showtimes
↓
Frontend displays filtered results
```

### 8. **Benefits**

- **Accurate Results**: Only shows relevant theaters/showtimes
- **Better UX**: Users see only what's available in their city
- **Performance**: Reduces data load
- **Real-world Usage**: Matches how BookMyShow works

This implementation ensures that when users select a city, they only see movies and showtimes that are actually available in theaters of that city, providing a much more relevant and useful experience.

