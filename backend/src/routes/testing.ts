/**
 * Testing Routes - Safe Testing Endpoints
 * These endpoints help test theater integrations safely
 */

import express from 'express';
import { simulateTheaterEndpoint } from '../mocks/theaterApiMock';
import { 
  syncInventoryWithTheater,
  confirmBookingWithTheater,
  blockSeatsAtTheater,
  isTheaterApiEnabled,
  setTheaterApiMode
} from '../services/theaterApiBridge';

const router = express.Router();

/**
 * Test Endpoint: Simulate theater response
 * GET /api/testing/theater/:theaterId/:action
 * 
 * Example: 
 * GET /api/testing/theater/theater-001/inventory-status?showtimeId=123
 */
router.get('/theater/:theaterId/:action', async (req, res): Promise<void> => {
  // Check if in safe mode
  const safeMode = process.env.SAFE_MODE === 'true' || process.env.NODE_ENV === 'development';
  
  if (!safeMode) {
    res.status(403).json({
      success: false,
      message: 'Testing endpoints disabled in production'
    });
    return;
  }
  
  await simulateTheaterEndpoint(req, res);
  return;
});

/**
 * Test Endpoint: Check if theater API is configured
 * GET /api/testing/theater/:theaterId/enabled
 */
router.get('/theater/:theaterId/enabled', async (req, res): Promise<void> => {
  try {
    const { theaterId } = req.params;
    const enabled = await isTheaterApiEnabled(theaterId);
    
    res.json({
      success: true,
      theaterId,
      enabled,
      safeMode: process.env.SAFE_MODE === 'true' || process.env.NODE_ENV === 'development'
    });
    return;
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    return;
  }
});

/**
 * Test Endpoint: Simulate inventory sync
 * POST /api/testing/sync-inventory
 * Body: { theaterId, showtimeId }
 */
router.post('/sync-inventory', async (req, res): Promise<void> => {
  try {
    const { theaterId, showtimeId } = req.body;
    
    if (!theaterId || !showtimeId) {
      res.status(400).json({
        success: false,
        message: 'theaterId and showtimeId required'
      });
      return;
    }
    
    const result = await syncInventoryWithTheater(theaterId, showtimeId);
    res.json(result);
    return;
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    return;
  }
});

/**
 * Test Endpoint: Simulate booking confirmation
 * POST /api/testing/confirm-booking
 * Body: { theaterId, bookingDetails }
 */
router.post('/confirm-booking', async (req, res): Promise<void> => {
  try {
    const { theaterId, bookingDetails } = req.body;
    
    if (!theaterId || !bookingDetails) {
      res.status(400).json({
        success: false,
        message: 'theaterId and bookingDetails required'
      });
      return;
    }
    
    const result = await confirmBookingWithTheater(theaterId, bookingDetails);
    res.json(result);
    return;
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    return;
  }
});

/**
 * Test Endpoint: Dry-run mode toggle
 * POST /api/testing/toggle-dry-run
 * Body: { theaterId, enabled }
 */
router.post('/toggle-dry-run', async (req, res): Promise<void> => {
  try {
    const { theaterId, enabled } = req.body;
    
    if (!theaterId || typeof enabled !== 'boolean') {
      res.status(400).json({
        success: false,
        message: 'theaterId and enabled (boolean) required'
      });
      return;
    }
    
    const result = await setTheaterApiMode(theaterId, enabled);
    res.json({
      success: result,
      theaterId,
      enabled,
      message: `Dry-run mode ${enabled ? 'enabled' : 'disabled'} for theater`
    });
    return;
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    return;
  }
});

export default router;

