'use client';

import { useEffect, useState, Suspense, useMemo, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { BooksService } from '@/lib/services/books';
import Navigation from '@/components/layout/Navigation';
import Footer from '@/components/layout/Footer';
import BooksList from '@/components/books/BooksList';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Link from 'next/link';
import { Book, Category, BookFilters } from '@/types';
import BookCard from '@/components/books/BookCard';

// Safe parsing functions
function safeParseInt(value: string | null): number | undefined {
  if (!value || value.trim() === '') return undefined;
  const parsed = parseInt(value);
  return isNaN(parsed) || parsed <= 0 ? undefined : parsed;
}

function safeParseFloat(value: string | null): number | undefined {
  if (!value || value.trim() === '') return undefined;
  const parsed = parseFloat(value);
  return isNaN(parsed) || parsed <= 0 ? undefined : parsed;
}

function BooksContent() {
  const searchParams = useSearchParams();
  
  const [books, setBooks] = useState<Book[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Parse filters from URL - memoized to prevent re-renders
  const filters = useMemo(() => {
    const categoryParam = searchParams?.get('category_id') || searchParams?.get('category'); // Support both for backward compatibility
    const pageParam = searchParams?.get('page');
    const minPriceParam = searchParams?.get('min_price');
    const maxPriceParam = searchParams?.get('max_price');
    
    const parsedFilters = {
      search: searchParams?.get('search') || '',
      category_id: safeParseInt(categoryParam || null),
      page: pageParam ? parseInt(pageParam) : 1,
      per_page: 12,
      min_price: safeParseFloat(minPriceParam || null),
      max_price: safeParseFloat(maxPriceParam || null),
    };
    
    return parsedFilters;
  }, [searchParams]);

  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Load data on mount and when search params change
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
                const [categoriesData, booksResponse] = await Promise.all([
          BooksService.getCategories(),
          BooksService.getBooks({ ...filters, per_page: 100, page: 1 }) // Load all books at once
        ]);
        
        setCategories(categoriesData);
        setBooks(booksResponse.data);
        setPagination(booksResponse);

        // Scroll to top when new books are loaded
        window.scrollTo(0, 0);

        // No pagination - load all books at once
        
      } catch (err) {
        setError('Failed to load books. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filters]);

      // No infinite scroll - all books loaded at once

  // No scroll effect needed - all books loaded at once

  // Show loading while fetching data
  if (loading) {
    return (
      <div className="min-h-screen bg-accent-cream">
        <Navigation />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading books...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-accent-cream">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-neutral-900 mb-2">Error Loading Books</h3>
            <p className="text-neutral-600 mb-6">{error}</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-accent-cream">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">Browse Books</h1>
          <p className="text-lg text-neutral-600">Find your next great read from our collection</p>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <form method="GET" className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Search Books</label>
              <input
                type="text"
                name="search"
                defaultValue={filters.search}
                placeholder="Type to search titles and authors..."
                className="input pr-10"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Category</label>
              <select
                name="category_id"
                defaultValue={filters.category_id || ''}
                className="input"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Price Range (EUR)</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  name="min_price"
                  placeholder="Min"
                  defaultValue={filters.min_price || ''}
                  className="input text-sm"
                  min="0"
                />
                <input
                  type="number"
                  name="max_price"
                  placeholder="Max"
                  defaultValue={filters.max_price || ''}
                  className="input text-sm"
                  min="0"
                />
              </div>
            </div>
            <div className="flex items-end">
              <Button type="submit" className="w-full">Apply Filters</Button>
            </div>
          </form>
        </Card>

        {/* Books List */}
        {books.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {books.map((book, index) => (
                <BookCard key={`${book.id}-${index}`} book={book} />
              ))}
            </div>
            
            {/* End of results indicator */}
            <div className="text-center py-8">
              <p className="text-gray-600">All available books displayed</p>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z"/>
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No books found
            </h3>
            <p className="text-gray-600 mb-6">
              Try adjusting your search or browse all available books.
            </p>
            <Link href="/books/create">
              <Button className="bg-green-600 text-white hover:bg-green-700">
                Add a Book
              </Button>
            </Link>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}

function BooksPageFallback() {
  return (
    <div className="min-h-screen bg-accent-cream">
      <Navigation />
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading books...</p>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default function BooksPage() {
  return (
    <Suspense fallback={<BooksPageFallback />}>
      <BooksContent />
    </Suspense>
  );
} 