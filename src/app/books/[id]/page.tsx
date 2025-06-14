import { BooksService } from '@/lib/services/books';
import Navigation from '@/components/layout/Navigation';
import BookCard from '@/components/books/BookCard';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import FallbackImage from '@/components/ui/FallbackImage';
import Link from 'next/link';

// Next.js App Router: params тепер асинхронні, треба await
export default async function BookDetailPage({ params, searchParams }: { params: { id: string }, searchParams: Record<string, string> }) {
  // Обов'язково await params (Next.js 14+)
  const resolvedParams = await params;
  const bookId = parseInt(resolvedParams.id);
  const book = await BooksService.getBook(bookId);
  // TODO: reviews, category, owner, etc. if needed

  if (!book) {
    return (
      <div className="min-h-screen bg-accent-cream">
        <Navigation />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="text-center py-12">
            <div className="text-6xl mb-4">❌</div>
            <h1 className="text-2xl font-bold text-neutral-900 mb-2">Book Not Found</h1>
            <p className="text-neutral-600 mb-6">The book you're looking for doesn't exist or has been removed.</p>
            <Link href="/books">
              <Button>Browse All Books</Button>
            </Link>
          </Card>
        </div>
      </div>
    );
  }

  // Backend now returns ready-to-use image URLs with proper CORS headers
  const primaryImage = book.first_image || book.images?.[0]?.image_url || '/images/placeholder-book.svg';
  const isAvailable = book.status === 'available';
  const statusColors = {
    available: 'bg-green-100 text-green-800',
    reserved: 'bg-yellow-100 text-yellow-800',
    sold: 'bg-red-100 text-red-800',
  };

  return (
    <div className="min-h-screen bg-accent-cream">
      <Navigation />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link href="/books">
            <Button variant="ghost">← Back to Books</Button>
          </Link>
        </div>
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Book Images */}
          <div className="space-y-4">
            <div className="relative aspect-[3/4] w-full">
              <FallbackImage
                src={primaryImage}
                alt={book.title}
                className="object-cover rounded-2xl absolute inset-0"
              />
              <div className={`absolute top-4 left-4 px-3 py-1 rounded-lg text-sm font-medium ${statusColors[book.status]}`}>
                {book.status.charAt(0).toUpperCase() + book.status.slice(1)}
              </div>
            </div>
            {book.images && book.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {book.images.slice(1, 5).map((image, index) => (
                  <div key={index} className="relative aspect-square">
                    <FallbackImage
                      src={image.image_url || '/images/placeholder-book.svg'}
                      alt={`${book.title} - Image ${index + 2}`}
                      className="object-cover rounded-lg absolute inset-0"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
          {/* Book Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-2">{book.title}</h1>
              <p className="text-xl text-neutral-600 mb-4">by {book.author}</p>
              {book.category && (
                <div className="inline-flex items-center px-3 py-1 bg-primary-100 text-primary-800 rounded-lg text-sm font-medium">
                  📚 {book.category.name}
                </div>
              )}
            </div>
            <div className="bg-primary-50 p-6 rounded-2xl">
              <div className="text-3xl font-bold text-primary-700 mb-2">€{book.price}</div>
              <p className="text-primary-600">Price includes shipping within Belgium</p>
            </div>
            <div>
              <span className="font-medium text-neutral-700">Condition:</span> {book.condition}
            </div>
            <div>
              <span className="font-medium text-neutral-700">Description:</span>
              <div className="text-neutral-800 mt-1 whitespace-pre-line">{book.description}</div>
            </div>
            {/* Book actions (Buy, Sold, etc.) — можна винести у окремий клієнтський компонент */}
            <div>
              {isAvailable ? (
                <Button className="w-full bg-green-600 text-white hover:bg-green-700">Buy Now</Button>
              ) : (
                <Button className="w-full" disabled>Not Available</Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 