import { Theater } from '../data/nepalTheaters';

export interface TheaterApiResponse {
  success: boolean;
  data: {
    theaters: Theater[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

export interface CreateTheaterRequest {
  name: string;
  nameNe?: string;
  city: string;
  area: string;
  address: string;
  phone?: string;
  email?: string;
  description?: string;
  amenities: string[];
  screenCount?: number;
  seatsPerScreen?: number;
}

export interface UpdateTheaterRequest {
  name?: string;
  nameNe?: string;
  city?: string;
  area?: string;
  address?: string;
  phone?: string;
  email?: string;
  description?: string;
  amenities?: string[];
  isActive?: boolean;
}

class TheaterService {
  private baseUrl = 'http://localhost:5000/api';

  /**
   * Get all theaters with pagination
   */
  async getTheaters(page = 1, limit = 50, city?: string): Promise<TheaterApiResponse> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      
      if (city) {
        params.append('city', city);
      }

      const response = await fetch(`${this.baseUrl}/admin/theaters?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch theaters: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching theaters:', error);
      throw error;
    }
  }

  /**
   * Get theaters by city
   */
  async getTheatersByCity(city: string): Promise<Theater[]> {
    try {
      const response = await this.getTheaters(1, 100, city);
      return response.data.theaters;
    } catch (error) {
      console.error(`Error fetching theaters for city ${city}:`, error);
      // Fallback to static data if API fails
      return this.getStaticTheatersByCity(city);
    }
  }

  /**
   * Get single theater by ID
   */
  async getTheaterById(id: string): Promise<Theater | null> {
    try {
      const response = await fetch(`${this.baseUrl}/admin/theaters/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch theater: ${response.statusText}`);
      }

      const result = await response.json();
      return result.success ? result.data.theater : null;
    } catch (error) {
      console.error('Error fetching theater:', error);
      return null;
    }
  }

  /**
   * Create a new theater
   */
  async createTheater(theaterData: CreateTheaterRequest): Promise<Theater> {
    try {
      const response = await fetch(`${this.baseUrl}/admin/theaters`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(theaterData),
      });

      if (!response.ok) {
        throw new Error(`Failed to create theater: ${response.statusText}`);
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.message || 'Failed to create theater');
      }

      return result.data.theater;
    } catch (error) {
      console.error('Error creating theater:', error);
      throw error;
    }
  }

  /**
   * Update an existing theater
   */
  async updateTheater(id: string, theaterData: UpdateTheaterRequest): Promise<Theater> {
    try {
      const response = await fetch(`${this.baseUrl}/admin/theaters/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(theaterData),
      });

      if (!response.ok) {
        throw new Error(`Failed to update theater: ${response.statusText}`);
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.message || 'Failed to update theater');
      }

      return result.data.theater;
    } catch (error) {
      console.error('Error updating theater:', error);
      throw error;
    }
  }

  /**
   * Delete a theater
   */
  async deleteTheater(id: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/admin/theaters/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      return response.ok;
    } catch (error) {
      console.error('Error deleting theater:', error);
      return false;
    }
  }

  /**
   * Sync static theaters to database (for initial setup)
   */
  async syncStaticTheaters(): Promise<{ success: number; failed: number; errors: string[] }> {
    const { nepalTheaters } = await import('../data/nepalTheaters');
    const results = { success: 0, failed: 0, errors: [] as string[] };

    for (const theater of nepalTheaters) {
      try {
        await this.createTheater({
          name: theater.name,
          nameNe: theater.nameNe,
          city: theater.city,
          area: theater.area,
          address: theater.address,
          phone: theater.phone,
          email: theater.email,
          amenities: theater.amenities,
          screenCount: theater.screens,
          seatsPerScreen: 200, // Default
        });
        results.success++;
        console.log(`✅ Synced theater: ${theater.name}`);
      } catch (error) {
        results.failed++;
        results.errors.push(`${theater.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        console.error(`❌ Failed to sync theater ${theater.name}:`, error);
      }
    }

    return results;
  }

  /**
   * Fallback to static data when API fails
   */
  private async getStaticTheatersByCity(city: string): Promise<Theater[]> {
    const { getTheatersByCity } = await import('../data/nepalTheaters');
    return getTheatersByCity(city);
  }

  /**
   * Get theaters with caching
   */
  async getTheatersWithCache(city: string, forceRefresh = false): Promise<Theater[]> {
    const cacheKey = `theaters_${city}`;
    const cacheExpiry = 5 * 60 * 1000; // 5 minutes

    if (!forceRefresh) {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        try {
          const { data, timestamp } = JSON.parse(cached);
          if (Date.now() - timestamp < cacheExpiry) {
            console.log(`📦 Using cached theaters for ${city}`);
            return data;
          }
        } catch (error) {
          console.warn('Failed to parse cached theaters:', error);
        }
      }
    }

    try {
      const theaters = await this.getTheatersByCity(city);
      
      // Cache the result
      localStorage.setItem(cacheKey, JSON.stringify({
        data: theaters,
        timestamp: Date.now(),
      }));

      return theaters;
    } catch (error) {
      console.error('Failed to fetch theaters, using static data:', error);
      return this.getStaticTheatersByCity(city);
    }
  }
}

export const theaterService = new TheaterService();
