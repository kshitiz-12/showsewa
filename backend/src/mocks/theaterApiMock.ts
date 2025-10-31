/**
 * Mock Theater API - For Testing Without Real Theater APIs
 * This simulates how external theaters would respond
 */

import { Request, Response } from 'express';

// Simulated theater configurations
const mockTheaterConfigs = [
  {
    theaterId: 'theater-001',
    name: 'QFX Cinemas - Civil Mall',
    city: 'Kathmandu',
    apiKey: 'test_key_qfx_civil',
    apiVersion: 'v1',
    endpoint: 'https://api.theater-mock.qfx.com/v1',
    syncInterval: '5min',
    features: ['real-time-sync', 'seat-status', 'inventory-management']
  },
  {
    theaterId: 'theater-002',
    name: 'BigMovies - Jaya Nepal',
    city: 'Kathmandu',
    apiKey: 'test_key_bigmovies',
    apiVersion: 'v1',
    endpoint: 'https://api.theater-mock.bigmovies.com/v1',
    syncInterval: '15min',
    features: ['batch-sync', 'seat-status']
  },
  {
    theaterId: 'theater-003',
    name: 'QFX Cinemas - Pokhara',
    city: 'Pokhara',
    apiKey: 'test_key_qfx_pokhara',
    apiVersion: 'v1',
    endpoint: 'https://api.theater-mock.qfx-pokhara.com/v1',
    syncInterval: '10min',
    features: ['real-time-sync', 'seat-status', 'inventory-management']
  }
];

/**
 * Mock: Get theater API configuration
 * This simulates what you'd get from a real theater management system
 */
export const mockGetTheaterConfig = (theaterId: string) => {
  return mockTheaterConfigs.find(t => t.theaterId === theaterId);
};

/**
 * Mock: Simulate theater API response
 * This simulates how a real theater would respond to inventory sync requests
 */
export const mockTheaterApiResponse = (theaterId: string, showtimeId: string) => {
  const theater = mockGetTheaterConfig(theaterId);
  
  return {
    success: true,
    theaterId,
    showtimeId,
    lastSync: new Date().toISOString(),
    availableSeats: Math.floor(Math.random() * 50) + 100, // Random between 100-150
    totalSeats: 200,
    blockedSeats: 0,
    maintenance: [],
    updatedAt: new Date().toISOString()
  };
};

/**
 * Mock: Simulate booking confirmation from theater
 * This simulates what you'd receive when a booking is made
 */
export const mockBookingConfirmation = (bookingDetails: any) => {
  return {
    success: true,
    bookingId: bookingDetails.bookingId,
    theaterConfirmationId: `TXN-${Date.now()}`,
    seats: bookingDetails.seats,
    status: 'confirmed',
    qrCode: 'mock-qr-code-data',
    issuedAt: new Date().toISOString()
  };
};

/**
 * Test Endpoint: Simulate Theater API
 * Use this to test without real theater integration
 */
export const simulateTheaterEndpoint = async (req: Request, res: Response) => {
  const { theaterId, action } = req.params;
  const apiKey = req.headers['x-api-key'] as string;
  
  // Mock authentication check
  const theater = mockGetTheaterConfig(theaterId);
  if (!theater || theater.apiKey !== apiKey) {
    return res.status(401).json({
      success: false,
      message: 'Invalid API key'
    });
  }
  
  switch (action) {
    case 'inventory-status':
      // Simulate inventory check
      return res.json(mockTheaterApiResponse(theaterId, req.query.showtimeId as string));
    
    case 'booking-confirm':
      // Simulate booking confirmation
      const bookingDetails = req.body;
      return res.json(mockBookingConfirmation(bookingDetails));
    
    case 'seat-block':
      // Simulate seat blocking
      return res.json({
        success: true,
        blockedUntil: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 min
        seats: req.body.seats
      });
    
    case 'seat-release':
      // Simulate seat release
      return res.json({
        success: true,
        released: req.body.seats
      });
    
    default:
      return res.status(404).json({
        success: false,
        message: 'Unknown action'
      });
  }
};

/**
 * Development Mode: Safe Testing Environment
 * This can be toggled via environment variable
 */
export const isSafeMode = () => {
  return process.env.NODE_ENV === 'development' || process.env.SAFE_MODE === 'true';
};

/**
 * Log all API calls for debugging
 */
export const logMockCall = (theaterId: string, action: string, details: any) => {
  console.log('🎬 Mock Theater API Call:', {
    theaterId,
    action,
    details,
    timestamp: new Date().toISOString(),
    safeMode: isSafeMode()
  });
};

