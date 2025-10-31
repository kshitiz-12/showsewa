/**
 * Global API fetch wrapper
 * Intercepts all fetch calls to localhost:5000 and replaces with VITE_API_URL
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Store original fetch
const originalFetch = globalThis.fetch;

// Override global fetch
globalThis.fetch = function(input: any, init?: RequestInit): Promise<Response> {
  const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
  
  // Replace localhost:5000 with API_BASE_URL
  const modifiedUrl = url.replace(/http:\/\/localhost:5000/g, API_BASE_URL);
  
  // Use modified URL for the fetch
  const modifiedInput = typeof input === 'string' || input instanceof URL 
    ? modifiedUrl 
    : { ...input, url: modifiedUrl };
  
  return originalFetch(modifiedInput, init);
};

// Export for backwards compatibility
export { API_BASE_URL };

