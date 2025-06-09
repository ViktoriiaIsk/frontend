'use client';

import React from 'react';
import { cn } from '@/utils';
import { ButtonProps } from '@/types';

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  children,
  onClick,
  type = 'button',
  className,
  ...props
}) => {
  const baseClasses = cn(
    'inline-flex items-center justify-center font-medium transition-all duration-200',
    'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500',
    'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
    'active:scale-95 transform-gpu',
    {
      // Size variants
      'px-3 py-2 text-sm rounded-lg': size === 'sm',
      'px-4 py-3 text-base rounded-xl': size === 'md',
      'px-6 py-4 text-lg rounded-xl': size === 'lg',
      
      // Color variants
      'bg-primary-600 hover:bg-primary-700 text-white shadow-eco hover:shadow-eco-lg':
        variant === 'primary',
      'bg-white hover:bg-neutral-50 text-neutral-700 border border-neutral-200 hover:border-primary-300 shadow-sm hover:shadow-md':
        variant === 'secondary',
      'bg-transparent hover:bg-primary-50 text-primary-700 hover:text-primary-800':
        variant === 'ghost',
      'bg-red-600 hover:bg-red-700 text-white shadow-sm hover:shadow-md':
        variant === 'danger',
    }
  );

  const handleClick = () => {
    if (!loading && !disabled && onClick) {
      onClick();
    }
  };

  return (
    <button
      type={type}
      className={cn(baseClasses, className)}
      onClick={handleClick}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg
          className="w-4 h-4 mr-2 animate-spin"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {children}
    </button>
  );
};

export default Button; 