'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Order } from '@/types';
import { OrderService } from '@/lib/services/orders';
import { LocalOrdersService } from '@/lib/services/localOrders';
import { PaymentService } from '@/lib/services/payment';
import { ShoppingBagIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon, ClockIcon, XCircleIcon } from '@heroicons/react/24/solid';
import { getBookImageUrlFromPath } from '@/utils';

interface OrderListProps {
  className?: string;
}

export default function OrderList({ className = '' }: OrderListProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError(null);
      
      try {
  
        
        // Get orders from localStorage only (no backend)
        const localOrders = LocalOrdersService.getLocalOrders();

        
        setOrders(localOrders);
              } catch (error) {
        setError('Failed to load orders');
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case 'pending':
        return <ClockIcon className="w-5 h-5 text-yellow-500" />;
      case 'cancelled':
        return <XCircleIcon className="w-5 h-5 text-red-500" />;
      default:
        return <ClockIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  if (loading && orders.length === 0) {
    return (
      <div className={`bg-white rounded-lg shadow p-4 sm:p-6 ${className}`}>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">My Orders</h2>
        <div className="text-center py-6 sm:py-8">
          <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-sm sm:text-base text-gray-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-lg shadow p-4 sm:p-6 ${className}`}>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">My Orders</h2>
        <div className="text-center py-6 sm:py-8">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-200">
            <ShoppingBagIcon className="w-6 h-6 sm:w-8 sm:h-8 text-red-600" />
          </div>
          <p className="text-sm sm:text-base text-red-600 mb-4">{error}</p>
          <button
            onClick={handleRefresh}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm sm:text-base"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className={`bg-white rounded-lg shadow p-4 sm:p-6 ${className}`}>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">My Orders</h2>
        <div className="text-center py-6 sm:py-8">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-200">
            <ShoppingBagIcon className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
          </div>
          <p className="text-sm sm:text-base text-gray-600 mb-4">You do not have any orders yet</p>
          <Link
            href="/"
            className="inline-block bg-green-600 text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm sm:text-base"
          >
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow ${className}`}>
      <div className="p-4 sm:p-6 border-b border-gray-200">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">My Orders</h2>
        <p className="text-sm sm:text-base text-gray-600">
          Total Value: {PaymentService.formatCurrency(
            OrderService.calculateTotalValue(orders) * 100
          )}
        </p>
      </div>

      <div className="divide-y divide-gray-200">
        {orders.map((order) => {
          const statusInfo = OrderService.formatOrderStatus(order.status);
          
          return (
            <div key={order.id} className="p-4 sm:p-6 hover:bg-gray-50 transition-colors cursor-pointer">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-4 space-y-2 sm:space-y-0">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(order.status)}
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm sm:text-base">
                      Order #{order.id}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600">
                      {OrderService.formatOrderDate(order.created_at)}
                    </p>
                  </div>
                </div>
                <div className="text-left sm:text-right">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>
                    {statusInfo.text}
                  </span>
                </div>
              </div>

                              <div className="flex flex-col sm:flex-row sm:items-start space-y-4 sm:space-y-0 sm:space-x-4">
                  {order.book?.first_image ? (
                    <Image
                      src={getBookImageUrlFromPath(order.book.first_image, order.book.id)}
                      alt={order.book.title || 'Book'}
                      width={256}
                      height={192}
                      className="w-full sm:w-16 h-48 sm:h-20 object-cover rounded-lg shadow-sm"
                    />
                  ) : (
                    <Image
                      src="/images/placeholder-book.svg"
                      alt="Book placeholder"
                      width={256}
                      height={192}
                      className="w-full sm:w-16 h-48 sm:h-20 object-cover rounded-lg shadow-sm"
                    />
                  )}
                
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-900 truncate text-sm sm:text-base">
                    {order.book?.title || 'Unknown Book'}
                  </h4>
                  <p className="text-xs sm:text-sm text-gray-600 mb-1">Author: {order.book?.author || 'Unknown'}</p>
                  <p className="text-xs sm:text-sm text-gray-600 mb-2">Condition: {order.book?.condition || 'Unknown'}</p>
                  
                  <div className="text-xs sm:text-sm text-gray-500">
                    <p>Shipping: {order.shipping_address?.city || 'Unknown'}, {order.shipping_address?.country || 'Unknown'}</p>
                  </div>
                </div>
                
                <div className="text-left sm:text-right flex-shrink-0 flex sm:flex-col items-center sm:items-end justify-between sm:justify-start">
                  <p className="text-lg sm:text-xl font-bold text-gray-900">
                    {order.total_amount && !isNaN(parseFloat(order.total_amount)) ? 
                      PaymentService.formatCurrency(parseFloat(order.total_amount) * 100) :
                      (order.book?.price && !isNaN(parseFloat(order.book.price)) ?
                        PaymentService.formatCurrency(parseFloat(order.book.price) * 100) :
                        'Price not available'
                      )
                    }
                  </p>
                  <ChevronRightIcon className="w-5 h-5 text-gray-400 mt-0 sm:mt-2" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="p-4 sm:p-6 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row items-center justify-between space-y-2 sm:space-y-0">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="w-full sm:w-auto px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            <span className="text-xs sm:text-sm text-gray-700 order-first sm:order-none">
              Page {currentPage} of {totalPages}
            </span>
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="w-full sm:w-auto px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 