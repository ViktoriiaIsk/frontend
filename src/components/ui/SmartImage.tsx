'use client';

import React, { useState, useEffect } from 'react';
import Image, { ImageProps } from 'next/image';
import { getImageUrlAlternatives } from '@/utils';

interface SmartImageProps extends Omit<ImageProps, 'src' | 'onError'> {
  src: string;
  fallback?: string;
}

/**
 * Smart image component that tries alternative URLs when the main image fails to load
 */
export default function SmartImage({ 
  src, 
  fallback = '/images/placeholder-book.svg',
  ...props 
}: SmartImageProps) {
  const [currentSrc, setCurrentSrc] = useState(() => {
    // Start with fallback if src is invalid
    if (!src || src === 'null' || src === 'undefined') {
      return fallback;
    }
    
    // Convert direct backend URLs to proxy URLs
    if (src.includes('13.37.117.93')) {
      const path = src.replace('http://13.37.117.93/', '').replace('https://13.37.117.93/', '');
      return `/api/proxy/${path}`;
    }
    
    return src;
  });
  const [alternativeIndex, setAlternativeIndex] = useState(-1);
  const [hasFailed, setHasFailed] = useState(false);
  
  const [alternatives] = useState(() => {
    if (!src || src === 'null' || src === 'undefined') return [];
    
    // Extract filename from URL if it's a full URL
    let imagePath = src;
    if (src.startsWith('http') && src.includes('/book-images/')) {
      imagePath = src.split('/book-images/')[1];
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
    
    // Convert direct backend URLs to proxy URLs
    let proxiedSrc = src;
    if (src.includes('13.37.117.93')) {
      const path = src.replace('http://13.37.117.93/', '').replace('https://13.37.117.93/', '');
      proxiedSrc = `/api/proxy/${path}`;
    }
    
    setCurrentSrc(proxiedSrc);
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
    <Image
      {...props}
      src={currentSrc}
      onError={handleImageError}
      alt={props.alt || 'Book image'}
      // Add unoptimized prop for external images to prevent Next.js optimization issues
      unoptimized={currentSrc.startsWith('http')}
    />
  );
} 