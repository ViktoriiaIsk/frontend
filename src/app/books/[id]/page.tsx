'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BooksService } from '@/lib/services/books';
import { AuthService } from '@/lib/services/auth';
import Navigation from '@/components/layout/Navigation';
import Footer from '@/components/layout/Footer';
import BookCard from '@/components/books/BookCard';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import FallbackImage from '@/components/ui/FallbackImage';
import Link from 'next/link';
import type { Book, User } from '@/types';

// Client component to handle user authentication and book ownership
export default function BookDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [book, setBook] = useState<Book | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

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
          console.error('Auth error:', error);
          setCurrentUser(null);
        }
      } catch (err: unknown) {
        console.error('Error fetching book:', err);
        
        // Retry up to 3 times with increasing delays for newly created books
        if (retryCount < 3) {
          console.log(`Retrying book fetch (attempt ${retryCount + 1}/3)...`);
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
            <div className="text-6xl mb-4">❌</div>
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
  const isOwner = currentUser && book.owner_id === currentUser.id;
  
  // Backend now returns ready-to-use image URLs with proper CORS headers
  const primaryImage = book.first_image || book.images?.[0]?.image_url || '/images/placeholder-book.svg';
  const isAvailable = book.status === 'available';
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
                src={primaryImage}
                alt={book.title}
                className="object-cover rounded-2xl absolute inset-0"
              />
              <div className={`absolute top-4 left-4 px-3 py-1 rounded-lg text-sm font-medium ${statusColors[book.status] || 'bg-gray-100 text-gray-800'}`}>
                {book.status ? book.status.charAt(0).toUpperCase() + book.status.slice(1) : 'Unknown'}
              </div>
            </div>
            {book.images && book.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {book.images.slice(1, 5).map((image, index) => (
                  <div key={index} className="relative aspect-square">
                    <FallbackImage
                      src={image.image_url || '/images/placeholder-book.svg'}
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
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-2">{book.title}</h1>
              <p className="text-xl text-neutral-600 mb-4">by {book.author}</p>
              {book.category && (
                <div className="inline-flex items-center px-3 py-1 bg-primary-100 text-primary-800 rounded-lg text-sm font-medium">
                  📚 {book.category.name}
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
                      variant="secondary" 
                      className="flex-1"
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this book?')) {
                          // TODO: Implement delete functionality
                          alert('Delete functionality coming soon');
                        }
                      }}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  {isAvailable ? (
                    <Button className="w-full bg-green-600 text-white hover:bg-green-700">
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
      <Footer />
    </div>
  );
} 