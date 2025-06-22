/**
 * CSRF Cookie utility for Laravel Sanctum SPA Authentication
 * This ensures that the CSRF cookie is available before making state-changing requests
 */

let csrfCookieInitialized = false;

/**
 * Get CSRF cookie URL based on environment
 */
const getCsrfUrl = (): string => {
  // Use direct HTTPS backend - no proxy needed
  return process.env.NEXT_PUBLIC_BACKEND_URL ? 
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/sanctum/csrf-cookie` : 
    'https://api.bookswap.space/sanctum/csrf-cookie';
};

/**
 * Initialize CSRF cookie for Laravel Sanctum
 * Should be called before login/register/any POST/PUT/DELETE requests
 */
export const initializeCsrfCookie = async (): Promise<void> => {
  // Skip if already initialized or if we're on server side
  if (csrfCookieInitialized || typeof window === 'undefined') {
    return;
  }

  // Skip CSRF in development to avoid CORS issues
  if (process.env.NODE_ENV === 'development') {
    csrfCookieInitialized = true;
    return;
  }

  try {
    const csrfUrl = getCsrfUrl();
    const response = await fetch(csrfUrl, {
      method: 'GET',
      credentials: 'include', // Important: include cookies
      headers: {
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      },
    });

    if (response.ok) {
      csrfCookieInitialized = true;
    }
  } catch (error) {
    // CSRF initialization failed - continue without it in development
    if (process.env.NODE_ENV === 'production') {
      throw error;
    }
  }
};

/**
 * Get CSRF token from cookies (if available)
 */
export const getCsrfToken = (): string | null => {
  if (typeof document === 'undefined') return null;
  
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'XSRF-TOKEN') {
      return decodeURIComponent(value);
    }
  }
  return null;
};

/**
 * Reset CSRF cookie state (for logout)
 */
export const resetCsrfCookie = (): void => {
  csrfCookieInitialized = false;
}; 