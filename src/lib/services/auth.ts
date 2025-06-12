import { api, endpoints, setAuthToken, removeAuthToken } from '@/lib/api';
import { 
  AuthResponse, 
  LoginCredentials, 
  RegisterData, 
  User, 
  ApiResponse 
} from '@/types';

/**
 * Authentication service for handling user login, registration, and logout
 */
export class AuthService {
  /**
   * Login user with email and password
   * @param credentials - User login credentials
   * @returns Promise with user data and token
   */
  static async login(credentials: LoginCredentials): Promise<AuthResponse> {
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

      // Store token in localStorage or sessionStorage based on remember option
      setAuthToken(token, credentials.remember || false);

      return { user, token };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Register new user account
   * @param data - User registration data
   * @returns Promise with user data and token
   */
  static async register(data: RegisterData): Promise<AuthResponse> {
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

      // Store token in sessionStorage by default for new registrations
      setAuthToken(token, false);

      return { user, token };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Logout current user
   * @returns Promise that resolves when logout is complete
   */
  static async logout(): Promise<void> {
    try {
      // Call logout endpoint to invalidate token on server
      await api.post(endpoints.auth.logout);
    } catch (error) {
      // Even if server logout fails, clear local token
      console.error('Server logout failed:', error);
    } finally {
      // Always clear token from local storage
      removeAuthToken();
    }
  }

  /**
   * Get current authenticated user
   * @returns Promise with current user data
   */
  static async getCurrentUser(): Promise<User> {
    try {
      const response = await api.get<ApiResponse<User>>(endpoints.auth.user);
      // Handle both response.data.data and response.data structures
      const user = response.data.data || response.data;
      
      // Validate that we have user data
      if (!user) {
        throw new Error('Invalid user data from server');
      }
      
      return user;
    } catch (error) {
      // If token is invalid, clear it
      removeAuthToken();
      throw error;
    }
  }

  /**
   * Refresh authentication token
   * @returns Promise with new token
   */
  static async refreshToken(): Promise<string> {
    try {
      const response = await api.post<ApiResponse<{ token: string }>>(
        endpoints.auth.refresh
      );
      
      // Handle both response.data.data and response.data structures
      const responseData = response.data.data || response.data;
      const token = responseData.token;
      
      // Validate that we have token
      if (!token) {
        throw new Error('Invalid token data from server');
      }
      
      // Update stored token
      setAuthToken(token, true);
      
      return token;
    } catch (error) {
      // If refresh fails, clear token
      removeAuthToken();
      throw error;
    }
  }

  /**
   * Check if user is authenticated by validating stored token
   * @returns Promise<boolean> indicating authentication status
   */
  static async isAuthenticated(): Promise<boolean> {
    try {
      await this.getCurrentUser();
      return true;
    } catch {
      return false;
    }
  }
} 