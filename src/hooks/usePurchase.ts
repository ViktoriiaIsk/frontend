import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Book } from '@/types';

interface UsePurchaseReturn {
  initiating: boolean;
  initiatePurchase: (book: Book) => Promise<void>;
}

/**
 * Hook for handling book purchase flow
 */
export function usePurchase(): UsePurchaseReturn {
  const [initiating, setInitiating] = useState(false);
  const router = useRouter();

  const initiatePurchase = async (book: Book) => {
    if (book.status !== 'available') {
      console.warn('Book is not available for purchase');
      return;
    }

    setInitiating(true);

    try {
      // For now, redirect to book details page where user can see full info and purchase
      // Later this can be enhanced with direct checkout modal
      router.push(`/books/${book.id}?action=buy`);
    } catch (error) {
      console.error('Failed to initiate purchase:', error);
    } finally {
      setInitiating(false);
    }
  };

  return {
    initiating,
    initiatePurchase,
  };
} 