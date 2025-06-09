import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Book } from '@/types';

interface UsePurchaseReturn {
  initiating: boolean;
  initiatePurchase: (book: Book) => void;
  error: string | null;
  showPaymentForm: boolean;
  selectedBook: Book | null;
  closePaymentForm: () => void;
}

/**
 * Hook for handling book purchase flow with Payment Intent
 */
export function usePurchase(): UsePurchaseReturn {
  const [initiating, setInitiating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const router = useRouter();

  const initiatePurchase = (book: Book) => {
    if (book.status !== 'available') {
      setError('Book is not available for purchase');
      return;
    }

    setError(null);
    setSelectedBook(book);
    setShowPaymentForm(true);
  };

  const closePaymentForm = () => {
    setShowPaymentForm(false);
    setSelectedBook(null);
    setError(null);
  };

  return {
    initiating,
    initiatePurchase,
    error,
    showPaymentForm,
    selectedBook,
    closePaymentForm,
  };
} 