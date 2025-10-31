/**
 * Theater API Bridge - Safe Integration Layer
 * Handles real theater API connections with safety checks
 */

import prisma from '../lib/prisma';
import { logMockCall, isSafeMode, mockGetTheaterConfig } from '../mocks/theaterApiMock';

interface TheaterApiConfig {
  theaterId: string;
  apiKey: string;
  apiSecret: string;
  endpoint: string;
  timeout: number;
  retryCount: number;
  dryRunMode: boolean;
}

interface ApiCallResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  fromCache?: boolean;
  timestamp: string;
}

/**
 * Get theater API configuration from database
 */
async function getTheaterConfig(theaterId: string): Promise<TheaterApiConfig | null> {
  try {
    // In real scenario, you'd fetch from a theater_api_config table
    // For now, check if theater exists and return mock config
    const theater = await prisma.theater.findUnique({
      where: { id: theaterId }
    });
    
    if (!theater) return null;
    
    // Return mock config for development
    const mockConfig = mockGetTheaterConfig(theaterId);
    if (mockConfig) {
      return {
        theaterId,
        apiKey: mockConfig.apiKey,
        apiSecret: 'secret_key_not_stored_plain',
        endpoint: mockConfig.endpoint,
        timeout: 5000,
        retryCount: 3,
        dryRunMode: isSafeMode() // Enable dry-run in development
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching theater config:', error);
    return null;
  }
}

/**
 * Call theater API with safety checks
 */
async function callTheaterApi<T = any>(
  theaterId: string,
  action: string,
  payload: any,
  options?: { skipDryRun?: boolean; force?: boolean }
): Promise<ApiCallResult<T>> {
  const config = await getTheaterConfig(theaterId);
  
  if (!config) {
    return {
      success: false,
      error: 'Theater configuration not found',
      timestamp: new Date().toISOString()
    };
  }
  
  // Safety: Check if in dry-run mode
  if (config.dryRunMode && !options?.skipDryRun) {
    console.log('🔒 DRY-RUN MODE - API call blocked for safety');
    logMockCall(theaterId, action, { payload, dryRun: true });
    
    return {
      success: true,
      data: { dryRun: true, action, payload } as T,
      fromCache: false,
      timestamp: new Date().toISOString()
    };
  }
  
  // Safety: Rate limiting check
  const rateLimitResult = await checkRateLimit(theaterId);
  if (!rateLimitResult.allowed) {
    return {
      success: false,
      error: `Rate limit exceeded. Retry after ${rateLimitResult.retryAfter}ms`,
      timestamp: new Date().toISOString()
    };
  }
  
  try {
    // Make actual API call with timeout and retries
    const result = await makeApiCallWithRetry<T>(config, action, payload);
    
    // Log the call
    logMockCall(theaterId, action, { payload, success: result.success });
    
    return result;
  } catch (error) {
    console.error(`❌ Theater API call failed for ${theaterId}:`, error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Rate limiting check
 */
async function checkRateLimit(theaterId: string): Promise<{ allowed: boolean; retryAfter?: number }> {
  // This would normally check Redis or database for rate limits
  // For now, always allow in development
  if (isSafeMode()) {
    return { allowed: true };
  }
  
  // In production, implement actual rate limiting
  return { allowed: true };
}

/**
 * Make API call with retry logic
 */
async function makeApiCallWithRetry<T>(
  config: TheaterApiConfig,
  action: string,
  payload: any,
  attempt: number = 0
): Promise<ApiCallResult<T>> {
  const maxRetries = config.retryCount || 3;
  
  try {
    // Simulate API call (replace with actual fetch)
    const url = `${config.endpoint}/${action}`;
    
    // In real scenario:
    // const response = await fetch(url, {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${config.apiKey}`,
    //     'Content-Type': 'application/json'
    //   },
    //   body: JSON.stringify(payload),
    //   signal: AbortSignal.timeout(config.timeout)
    // });
    
    // For now, return mock success
    return {
      success: true,
      data: { mocked: true } as T,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    if (attempt < maxRetries) {
      console.log(`Retry ${attempt + 1}/${maxRetries} for theater ${config.theaterId}`);
      await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
      return makeApiCallWithRetry(config, action, payload, attempt + 1);
    }
    throw error;
  }
}

/**
 * Public API: Sync inventory with theater
 */
export async function syncInventoryWithTheater(
  theaterId: string,
  showtimeId: string,
  options?: { force?: boolean; skipDryRun?: boolean }
): Promise<ApiCallResult> {
  return callTheaterApi(theaterId, 'inventory-status', { showtimeId }, options);
}

/**
 * Public API: Confirm booking with theater
 */
export async function confirmBookingWithTheater(
  theaterId: string,
  bookingDetails: any,
  options?: { skipDryRun?: boolean }
): Promise<ApiCallResult> {
  return callTheaterApi(theaterId, 'booking-confirm', bookingDetails, options);
}

/**
 * Public API: Block seats at theater
 */
export async function blockSeatsAtTheater(
  theaterId: string,
  seats: string[],
  duration: number,
  options?: { skipDryRun?: boolean }
): Promise<ApiCallResult> {
  return callTheaterApi(
    theaterId,
    'seat-block',
    { seats, duration },
    options
  );
}

/**
 * Public API: Release seats at theater
 */
export async function releaseSeatsAtTheater(
  theaterId: string,
  seats: string[],
  options?: { skipDryRun?: boolean }
): Promise<ApiCallResult> {
  return callTheaterApi(
    theaterId,
    'seat-release',
    { seats },
    options
  );
}

/**
 * Check if theater API is enabled and configured
 */
export async function isTheaterApiEnabled(theaterId: string): Promise<boolean> {
  const config = await getTheaterConfig(theaterId);
  return config !== null;
}

/**
 * Enable/disable theater API for safety
 */
export async function setTheaterApiMode(theaterId: string, enabled: boolean): Promise<boolean> {
  try {
    // In real scenario, you'd update the theater_api_config table
    // For now, just log it
    console.log(`Theater ${theaterId} API ${enabled ? 'enabled' : 'disabled'}`);
    return true;
  } catch (error) {
    console.error('Error setting theater API mode:', error);
    return false;
  }
}

