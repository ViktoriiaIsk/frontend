import { Order, Book } from '@/types';

/**
 * Local orders service for storing orders in localStorage
 * This is a temporary solution while backend has serialization issues
 */
export class LocalOrdersService {
  private static readonly STORAGE_KEY = 'bookswap_local_orders';

  /**
   * Check if we're in browser environment
   */
  private static isBrowser(): boolean {
    return typeof window !== 'undefined';
  }

  /**
   * Save order to localStorage
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
      console.warn('localStorage not available on server');
      return;
    }

    try {
      const existingOrders = this.getLocalOrders();
      
      const newOrder: Order = {
        id: orderData.id,
        user_id: 0, // Will be filled from auth
        book_id: orderData.book.id,
        total_amount: orderData.totalAmount,
        status: orderData.status,
        payment_intent_id: orderData.paymentIntentId,
        shipping_address: orderData.shippingAddress,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        book: orderData.book,
        user: {
          id: 0,
          name: 'Current User',
          email: '',
          created_at: '',
          updated_at: ''
        }
      };

      const updatedOrders = [newOrder, ...existingOrders];
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedOrders));
      
      console.log('Order saved to localStorage:', newOrder);
    } catch (error) {
      console.error('Failed to save order to localStorage:', error);
    }
  }

  /**
   * Get orders from localStorage
   */
  static getLocalOrders(): Order[] {
    if (!this.isBrowser()) {
      // Return empty array on server-side to prevent SSR issues
      return [];
    }

    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return [];
      
      const orders = JSON.parse(stored) as Order[];
      return Array.isArray(orders) ? orders : [];
    } catch (error) {
      console.error('Failed to get orders from localStorage:', error);
      return [];
    }
  }

  /**
   * Clear all local orders
   */
  static clearLocalOrders(): void {
    if (!this.isBrowser()) {
      console.warn('localStorage not available on server');
      return;
    }

    try {
      localStorage.removeItem(this.STORAGE_KEY);
      console.log('Local orders cleared');
    } catch (error) {
      console.error('Failed to clear local orders:', error);
    }
  }

  /**
   * Update order status
   */
  static updateOrderStatus(orderId: number, status: 'pending' | 'completed' | 'cancelled'): void {
    if (!this.isBrowser()) {
      console.warn('localStorage not available on server');
      return;
    }

    try {
      const orders = this.getLocalOrders();
      const orderIndex = orders.findIndex(order => order.id === orderId);
      
      if (orderIndex !== -1) {
        orders[orderIndex].status = status;
        orders[orderIndex].updated_at = new Date().toISOString();
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(orders));
        console.log(`Order ${orderId} status updated to ${status}`);
      }
    } catch (error) {
      console.error('Failed to update order status:', error);
    }
  }

  /**
   * Get order by ID from localStorage
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
} 