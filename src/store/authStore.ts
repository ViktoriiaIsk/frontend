import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api, setAuthToken, removeAuthToken, endpoints } from '@/lib/api';
import { resetCsrfCookie } from '@/lib/csrf';
import { LocalOrdersService } from '@/lib/services/localOrders';
import { User, LoginCredentials, RegisterData, AuthResponse, ApiResponse } from '@/types';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  
  // Actions
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  setUser: (user: User) => void;
  setToken: (token: string) => void;
  clearAuth: () => void;
}

/**
 * Authentication store using Zustand
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      isAuthenticated: false,

      login: async (credentials: LoginCredentials) => {
        set({ isLoading: true });
        
        try {
          const response = await api.post<ApiResponse<AuthResponse>>(
            endpoints.auth.login,
            credentials
          );
          
          // Handle both response.data.data and response.data structures
          const responseData = response.data.data || response.data;
          const { user, token } = responseData;
          
          // Validate that we have the required data
          if (!user || !token) {
            throw new Error('Invalid response format from server');
          }
          
          // Save token and user
          setAuthToken(token, credentials.remember);
          set({ 
            user, 
            token, 
            isAuthenticated: true, 
            isLoading: false 
          });
          
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      register: async (data: RegisterData) => {
        set({ isLoading: true });
        
        try {
          
          // Clear any existing local orders before registration to prevent data leakage
          LocalOrdersService.clearAllUsersOrders();
          
          const response = await api.post<ApiResponse<AuthResponse>>(
            endpoints.auth.register,
            data
          );
          
          console.log('Register response details:', {
            status: response.status,
            statusText: response.statusText,
            headers: response.headers,
            data: response.data
          });
          
          // Handle both response.data.data and response.data structures
          const responseData = response.data.data || response.data;
          
          const { user, token } = responseData;
          
          console.log('Parsed registration data:', {
            user: user ? { id: user.id, email: user.email, name: user.name } : null, 
            tokenExists: !!token,
            tokenLength: token?.length || 0
          });
          
          // Validate that we have the required data
          if (!user || !token) {
            console.error('Validation failed: Missing user or token', { user: !!user, token: !!token });
            throw new Error('Invalid response format from server - missing user or token');
          }
          
          // Save token and user
          setAuthToken(token, false); // Don't remember by default for registration
          set({ 
            user, 
            token, 
            isAuthenticated: true, 
            isLoading: false 
          });
          
          // Migrate any old order data to new user-specific format
          LocalOrdersService.migrateOldData();
          
          
        } catch (err) {
          console.error('💥 Registration error occurred:', err);
          
          // Log detailed error information
          if (err && typeof err === 'object') {
            console.error('📊 Error details:', {
              name: (err as Error).name,
              message: (err as Error).message,
              status: (err as any).status,
              response: (err as any).response?.data,
              isNetworkError: !(err as any).response,
              stack: (err as Error).stack
            });
          }
          
          set({ isLoading: false });
          const message = err instanceof Error ? err.message : 'Registration failed';
          console.error('🚨 Final error message:', message);
          throw new Error(message);
        }
      },

      logout: () => {
        
        // Clear authentication tokens
        removeAuthToken();
        
        // Reset CSRF cookie state
        resetCsrfCookie();
        
        // Clear local orders for current user
        LocalOrdersService.clearOnLogout();
        
        // Reset auth state
        set({ 
          user: null, 
          token: null, 
          isAuthenticated: false,
          isLoading: false
        });
        
      },

      checkAuth: async () => {
        // Get token from storage (in case it's not in state yet due to hydration)
        const { token: stateToken } = get();
        const storageToken = typeof window !== 'undefined' ? 
          localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token') : null;
        
        const token = stateToken || storageToken;
        
        if (!token) {
          set({ 
            isAuthenticated: false,
            isLoading: false,
            user: null,
            token: null
          });
          return;
        }

        // Update state with token if it wasn't there
        if (!stateToken && storageToken) {
          set({ token: storageToken });
        }

        set({ isLoading: true });
        
        try {
          const response = await api.get<ApiResponse<User>>(endpoints.auth.user);
          // Handle both response.data.data and response.data structures
          const user = response.data.data || response.data;
          
          // Validate that we have user data
          if (!user) {
            throw new Error('Invalid user data from server');
          }
          
          set({ 
            user, 
            isAuthenticated: true, 
            isLoading: false,
            token: token
          });
          
        } catch {
          // Token is invalid, clear auth but don't redirect
          set({ 
            user: null, 
            token: null, 
            isAuthenticated: false,
            isLoading: false
          });
          removeAuthToken();
        }
      },

      setUser: (user: User) => {
        set({ user });
      },

      setToken: (token: string) => {
        setAuthToken(token);
        set({ token, isAuthenticated: true });
      },

      clearAuth: () => {
        removeAuthToken();
        set({ 
          user: null, 
          token: null, 
          isAuthenticated: false,
          isLoading: false
        });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated
      }),
    }
  )
); 