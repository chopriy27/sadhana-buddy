// API Configuration
// In development, we use relative URLs (same origin)
// In production Capacitor apps, we need the full server URL

// Set this to your Railway deployment URL after deploying
const PRODUCTION_API_URL = 'https://web-production-27f10.up.railway.app';

// Detect if running in Capacitor native app
const isCapacitorNative = () => {
  return typeof window !== 'undefined' && 
         (window as any).Capacitor?.isNativePlatform?.() === true;
};

// Get the API base URL
export const getApiBaseUrl = (): string => {
  // In development, use relative URLs
  if (import.meta.env.DEV) {
    return '';
  }
  
  // In production web (PWA), use relative URLs
  if (!isCapacitorNative()) {
    return '';
  }
  
  // In native Capacitor app, use the full production URL
  return PRODUCTION_API_URL;
};

export const API_BASE_URL = getApiBaseUrl();
