'use client';

import React, { useState, useEffect } from 'react';

interface FallbackImageProps {
  src: string;
  alt: string;
  className?: string;
  fallback?: string;
  onClick?: () => void;
}

/**
 * Simple fallback image component using regular img tag for better compatibility
 * Backend now returns ready-to-use image URLs with proper CORS headers
 */
export default function FallbackImage({ 
  src, 
  alt,
  className = '',
  fallback = '/images/placeholder-book.svg',
  onClick,
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
    
    // Try alternative URLs for Laravel storage link issues
    if (!currentSrc.startsWith('http') && currentSrc !== fallback) {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://api.bookswap.space';
      const absoluteUrl = currentSrc.startsWith('/') ? `${backendUrl}${currentSrc}` : `${backendUrl}/${currentSrc}`;
      setCurrentSrc(absoluteUrl);
      return;
    }
    
    // If it's already an absolute URL but failed, try alternative paths
    if (currentSrc.startsWith('http') && currentSrc.includes('/storage/') && currentSrc !== fallback) {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://api.bookswap.space';
      const filename = currentSrc.split('/').pop();
      
      // Try direct public path as fallback for storage link issues
      const alternativeUrl = `${backendUrl}/app/public/books/${filename}`;
      if (alternativeUrl !== currentSrc) {
        setCurrentSrc(alternativeUrl);
        return;
      }
    }
    
    setCurrentSrc(fallback);
    setHasFailed(true);
  };

  if (!currentSrc) {
    return null;
  }

  // Use regular img tag for better compatibility with external images
  return (
    <img
      src={currentSrc}
      alt={alt}
      className={className}
      onError={handleImageError}
      onClick={onClick}
      style={{
        objectFit: 'cover',
        width: '100%',
        height: '100%',
      }}
      loading="lazy"
      // Only use crossOrigin for our backend images in production
      {...(currentSrc.includes('api.bookswap.space') && process.env.NODE_ENV === 'production' ? { crossOrigin: 'anonymous' } : {})}
    />
  );
} 