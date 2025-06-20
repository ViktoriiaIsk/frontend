'use client';

import React, { useState, useEffect } from 'react';
import Image, { ImageProps } from 'next/image';
import { getImageUrlAlternatives } from '@/utils';
import ImageDebugger from '@/components/debug/ImageDebugger';

interface SmartImageProps extends Omit<ImageProps, 'src' | 'onError'> {
  src: string;
  fallback?: string;
  bookId?: number | string;
  showDebugger?: boolean;
}

/**
 * Smart image component that tries alternative URLs when the main image fails to load
 */
export default function SmartImage({ 
  src, 
  fallback = '/images/placeholder-book.svg',
  bookId,
  showDebugger = false,
  ...props 
}: SmartImageProps) {
  const [currentSrc, setCurrentSrc] = useState(() => {
    // Start with fallback if src is invalid
    if (!src || src === 'null' || src === 'undefined') {
      return fallback;
    }
    
    // Use direct backend URL for production
    if (src.includes('13.37.117.93')) {
      const path = src.replace('http://13.37.117.93/', '').replace('https://13.37.117.93/', '');
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://bookswap-save-planet.vercel.app';
      return `${backendUrl}/${path}`;
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
      setCurrentSrc(fallback);
      setHasFailed(true);
      return;
    }
    
    // Use direct backend URL for production
    let backendSrc = src;
    if (src.includes('13.37.117.93')) {
      const path = src.replace('http://13.37.117.93/', '').replace('https://13.37.117.93/', '');
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://bookswap-save-planet.vercel.app';
      backendSrc = `${backendUrl}/${path}`;
    }
    
    setCurrentSrc(backendSrc);
    setAlternativeIndex(-1);
    setHasFailed(false);
  }, [src, fallback]);

  const handleImageError = () => {
    if (hasFailed) return; // Prevent infinite loops
    
    
    const nextIndex = alternativeIndex + 1;
    
    if (nextIndex < alternatives.length) {
      // Try next alternative
      setAlternativeIndex(nextIndex);
      setCurrentSrc(alternatives[nextIndex]);
    } else {
      // All alternatives failed, use fallback
      setCurrentSrc(fallback);
      setHasFailed(true);
    }
  };

  // Don't render if src is completely invalid
  if (!currentSrc) {
    return null;
  }

  return (
    <>
      <Image
        {...props}
        src={currentSrc}
        onError={handleImageError}
        alt={props.alt || 'Book image'}
        // Add unoptimized prop for external images to prevent Next.js optimization issues
        unoptimized={currentSrc.startsWith('http')}
      />
      {showDebugger && (
        <ImageDebugger 
          imagePath={src} 
          bookId={bookId}
        />
      )}
    </>
  );
} 