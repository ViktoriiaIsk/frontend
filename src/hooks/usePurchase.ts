import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Book } from '@/types';
import { PaymentService } from '@/lib/services/payment';

interface UsePurchaseReturn {
  initiating: boolean;
  initiatePurchase: (book: Book) => Promise<void>;
  error: string | null;
}

/**
 * Hook for handling book purchase flow with real Stripe checkout
 */
export function usePurchase(): UsePurchaseReturn {
  const [initiating, setInitiating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const initiatePurchase = async (book: Book) => {
    if (book.status !== 'available') {
      setError('Book is not available for purchase');
      return;
    }

    setInitiating(true);
    setError(null);

    try {
      // Create URLs for success and cancel redirects
      const baseUrl = window.location.origin;
      const successUrl = `${baseUrl}/payment/success?book_id=${book.id}&session_id={CHECKOUT_SESSION_ID}`;
      const cancelUrl = `${baseUrl}/books/${book.id}?payment=cancelled`;

      // Create Stripe checkout session
      const result = await PaymentService.createCheckoutSession(
        book.id,
        book.title,
        Number(book.price),
        successUrl,
        cancelUrl
      );

      if (!result.success) {
        setError(result.error || 'Failed to create checkout session');
        return;
      }

      // Stripe will handle the redirect, so we don't need to do anything else
      // The user will be redirected to Stripe checkout automatically
      
    } catch (error) {
      console.error('Failed to initiate purchase:', error);
      setError(error instanceof Error ? error.message : 'Failed to initiate purchase');
    } finally {
      setInitiating(false);
    }
  };

  return {
    initiating,
    initiatePurchase,
    error,
  };
} 