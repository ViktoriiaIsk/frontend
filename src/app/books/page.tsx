'use client';

import React, { useState } from 'react';
import { useSearchParams } from 'next/navigation';

import Navigation from '@/components/layout/Navigation';
import BookCard from '@/components/books/BookCard';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { useBooks, useCategories } from '@/hooks/useBooks';
import { BookFilters } from '@/types';
import { cn } from '@/utils';

/**
 * Books listing page with filters and search
 */
const BooksPage: React.FC = () => {
  const searchParams = useSearchParams();
  const [currentFilters, setCurrentFilters] = useState<BookFilters>({
    search: searchParams?.get('search') || '',
    category_id: searchParams?.get('category') ? parseInt(searchParams.get('category')!) : undefined,
    page: 1,
    per_page: 12,
    sort_by: 'newest',
  });

  // Fetch books with current filters
  const { data: booksResponse, isLoading: isBooksLoading, error: booksError } = useBooks(currentFilters);
  
  // Fetch categories for filter dropdown
  const { data: categoriesResponse, isLoading: isCategoriesLoading } = useCategories();

  // Handle filter changes
  const handleFilterChange = (newFilters: Partial<BookFilters>) => {
    setCurrentFilters(prev => ({
      ...prev,
      ...newFilters,
      page: 1, // Reset to first page when filters change
    }));
  };

  // Handle search
  const handleSearch = (search: string) => {
    handleFilterChange({ search });
  };

  // Handle sort change
  const handleSortChange = (sort_by: BookFilters['sort_by']) => {
    handleFilterChange({ sort_by });
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    setCurrentFilters(prev => ({ ...prev, page }));
  };

  // Sort options
  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'price_asc', label: 'Price: Low to High' },
    { value: 'price_desc', label: 'Price: High to Low' },
    { value: 'title_asc', label: 'Title: A-Z' },
    { value: 'title_desc', label: 'Title: Z-A' },
  ];

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
        <Card className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Search Books
              </label>
              <input
                type="text"
                placeholder="Search by title or author..."
                value={currentFilters.search || ''}
                onChange={(e) => handleSearch(e.target.value)}
                className="input"
              />
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
                {categoriesResponse?.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Sort By
              </label>
              <select
                value={currentFilters.sort_by || 'newest'}
                onChange={(e) => handleSortChange(e.target.value as BookFilters['sort_by'])}
                className="input"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
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
        </Card>

        {/* Results Section */}
        {booksError ? (
          <Card className="text-center py-12">
            <div className="text-red-500 text-lg mb-2">
              ❌ Error loading books
            </div>
            <p className="text-neutral-600">
              {booksError.message || 'Something went wrong. Please try again.'}
            </p>
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
              Try adjusting your search criteria or check back later for new listings.
            </p>
            <Button onClick={() => setCurrentFilters({ page: 1, per_page: 12, sort_by: 'newest' })}>
              Clear Filters
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
};

export default BooksPage; 