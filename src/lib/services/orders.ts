import { api, endpoints } from '@/lib/api';
import { Order, ApiResponse, PaginatedResponse } from '@/types';

/**
 * Service for managing user orders
 */
export class OrderService {
  /**
   * Get user orders with pagination
   * @param page - Page number
   * @param perPage - Items per page
   * @returns Promise with paginated orders
   */
  static async getUserOrders(
    page: number = 1, 
    perPage: number = 10
  ): Promise<PaginatedResponse<Order>> {
    try {
      console.log(`Fetching user orders - page: ${page}, perPage: ${perPage}`);
      
      // Try /user/orders endpoint first, then fallback to /orders
      let response;
      try {
        console.log('Trying /user/orders endpoint...');
        response = await api.get<PaginatedResponse<Order>>(
          `${endpoints.user.orders}?page=${page}&per_page=${perPage}`
        );
        console.log('User orders response from /user/orders:', response.data);
      } catch (userOrdersError: any) {
        console.log('Failed to fetch from /user/orders, trying /orders...', userOrdersError?.status);
        response = await api.get<PaginatedResponse<Order>>(
          `${endpoints.orders.list}?page=${page}&per_page=${perPage}`
        );
        console.log('User orders response from /orders:', response.data);
      }
      
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
            console.warn(`Order ${order.id} missing required fields:`, {
              book_id: order.book_id,
              total_amount: order.total_amount
            });
            return false;
          }
          
          return true;
        });
        
        console.log(`Filtered ${validOrders.length} valid orders from ${response.data.data.length} total`);
        
        return {
          ...response.data,
          data: validOrders
        };
      }
      
      return response.data;
    } catch (error: any) {
      console.error('Get user orders error:', error);
      console.error('Error status:', error?.status);
      console.error('Error response:', error?.response?.data);
      
      // If orders endpoint doesn't exist, return empty result
      if (error?.status === 404 || error?.response?.status === 404) {
        console.warn('Orders endpoint not found (404), returning empty orders');
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
      
      throw error;
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
      
      console.log('Get order response:', response.data);
      
      // Handle both response.data.data and response.data structures
      const order = response.data.data || response.data;
      
      console.log('Extracted order:', order);
      
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
    
    console.log(`Trying to fetch recent orders starting from ID ${startId}...`);
    
    for (let i = startId; i >= 1 && orders.length < limit && (startId - i) < maxAttempts; i--) {
      try {
        const order = await this.getOrder(i);
        if (order && order.id) {
          orders.push(order);
          console.log(`Found order ${order.id}`);
        }
      } catch (error) {
        // Order doesn't exist, continue
        continue;
      }
    }
    
    console.log(`Found ${orders.length} orders via fallback method`);
    
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