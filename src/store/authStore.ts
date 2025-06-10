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
          
          const { user, token } = response.data.data;
          
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
          
          const { user, token } = response.data.data;
          
          // Save token and user
          setAuthToken(token, false); // Don't remember by default for registration
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
        const { token } = get();
        
        if (!token) {
          set({ isAuthenticated: false });
          return;
        }

        set({ isLoading: true });
        
        try {
          const response = await api.get<ApiResponse<User>>(endpoints.auth.user);
          const user = response.data.data;
          
          set({ 
            user, 
            isAuthenticated: true, 
            isLoading: false 
          });
          
        } catch (error) {
          // Token is invalid, clear auth
          get().logout();
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