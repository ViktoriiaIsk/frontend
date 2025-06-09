'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import FallbackImage from '@/components/ui/FallbackImage';

import Navigation from '@/components/layout/Navigation';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { useBook } from '@/hooks/useBooks';
import { formatCurrency, formatDate } from '@/utils';
import { PaymentService } from '@/lib/services/payment';

/**
 * Individual book detail page
 */
const BookDetailPage: React.FC = () => {
  const params = useParams();
  const searchParams = useSearchParams();
  const bookId = parseInt(params?.id as string);
  const [buyingNow, setBuyingNow] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);

  // Fetch book details
  const { data: book, isLoading, error } = useBook(bookId);

  // Check if user came here to buy
  useEffect(() => {
    if (searchParams.get('action') === 'buy' && book?.status === 'available') {
      setShowCheckout(true);
    }
  }, [searchParams, book]);

  // Handle buy now action
  const handleBuyNow = async () => {
    if (!book || book.status !== 'available') return;
    
    setBuyingNow(true);
    
    try {
      // Simulate payment process - in real app this would open Stripe checkout
      console.log('Initiating purchase for book:', book.title);
      
      // For now, just show checkout section
      setShowCheckout(true);
    } catch (error) {
      console.error('Purchase failed:', error);
    } finally {
      setBuyingNow(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-accent-cream">
        <Navigation />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Image skeleton */}
              <div className="bg-neutral-200 aspect-[3/4] rounded-2xl"></div>
              {/* Content skeleton */}
              <div className="space-y-4">
                <div className="h-8 bg-neutral-200 rounded w-3/4"></div>
                <div className="h-6 bg-neutral-200 rounded w-1/2"></div>
                <div className="h-4 bg-neutral-200 rounded w-1/4"></div>
                <div className="h-32 bg-neutral-200 rounded"></div>
                <div className="h-12 bg-neutral-200 rounded w-1/3"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !book) {
    return (
      <div className="min-h-screen bg-accent-cream">
        <Navigation />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="text-center py-12">
            <div className="text-6xl mb-4">❌</div>
            <h1 className="text-2xl font-bold text-neutral-900 mb-2">
              Book Not Found
            </h1>
            <p className="text-neutral-600 mb-6">
              The book you're looking for doesn't exist or has been removed.
            </p>
            <Link href="/books">
              <Button>Browse All Books</Button>
            </Link>
          </Card>
        </div>
      </div>
    );
  }

  // Get the primary image or first image
  const primaryImage = book.first_image || 
                      book.images?.[0]?.url || 
                      '/images/placeholder-book.svg';

  // Book availability status
  const isAvailable = book.status === 'available';
  const statusColors = {
    available: 'bg-green-100 text-green-800',
    reserved: 'bg-yellow-100 text-yellow-800',
    sold: 'bg-red-100 text-red-800',
  };

  return (
    <div className="min-h-screen bg-accent-cream">
      <Navigation />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back button */}
        <div className="mb-6">
          <Link href="/books">
            <Button variant="ghost">
              ← Back to Books
            </Button>
          </Link>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Book Images */}
          <div className="space-y-4">
            {/* Main image */}
            <div className="relative aspect-[3/4] w-full">
              <FallbackImage
                src={primaryImage}
                alt={book.title}
                className="object-cover rounded-2xl absolute inset-0"
              />
              
              {/* Status badge */}
              <div className={`absolute top-4 left-4 px-3 py-1 rounded-lg text-sm font-medium ${statusColors[book.status]}`}>
                {book.status.charAt(0).toUpperCase() + book.status.slice(1)}
              </div>
            </div>

            {/* Additional images */}
            {book.images && book.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {book.images.slice(1, 5).map((image, index) => (
                  <div key={index} className="relative aspect-square">
                    <FallbackImage
                      src={image.url || '/images/placeholder-book.svg'}
                      alt={`${book.title} - Image ${index + 2}`}
                      className="object-cover rounded-lg absolute inset-0"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Book Details */}
          <div className="space-y-6">
            {/* Title and Author */}
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-2">
                {book.title}
              </h1>
              <p className="text-xl text-neutral-600 mb-4">
                by {book.author}
              </p>
              
              {/* Category */}
              {book.category && (
                <div className="inline-flex items-center px-3 py-1 bg-primary-100 text-primary-800 rounded-lg text-sm font-medium">
                  📚 {book.category.name}
                </div>
              )}
            </div>

            {/* Price */}
            <div className="bg-primary-50 p-6 rounded-2xl">
              <div className="text-3xl font-bold text-primary-700 mb-2">
                {formatCurrency(book.price)}
              </div>
              <p className="text-primary-600">
                Price includes shipping within Belgium
              </p>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-3">
                Description
              </h3>
              <p className="text-neutral-600 leading-relaxed whitespace-pre-line">
                {book.description}
              </p>
            </div>

            {/* Book Details */}
            <Card>
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">
                Book Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-neutral-500">Listed:</span>
                  <span className="ml-2 text-neutral-900">
                    {formatDate(book.created_at)}
                  </span>
                </div>
                <div>
                  <span className="text-neutral-500">Category:</span>
                  <span className="ml-2 text-neutral-900">
                    {book.category?.name || 'Uncategorized'}
                  </span>
                </div>
                <div>
                  <span className="text-neutral-500">Condition:</span>
                  <span className="ml-2 text-neutral-900">
                    {book.condition || 'Good'}
                  </span>
                </div>
                <div>
                  <span className="text-neutral-500">Status:</span>
                  <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${statusColors[book.status]}`}>
                    {book.status.charAt(0).toUpperCase() + book.status.slice(1)}
                  </span>
                </div>
              </div>
            </Card>

            {/* Seller Info */}
            {book.owner && (
              <Card>
                <h3 className="text-lg font-semibold text-neutral-900 mb-4">
                  Seller Information
                </h3>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-primary-600 font-semibold">
                      {book.owner.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-neutral-900">
                      {book.owner.name}
                    </p>
                    <p className="text-sm text-neutral-500">
                      Member since {formatDate(book.owner.created_at)}
                    </p>
                  </div>
                </div>
              </Card>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              {isAvailable ? (
                <>
                  <Button 
                    size="lg" 
                    className="w-full"
                    onClick={handleBuyNow}
                    loading={buyingNow}
                  >
                    🛒 Buy Now - {formatCurrency(book.price)}
                  </Button>
                  <Button variant="secondary" size="lg" className="w-full">
                    💬 Contact Seller
                  </Button>
                </>
              ) : (
                <Button variant="secondary" size="lg" className="w-full" disabled>
                  {book.status === 'sold' ? '✅ Sold' : '⏳ Reserved'}
                </Button>
              )}
              
              <Button variant="ghost" size="lg" className="w-full">
                ❤️ Add to Wishlist
              </Button>
            </div>

            {/* Checkout Section */}
            {showCheckout && isAvailable && (
              <Card className="border-primary-200 bg-primary-50">
                <h3 className="text-lg font-semibold text-primary-900 mb-4">
                  🛒 Ready to Purchase
                </h3>
                <div className="space-y-4">
                  <div className="bg-white rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">{book.title}</span>
                      <span className="font-bold text-primary-600">
                        {formatCurrency(book.price)}
                      </span>
                    </div>
                    <p className="text-sm text-neutral-600">
                      by {book.author} • {book.condition} condition
                    </p>
                  </div>
                  
                  <div className="flex space-x-3">
                    <Button 
                      className="flex-1"
                      onClick={() => {
                        // Here would go actual Stripe checkout
                        alert(`Purchase initiated for ${book.title}!\n\nIn a real app, this would open Stripe checkout for ${formatCurrency(book.price)}`);
                      }}
                    >
                      💳 Pay with Card
                    </Button>
                    <Button 
                      variant="secondary"
                      onClick={() => setShowCheckout(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                  
                  <p className="text-xs text-primary-700">
                    💳 Secure payment with Stripe • 🛡️ Buyer protection included
                  </p>
                </div>
              </Card>
            )}

            {/* Safety Notice */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <h4 className="font-medium text-yellow-800 mb-2">
                🛡️ Safety Notice
              </h4>
              <p className="text-sm text-yellow-700">
                Always meet in public places. Inspect the book before payment. 
                BookSwap provides buyer protection for online payments.
              </p>
            </div>
          </div>
        </div>

        {/* Related Books */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-neutral-900 mb-8">
            More Books Like This
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Placeholder for related books */}
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-neutral-200 aspect-[3/4] rounded-2xl mb-4"></div>
                <div className="h-4 bg-neutral-200 rounded mb-2"></div>
                <div className="h-3 bg-neutral-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookDetailPage; 