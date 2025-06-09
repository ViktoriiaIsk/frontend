'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Navigation from '@/components/layout/Navigation';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { PaymentService } from '@/lib/services/payment';
import { useBook } from '@/hooks/useBooks';
import { formatCurrency } from '@/utils';

/**
 * Payment success page - handles successful Stripe checkout
 */
const PaymentSuccessPage: React.FC = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [processing, setProcessing] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const bookId = parseInt(searchParams.get('book_id') || '0');
  const sessionId = searchParams.get('session_id');

  // Fetch book details
  const { data: book, isLoading: bookLoading } = useBook(bookId);

  useEffect(() => {
    const processPayment = async () => {
      if (!bookId || !sessionId) {
        setError('Missing payment information');
        setProcessing(false);
        return;
      }

      try {
        // Process successful payment and update book status
        const result = await PaymentService.processSuccessfulPayment(bookId, sessionId);
        
        if (result.success) {
          setSuccess(true);
        } else {
          setError(result.error || 'Failed to process payment');
        }
      } catch (err) {
        console.error('Payment processing error:', err);
        setError(err instanceof Error ? err.message : 'Failed to process payment');
      } finally {
        setProcessing(false);
      }
    };

    if (bookId && sessionId) {
      processPayment();
    } else {
      setError('Invalid payment parameters');
      setProcessing(false);
    }
  }, [bookId, sessionId]);

  // Loading state
  if (processing || bookLoading) {
    return (
      <div className="min-h-screen bg-accent-cream">
        <Navigation />
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <Card className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <h1 className="text-2xl font-bold text-neutral-900 mb-2">
              Processing Payment...
            </h1>
            <p className="text-neutral-600">
              Please wait while we confirm your payment
            </p>
          </Card>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-accent-cream">
        <Navigation />
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <Card className="text-center py-12">
            <div className="text-6xl mb-4">❌</div>
            <h1 className="text-2xl font-bold text-neutral-900 mb-2">
              Payment Error
            </h1>
            <p className="text-neutral-600 mb-6">
              {error}
            </p>
            <div className="space-y-3">
              <Link href="/books">
                <Button>Browse Books</Button>
              </Link>
              {bookId && (
                <Link href={`/books/${bookId}`}>
                  <Button variant="secondary">Back to Book</Button>
                </Link>
              )}
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // Success state
  if (success && book) {
    return (
      <div className="min-h-screen bg-accent-cream">
        <Navigation />
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <Card className="text-center py-12">
            <div className="text-6xl mb-4">✅</div>
            <h1 className="text-2xl font-bold text-neutral-900 mb-2">
              Payment Successful!
            </h1>
            <p className="text-neutral-600 mb-6">
              Thank you for your purchase. Your payment has been processed successfully.
            </p>
            
            {/* Book details */}
            <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-6">
              <h3 className="font-semibold text-green-900 mb-2">Purchase Details</h3>
              <div className="space-y-2 text-sm text-green-800">
                <div className="flex justify-between">
                  <span>Book:</span>
                  <span className="font-medium">{book.title}</span>
                </div>
                <div className="flex justify-between">
                  <span>Author:</span>
                  <span>{book.author}</span>
                </div>
                <div className="flex justify-between">
                  <span>Price:</span>
                  <span className="font-bold">{formatCurrency(book.price)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Status:</span>
                  <span className="font-medium text-red-600">SOLD</span>
                </div>
              </div>
            </div>

            {/* Next steps */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
              <h3 className="font-semibold text-blue-900 mb-2">What's Next?</h3>
              <div className="text-sm text-blue-800 space-y-2">
                <p>• You will receive an email confirmation shortly</p>
                <p>• The seller will be notified about your purchase</p>
                <p>• You can track your order in your profile</p>
                <p>• Shipping details will be provided by the seller</p>
              </div>
            </div>

            <div className="space-y-3">
              <Link href="/dashboard">
                <Button>View My Orders</Button>
              </Link>
              <Link href="/books">
                <Button variant="secondary">Continue Shopping</Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // Fallback
  return (
    <div className="min-h-screen bg-accent-cream">
      <Navigation />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Card className="text-center py-12">
          <div className="text-6xl mb-4">❓</div>
          <h1 className="text-2xl font-bold text-neutral-900 mb-2">
            Unknown Status
          </h1>
          <p className="text-neutral-600 mb-6">
            We're not sure what happened. Please contact support if you need help.
          </p>
          <Link href="/books">
            <Button>Browse Books</Button>
          </Link>
        </Card>
      </div>
    </div>
  );
};

export default PaymentSuccessPage; 