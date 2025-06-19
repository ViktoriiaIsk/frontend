'use client';

import { useEffect, useState } from 'react';
import BookCard from '@/components/books/BookCard';
import { AuthService } from '@/lib/services/auth';
import type { Book, User } from '@/types';

interface BooksListProps {
  books: Book[];
}

export default function BooksList({ books }: BooksListProps) {
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

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {books.map((book) => (
        <BookCard 
          key={book.id} 
          book={book} 
          currentUserId={currentUser?.id}
        />
      ))}
    </div>
  );
} 