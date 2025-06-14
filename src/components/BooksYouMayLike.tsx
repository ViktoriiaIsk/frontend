import Link from 'next/link';
import BookCard from '@/components/books/BookCard';
import Button from '@/components/ui/Button';

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
  const randomBooks = shuffleArray(books);
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
                <BookCard key={book.id} book={book} />
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
            <div className="text-6xl mb-4">📚</div>
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