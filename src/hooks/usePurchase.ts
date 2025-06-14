import { useState } from 'react';
import { Book } from '@/types';
import { PaymentService } from '@/lib/services/payment';

interface UsePurchaseReturn {
  initiating: boolean;
  initiatePurchase: (bookId: number) => Promise<{ success: boolean; orderId?: number; clientSecret?: string; error?: string; }>;
  error: string | null;
  showPaymentForm: boolean;
  selectedBook: Book | null;
  closePaymentForm: () => void;
}

/**
 * Hook for handling book purchase flow with Payment Intent
 */
export function usePurchase(): UsePurchaseReturn {
  const [isInitiating, setIsInitiating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  const initiatePurchase = async (bookId: number) => {
    setIsInitiating(true);
    setError(null);
    
    try {
      const result = await PaymentService.createBookPaymentIntent(bookId, {
        street: '',
        city: '',
        state: '',
        postal_code: '',
        country: 'BE'
      });
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to initiate purchase';
      setError(errorMessage);
      throw err;
    } finally {
      setIsInitiating(false);
    }
  };

  const closePaymentForm = () => {
    setShowPaymentForm(false);
    setSelectedBook(null);
    setError(null);
  };

  return {
    initiating: isInitiating,
    initiatePurchase,
    error,
    showPaymentForm,
    selectedBook,
    closePaymentForm,
  };
} 