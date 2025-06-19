import axios, { AxiosError, AxiosResponse } from 'axios';
import { ApiError, BookFilters } from '@/types';

// Base API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://13.37.117.93/api';

// API Base URL configured

// Create axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    // 'X-Requested-With': 'XMLHttpRequest', // Removed due to CORS restrictions on backend
  },
  withCredentials: false,
  timeout: 10000,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      if (config.url?.includes('/login') || config.url?.includes('/register')) {
        // Ensure proper headers for auth requests
        config.headers['Accept'] = 'application/json';
        config.headers['Content-Type'] = 'application/json';
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {

    const apiError: ApiError = {
      message: 'An error occurred',
      status: error.response?.status,
    };

    if (error.response?.data) {
      const data = error.response.data as Record<string, unknown>;
      apiError.message = (data.message as string) || 'An error occurred';
      apiError.errors = data.errors as Record<string, string[]>;
    }

    // Handle specific error types with better messaging
    if (!error.response) {
      if (error.code === 'NETWORK_ERROR' || error.message.includes('Network Error')) {
        apiError.message = 'Unable to connect to server. Please check your internet connection and try again.';
      } else if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        apiError.message = 'Request timeout. The server is taking too long to respond.';
      } else {
        apiError.message = 'Network error - please check your connection and server status';
      }
      return Promise.reject(apiError);
    }

    // Handle 401 errors (unauthorized)
    if (error.response?.status === 401) {
      // Clear stored token
      removeAuthToken();
      // Don't automatically redirect to login - let components handle it
      // This prevents unwanted redirects on public pages
    }

    // Handle 403 errors (forbidden)
    if (error.response?.status === 403) {
      apiError.message = 'Access denied';
    }

    // Handle 404 errors (not found)
    if (error.response?.status === 404) {
      apiError.message = 'Resource not found';
    }

    // Handle 422 errors (validation)
    if (error.response?.status === 422) {
      apiError.message = 'Validation failed';
    }

    // Handle 500 errors (server error)
    if (error.response?.status === 500) {
      apiError.message = 'Server error occurred. Please try again later.';
    }

    return Promise.reject(apiError);
  }
);

// Token management functions
export const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  
  // Try localStorage first
  let token = localStorage.getItem('auth_token');
  
  // Fallback to sessionStorage
  if (!token) {
    token = sessionStorage.getItem('auth_token');
  }
  
  return token;
};

export const setAuthToken = (token: string, remember: boolean = false): void => {
  if (typeof window === 'undefined') return;
  
  if (remember) {
    localStorage.setItem('auth_token', token);
    sessionStorage.removeItem('auth_token');
  } else {
    sessionStorage.setItem('auth_token', token);
    localStorage.removeItem('auth_token');
  }
};

export const removeAuthToken = (): void => {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem('auth_token');
  sessionStorage.removeItem('auth_token');
};

// API endpoint helpers
export const endpoints = {
  // Authentication
  auth: {
    login: '/login',
    register: '/register',
    logout: '/logout',
    user: '/user',
    refresh: '/refresh',
  },

  // Stripe Configuration
  stripe: {
    config: '/stripe/config',
  },
  
  // Books
  books: {
    list: '/books',
    show: (id: number) => `/books/${id}`,
    create: '/books',
    update: (id: number) => `/books/${id}`,
    delete: (id: number) => `/books/${id}`,
    images: (id: number) => `/books/${id}/images`,
    reviews: (id: number) => `/books/${id}/reviews`,
  },
  
  // Categories
  categories: {
    list: '/categories',
    show: (id: number) => `/categories/${id}`,
  },
  
  // Reviews
  reviews: {
    create: (bookId: number) => `/books/${bookId}/reviews`,
    update: (id: number) => `/reviews/${id}`,
    delete: (id: number) => `/reviews/${id}`,
  },
  
  // Orders
  orders: {
    list: '/orders',
    show: (id: number) => `/orders/${id}`,
    create: '/orders',
    complete: '/orders/complete-payment',
  },
  
  // Payment
  payment: {
    createIntent: '/payment/create-intent',
    confirm: '/payment/confirm',
  },
  
  // User
  user: {
    profile: '/user/profile',
    updateProfile: '/user/profile',
    changePassword: '/user/change-password',
    books: '/books', // Use general books endpoint with user filter
    orders: '/orders', // Use general orders endpoint with user authentication
  },
};

// Helper function to build query string
export const buildQueryString = (filters: BookFilters): string => {
  const params = new URLSearchParams();
  
  // Add pagination
  if (filters.page && filters.page > 1) {
    params.append('page', filters.page.toString());
  }
  if (filters.per_page) {
    params.append('per_page', filters.per_page.toString());
  }
  
  // Add search
  if (filters.search) {
    params.append('search', filters.search);
  }
  
  // Add category filter
  if (filters.category_id) {
    params.append('category_id', filters.category_id.toString());
  }
  
  // Add price range
  if (filters.min_price) {
    params.append('min_price', filters.min_price.toString());
  }
  if (filters.max_price) {
    params.append('max_price', filters.max_price.toString());
    }
  
  const queryString = params.toString();
  
  return queryString ? `?${queryString}` : '';
};

// Helper function for file uploads
export const createFormData = (data: Record<string, unknown>): FormData => {
  const formData = new FormData();
  
  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (Array.isArray(value)) {
        value.forEach((item) => {
          if (item instanceof File) {
            // For file arrays, append each file with the same key name (e.g., images[])
            formData.append(`${key}[]`, item);
          } else {
            // For non-file arrays, use indexed keys
            formData.append(`${key}[]`, String(item));
          }
        });
      } else if (value instanceof File) {
        formData.append(key, value);
      } else {
        formData.append(key, String(value));
      }
    }
  });
  
  return formData;
};

// Export default api instance
export default api; 