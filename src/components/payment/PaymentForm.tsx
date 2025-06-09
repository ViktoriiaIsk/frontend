'use client';

import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import Button from '@/components/ui/Button';
import { PaymentService } from '@/lib/services/payment';
import { Book } from '@/types';

interface PaymentFormProps {
  book: Book;
  onSuccess: () => void;
  onError: (error: string) => void;
}

/**
 * Stripe payment form for Payment Intent flow
 */
const PaymentForm: React.FC<PaymentFormProps> = ({ book, onSuccess, onError }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);

  // Default shipping address for Belgium
  const shippingAddress = {
    street: 'Default Street 123',
    city: 'Brussels',
    state: 'Brussels Capital Region',
    postal_code: '1000',
    country: 'BE',
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      onError('Stripe not loaded');
      return;
    }

    setProcessing(true);

    try {
      const cardElement = elements.getElement(CardElement);
      
      if (!cardElement) {
        onError('Card element not found');
        return;
      }

      // Create payment method
      const { error: methodError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
        billing_details: {
          name: 'Customer Name', // In real app, get from form
        },
      });

      if (methodError) {
        onError(methodError.message || 'Failed to create payment method');
        return;
      }

      // Process payment with backend
      const result = await PaymentService.processPaymentIntent(
        book.id,
        paymentMethod.id,
        shippingAddress
      );

      if (result.success) {
        onSuccess();
      } else if (result.requiresAction && result.clientSecret) {
        // Handle 3D Secure
        const { error: confirmError } = await stripe.confirmCardPayment(result.clientSecret);
        
        if (confirmError) {
          onError(confirmError.message || 'Payment confirmation failed');
        } else {
          onSuccess();
        }
      } else {
        onError(result.error || 'Payment failed');
      }

    } catch (error) {
      onError(error instanceof Error ? error.message : 'Payment failed');
    } finally {
      setProcessing(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#374151',
        '::placeholder': {
          color: '#9CA3AF',
        },
      },
      invalid: {
        color: '#EF4444',
      },
    },
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-2">
          Card Details
        </label>
        <div className="p-3 border border-neutral-300 rounded-lg bg-white">
          <CardElement options={cardElementOptions} />
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">Payment Summary</h4>
        <div className="text-sm text-blue-800 space-y-1">
          <div className="flex justify-between">
            <span>Book:</span>
            <span className="font-medium">{book.title}</span>
          </div>
          <div className="flex justify-between">
            <span>Price:</span>
            <span className="font-bold">{PaymentService.formatCurrency(Number(book.price) * 100)}</span>
          </div>
          <div className="flex justify-between">
            <span>Shipping:</span>
            <span>Included</span>
          </div>
        </div>
      </div>

      <Button
        type="submit"
        loading={processing}
        disabled={!stripe || processing}
        className="w-full"
        size="lg"
      >
        {processing ? 'Processing...' : `Pay ${PaymentService.formatCurrency(Number(book.price) * 100)}`}
      </Button>

      <div className="text-xs text-neutral-500 text-center">
        <p>💳 Secure payment with Stripe</p>
        <p>🔒 Your card details are encrypted and secure</p>
      </div>
    </form>
  );
};

export default PaymentForm; 