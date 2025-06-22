'use client';

import { useEffect, useState } from 'react';
import HeroSection from '@/components/HeroSection';
import FeaturedCategories from '@/components/FeaturedCategories';
import EcoSection from '@/components/EcoSection';
import BooksYouMayLike from '@/components/BooksYouMayLike';
import Footer from '@/components/layout/Footer';
import { BooksService } from '@/lib/services/books';
import { Book, Category } from '@/types';

/**
 * Home page component with hero section and features
 */
export default function HomePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Get data in parallel for better performance
        const [categoriesData, booksResponse] = await Promise.all([
          BooksService.getCategories(),
          BooksService.getBooks({ per_page: 50 }) // Get more books for better randomization
        ]);
        
        setCategories(categoriesData);
        setBooks(booksResponse.data);
      } catch (err) {
        // Silently handle error
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <>
        <HeroSection />
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
        <EcoSection />
        <Footer />
      </>
    );
  }

  return (
    <>
      <HeroSection />
      {categories.length > 0 && <FeaturedCategories categories={categories} />}
      <EcoSection />
      {books.length > 0 && <BooksYouMayLike books={books} />}
      <Footer />
    </>
  );
}
