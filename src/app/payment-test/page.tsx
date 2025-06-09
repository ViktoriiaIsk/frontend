'use client';

import React, { useState } from 'react';
import { CreditCard, Euro, MapPin, CheckCircle, AlertCircle } from 'lucide-react';
import Navigation from '@/components/layout/Navigation';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { TestCardInfo } from '@/components/payment/TestCardInfo';
import { PaymentService } from '@/lib/services/payment';

export default function PaymentTestPage() {
  const [showTestCards, setShowTestCards] = useState(true);
  const [paymentTest, setPaymentTest] = useState<{
    loading: boolean;
    result: string | null;
    error: string | null;
  }>({
    loading: false,
    result: null,
    error: null,
  });

  // Test amounts for Belgium in EUR cents
  const testAmount = 1200; // €12.00

  const handleTestPaymentIntent = async () => {
    setPaymentTest({ loading: true, result: null, error: null });

    try {
      // Test Payment Intent creation
      const testBookId = 999;
      const shippingAddress = {
        street: 'Test Street 123',
        city: 'Brussels',
        state: 'Brussels Capital Region',
        postal_code: '1000',
        country: 'BE',
      };

      // Test creating payment intent
      const result = await PaymentService.createPaymentIntent({
        book_id: testBookId,
        shipping_address: shippingAddress,
      });

      setPaymentTest({
        loading: false,
        result: `Payment Intent created successfully! Client Secret: ${result.client_secret.substring(0, 20)}...`,
        error: null,
      });
    } catch (error) {
      setPaymentTest({
        loading: false,
        result: null,
        error: error instanceof Error ? error.message : "Test failed",
      });
    }
  };

  return (
    <div className="min-h-screen bg-accent-cream py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">
            Real Stripe Payment Test - Belgium (EUR)
          </h1>
          <div className="flex items-center space-x-4 text-neutral-600">
            <div className="flex items-center">
              <MapPin className="w-4 h-4 mr-1" />
              Belgium
            </div>
            <div className="flex items-center">
              <Euro className="w-4 h-4 mr-1" />
              EUR Currency
            </div>
            <div className="flex items-center">
              <CreditCard className="w-4 h-4 mr-1" />
              Real Stripe Checkout
            </div>
          </div>
        </div>

        {/* Test Cards Section */}
        <TestCardInfo 
          isVisible={showTestCards} 
          onToggle={() => setShowTestCards(!showTestCards)} 
        />

        {/* Integration Status */}
        <Card className="mb-6">
          <Card.Header>
            <Card.Title>🔗 Integration Status</Card.Title>
          </Card.Header>
          <Card.Content className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center text-green-600">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  <span className="text-sm">Real Stripe Checkout Session</span>
                </div>
                <div className="flex items-center text-green-600">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  <span className="text-sm">EUR Currency Support</span>
                </div>
                <div className="flex items-center text-green-600">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  <span className="text-sm">Belgium Locale (nl-BE)</span>
                </div>
                <div className="flex items-center text-green-600">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  <span className="text-sm">Success/Cancel Redirects</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center text-orange-600">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  <span className="text-sm">Backend Integration Required</span>
                </div>
                <div className="flex items-center text-orange-600">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  <span className="text-sm">Book Status Update (sold)</span>
                </div>
                <div className="flex items-center text-orange-600">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  <span className="text-sm">Email Notifications</span>
                </div>
                <div className="flex items-center text-orange-600">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  <span className="text-sm">Order Management</span>
                </div>
              </div>
            </div>
          </Card.Content>
        </Card>

        {/* Test Payment Intent */}
        <Card className="mb-6">
          <Card.Header>
            <Card.Title>🛒 Test Payment Intent</Card.Title>
          </Card.Header>
          <Card.Content className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="text-blue-800">
                <strong>Info:</strong> This will create a Payment Intent for on-site payment form.
                Your backend handles the payment processing.
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Test Book Details</h4>
              <div className="text-sm text-blue-800 space-y-1">
                <div>• Book: "Test Book - Programming with React"</div>
                <div>• Price: {PaymentService.formatCurrency(testAmount, 'EUR')}</div>
                <div>• Currency: EUR (Euro)</div>
                <div>• Country: Belgium</div>
              </div>
            </div>

            <Button 
              onClick={handleTestPaymentIntent}
              loading={paymentTest.loading}
              className="w-full"
              size="lg"
            >
              {paymentTest.loading ? 'Creating Payment Intent...' : '🚀 Test Payment Intent'}
            </Button>
          </Card.Content>
        </Card>

        {/* Test Results */}
        <Card>
          <Card.Header>
            <Card.Title>Test Results</Card.Title>
          </Card.Header>
          <Card.Content className="space-y-4">
            {paymentTest.loading && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                <p className="text-neutral-600 mt-2">Creating Stripe checkout session...</p>
              </div>
            )}

            {paymentTest.result && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="text-green-800">
                  <strong>Success:</strong>
                  <div className="mt-1 text-sm">{paymentTest.result}</div>
                </div>
              </div>
            )}

            {paymentTest.error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="text-red-800">
                  <strong>Error:</strong>
                  <div className="mt-1 text-sm">{paymentTest.error}</div>
                </div>
              </div>
            )}

            {!paymentTest.loading && !paymentTest.result && !paymentTest.error && (
              <div className="text-center py-8 text-neutral-500">
                Click "Test Payment Intent" to test creating payment intent with your backend
              </div>
            )}

            <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4">
              <h4 className="font-medium text-neutral-900 mb-2">Environment Info</h4>
              <div className="text-sm text-neutral-600 space-y-1">
                <div>• API Endpoint: {process.env.NEXT_PUBLIC_API_BASE_URL || 'http://13.37.117.93/api'}</div>
                <div>• Stripe Key: {process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ? 'Configured ✅' : 'Missing ❌'}</div>
                <div>• Currency: EUR (Euros)</div>
                <div>• Country: Belgium (BE)</div>
                <div>• Locale: nl-BE (Dutch-Belgium)</div>
              </div>
            </div>
          </Card.Content>
        </Card>
      </div>
    </div>
  );
} 