import Link from 'next/link';

import Navigation from '@/components/layout/Navigation';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import BookCard from '@/components/books/BookCard';
import { useBooks } from '@/hooks/useBooks';
import { useCategories } from '@/hooks/useBooks';
import HeroSection from '@/components/HeroSection';
import FeaturedCategories from '@/components/FeaturedCategories';
import EcoSection from '@/components/EcoSection';
import BooksYouMayLike from '@/components/BooksYouMayLike';
import Footer from '@/components/layout/Footer';
import { BooksService } from '@/lib/services/books';

// Add caching for better performance
export const revalidate = 300; // Revalidate every 5 minutes

/**
 * Home page component with hero section and features
 */
export default async function HomePage() {
  try {
    // Get data on the server in parallel for better performance
    const [categories, booksResponse] = await Promise.all([
      BooksService.getCategories(),
      BooksService.getBooks({ per_page: 8 })
    ]);
    const books = booksResponse.data;

  return (
      <>
        <HeroSection />
        <FeaturedCategories categories={categories} />
        <EcoSection />
        <BooksYouMayLike books={books} />
        <Footer />
      </>
    );
  } catch (error) {
    console.error('Error loading home page:', error);
    // Fallback UI in case of API errors
    return (
      <>
        <HeroSection />
        <EcoSection />
        <Footer />
      </>
  );
}
}
