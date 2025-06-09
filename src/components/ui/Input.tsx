'use client';

import React, { forwardRef } from 'react';
import { cn } from '@/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  variant?: 'default' | 'search';
  fullWidth?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  variant = 'default',
  fullWidth = true,
  className,
  ...props
}, ref) => {
  const inputClasses = cn(
    'flex h-12 w-full rounded-xl border bg-white px-4 py-3 text-base transition-all duration-200',
    'placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-0',
    'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-neutral-50',
    {
      'border-neutral-200 hover:border-neutral-300 focus:border-primary-500': !error,
      'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500': error,
      'pl-12': leftIcon,
      'pr-12': rightIcon,
      'w-full': fullWidth,
      // Search variant
      'bg-neutral-50 border-0 hover:bg-white focus:bg-white': variant === 'search',
    },
    className
  );

  return (
    <div className={cn('space-y-2', { 'w-full': fullWidth })}>
      {label && (
        <label className="block text-sm font-medium text-neutral-700">
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400">
            {leftIcon}
          </div>
        )}
        
        <input
          ref={ref}
          className={inputClasses}
          {...props}
        />
        
        {rightIcon && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400">
            {rightIcon}
          </div>
        )}
      </div>
      
      {(error || helperText) && (
        <div className="space-y-1">
          {error && (
            <p className="text-sm text-red-600 flex items-center gap-1">
              <svg
                className="w-4 h-4 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              {error}
            </p>
          )}
          {helperText && !error && (
            <p className="text-sm text-neutral-500">{helperText}</p>
          )}
        </div>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input; 