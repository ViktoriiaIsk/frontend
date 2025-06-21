'use client';

import React, { useState } from 'react';
import Image, { ImageProps } from 'next/image';

interface SimpleImageProps extends Omit<ImageProps, 'src' | 'onError'> {
  src: string;
  fallback?: string;
}

/**
 * Simple image component for HTTPS backend - no complex fallback logic needed
 */
export default function SimpleImage({ 
  src, 
  fallback = '/images/placeholder-book.svg',
  ...props 
}: SimpleImageProps) {
  const [currentSrc, setCurrentSrc] = useState(() => {
    // Return fallback for invalid sources
    if (!src || src === 'null' || src === 'undefined') {
      return fallback;
    }
    
    // If already a complete URL, use as is
    if (src.startsWith('http')) {
      return src;
    }
    
    // Build URL with backend domain
    const backendUrl = process.env.NEXT_PUBLIC_IMAGE_BASE_URL || 'https://api.bookswap.space';
    
    // Handle different path formats
    if (src.startsWith('/')) {
      return `${backendUrl}${src}`;
    }
    
    return `${backendUrl}/${src}`;
  });

  const handleImageError = () => {
    // Simple fallback - just use placeholder
    setCurrentSrc(fallback);
  };

  return (
    <Image
      {...props}
      src={currentSrc}
      onError={handleImageError}
      alt={props.alt || 'Book image'}
      // Enable optimization for external HTTPS images
      unoptimized={false}
    />
  );
} 