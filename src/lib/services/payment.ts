import { loadStripe, Stripe } from '@stripe/stripe-js';
import { api, endpoints } from '@/lib/api';
import { 
  PaymentIntentData, 
  PaymentIntentResponse, 
  PaymentConfirmData,
  ShippingAddress,
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
   * Process payment with existing Payment Intent flow
   * @param bookId - ID of the book to purchase
   * @param paymentMethodId - Stripe payment method ID from form
   * @param shippingAddress - Shipping address details
   * @returns Promise with payment result
   */
  static async processPaymentIntent(
    bookId: number,
    paymentMethodId: string,
    shippingAddress: ShippingAddress
  ): Promise<{ success: boolean; error?: string; requiresAction?: boolean; clientSecret?: string }> {
    try {
      const stripe = await this.getStripeInstance();
      if (!stripe) {
        throw new Error('Failed to load Stripe');
      }

      // Step 1: Create payment intent via backend - correct format per API docs
      const intentResponse = await this.createPaymentIntent({
        book_id: bookId,
        shipping_address: shippingAddress.street, // Full address as string
        shipping_city: shippingAddress.city,
        shipping_postal_code: shippingAddress.postal_code,
        shipping_country: shippingAddress.country,
      });

      // Step 2: Confirm payment with Stripe
      const { error, paymentIntent } = await stripe.confirmCardPayment(intentResponse.client_secret, {
        payment_method: paymentMethodId
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (paymentIntent?.status === 'succeeded') {
        // Step 3: Confirm payment with backend
        await this.confirmPayment({
          payment_intent_id: paymentIntent.id,
          order_id: intentResponse.order_id,
        });

        return { success: true };
      }

      if (paymentIntent?.status === 'requires_action') {
        return { 
          success: false, 
          requiresAction: true, 
          clientSecret: intentResponse.client_secret 
        };
      }

      return { success: false, error: 'Payment failed' };

    } catch (error) {
      console.error('Process payment intent error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to process payment' 
      };
    }
  }

  /**
   * Create payment intent for book purchase
   * @param data - Payment intent data
   * @returns Promise with client secret and order ID
   */
  static async createPaymentIntent(data: PaymentIntentData): Promise<PaymentIntentResponse> {
    try {
      console.log('Creating payment intent with data:', data);
      const response = await api.post<any>('/payment/create-intent', data);
      console.log('Payment intent response:', response.data);
      
      // Extract client_secret from the nested structure
      const clientSecret = response.data.payment_intent?.client_secret || 
                          response.data.client_secret ||
                          response.data.payment?.client_secret;
      
      const orderId = response.data.order?.id || response.data.order_id;
      
      if (!clientSecret) {
        throw new Error('No client_secret received from backend');
      }
      
      return {
        client_secret: clientSecret,
        order_id: orderId
      };
    } catch (error: unknown) {
      console.error('Create payment intent error:', error);
      // Log detailed error information
      if (error && typeof error === 'object' && 'errors' in error) {
        console.error('Validation errors:', (error as any).errors);
      }
      if (error && typeof error === 'object' && 'message' in error) {
        console.error('Error message:', (error as any).message);
      }
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
    shippingAddress: ShippingAddress
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

      // Create payment intent - correct format per API docs
      const paymentData: PaymentIntentData = {
        book_id: bookId,
        shipping_address: shippingAddress.street, // Full address as string
        shipping_city: shippingAddress.city,
        shipping_postal_code: shippingAddress.postal_code,
        shipping_country: shippingAddress.country,
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
  static validatePaymentData(bookId: number, shippingAddress: ShippingAddress): { valid: boolean; errors: string[] } {
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