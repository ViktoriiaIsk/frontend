'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { CheckCircleIcon, ArrowRightIcon, ShoppingBagIcon } from '@heroicons/react/24/solid';
import { Order } from '@/types';
import { OrderService } from '@/lib/services/orders';
import { LocalOrdersService } from '@/lib/services/localOrders';
import { PaymentService } from '@/lib/services/payment';

function ThankYouContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const orderId = searchParams.get('order_id');
  const paymentIntentId = searchParams.get('payment_intent');

  useEffect(() => {
    if (!orderId) {
      setError('Order information not found');
      setLoading(false);
      return;
    }

    const fetchOrderDetails = async () => {
      try {
        const orderData = await OrderService.getOrder(parseInt(orderId));
        setOrder(orderData);
      } catch (err) {
        console.error('Error fetching order from backend:', err);
        
        // Try to get order from localStorage as fallback
        console.log('Trying to get order from localStorage...');
        const localOrder = LocalOrdersService.getLocalOrder(parseInt(orderId));
        
        if (localOrder) {
          console.log('Found order in localStorage:', localOrder);
          setOrder(localOrder);
        } else {
          console.warn('Could not load order details from backend or localStorage, but payment was successful');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center bg-white rounded-lg shadow-lg p-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShoppingBagIcon className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Error</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="w-full bg-gray-900 text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-800 transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  // If we don't have order details but no error, show success without details
  if (!order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto">
            {/* Success Header */}
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircleIcon className="w-12 h-12 text-green-600" />
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Thank You for Your Purchase!
              </h1>
              <p className="text-xl text-gray-600">
                Your payment has been processed successfully
              </p>
            </div>

            {/* Order Info */}
            <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Payment Successful
              </h2>
              <p className="text-gray-600 mb-4">
                Order ID: <span className="font-mono font-medium">#{orderId}</span>
              </p>
              <p className="text-gray-600 mb-6">
                Payment Intent: <span className="font-mono text-sm">{paymentIntentId}</span>
              </p>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-blue-900 mb-3">
                  What is next?
                </h3>
                <ul className="space-y-2 text-blue-800">
                  <li>• You will receive a confirmation email shortly</li>
                  <li>• The seller will contact you to arrange delivery</li>
                  <li>• Check your profile for order updates</li>
                </ul>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => router.push('/profile')}
                className="flex items-center justify-center space-x-2 bg-white border border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                <span>My Profile</span>
                <ArrowRightIcon className="w-4 h-4" />
              </button>
              
              <button
                onClick={() => router.push('/')}
                className="flex items-center justify-center space-x-2 bg-gray-900 text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-800 transition-colors"
              >
                <span>Continue Shopping</span>
                <ArrowRightIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircleIcon className="w-12 h-12 text-green-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Thank You for Your Purchase!
            </h1>
            <p className="text-xl text-gray-600">
              Your order has been successfully placed
            </p>
          </div>

          {/* Order Details Card */}
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <div className="border-b border-gray-200 pb-6 mb-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                Order Details
              </h2>
              <p className="text-gray-600">
                Order Number: <span className="font-mono font-medium">#{order.id}</span>
              </p>
              <p className="text-gray-600">
                Date: {OrderService.formatOrderDate(order.created_at)}
              </p>
            </div>

            {/* Book Information */}
            <div className="flex items-start space-x-4 mb-6">
              {order.book.first_image ? (
                <Image
                  src={order.book.first_image}
                  alt={order.book.title}
                  width={80}
                  height={112}
                  className="w-20 h-28 object-cover rounded-lg shadow-md"
                />
              ) : (
                <div className="w-20 h-28 bg-gray-200 rounded-lg flex items-center justify-center">
                  <ShoppingBagIcon className="w-8 h-8 text-gray-400" />
                </div>
              )}
              
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {order.book.title}
                </h3>
                <p className="text-gray-600 mb-2">Author: {order.book.author}</p>
                <p className="text-gray-600 mb-2">Condition: {order.book.condition}</p>
                <p className="text-2xl font-bold text-green-600">
                  {PaymentService.formatCurrency(parseFloat(order.total_amount) * 100)}
                </p>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="border-t border-gray-200 pt-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-3">
                Shipping Address
              </h4>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-800">{order.shipping_address.street}</p>
                <p className="text-gray-800">
                  {order.shipping_address.city}, {order.shipping_address.postal_code}
                </p>
                <p className="text-gray-800">{order.shipping_address.country}</p>
              </div>
            </div>
          </div>

          {/* Information Card */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">
              What is next?
            </h3>
            <ul className="space-y-2 text-blue-800">
              <li>• You will receive a confirmation email within a few minutes</li>
              <li>• The seller will contact you to arrange delivery</li>
              <li>• You can track your order status in your profile</li>
              <li>• Contact our support team if you have any questions</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => router.push('/profile')}
              className="flex items-center justify-center space-x-2 bg-white border border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              <span>My Orders</span>
              <ArrowRightIcon className="w-4 h-4" />
            </button>
            
            <button
              onClick={() => router.push('/')}
              className="flex items-center justify-center space-x-2 bg-gray-900 text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-800 transition-colors"
            >
              <span>Continue Shopping</span>
              <ArrowRightIcon className="w-4 h-4" />
            </button>
          </div>

          {/* Contact Support */}
          <div className="text-center mt-8">
            <p className="text-gray-600">
              Have questions? {' '}
              <a 
                href="mailto:support@bookswap.com" 
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Contact Support
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  );
}

export default function ThankYouPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ThankYouContent />
    </Suspense>
  );
} 