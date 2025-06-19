import { Order, Book } from '@/types';

/**
 * Local orders service for storing orders in localStorage
 * This is a temporary solution while backend has serialization issues
 * Now with user isolation to prevent data leakage between users
 */
export class LocalOrdersService {
  private static readonly STORAGE_KEY_PREFIX = 'bookswap_local_orders_user_';

  /**
   * Check if we're in browser environment
   */
  private static isBrowser(): boolean {
    return typeof window !== 'undefined';
  }

  /**
   * Get current user ID from stored auth token or user info
   */
  private static getCurrentUserId(): string | null {
    if (!this.isBrowser()) return null;
    
    try {
      // Method 1: Try to get user from auth store/localStorage
      const userDataStr = localStorage.getItem('auth-storage');
      if (userDataStr) {
        const userData = JSON.parse(userDataStr);
        if (userData?.state?.user?.id) {
          console.log('Found user ID from auth store:', userData.state.user.id);
          return userData.state.user.id.toString();
        }
      }
      
      // Method 2: Try JWT token decode (if it's actually JWT)
      const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
      if (token && token.includes('.')) {
        // Only try JWT decode if token has dots (JWT format)
        const parts = token.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(atob(parts[1]));
          const userId = payload.sub || payload.user_id || payload.id;
          if (userId) {
            console.log('Found user ID from JWT:', userId);
            return userId.toString();
          }
        }
      }
      
      // Method 3: Use token itself as user identifier (fallback)
      if (token) {
        // Create a simple hash of the token for user identification
        const simpleHash = token.substring(0, 8) + token.length;
        console.log('Using token hash as user ID:', simpleHash);
        return simpleHash;
      }
      
      console.warn('No user identification method worked');
      return null;
    } catch (error) {
      console.error('Failed to extract user ID:', error);
      return null;
    }
  }

  /**
   * Get storage key for current user
   */
  private static getStorageKey(): string | null {
    const userId = this.getCurrentUserId();
    if (!userId) {
      return null;
    }
    return `${this.STORAGE_KEY_PREFIX}${userId}`;
  }

  /**
   * Save order to localStorage (user-specific)
   */
  static saveOrder(orderData: {
    id: number;
    book: Book;
    totalAmount: string;
    paymentIntentId: string;
    status: 'pending' | 'completed' | 'cancelled';
    shippingAddress: {
      street: string;
      city: string;
      state: string;
      postal_code: string;
      country: string;
    };
  }): void {
    if (!this.isBrowser()) {
      return;
    }

    const storageKey = this.getStorageKey();
    if (!storageKey) {
      return;
    }

    try {
      const existingOrders = this.getLocalOrders();
      
      const newOrder: Order = {
        id: orderData.id,
        user_id: parseInt(this.getCurrentUserId() || '0'),
        book_id: orderData.book.id,
        total_amount: orderData.totalAmount,
        status: orderData.status,
        payment_intent_id: orderData.paymentIntentId,
        shipping_address: orderData.shippingAddress,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        book: orderData.book,
        user: {
          id: parseInt(this.getCurrentUserId() || '0'),
          name: 'Current User',
          email: '',
          created_at: '',
          updated_at: ''
        }
      };

      const updatedOrders = [newOrder, ...existingOrders];
      localStorage.setItem(storageKey, JSON.stringify(updatedOrders));
      
    } catch (error) {
      console.error('Failed to save order to localStorage:', error);
    }
  }

  /**
   * Get orders from localStorage (user-specific)
   */
  static getLocalOrders(): Order[] {
    if (!this.isBrowser()) {
      // Return empty array on server-side to prevent SSR issues
      return [];
    }

    const storageKey = this.getStorageKey();
    if (!storageKey) {
      // No user authenticated - return empty array
      return [];
    }

    try {
      const stored = localStorage.getItem(storageKey);
      if (!stored) return [];
      
      const orders = JSON.parse(stored) as Order[];
      return Array.isArray(orders) ? orders : [];
    } catch (error) {
      console.error('Failed to get orders from localStorage:', error);
      return [];
    }
  }

  /**
   * Clear current user's local orders
   */
  static clearLocalOrders(): void {
    if (!this.isBrowser()) {
      return;
    }

    const storageKey = this.getStorageKey();
    if (!storageKey) {
      return;
    }

    try {
      localStorage.removeItem(storageKey);
    } catch (error) {
      console.error('Failed to clear local orders:', error);
    }
  }

  /**
   * Clear ALL local orders data (for maintenance/debug)
   */
  static clearAllUsersOrders(): void {
    if (!this.isBrowser()) {
      return;
    }

    try {
      // Get all localStorage keys and remove those that match our pattern
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(this.STORAGE_KEY_PREFIX)) {
          keysToRemove.push(key);
        }
      }
      
      keysToRemove.forEach(key => localStorage.removeItem(key));
      
      // Also remove old format data if exists
      localStorage.removeItem('bookswap_local_orders');
      
    } catch (error) {
      console.error('Failed to clear all local orders:', error);
    }
  }

  /**
   * Update order status (user-specific)
   */
  static updateOrderStatus(orderId: number, status: 'pending' | 'completed' | 'cancelled'): void {
    if (!this.isBrowser()) {
      return;
    }

    const storageKey = this.getStorageKey();
    if (!storageKey) {
      return;
    }

    try {
      const orders = this.getLocalOrders();
      const orderIndex = orders.findIndex(order => order.id === orderId);
      
      if (orderIndex !== -1) {
        orders[orderIndex].status = status;
        orders[orderIndex].updated_at = new Date().toISOString();
        localStorage.setItem(storageKey, JSON.stringify(orders));
      }
    } catch (error) {
      console.error('Failed to update order status:', error);
    }
  }

  /**
   * Get order by ID from localStorage (user-specific)
   */
  static getLocalOrder(orderId: number): Order | null {
    if (!this.isBrowser()) {
      return null;
    }

    try {
      const orders = this.getLocalOrders();
      return orders.find(order => order.id === orderId) || null;
    } catch (error) {
      console.error('Failed to get local order:', error);
      return null;
    }
  }

  /**
   * Clear orders on user logout
   */
  static clearOnLogout(): void {
    this.clearLocalOrders();
  }

  /**
   * Migrate old format data to new user-specific format
   */
  static migrateOldData(): void {
    if (!this.isBrowser()) return;
    
    const currentUserId = this.getCurrentUserId();
    if (!currentUserId) return;
    
    try {
      // Check if old format data exists
      const oldData = localStorage.getItem('bookswap_local_orders');
      if (oldData) {
        
        // If current user doesn't have data yet, migrate the old data to them
        const newStorageKey = this.getStorageKey();
        if (newStorageKey && !localStorage.getItem(newStorageKey)) {
          localStorage.setItem(newStorageKey, oldData);
        }
        
        // Remove old format data
        localStorage.removeItem('bookswap_local_orders');
      }
    } catch (error) {
      console.error('Failed to migrate old orders data:', error);
    }
  }
} 