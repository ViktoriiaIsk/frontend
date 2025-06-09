'use client';

import React from 'react';
import { cn } from '@/utils';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}

/**
 * Loading spinner component with optional text
 */
const Loading: React.FC<LoadingProps> = ({
  size = 'md',
  text,
  className,
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className={cn('flex flex-col items-center justify-center', className)}>
      <div
        className={cn(
          'animate-spin rounded-full border-2 border-neutral-200 border-t-primary-600',
          sizeClasses[size]
        )}
      />
      {text && (
        <p className="mt-2 text-sm text-neutral-600">{text}</p>
      )}
    </div>
  );
};

export default Loading; 