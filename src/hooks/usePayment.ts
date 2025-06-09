import { useMutation, useQuery } from '@tanstack/react-query';
import { PaymentService } from '@/lib/services/payment';
import { 
  PaymentIntentData, 
  PaymentConfirmData,
  ShippingAddress 
} from '@/types';

/**
 * Hook for creating payment intent
 */
export const useCreatePaymentIntent = () => {
  return useMutation({
    mutationFn: ({ bookId, shippingAddress }: { 
      bookId: number; 
      shippingAddress: ShippingAddress;
    }) => PaymentService.createBookPaymentIntent(bookId, shippingAddress),
  });
};

/**
 * Hook for confirming payment
 */
export const useConfirmPayment = () => {
  return useMutation({
    mutationFn: (data: PaymentConfirmData) => PaymentService.confirmPayment(data),
  });
};

/**
 * Hook for getting Stripe instance
 */
export const useStripe = () => {
  return useQuery({
    queryKey: ['stripe-instance'],
    queryFn: () => PaymentService.getStripeInstance(),
    staleTime: Infinity, // Stripe instance doesn't change
    gcTime: Infinity,
  });
}; 