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
import { BooksService } from '@/lib/services/books';

/**
 * Home page component with hero section and features
 */
export default async function HomePage() {
  // Get data on the server
  const categories = await BooksService.getCategories();
  const booksResponse = await BooksService.getBooks({ per_page: 8 });
  const books = booksResponse.data;

  return (
    <>
      <HeroSection />
      <FeaturedCategories categories={categories} />
      <EcoSection />
      <BooksYouMayLike books={books} />
    </>
  );
}
