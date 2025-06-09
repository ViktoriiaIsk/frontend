'use client';

import { useState } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { TestCardInfo } from '@/components/payment/TestCardInfo';
import { PaymentService } from '@/lib/services/payment';
import { Euro, MapPin, CreditCard } from 'lucide-react';

export default function PaymentTestPage() {
  const [showTestCards, setShowTestCards] = useState(false);
  const [paymentTest, setPaymentTest] = useState<{
    loading: boolean;
    result: string | null;
    error: string | null;
  }>({
    loading: false,
    result: null,
    error: null,
  });

  const testAmount = 1250; // 12.50 EUR in cents
  const testBook = {
    id: 1,
    title: "Test Book for Payment",
    author: "Test Author",
    price: testAmount,
  };

  const belgiumAddress = {
    street: "Rue de la Loi 123",
    city: "Brussels",
    postal_code: "1000",
    country: "BE",
    state: "Brussels Capital Region"
  };

  const handleTestPayment = async () => {
    setPaymentTest({ loading: true, result: null, error: null });
    
    try {
      // Simulate creating payment intent
      const result = await PaymentService.createBookPaymentIntent(
        testBook.id,
        belgiumAddress
      );

      if (result.success) {
        setPaymentTest({
          loading: false,
          result: `Payment intent created successfully! Order ID: ${result.orderId}`,
          error: null,
        });
      } else {
        setPaymentTest({
          loading: false,
          result: null,
          error: result.error || 'Payment creation failed',
        });
      }
    } catch (error) {
      setPaymentTest({
        loading: false,
        result: null,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      });
    }
  };

  return (
    <div className="min-h-screen bg-accent-cream py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">
            Payment Test - Belgium (EUR)
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
              Stripe Test Mode
            </div>
          </div>
        </div>

        {/* Test Cards Section */}
        <TestCardInfo 
          isVisible={showTestCards} 
          onToggle={() => setShowTestCards(!showTestCards)} 
        />

        {/* Test Book and Payment */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Test Product */}
          <Card padding="md" className="h-fit">
            <Card.Header>
              <Card.Title>Test Product</Card.Title>
            </Card.Header>
            <Card.Content className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg text-neutral-900">
                  {testBook.title}
                </h3>
                <p className="text-neutral-600">by {testBook.author}</p>
                <p className="text-2xl font-bold text-primary-600 mt-2">
                  {PaymentService.formatCurrency(testAmount, 'EUR')}
                </p>
              </div>

              <div className="border-t border-neutral-100 pt-4">
                <h4 className="font-medium text-neutral-900 mb-2">Shipping Address</h4>
                <div className="text-sm text-neutral-600 space-y-1">
                  <div>{belgiumAddress.street}</div>
                  <div>{belgiumAddress.postal_code} {belgiumAddress.city}</div>
                  <div>{belgiumAddress.state}</div>
                  <div>Belgium ({belgiumAddress.country})</div>
                </div>
              </div>

              <Button
                onClick={handleTestPayment}
                loading={paymentTest.loading}
                className="w-full"
                size="lg"
              >
                Test Payment Intent
              </Button>
            </Card.Content>
          </Card>

          {/* Payment Results */}
          <Card padding="md">
            <Card.Header>
              <Card.Title>Payment Test Results</Card.Title>
            </Card.Header>
            <Card.Content className="space-y-4">
              {paymentTest.loading && (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                  <p className="text-neutral-600 mt-2">Creating payment intent...</p>
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
                  Click "Test Payment Intent" to start testing
                </div>
              )}

              <div className="border-t border-neutral-100 pt-4">
                <h4 className="font-medium text-neutral-900 mb-2">Testing Info</h4>
                <div className="text-sm text-neutral-600 space-y-1">
                  <div>• Use test cards from above</div>
                  <div>• Amount: {PaymentService.formatCurrency(testAmount, 'EUR')}</div>
                  <div>• Currency: EUR (Euros)</div>
                  <div>• Country: Belgium (BE)</div>
                  <div>• Backend: {process.env.NEXT_PUBLIC_API_BASE_URL || 'http://13.37.117.93/api'}</div>
                </div>
              </div>
            </Card.Content>
          </Card>
        </div>

        {/* Additional Information */}
        <Card padding="md" className="mt-6">
          <Card.Header>
            <Card.Title>Integration Notes</Card.Title>
          </Card.Header>
          <Card.Content>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h4 className="font-medium text-neutral-900 mb-2">Backend Configuration</h4>
                <ul className="text-sm text-neutral-600 space-y-1">
                  <li>• Currency: EUR (Euro)</li>
                  <li>• Country: Belgium (BE)</li>
                  <li>• Locale: nl-BE (Dutch-Belgium)</li>
                  <li>• Test Mode: Enabled</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-neutral-900 mb-2">Frontend Updates</h4>
                <ul className="text-sm text-neutral-600 space-y-1">
                  <li>• Currency formatting: EUR</li>
                  <li>• Address validation: Belgium</li>
                  <li>• Test card helpers: Added</li>
                  <li>• Payment service: Updated</li>
                </ul>
              </div>
            </div>
          </Card.Content>
        </Card>
      </div>
    </div>
  );
} 