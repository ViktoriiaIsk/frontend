'use client';

import React, { useState } from 'react';
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
  const [currentSrc, setCurrentSrc] = useState(src);
  const [alternativeIndex, setAlternativeIndex] = useState(-1);
  const [alternatives] = useState(() => {
    // Extract filename from URL if it's a full URL
    let imagePath = src;
    if (src.startsWith('http') && src.includes('/book-images/')) {
      imagePath = src.split('/book-images/')[1];
    }
    return getImageUrlAlternatives(imagePath);
  });

  const handleImageError = () => {
    const nextIndex = alternativeIndex + 1;
    
    if (nextIndex < alternatives.length) {
      // Try next alternative
      setAlternativeIndex(nextIndex);
      setCurrentSrc(alternatives[nextIndex]);
    } else {
      // All alternatives failed, use fallback
      setCurrentSrc(fallback);
    }
  };

  return (
    <Image
      {...props}
      src={currentSrc}
      onError={handleImageError}
    />
  );
} 