'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { BooksService } from '@/lib/services/books';
import Navigation from '@/components/layout/Navigation';
import Footer from '@/components/layout/Footer';
import BooksList from '@/components/books/BooksList';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Link from 'next/link';
import { Book, Category } from '@/types';

function buildQuery(params: Record<string, any>) {
  const q = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&');
  return q ? `?${q}` : '';
}

function BooksContent() {
  const searchParams = useSearchParams();
  
  const [books, setBooks] = useState<Book[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Parse filters from URL
  const filters = {
    search: searchParams?.get('search') || '',
    category_id: searchParams?.get('category') ? parseInt(searchParams.get('category')!) : undefined,
    page: searchParams?.get('page') ? parseInt(searchParams.get('page')!) : 1,
    per_page: 12,
    min_price: searchParams?.get('min_price') ? parseInt(searchParams.get('min_price')!) : undefined,
    max_price: searchParams?.get('max_price') ? parseInt(searchParams.get('max_price')!) : undefined,
  };

  // Load data on mount and when search params change
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [booksResponse, categoriesData] = await Promise.all([
          BooksService.getBooks(filters),
          BooksService.getCategories()
        ]);
        
        setBooks(booksResponse.data);
        setPagination({
          current_page: booksResponse.current_page,
          last_page: booksResponse.last_page,
          total: booksResponse.total
        });
        setCategories(categoriesData);
        
      } catch (err) {
        console.error('Error loading books:', err);
        setError(err instanceof Error ? err.message : 'Failed to load books');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [searchParams, filters]);

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
            <div className="text-6xl mb-4">❌</div>
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
                name="category"
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
        {books.length ? (
          <BooksList books={books} />
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-xl font-semibold text-neutral-900 mb-2">No books found</h3>
            <p className="text-neutral-600 mb-6">Try adjusting your filters or search query.</p>
            <Link href="/books/create">
              <Button>Add First Book</Button>
            </Link>
          </div>
        )}
        {/* Pagination */}
        {pagination && pagination.last_page > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            {Array.from({ length: pagination.last_page }, (_, i) => i + 1).map((page) => (
              <Link
                key={page}
                href={buildQuery({ ...filters, page })}
                className={`px-4 py-2 rounded-lg border ${filters.page === page ? 'bg-primary-600 text-white' : 'bg-white text-primary-700'}`}
              >
                {page}
              </Link>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}

// Loading fallback component
function BooksPageFallback() {
  return (
    <div className="min-h-screen bg-accent-cream">
      <Navigation />
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
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