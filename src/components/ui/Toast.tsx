'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/utils';

interface ToastProps {
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  duration?: number;
  onClose?: () => void;
}

/**
 * Simple toast notification component
 */
const Toast: React.FC<ToastProps> = ({
  message,
  type = 'info',
  duration = 3000,
  onClose
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => {
        onClose?.();
      }, 300); // Wait for fade out animation
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose?.();
    }, 300);
  };

  return (
    <div
      className={cn(
        'fixed top-4 right-4 z-50 max-w-sm w-full bg-white rounded-lg shadow-lg border transition-all duration-300 transform',
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0',
        {
          'border-blue-200 bg-blue-50': type === 'info',
          'border-green-200 bg-green-50': type === 'success',
          'border-yellow-200 bg-yellow-50': type === 'warning',
          'border-red-200 bg-red-50': type === 'error',
        }
      )}
    >
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            {type === 'info' && <span className="text-blue-500">ℹ️</span>}
            {type === 'success' && <span className="text-green-500">✅</span>}
            {type === 'warning' && <span className="text-yellow-500">⚠️</span>}
            {type === 'error' && <span className="text-red-500">❌</span>}
          </div>
          <div className="ml-3 w-0 flex-1">
            <p className={cn(
              'text-sm font-medium',
              {
                'text-blue-800': type === 'info',
                'text-green-800': type === 'success',
                'text-yellow-800': type === 'warning',
                'text-red-800': type === 'error',
              }
            )}>
              {message}
            </p>
          </div>
          <div className="ml-4 flex-shrink-0 flex">
            <button
              onClick={handleClose}
              className={cn(
                'rounded-md inline-flex text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2',
                {
                  'text-blue-500 hover:text-blue-600 focus:ring-blue-500': type === 'info',
                  'text-green-500 hover:text-green-600 focus:ring-green-500': type === 'success',
                  'text-yellow-500 hover:text-yellow-600 focus:ring-yellow-500': type === 'warning',
                  'text-red-500 hover:text-red-600 focus:ring-red-500': type === 'error',
                }
              )}
            >
              <span className="sr-only">Close</span>
              ✕
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Toast; 