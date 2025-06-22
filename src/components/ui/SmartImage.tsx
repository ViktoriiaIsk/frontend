'use client';

import React, { useState, useEffect } from 'react';
import { getImageUrlAlternatives } from '@/utils';
import FallbackImage from './FallbackImage';

interface SmartImageProps {
  src: string;
  alt: string;
  bookId?: number;
  className?: string;
  sizes?: string;
  priority?: boolean;
}

/**
 * Smart image component that tries alternative URLs when the main image fails to load
 */
export default function SmartImage({ 
  src, 
  alt,
  bookId,
  className,
  sizes,
  priority,
}: SmartImageProps) {
  const [currentSrc, setCurrentSrc] = useState(() => {
    // Start with fallback if src is invalid
    if (!src || src === 'null' || src === 'undefined') {
      return '/images/placeholder-book.svg';
    }
    
    // Use direct backend URL for production
    if (src.includes('api.bookswap.space')) {
      return src; // Already correct URL
    }
    
    return src;
  });
  const [alternativeIndex, setAlternativeIndex] = useState(-1);
  const [hasFailed, setHasFailed] = useState(false);
  
  const [alternatives] = useState(() => {
    if (!src || src === 'null' || src === 'undefined') return [];
    
    // Extract filename from URL if it's a full URL
    let imagePath = src;
    if (src.startsWith('http')) {
      // Extract path from full URL
      if (src.includes('/storage/books/')) {
        imagePath = src.split('/storage/books/')[1];
      } else if (src.includes('/book-images/')) {
        imagePath = src.split('/book-images/')[1];
      } else if (src.includes('/books/')) {
        imagePath = src.split('/books/')[1];
      } else {
        // Extract just the filename
        imagePath = src.split('/').pop() || src;
      }
    }
    return getImageUrlAlternatives(imagePath);
  });

  // Reset when src changes
  useEffect(() => {
    if (!src || src === 'null' || src === 'undefined') {
      setCurrentSrc('/images/placeholder-book.svg');
      setHasFailed(true);
      return;
    }
    
    // Use direct backend URL for production
    let backendSrc = src;
    if (src.includes('api.bookswap.space')) {
      backendSrc = src; // Already correct URL
    }
    
    setCurrentSrc(backendSrc);
    setAlternativeIndex(-1);
    setHasFailed(false);
  }, [src]);

  const handleImageError = () => {
    if (hasFailed) return; // Prevent infinite loops
    
    
    const nextIndex = alternativeIndex + 1;
    
    if (nextIndex < alternatives.length) {
      // Try next alternative
      setAlternativeIndex(nextIndex);
      setCurrentSrc(alternatives[nextIndex]);
    } else {
      // All alternatives failed, use fallback
      setCurrentSrc('/images/placeholder-book.svg');
      setHasFailed(true);
    }
  };

  // Don't render if src is completely invalid
  if (!currentSrc) {
    return null;
  }

  return (
    <img
      src={currentSrc}
      onError={handleImageError}
      alt={alt || 'Book image'}
      className={className}
      sizes={sizes}
    />
  );
} 