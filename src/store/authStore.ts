import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api, setAuthToken, removeAuthToken, endpoints } from '@/lib/api';
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
          const response = await api.post<ApiResponse<AuthResponse>>(
            endpoints.auth.register,
            data
          );
          
          // Handle both response.data.data and response.data structures
          const responseData = response.data.data || response.data;
          const { user, token } = responseData;
          
          // Validate that we have the required data
          if (!user || !token) {
            throw new Error('Invalid response format from server');
          }
          
          // Save token and user
          setAuthToken(token, false); // Don't remember by default for registration
          set({ 
            user, 
            token, 
            isAuthenticated: true, 
            isLoading: false 
          });
          
        } catch (err) {
          set({ isLoading: false });
          const message = err instanceof Error ? err.message : 'Registration failed';
          throw new Error(message);
        }
      },

      logout: () => {
        removeAuthToken();
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
          
        } catch (error) {
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