'use client';

import React from 'react';
import { X } from 'lucide-react';
import { Book } from '@/types';
import StripeProvider from './StripeProvider';
import PaymentForm from './PaymentForm';

interface PaymentModalProps {
  isOpen: boolean;
  book: Book | null;
  onClose: () => void;
  onSuccess: () => void;
  onError: (error: string) => void;
}

/**
 * Modal with Stripe payment form
 */
const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  book,
  onClose,
  onSuccess,
  onError,
}) => {
  if (!isOpen || !book) return null;

  const handleSuccess = () => {
    onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-neutral-900">
                Complete Purchase
              </h2>
              <p className="text-sm text-neutral-600 mt-1">
                {book.title} by {book.author}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-neutral-400" />
            </button>
          </div>

          {/* Payment Form */}
          <StripeProvider>
            <PaymentForm
              book={book}
              onSuccess={handleSuccess}
              onError={onError}
            />
          </StripeProvider>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal; 