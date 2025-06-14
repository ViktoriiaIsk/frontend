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
      const response = await api.get<PaginatedResponse<Order>>(
        `${endpoints.orders.list}?page=${page}&per_page=${perPage}`
      );
      return response.data;
    } catch (error) {
      console.error('Get user orders error:', error);
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
      return response.data.data;
    } catch (error) {
      console.error('Get order error:', error);
      throw error;
    }
  }

  /**
   * Format order status for display
   * @param status - Order status
   * @returns Formatted status
   */
  static formatOrderStatus(status: string): { text: string; color: string } {
    switch (status) {
      case 'pending':
        return { text: 'В обробці', color: 'text-yellow-600 bg-yellow-100' };
      case 'completed':
        return { text: 'Виконано', color: 'text-green-600 bg-green-100' };
      case 'cancelled':
        return { text: 'Скасовано', color: 'text-red-600 bg-red-100' };
      default:
        return { text: 'Невідомо', color: 'text-gray-600 bg-gray-100' };
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