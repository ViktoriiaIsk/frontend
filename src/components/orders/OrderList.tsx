'use client';

import { useState, useEffect } from 'react';
import { Order } from '@/types';
import { OrderService } from '@/lib/services/orders';
import { PaymentService } from '@/lib/services/payment';
import { ShoppingBagIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon, ClockIcon, XCircleIcon } from '@heroicons/react/24/solid';

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
    fetchOrders();
  }, [currentPage]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await OrderService.getUserOrders(currentPage, 10);
      setOrders(data.data);
      setTotalPages(data.last_page);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Не вдалося завантажити замовлення');
    } finally {
      setLoading(false);
    }
  };

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

  if (loading && orders.length === 0) {
    return (
      <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Мої замовлення</h2>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Завантаження замовлень...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Мої замовлення</h2>
        <div className="text-center py-8">
          <ShoppingBagIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchOrders}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Спробувати знову
          </button>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Мої замовлення</h2>
        <div className="text-center py-8">
          <ShoppingBagIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">У вас поки немає замовлень</p>
          <a
            href="/"
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Почати покупки
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow ${className}`}>
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900">Мої замовлення</h2>
        <p className="text-gray-600">
          Загальна вартість: {PaymentService.formatCurrency(
            OrderService.calculateTotalValue(orders) * 100
          )}
        </p>
      </div>

      <div className="divide-y divide-gray-200">
        {orders.map((order) => {
          const statusInfo = OrderService.formatOrderStatus(order.status);
          
          return (
            <div key={order.id} className="p-6 hover:bg-gray-50 transition-colors cursor-pointer">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(order.status)}
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Замовлення #{order.id}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {OrderService.formatOrderDate(order.created_at)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>
                    {statusInfo.text}
                  </span>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                {order.book.first_image ? (
                  <img
                    src={order.book.first_image}
                    alt={order.book.title}
                    className="w-16 h-20 object-cover rounded-lg shadow-sm"
                  />
                ) : (
                  <div className="w-16 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                    <ShoppingBagIcon className="w-6 h-6 text-gray-400" />
                  </div>
                )}
                
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-900 truncate">
                    {order.book.title}
                  </h4>
                  <p className="text-sm text-gray-600 mb-1">Автор: {order.book.author}</p>
                  <p className="text-sm text-gray-600 mb-2">Стан: {order.book.condition}</p>
                  
                  <div className="text-sm text-gray-500">
                    <p>Доставка: {order.shipping_address.city}, {order.shipping_address.country}</p>
                  </div>
                </div>
                
                <div className="text-right flex-shrink-0">
                  <p className="text-lg font-bold text-gray-900">
                    {PaymentService.formatCurrency(parseFloat(order.total_amount) * 100)}
                  </p>
                  <ChevronRightIcon className="w-5 h-5 text-gray-400 mt-2" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="p-6 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Попередня
            </button>
            
            <span className="text-sm text-gray-700">
              Сторінка {currentPage} з {totalPages}
            </span>
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Наступна
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 