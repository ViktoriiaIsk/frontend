'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

import Navigation from '@/components/layout/Navigation';
import BookCard from '@/components/books/BookCard';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { useBooks, useCategories } from '@/hooks/useBooks';
import { BookFilters } from '@/types';
import { cn } from '@/utils';

// Debounce hook for search input
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

/**
 * Books listing page with filters and search
 */
const BooksPage: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Search input state (for immediate UI feedback)
  const [searchInput, setSearchInput] = useState(
    searchParams?.get('search') || ''
  );
  
  // Debounced search value (for API calls)
  const debouncedSearch = useDebounce(searchInput, 300);
  
  const [currentFilters, setCurrentFilters] = useState<BookFilters>({
    search: searchParams?.get('search') || '',
    category_id: searchParams?.get('category') ? parseInt(searchParams.get('category')!) : undefined,
    page: searchParams?.get('page') ? parseInt(searchParams.get('page')!) : 1,
    per_page: 12,
    min_price: searchParams?.get('min_price') ? parseInt(searchParams.get('min_price')!) : undefined,
    max_price: searchParams?.get('max_price') ? parseInt(searchParams.get('max_price')!) : undefined,
  });

  // Update filters when debounced search changes
  useEffect(() => {
    if (debouncedSearch !== currentFilters.search) {
      handleFilterChange({ search: debouncedSearch });
    }
  }, [debouncedSearch]);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    
    if (currentFilters.search) params.set('search', currentFilters.search);
    if (currentFilters.category_id) params.set('category', currentFilters.category_id.toString());
    if (currentFilters.page && currentFilters.page > 1) params.set('page', currentFilters.page.toString());
    if (currentFilters.min_price) params.set('min_price', currentFilters.min_price.toString());
    if (currentFilters.max_price) params.set('max_price', currentFilters.max_price.toString());
    
    const newUrl = params.toString() ? `${window.location.pathname}?${params.toString()}` : window.location.pathname;
    router.replace(newUrl, { scroll: false });
  }, [currentFilters, router]);

  // Fetch books with current filters
  const { data: booksResponse, isLoading: isBooksLoading, error: booksError } = useBooks(currentFilters);
  
  // Fetch categories for filter dropdown
  const { data: categoriesResponse, isLoading: isCategoriesLoading } = useCategories();

  // Handle filter changes
  const handleFilterChange = useCallback((newFilters: Partial<BookFilters>) => {
    setCurrentFilters(prev => ({
      ...prev,
      ...newFilters,
      page: newFilters.page || 1, // Reset to first page when filters change (except for pagination)
    }));
  }, []);

  // Handle search input change
  const handleSearchInputChange = (search: string) => {
    setSearchInput(search);
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    setCurrentFilters(prev => ({ ...prev, page }));
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Clear all filters
  const clearAllFilters = () => {
    setSearchInput('');
    setCurrentFilters({
      page: 1,
      per_page: 12,
    });
  };

  // Check if any filters are active
  const hasActiveFilters = !!(
    currentFilters.search ||
    currentFilters.category_id ||
    currentFilters.min_price ||
    currentFilters.max_price
  );

  // Mobile filter toggle
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  return (
    <div className="min-h-screen bg-accent-cream">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">
            Browse Books
          </h1>
          <p className="text-lg text-neutral-600">
            Find your next great read from our collection
          </p>
        </div>

        {/* Filters Section */}
        <Card className="mb-6">
          {/* Mobile Filter Toggle */}
          <div className="md:hidden mb-4">
            <Button
              variant="secondary"
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="w-full flex items-center justify-between"
            >
              <span>Filters</span>
              <span className={`transform transition-transform ${showMobileFilters ? 'rotate-180' : ''}`}>
                ▼
              </span>
            </Button>
          </div>

          <div className={`${showMobileFilters ? 'block' : 'hidden'} md:block`}>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Search Books
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Type to search titles and authors..."
                    value={searchInput}
                    onChange={(e) => handleSearchInputChange(e.target.value)}
                    className="input pl-10 pr-10"
                  />
                  {searchInput && (
                    <button
                      onClick={() => handleSearchInputChange('')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                    >
                      ✕
                    </button>
                  )}
                </div>
                <p className="text-xs text-neutral-500 mt-1">
                  🔍 Live search: Results update as you type. Searches both book titles and author names simultaneously.
                  <br />
                  <span className="text-amber-600">⚠️ Search filtering happens on your device for better accuracy.</span>
                </p>
              </div>

              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Category
                </label>
                <select
                  value={currentFilters.category_id || ''}
                  onChange={(e) => handleFilterChange({ 
                    category_id: e.target.value ? parseInt(e.target.value) : undefined 
                  })}
                  className="input"
                  disabled={isCategoriesLoading}
                >
                  <option value="">All Categories</option>
                  {categoriesResponse && Array.isArray(categoriesResponse) ? 
                    categoriesResponse.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    )) : null
                  }
                </select>
              </div>

              {/* Price Range */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Price Range (EUR)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={currentFilters.min_price || ''}
                    onChange={(e) => handleFilterChange({ 
                      min_price: e.target.value ? parseInt(e.target.value) : undefined 
                    })}
                    className="input text-sm"
                    min="0"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={currentFilters.max_price || ''}
                    onChange={(e) => handleFilterChange({ 
                      max_price: e.target.value ? parseInt(e.target.value) : undefined 
                    })}
                    className="input text-sm"
                    min="0"
                  />
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Active Filters & Clear Button */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 mb-6">
            <span className="text-sm font-medium text-neutral-600">Active filters:</span>
            
            {currentFilters.search && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                Search: "{currentFilters.search}"
                <button 
                  onClick={() => {
                    setSearchInput('');
                    handleFilterChange({ search: undefined });
                  }}
                  className="ml-2 text-primary-600 hover:text-primary-800"
                >
                  ✕
                </button>
              </span>
            )}
            
            {currentFilters.category_id && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-secondary-100 text-secondary-800">
                Category: {categoriesResponse && Array.isArray(categoriesResponse) ? 
                  categoriesResponse.find(c => c.id === currentFilters.category_id)?.name || 'Unknown'
                  : 'Unknown'
                }
                <button 
                  onClick={() => handleFilterChange({ category_id: undefined })}
                  className="ml-2 text-secondary-600 hover:text-secondary-800"
                >
                  ✕
                </button>
              </span>
            )}
            
            {(currentFilters.min_price || currentFilters.max_price) && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Price: {currentFilters.min_price || 0}€ - {currentFilters.max_price || '∞'}€
                <button 
                  onClick={() => handleFilterChange({ min_price: undefined, max_price: undefined })}
                  className="ml-2 text-green-600 hover:text-green-800"
                >
                  ✕
                </button>
              </span>
            )}
            
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={clearAllFilters}
              className="text-neutral-600 hover:text-neutral-800"
            >
              Clear All
            </Button>
          </div>
        )}

        {/* Results Section */}
        {booksError ? (
          <Card className="text-center py-12">
            <div className="text-red-500 text-lg mb-2">
              ❌ Error loading books
            </div>
            <p className="text-neutral-600">
              {booksError.message || 'Something went wrong. Please try again.'}
            </p>
            <Button onClick={() => window.location.reload()} className="mt-4">
              Try Again
            </Button>
          </Card>
        ) : isBooksLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-neutral-200 aspect-[3/4] rounded-2xl mb-4"></div>
                <div className="h-4 bg-neutral-200 rounded mb-2"></div>
                <div className="h-3 bg-neutral-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-neutral-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : booksResponse?.data?.length ? (
          <>
            {/* Results count */}
            <div className="flex justify-between items-center mb-6">
              <p className="text-neutral-600">
                Showing {booksResponse.data.length} of {booksResponse.total} books
                {hasActiveFilters && ' (filtered)'}
              </p>
              <p className="text-sm text-neutral-500">
                Page {booksResponse.current_page} of {booksResponse.last_page}
              </p>
            </div>

            {/* Books Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {booksResponse.data.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>

            {/* Pagination */}
            {booksResponse.last_page > 1 && (
              <div className="flex justify-center items-center space-x-2">
                <Button
                  variant="secondary"
                  disabled={booksResponse.current_page === 1}
                  onClick={() => handlePageChange(booksResponse.current_page - 1)}
                >
                  Previous
                </Button>
                
                {/* Page numbers */}
                {Array.from({ length: Math.min(5, booksResponse.last_page) }, (_, i) => {
                  const pageNum = Math.max(1, booksResponse.current_page - 2) + i;
                  if (pageNum > booksResponse.last_page) return null;
                  
                  return (
                    <Button
                      key={pageNum}
                      variant={pageNum === booksResponse.current_page ? 'primary' : 'secondary'}
                      onClick={() => handlePageChange(pageNum)}
                      className="w-10 h-10"
                    >
                      {pageNum}
                    </Button>
                  );
                })}
                
                <Button
                  variant="secondary"
                  disabled={booksResponse.current_page === booksResponse.last_page}
                  onClick={() => handlePageChange(booksResponse.current_page + 1)}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        ) : (
          <Card className="text-center py-12">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-xl font-semibold text-neutral-900 mb-2">
              No books found
            </h3>
            <p className="text-neutral-600 mb-6">
              {hasActiveFilters 
                ? 'Try adjusting your search criteria or clear filters to see all books.'
                : 'No books available yet. Check back later for new listings.'
              }
            </p>
            {hasActiveFilters ? (
              <Button onClick={clearAllFilters}>
                Clear Filters
              </Button>
            ) : (
              <Button onClick={() => router.push('/books/create')}>
                List First Book
              </Button>
            )}
          </Card>
        )}
      </div>
    </div>
  );
};

export default BooksPage; 