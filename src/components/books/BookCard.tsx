'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Book } from '@/types';
import { formatCurrency, truncateText } from '@/utils';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import FallbackImage from '@/components/ui/FallbackImage';
import PaymentModal from '@/components/payment/PaymentModal';
// import { usePurchase } from '@/hooks/usePurchase';

interface BookCardProps {
  book: Book;
  variant?: 'grid' | 'list';
  showActions?: boolean;
  currentUserId?: number | null;
}

/**
 * Book card component for displaying book information in grid or list view
 */
const BookCard: React.FC<BookCardProps> = ({
  book,
  variant = 'grid',
  showActions = true,
  currentUserId,
}) => {
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  
  // Check if current user is the owner
  const isOwner = currentUserId && book.owner_id === currentUserId;
  
  // Get the primary image or first image from API
  // Backend now returns ready-to-use URLs in image_url field
  const imageUrl = book.first_image || 
                   book.images?.[0]?.image_url || 
                   book.images?.[0]?.url || // Fallback for backward compatibility
                   '/images/placeholder-book.svg';

  // Handle buy now click
  const handleBuyNow = () => {
    setShowPaymentModal(true);
  };

  // Handle payment success
  const handlePaymentSuccess = () => {
    alert('Payment successful! Your order has been placed.');
    setShowPaymentModal(false);
  };

  // Handle payment error
  const handlePaymentError = (error: string) => {
    alert(`Payment failed: ${error}`);
  };

  if (variant === 'list') {
    return (
      <Card padding="none" hover className="overflow-hidden">
        <div className="flex flex-col sm:flex-row">
          {/* Book Image */}
          <div className="relative w-full sm:w-32 h-48 sm:h-32 flex-shrink-0">
            <FallbackImage
              src={imageUrl}
              alt={book.title}
              className="object-cover absolute inset-0"
            />
            {book.status !== 'available' && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <span className="text-white text-sm font-medium capitalize">
                  {book.status}
                </span>
              </div>
            )}
          </div>

          {/* Book Info */}
          <div className="flex-1 p-4">
            <div className="flex justify-between items-start">
              <div className="flex-1 min-w-0">
                <Link href={`/books/${book.id}`}>
                  <h3 className="text-lg font-semibold text-neutral-900 hover:text-primary-600 transition-colors line-clamp-1">
                    {book.title}
                  </h3>
                </Link>
                <p className="text-sm text-neutral-600 mb-1">by {book.author}</p>
                <p className="text-sm text-neutral-500 mb-2">
                  Category: {book.category?.name}
                </p>
                <p className="text-sm text-neutral-600 line-clamp-2">
                  {truncateText(book.description, 120)}
                </p>
              </div>
              
              <div className="flex flex-col items-end ml-4">
                <span className="text-xl font-bold text-primary-600 mb-2">
                  {formatCurrency(book.price)}
                </span>
                {showActions && (
                  <>
                    {isOwner ? (
                      <Link href={`/books/${book.id}/edit`}>
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                          ✏️ Edit
                        </Button>
                      </Link>
                                         ) : book.status === 'available' ? (
                  <Button 
                    size="sm" 
                    onClick={handleBuyNow}
                  >
                    Buy Now
                  </Button>
                     ) : null}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  // Grid variant (default)
  return (
    <Card padding="none" hover className="overflow-hidden h-full flex flex-col">
      {/* Book Image */}
      <div className="relative aspect-[3/4] w-full">
        <FallbackImage
          src={imageUrl}
          alt={book.title}
          className="object-cover absolute inset-0"
        />
        {book.status !== 'available' && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="text-white text-sm font-medium capitalize">
              {book.status}
            </span>
          </div>
        )}
        
        {/* Price badge */}
        <div className="absolute top-2 right-2 bg-white bg-opacity-90 rounded-lg px-2 py-1">
          <span className="text-sm font-bold text-primary-600">
            {formatCurrency(book.price)}
          </span>
        </div>
      </div>

      {/* Book Info */}
      <div className="p-4 flex-1 flex flex-col">
        <Link href={`/books/${book.id}`}>
          <h3 className="text-lg font-semibold text-neutral-900 hover:text-primary-600 transition-colors line-clamp-2 mb-1">
            {book.title}
          </h3>
        </Link>
        
        <p className="text-sm text-neutral-600 mb-2">by {book.author}</p>
        
        <p className="text-xs text-neutral-500 mb-2">
          {book.category?.name}
        </p>
        
        <p className="text-sm text-neutral-600 flex-1 line-clamp-3 mb-4">
          {truncateText(book.description, 100)}
        </p>

        {/* Actions */}
        {showActions && (
          <div className="space-y-2">
            {isOwner ? (
              // Owner actions
              <>
                <Link href={`/books/${book.id}/edit`}>
                  <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700">
                    ✏️ Edit Book
                  </Button>
                </Link>
                <Link href={`/books/${book.id}`}>
                  <Button variant="ghost" size="sm" className="w-full">
                    View Details
                  </Button>
                </Link>
              </>
            ) : (
              // Buyer actions
              <>
            {book.status === 'available' ? (
              <Button 
                size="sm" 
                className="w-full"
                onClick={handleBuyNow}
              >
                🛒 Buy Now
              </Button>
            ) : (
              <Button variant="secondary" size="sm" className="w-full" disabled>
                {book.status === 'sold' ? 'Sold' : 'Reserved'}
              </Button>
            )}
            
            <Link href={`/books/${book.id}`}>
              <Button variant="ghost" size="sm" className="w-full">
                View Details
              </Button>
            </Link>
              </>
            )}
          </div>
        )}
      </div>
      
      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        book={book}
        onClose={() => setShowPaymentModal(false)}
        onSuccess={handlePaymentSuccess}
        onError={handlePaymentError}
      />
    </Card>
  );
};

export default BookCard; 