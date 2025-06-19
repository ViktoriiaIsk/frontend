import { api, endpoints } from '@/lib/api';
import { Order, ApiResponse, PaginatedResponse } from '@/types';

/**
 * Service for managing user orders
 */
export class OrderService {
  /**
   * Get user orders with pagination
   * First tries localStorage, then falls back to backend
   * @param page - Page number
   * @param perPage - Items per page
   * @returns Promise with paginated orders
   */
  static async getUserOrders(
    page: number = 1, 
    perPage: number = 10
  ): Promise<PaginatedResponse<Order>> {
    
    // First try localStorage (primary source for orders)
    if (typeof window !== 'undefined') {
      const { LocalOrdersService } = await import('./localOrders');
      const localOrders = LocalOrdersService.getLocalOrders();
      
      if (localOrders.length > 0) {
        
        // Calculate pagination for local orders
        const startIndex = (page - 1) * perPage;
        const endIndex = startIndex + perPage;
        const paginatedOrders = localOrders.slice(startIndex, endIndex);
        
        return {
          data: paginatedOrders,
          current_page: page,
          last_page: Math.ceil(localOrders.length / perPage),
          per_page: perPage,
          total: localOrders.length,
          links: {
            first: '',
            last: '',
            prev: page > 1 ? '' : undefined,
            next: page < Math.ceil(localOrders.length / perPage) ? '' : undefined
          }
        };
      }
    }
    
    // Fallback to backend if no local orders found
    try {
      const response = await api.get<PaginatedResponse<Order>>(
        `${endpoints.orders.list}?page=${page}&per_page=${perPage}`
      );
      
      // Check if we have valid data structure
      if (response.data && response.data.data) {
        // Filter out empty objects and invalid orders
        const validOrders = response.data.data.filter(order => {
          // Basic validation
          if (!order || typeof order !== 'object' || !order.id) {
            return false;
          }
          
          // Check required fields
          const hasRequiredFields = order.book_id && order.total_amount;
          
          if (!hasRequiredFields) {
            console.log('Order missing required fields:', {
              book_id: order.book_id,
              total_amount: order.total_amount
            });
            return false;
          }
          
          return true;
        });
        
        
        return {
          ...response.data,
          data: validOrders
        };
      }
      
      return response.data;
    } catch (error: any) {
      console.error('Backend orders error:', error);
      console.error('Error status:', error?.status);
      console.error('Error response:', error?.response?.data);
      
      // Backend failed, return empty result since we already checked localStorage
      return {
        data: [],
        current_page: 1,
        last_page: 1,
        per_page: perPage,
        total: 0,
        links: {
          first: '',
          last: '',
          prev: undefined,
          next: undefined
        }
      };
    }
  }

  /**
   * Get specific order by ID
   * @param orderId - Order ID
   * @returns Promise with order details
   */
  static async getOrder(orderId: number): Promise<Order> {
    try {
      const response = await api.get<ApiResponse<Order>>(
        endpoints.orders.show(orderId)
      );
      
      
      // Handle both response.data.data and response.data structures
      const order = response.data.data || response.data;
      
      
      // Check if order data is valid
      if (!order || !order.id) {
        console.error('Invalid order data received:', order);
        throw new Error('Order data not found or invalid');
      }
      
      return order;
    } catch (error) {
      console.error('Get order error:', error);
      throw error;
    }
  }

  /**
   * Try to get recent orders by attempting to fetch individual orders
   * This is a fallback when the list endpoint returns invalid data
   */
  static async getRecentOrders(limit: number = 10): Promise<Order[]> {
    const orders: Order[] = [];
    
    // Start from a higher ID and work backwards to find recent orders
    // This is more efficient than starting from 1
    const maxAttempts = limit * 3; // Try 3x the limit to account for gaps
    const startId = 50; // Start from ID 50 and work backwards
    
    
    for (let i = startId; i >= 1 && orders.length < limit && (startId - i) < maxAttempts; i--) {
      try {
        const order = await this.getOrder(i);
        if (order && order.id) {
          orders.push(order);
        }
      } catch {
        // Order doesn't exist, continue
        continue;
      }
    }
    
    
    // Sort by creation date (newest first)
    return orders.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }

  /**
   * Format order status for display
   * @param status - Order status
   * @returns Formatted status
   */
  static formatOrderStatus(status: string): { text: string; color: string } {
    switch (status) {
      case 'pending':
        return { text: 'Processing', color: 'text-yellow-600 bg-yellow-100' };
      case 'completed':
        return { text: 'Completed', color: 'text-green-600 bg-green-100' };
      case 'cancelled':
        return { text: 'Cancelled', color: 'text-red-600 bg-red-100' };
      default:
        return { text: 'Unknown', color: 'text-gray-600 bg-gray-100' };
    }
  }

  /**
   * Format order date for display
   * @param dateString - ISO date string
   * @returns Formatted date
   */
  static formatOrderDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('uk-UA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Calculate total orders value
   * @param orders - Array of orders
   * @returns Total value in EUR
   */
  static calculateTotalValue(orders: Order[]): number {
    return orders.reduce((total, order) => {
      return total + parseFloat(order.total_amount);
    }, 0);
  }
}

export default OrderService; 