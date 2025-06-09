'use client';

import React from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { PaymentService } from '@/lib/services/payment';

interface StripeProviderProps {
  children: React.ReactNode;
}

/**
 * Stripe Elements provider for payment forms
 */
const StripeProvider: React.FC<StripeProviderProps> = ({ children }) => {
  const stripePromise = PaymentService.getStripeInstance();

  const options = {
    // Appearance configuration for Stripe Elements
    appearance: {
      theme: 'stripe' as const,
      variables: {
        colorPrimary: '#059669', // primary-600
        colorBackground: '#ffffff',
        colorText: '#374151',
        colorDanger: '#EF4444',
        fontFamily: 'Inter, system-ui, sans-serif',
        spacingUnit: '4px',
        borderRadius: '8px',
      },
    },
    // Currency and locale settings
    currency: 'eur',
    locale: 'nl' as const, // Netherlands locale for Belgium
  };

  return (
    <Elements stripe={stripePromise} options={options}>
      {children}
    </Elements>
  );
};

export default StripeProvider; 