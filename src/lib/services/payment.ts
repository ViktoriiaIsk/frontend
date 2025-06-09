import { loadStripe, Stripe } from '@stripe/stripe-js';
import { api, endpoints } from '@/lib/api';
import { 
  PaymentIntentData, 
  PaymentIntentResponse, 
  PaymentConfirmData,
  ApiResponse 
} from '@/types';

// Stripe public key - should be in environment variables
const STRIPE_PUBLIC_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_your_key_here';

// Stripe instance
let stripePromise: Promise<Stripe | null>;
const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(STRIPE_PUBLIC_KEY);
  }
  return stripePromise;
};

/**
 * Payment service for handling Stripe payments
 */
export class PaymentService {
  /**
   * Get Stripe instance
   */
  static async getStripeInstance(): Promise<Stripe | null> {
    return await getStripe();
  }

  /**
   * Create payment intent for book purchase
   * @param data - Payment intent data
   * @returns Promise with client secret and order ID
   */
  static async createPaymentIntent(data: PaymentIntentData): Promise<PaymentIntentResponse> {
    try {
      const response = await api.post<ApiResponse<PaymentIntentResponse>>(
        endpoints.payment.createIntent,
        data
      );

      return response.data.data;
    } catch (error) {
      console.error('Create payment intent error:', error);
      throw error;
    }
  }

  /**
   * Confirm payment after successful Stripe payment
   * @param data - Payment confirmation data
   * @returns Promise with order details
   */
  static async confirmPayment(data: PaymentConfirmData): Promise<void> {
    try {
      await api.post<ApiResponse<void>>(
        endpoints.payment.confirm,
        data
      );
    } catch (error) {
      console.error('Confirm payment error:', error);
      throw error;
    }
  }

  /**
   * Create payment intent for book purchase
   * @param bookId - ID of the book to purchase
   * @param shippingAddress - Shipping address details
   * @returns Promise with payment intent data
   */
  static async createBookPaymentIntent(
    bookId: number,
    shippingAddress: any
  ): Promise<{ success: boolean; orderId?: number; clientSecret?: string; error?: string }> {
    try {
      // Validate input data
      const validation = this.validatePaymentData(bookId, shippingAddress);
      if (!validation.valid) {
        return { 
          success: false, 
          error: validation.errors.join(', ') 
        };
      }

      // Create payment intent
      const paymentData: PaymentIntentData = {
        book_id: bookId,
        shipping_address: shippingAddress,
      };

      const { client_secret, order_id } = await this.createPaymentIntent(paymentData);

      return { 
        success: true, 
        orderId: order_id, 
        clientSecret: client_secret 
      };
    } catch (error) {
      console.error('Create book payment intent error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'An error occurred while creating payment' 
      };
    }
  }

  /**
   * Format currency for display (EUR for Belgium)
   * @param amount - Amount in cents
   * @param currency - Currency code
   * @returns Formatted currency string
   */
  static formatCurrency(amount: number, currency: string = 'EUR'): string {
    return new Intl.NumberFormat('nl-BE', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
    }).format(amount / 100);
  }

  /**
   * Convert EUR to cents for Stripe
   * @param amount - Amount in EUR
   * @returns Amount in cents
   */
  static convertToCents(amount: number): number {
    return Math.round(amount * 100);
  }

  /**
   * Get test credit card numbers for Stripe testing
   * @returns Object with test card information
   */
  static getTestCards() {
    return {
      success: {
        visa: '4242424242424242',
        visaDebit: '4000056655665556',
        mastercard: '5555555555554444',
        amex: '378282246310005',
        description: 'Successful payment cards'
      },
      decline: {
        generic: '4000000000000002',
        insufficientFunds: '4000000000009995',
        lostCard: '4000000000009987',
        stolenCard: '4000000000009979',
        description: 'Cards that will be declined'
      },
      auth: {
        requireAuth: '4000002500003155',
        description: 'Card that requires authentication (3D Secure)'
      },
      info: 'Use any future expiry date (e.g., 12/34), any 3-digit CVC, and any postal code'
    };
  }

  /**
   * Validate payment data before processing
   * @param bookId - Book ID
   * @param shippingAddress - Shipping address
   * @returns Validation result
   */
  static validatePaymentData(bookId: number, shippingAddress: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!bookId || bookId <= 0) {
      errors.push('Invalid book ID');
    }

    if (!shippingAddress) {
      errors.push('Shipping address is required');
    } else {
      if (!shippingAddress.street) errors.push('Street is required');
      if (!shippingAddress.city) errors.push('City is required');
      if (!shippingAddress.postal_code) errors.push('Postal code is required');
      if (!shippingAddress.country) errors.push('Country is required');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

export default PaymentService; 