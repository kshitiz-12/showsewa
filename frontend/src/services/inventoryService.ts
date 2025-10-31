import { Theater } from '../data/nepalTheaters';

export interface SeatInventory {
  theaterId: string;
  screenId: string;
  showtimeId: string;
  totalSeats: number;
  availableSeats: number;
  reservedSeats: number; // Temporarily held
  soldSeats: number;
  blockedSeats: number; // Maintenance/technical issues
  lastUpdated: string;
}

export interface ChannelBooking {
  id: string;
  channel: 'SHOWSEWA' | 'WALK_IN' | 'OTHER_PLATFORM' | 'POS_SYSTEM';
  theaterId: string;
  showtimeId: string;
  seats: string[];
  bookingReference: string;
  status: 'CONFIRMED' | 'PENDING' | 'CANCELLED';
  createdAt: string;
  updatedAt: string;
}

export interface TheaterChannel {
  theaterId: string;
  channels: {
    showsewa: boolean;
    walkIn: boolean;
    otherPlatform: boolean;
    posSystem: boolean;
  };
  syncSettings: {
    autoSync: boolean;
    syncInterval: number; // minutes
    lastSync: string;
  };
}

class InventoryService {
  private baseUrl = 'http://localhost:5000/api';

  /**
   * Get real-time seat inventory for a showtime
   */
  async getSeatInventory(showtimeId: string): Promise<SeatInventory> {
    try {
      const response = await fetch(`${this.baseUrl}/inventory/showtime/${showtimeId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch inventory: ${response.statusText}`);
      }

      const result = await response.json();
      return result.data.inventory;
    } catch (error) {
      console.error('Error fetching seat inventory:', error);
      throw error;
    }
  }

  /**
   * Reserve seats temporarily (for booking process)
   */
  async reserveSeats(showtimeId: string, seats: string[], duration = 10): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/inventory/reserve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          showtimeId,
          seats,
          duration, // minutes
        }),
      });

      return response.ok;
    } catch (error) {
      console.error('Error reserving seats:', error);
      return false;
    }
  }

  /**
   * Confirm seat booking (move from reserved to sold)
   */
  async confirmBooking(bookingId: string, channel: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/inventory/confirm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          bookingId,
          channel,
        }),
      });

      return response.ok;
    } catch (error) {
      console.error('Error confirming booking:', error);
      return false;
    }
  }

  /**
   * Cancel booking and release seats
   */
  async cancelBooking(bookingId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/inventory/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ bookingId }),
      });

      return response.ok;
    } catch (error) {
      console.error('Error cancelling booking:', error);
      return false;
    }
  }

  /**
   * Get theater's channel configuration
   */
  async getTheaterChannels(theaterId: string): Promise<TheaterChannel> {
    try {
      const response = await fetch(`${this.baseUrl}/theaters/${theaterId}/channels`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch theater channels: ${response.statusText}`);
      }

      const result = await response.json();
      return result.data.channels;
    } catch (error) {
      console.error('Error fetching theater channels:', error);
      throw error;
    }
  }

  /**
   * Update theater's channel configuration
   */
  async updateTheaterChannels(theaterId: string, channels: TheaterChannel): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/theaters/${theaterId}/channels`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(channels),
      });

      return response.ok;
    } catch (error) {
      console.error('Error updating theater channels:', error);
      return false;
    }
  }

  /**
   * Force sync inventory across all channels
   */
  async syncInventory(theaterId: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/inventory/sync/${theaterId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      const result = await response.json();
      return {
        success: response.ok,
        message: result.message || 'Sync completed',
      };
    } catch (error) {
      console.error('Error syncing inventory:', error);
      return {
        success: false,
        message: 'Sync failed',
      };
    }
  }

  /**
   * Get booking history by channel
   */
  async getChannelBookings(theaterId: string, channel?: string): Promise<ChannelBooking[]> {
    try {
      const params = new URLSearchParams({ theaterId });
      if (channel) params.append('channel', channel);

      const response = await fetch(`${this.baseUrl}/bookings/channel?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch channel bookings: ${response.statusText}`);
      }

      const result = await response.json();
      return result.data.bookings;
    } catch (error) {
      console.error('Error fetching channel bookings:', error);
      return [];
    }
  }

  /**
   * Real-time inventory monitoring (WebSocket)
   */
  subscribeToInventoryUpdates(theaterId: string, callback: (inventory: SeatInventory) => void): () => void {
    // In a real implementation, this would use WebSocket
    // For now, we'll simulate with polling
    const interval = setInterval(async () => {
      try {
        // Poll for updates every 30 seconds
        const response = await fetch(`${this.baseUrl}/inventory/theater/${theaterId}/status`);
        if (response.ok) {
          const result = await response.json();
          callback(result.data.inventory);
        }
      } catch (error) {
        console.warn('Inventory update polling failed:', error);
      }
    }, 30000);

    return () => clearInterval(interval);
  }
}

export const inventoryService = new InventoryService();
