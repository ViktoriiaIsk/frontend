'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

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
 * Backend now returns ready-to-use image URLs with proper CORS headers
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
  const [hasFailed, setHasFailed] = useState(false);

  useEffect(() => {
    if (!src || src === 'null' || src === 'undefined') {
      setCurrentSrc(fallback);
      setHasFailed(true);
      return;
    }
    
    setCurrentSrc(src);
    setHasFailed(false);
  }, [src, fallback]);

  const handleImageError = () => {
    if (hasFailed) return;
    
    setCurrentSrc(fallback);
    setHasFailed(true);
  };

  if (!currentSrc) {
    return null;
  }

  return (
    <Image
      src={currentSrc}
      alt={alt}
      className={className}
      width={width || 400}
      height={height || 600}
      onError={handleImageError}
      style={{
        objectFit: 'cover',
        width: '100%',
        height: '100%',
      }}
      // Optimize external images
      unoptimized={currentSrc.startsWith('http')}
      // Add priority for above-the-fold images
      priority={false}
      // Add loading optimization
      loading="lazy"
    />
  );
} 