'use client';
import React, { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { BooksService } from '@/lib/services/books';
import { AuthService } from '@/lib/services/auth';
import { useDeleteBook, useCategories } from '@/hooks/useBooks';
import { extractErrorMessage, getBookImageUrlFromPath } from '@/utils';
import Navigation from '@/components/layout/Navigation';
import Footer from '@/components/layout/Footer';

import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import FallbackImage from '@/components/ui/FallbackImage';
import PaymentModal from '@/components/payment/PaymentModal';
import Link from 'next/link';
import type { Book, User } from '@/types';

// Client component to handle user authentication and book ownership
export default function BookDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [book, setBook] = useState<Book | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Delete book hook
  const { mutate: deleteBook, isPending: isDeleting } = useDeleteBook();
  
  // Categories hook
  const { data: categories } = useCategories();

  // Memoized values - must be before any conditional returns
  const allImages = useMemo(() => book?.images || [], [book?.images]);
  
  const currentImage = useMemo(() => {
    if (!book) return '/images/placeholder-book.svg';
    
    if (allImages[selectedImageIndex]?.url) {
      return getBookImageUrlFromPath(allImages[selectedImageIndex].url, book.id);
    }
    if (book.first_image) {
      return getBookImageUrlFromPath(book.first_image, book.id);
    }
    return '/images/placeholder-book.svg';
  }, [book, allImages, selectedImageIndex]);

  useEffect(() => {
    const fetchData = async (retryCount = 0) => {
      try {
        const resolvedParams = await params;
        const bookId = parseInt(resolvedParams.id);
        
        
        // Fetch book data with retry logic for newly created books
        const bookData = await BooksService.getBook(bookId);
        setBook(bookData);
        
        // Try to get current user (may fail if not authenticated)
        try {
          const userData = await AuthService.getCurrentUser();
          setCurrentUser(userData);
        } catch (error: unknown) {
          setCurrentUser(null);
        }
      } catch (err: unknown) {
        
        // Retry up to 3 times with increasing delays for newly created books
        if (retryCount < 3) {
          setTimeout(() => {
            fetchData(retryCount + 1);
          }, (retryCount + 1) * 1000); // 1s, 2s, 3s delays
          return;
        }
        
        setError(err instanceof Error ? err.message : 'Failed to load book');
        setLoading(false);
      }
      
      if (retryCount === 0) {
        setLoading(false);
      }
    };

    fetchData();
  }, [params]);

  // Handle keyboard navigation in modal
  useEffect(() => {
    if (!showImageModal || !book) return;

    const images = book.images || [];
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowImageModal(false);
      } else if (e.key === 'ArrowLeft' && images.length > 1) {
        setSelectedImageIndex(selectedImageIndex > 0 ? selectedImageIndex - 1 : images.length - 1);
      } else if (e.key === 'ArrowRight' && images.length > 1) {
        setSelectedImageIndex(selectedImageIndex < images.length - 1 ? selectedImageIndex + 1 : 0);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showImageModal, selectedImageIndex, book]);

  // Handle book purchase
  const handleBuyNow = () => {
    if (!book) return;
    
    if (!currentUser) {
      alert('Please log in to purchase books');
      return;
    }
    
    // Open payment modal
    setShowPaymentModal(true);
  };

  // Handle payment success
  const handlePaymentSuccess = () => {
    // Removed the alert notification - direct redirect to thank you page
    // The PaymentForm component will handle the redirect internally
  };

  // Handle payment error
  const handlePaymentError = (error: string) => {
    alert(`Payment failed: ${error}`);
  };

  // Handle book deletion
  const handleDelete = () => {
    if (!book) return;
    
    const confirmed = confirm(
      `Are you sure you want to delete "${book.title}"? This action cannot be undone.`
    );
    
    if (confirmed) {
      deleteBook(book.id, {
        onSuccess: () => {
          router.push('/books');
        },
        onError: (error: unknown) => {
          const errorMessage = extractErrorMessage(error);
          alert(`Failed to delete book: ${errorMessage}`);
        }
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-accent-cream">
        <Navigation />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-neutral-900 mb-2">Loading Book Details</h2>
            <p className="text-neutral-600">Please wait while we fetch the book information...</p>
          </Card>
        </div>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="min-h-screen bg-accent-cream">
        <Navigation />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="text-center py-12">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-neutral-900 mb-2">Book Not Found</h1>
            <p className="text-neutral-600 mb-6">{error || "The book you're looking for doesn't exist or has been removed."}</p>
            <div className="flex gap-4 justify-center">
              <Button 
                onClick={() => {
                  setError(null);
                  setLoading(true);
                  // Trigger refetch
                  const fetchData = async () => {
                    try {
                      const resolvedParams = await params;
                      const bookId = parseInt(resolvedParams.id);
                      const bookData = await BooksService.getBook(bookId);
                      setBook(bookData);
                    } catch (err: unknown) {
                      setError(err instanceof Error ? err.message : 'Failed to load book');
                    } finally {
                      setLoading(false);
                    }
                  };
                  fetchData();
                }}
                variant="secondary"
              >
                Try Again
              </Button>
            <Link href="/books">
              <Button>Browse All Books</Button>
            </Link>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // Check if current user is the owner of this book
  const isOwner = currentUser && book?.owner_id === currentUser.id;
  const isAvailable = book?.status === 'available';
  
  // Find category by ID
  const bookCategory = categories?.find(cat => cat.id === book.category_id);
  const statusColors = {
    available: 'bg-green-100 text-green-800',
    reserved: 'bg-yellow-100 text-yellow-800',
    sold: 'bg-red-100 text-red-800',
    pending: 'bg-blue-100 text-blue-800',
  };

  return (
    <div className="min-h-screen bg-accent-cream">
      <Navigation />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link href="/books">
            <Button variant="ghost">← Back to Books</Button>
          </Link>
        </div>
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Book Images */}
          <div className="space-y-4">
            <div className="relative aspect-[3/4] w-full">
              <FallbackImage
                src={currentImage}
                alt={book.title}
                className="object-cover rounded-2xl absolute inset-0 cursor-pointer hover:opacity-95 transition-opacity"
                onClick={() => setShowImageModal(true)}
              />
              <div className={`absolute top-4 left-4 px-3 py-1 rounded-lg text-sm font-medium ${statusColors[book.status] || 'bg-gray-100 text-gray-800'}`}>
                {book.status ? book.status.charAt(0).toUpperCase() + book.status.slice(1) : 'Unknown'}
              </div>
              {allImages.length > 1 && (
                <div className="absolute bottom-4 right-4 bg-black/50 text-white px-2 py-1 rounded text-sm">
                  {selectedImageIndex + 1} / {allImages.length}
                </div>
              )}
            </div>

            {/* Thumbnail Gallery */}
            {allImages.length > 1 && (
              <div className="grid grid-cols-5 gap-2">
                {allImages.map((image, index) => (
                  <div 
                    key={index} 
                    className={`relative aspect-square cursor-pointer rounded-lg overflow-hidden border-2 transition-all hover:opacity-80 ${
                      selectedImageIndex === index ? 'border-primary-500' : 'border-transparent'
                    }`}
                    onClick={() => setSelectedImageIndex(index)}
                  >
                    <FallbackImage
                      src={image.url ? getBookImageUrlFromPath(image.url, book.id) : '/images/placeholder-book.svg'}
                      alt={`${book.title} - Image ${index + 1}`}
                      className="object-cover absolute inset-0"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
          {/* Book Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-2">{book.title}</h1>
              <p className="text-xl text-neutral-600 mb-4">by {book.author}</p>
              {bookCategory && (
                <div className="mb-4">
                <div className="inline-flex items-center px-3 py-1 bg-primary-100 text-primary-800 rounded-lg text-sm font-medium">
                    {bookCategory.name}
                  </div>
                  {bookCategory.description && (
                    <p className="text-sm text-neutral-500 mt-2 italic">
                      {bookCategory.description}
                    </p>
                  )}
                </div>
              )}
            </div>
            <div className="bg-primary-50 p-6 rounded-2xl">
              <div className="text-3xl font-bold text-primary-700 mb-2">€{book.price}</div>
              <p className="text-primary-600">Price includes shipping within Belgium</p>
            </div>
            <div>
              <span className="font-medium text-neutral-700">Condition:</span> {book.condition || 'Not specified'}
            </div>
                <div>
              <span className="font-medium text-neutral-700">Description:</span>
              <div className="text-neutral-800 mt-1 whitespace-pre-line">{book.description}</div>
                </div>
            {/* Book actions - different for owner vs other users */}
                <div>
              {isOwner ? (
                <div className="space-y-3">
                  <p className="text-sm text-neutral-600">This is your book listing</p>
                  <div className="flex gap-3">
                    <Link href={`/books/${book.id}/edit`} className="flex-1">
                      <Button className="w-full bg-blue-600 text-white hover:bg-blue-700">
                        Edit Book
                      </Button>
                    </Link>
                    <Button 
                      variant="danger" 
                      className="flex-1"
                      onClick={handleDelete}
                      loading={isDeleting}
                      disabled={isDeleting}
                    >
                      {isDeleting ? 'Deleting...' : 'Delete'}
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  {isAvailable ? (
                    <Button 
                      className="w-full bg-green-600 text-white hover:bg-green-700"
                      onClick={handleBuyNow}
                    >
                      Buy Now
                    </Button>
                  ) : (
                    <Button className="w-full" disabled>
                      Not Available
                    </Button>
                  )}
                </>
            )}
            </div>
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {showImageModal && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setShowImageModal(false)}
        >
          <div className="relative w-full h-full max-w-6xl max-h-full flex items-center justify-center">
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute top-4 right-4 text-white hover:text-gray-300 text-3xl z-10 bg-black/50 w-12 h-12 rounded-full flex items-center justify-center"
            >
              ✕
            </button>
            
            <div className="relative w-full h-full flex items-center justify-center">
              <FallbackImage
                src={currentImage}
                alt={book.title}
                className="max-w-full max-h-full object-contain rounded-lg"
              />
              
              {/* Navigation arrows */}
              {allImages.length > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedImageIndex(selectedImageIndex > 0 ? selectedImageIndex - 1 : allImages.length - 1);
                    }}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/60 text-white p-3 rounded-full hover:bg-black/80 transition-colors text-xl z-10"
                  >
                    ←
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedImageIndex(selectedImageIndex < allImages.length - 1 ? selectedImageIndex + 1 : 0);
                    }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/60 text-white p-3 rounded-full hover:bg-black/80 transition-colors text-xl z-10"
                  >
                    →
                  </button>
                  
                  {/* Image counter */}
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/60 text-white px-4 py-2 rounded-lg text-base z-10">
                    {selectedImageIndex + 1} / {allImages.length}
                  </div>
                </>
              )}
              </div>
          </div>
        </div>
      )}

        {/* Payment Modal */}
        <PaymentModal
        isOpen={showPaymentModal}
        book={book}
        onClose={() => setShowPaymentModal(false)}
          onSuccess={handlePaymentSuccess}
          onError={handlePaymentError}
        />
      
      <Footer />
    </div>
  );
} 