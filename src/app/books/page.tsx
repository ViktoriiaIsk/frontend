import { BooksService } from '@/lib/services/books';
import Navigation from '@/components/layout/Navigation';
import Footer from '@/components/layout/Footer';
import BookCard from '@/components/books/BookCard';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Link from 'next/link';

function buildQuery(params: Record<string, any>) {
  const q = Object.entries(params)
    .filter(([_, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&');
  return q ? `?${q}` : '';
}

// Next.js App Router: searchParams тепер асинхронні, треба await
export default async function BooksPage(props: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const searchParams = await props.searchParams;
  // SSR: отримуємо фільтри з URL
  const filters = {
    search: Array.isArray(searchParams?.search) ? searchParams.search[0] : (searchParams?.search || ''),
    category_id: searchParams?.category ? parseInt(Array.isArray(searchParams.category) ? searchParams.category[0] : searchParams.category) : undefined,
    page: searchParams?.page ? parseInt(Array.isArray(searchParams.page) ? searchParams.page[0] : searchParams.page) : 1,
    per_page: 12,
    min_price: searchParams?.min_price ? parseInt(Array.isArray(searchParams.min_price) ? searchParams.min_price[0] : searchParams.min_price) : undefined,
    max_price: searchParams?.max_price ? parseInt(Array.isArray(searchParams.max_price) ? searchParams.max_price[0] : searchParams.max_price) : undefined,
  };
  const booksResponse = await BooksService.getBooks(filters);
  const categories = await BooksService.getCategories();

  return (
    <div className="min-h-screen bg-accent-cream">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">Browse Books</h1>
          <p className="text-lg text-neutral-600">Find your next great read from our collection</p>
        </div>
        {/* SSR Filters */}
        <Card className="mb-6">
          <form method="GET" className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Search Books</label>
              <input
                type="text"
                name="search"
                defaultValue={filters.search}
                placeholder="Type to search titles and authors..."
                className="input pr-10"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Category</label>
              <select
                name="category"
                defaultValue={filters.category_id || ''}
                className="input"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Price Range (EUR)</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  name="min_price"
                  placeholder="Min"
                  defaultValue={filters.min_price || ''}
                  className="input text-sm"
                  min="0"
                />
                <input
                  type="number"
                  name="max_price"
                  placeholder="Max"
                  defaultValue={filters.max_price || ''}
                  className="input text-sm"
                  min="0"
                />
              </div>
            </div>
            <div className="flex items-end">
              <Button type="submit" className="w-full">Apply Filters</Button>
            </div>
          </form>
        </Card>
        {/* Books List */}
        {booksResponse.data.length ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {booksResponse.data.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-xl font-semibold text-neutral-900 mb-2">No books found</h3>
            <p className="text-neutral-600 mb-6">Try adjusting your filters or search query.</p>
            <Link href="/books/create">
              <Button>Add First Book</Button>
            </Link>
          </div>
        )}
        {/* Pagination */}
        <div className="flex justify-center gap-2 mt-8">
          {Array.from({ length: booksResponse.last_page }, (_, i) => i + 1).map((page) => (
            <Link
              key={page}
              href={buildQuery({ ...filters, page })}
              className={`px-4 py-2 rounded-lg border ${filters.page === page ? 'bg-primary-600 text-white' : 'bg-white text-primary-700'}`}
            >
              {page}
            </Link>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
} 