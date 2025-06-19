'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import BookCard from '@/components/books/BookCard';
import Button from '@/components/ui/Button';
import { AuthService } from '@/lib/services/auth';
import type { User } from '@/types';

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

import type { Book } from '@/types';

export default function BooksYouMayLike({ books }: { books: Book[] }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const randomBooks = shuffleArray(books);

  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const user = await AuthService.getCurrentUser();
        setCurrentUser(user);
      } catch {
        // User not authenticated, that's fine
        setCurrentUser(null);
      }
    };

    getCurrentUser();
  }, []);
  return (
    <section className="py-16 bg-green-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-green-900 mb-4">
            Books you may like (Second-hand)
          </h2>
          <p className="text-lg text-green-800 max-w-2xl mx-auto">
            Discover pre-loved books from our community. Every book here is looking for a new home — and helps the planet!
          </p>
        </div>
        {randomBooks.length ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {randomBooks.map((book) => (
                <BookCard 
                  key={book.id} 
                  book={book} 
                  currentUserId={currentUser?.id}
                />
              ))}
            </div>
            <div className="text-center">
              <Link href="/books">
                <Button size="lg" className="bg-green-600 text-white hover:bg-green-700">
                  View All Books
                </Button>
              </Link>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z"/>
            </svg>
          </div>
            <h3 className="text-xl font-semibold text-green-900 mb-2">
              No books available yet
            </h3>
            <p className="text-green-800 mb-6">
              Be the first to give a book a second life!
            </p>
            <Link href="/books/create">
              <Button className="bg-green-600 text-white hover:bg-green-700">
                Add First Book
              </Button>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
} 