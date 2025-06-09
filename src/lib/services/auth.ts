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

      const { user, token } = response.data.data;

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

      const { user, token } = response.data.data;

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
      return response.data.data;
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
      
      const token = response.data.data.token;
      
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