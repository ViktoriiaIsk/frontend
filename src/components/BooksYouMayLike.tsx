'use client';

import Link from 'next/link';
import { useEffect, useState, useMemo } from 'react';
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

  // Filter out books owned by current user and show only available books
  const booksForUser = books.filter(book => 
    book.owner_id !== currentUser?.id && book.status === 'available'
  );
  
  // Always show exactly 5 random books (randomize only when books change, not on every render)
  const randomBooks = useMemo(() => {
    // Remove duplicates by id first
    const uniqueBooks = booksForUser.filter((book, index, self) => 
      index === self.findIndex(b => b.id === book.id)
    );
    
    // Create a deterministic but random-looking shuffle based on book IDs
    // This ensures the same books will show the same order during the session
    // but different order on page refresh (when books array changes)
    const shuffled = shuffleArray([...uniqueBooks]);
    return shuffled.slice(0, 5);
  }, [booksForUser]); // Only re-shuffle when booksForUser changes

  // Don't show section if no books available for user
  if (randomBooks.length === 0) {
    return null;
  }

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
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          {randomBooks.map((book, index) => (
            <BookCard 
              key={`${book.id}-${index}`} 
              book={book} 
              currentUserId={currentUser?.id}
            />
          ))}
        </div>
        
        <div className="text-center">
          <Link href="/books">
            <Button size="lg" className="bg-green-600 text-white hover:bg-green-700">
              Browse More Books
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
} 