'use client';

import React, { useState, useEffect } from 'react';
import { getImageUrlAlternatives } from '@/utils';

interface FallbackImageProps {
  src: string;
  alt: string;
  className?: string;
  fallback?: string;
  width?: number;
  height?: number;
}

/**
 * Simple fallback image component using regular img tag
 * Used when Next.js Image component causes issues
 */
export default function FallbackImage({ 
  src, 
  alt,
  className = '',
  fallback = '/images/placeholder-book.svg',
  width,
  height,
}: FallbackImageProps) {
  const [currentSrc, setCurrentSrc] = useState(() => {
    if (!src || src === 'null' || src === 'undefined') {
      return fallback;
    }
    return src;
  });
  const [alternativeIndex, setAlternativeIndex] = useState(-1);
  const [hasFailed, setHasFailed] = useState(false);
  
  const [alternatives] = useState(() => {
    if (!src || src === 'null' || src === 'undefined') return [];
    
    let imagePath = src;
    if (src.startsWith('http') && src.includes('/book-images/')) {
      imagePath = src.split('/book-images/')[1];
    }
    return getImageUrlAlternatives(imagePath);
  });

  useEffect(() => {
    if (!src || src === 'null' || src === 'undefined') {
      setCurrentSrc(fallback);
      setHasFailed(true);
      return;
    }
    
    setCurrentSrc(src);
    setAlternativeIndex(-1);
    setHasFailed(false);
  }, [src, fallback]);

  const handleImageError = () => {
    if (hasFailed) return;
    
    const nextIndex = alternativeIndex + 1;
    
    if (nextIndex < alternatives.length) {
      setAlternativeIndex(nextIndex);
      setCurrentSrc(alternatives[nextIndex]);
    } else {
      setCurrentSrc(fallback);
      setHasFailed(true);
    }
  };

  if (!currentSrc) {
    return null;
  }

  return (
    <img
      src={currentSrc}
      alt={alt}
      className={className}
      width={width}
      height={height}
      onError={handleImageError}
      style={{
        objectFit: 'cover',
        width: '100%',
        height: '100%',
      }}
    />
  );
} 