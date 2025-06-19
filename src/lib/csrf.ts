/**
 * CSRF Cookie utility for Laravel Sanctum SPA Authentication
 * This ensures that the CSRF cookie is available before making state-changing requests
 */

let csrfCookieInitialized = false;

/**
 * Initialize CSRF cookie for Laravel Sanctum
 * Should be called before login/register/any POST/PUT/DELETE requests
 */
export const initializeCsrfCookie = async (): Promise<void> => {
  // Skip if already initialized or if we're on server side
  if (csrfCookieInitialized || typeof window === 'undefined') {
    return;
  }

  try {
    console.log('Initializing CSRF cookie...');
    
    const response = await fetch('/api/proxy/sanctum/csrf-cookie', {
      method: 'GET',
      credentials: 'include', // Important: include cookies
      headers: {
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      },
    });

    if (response.ok) {
      csrfCookieInitialized = true;
      console.log('CSRF cookie initialized successfully');
    } else {
      console.warn('CSRF cookie initialization failed:', response.status, response.statusText);
      // Don't throw error, as some backends might not require CSRF
    }
  } catch (error) {
    console.warn('CSRF cookie initialization error:', error);
    // Don't throw error, continue with request
  }
};

/**
 * Reset CSRF cookie initialization state
 * Useful when user logs out or token expires
 */
export const resetCsrfCookie = (): void => {
  csrfCookieInitialized = false;
};

/**
 * Get CSRF token from meta tag or cookie
 * This is typically set by Laravel in the page header
 */
export const getCsrfToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  
  // Try to get from meta tag first
  const metaTag = document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement;
  if (metaTag) {
    return metaTag.content;
  }
  
  // Try to get from cookie
  const match = document.cookie.match(/XSRF-TOKEN=([^;]+)/);
  if (match) {
    return decodeURIComponent(match[1]);
  }
  
  return null;
}; 