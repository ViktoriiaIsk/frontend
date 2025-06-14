import Link from 'next/link';
import Button from '@/components/ui/Button';
import Navigation from '@/components/layout/Navigation';

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      <Navigation />
      <div className="absolute inset-0 bg-gradient-to-br from-primary-50 to-secondary-50 opacity-50" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-neutral-900 mb-6">
            Give Books a <span className="text-primary-600">Second Life</span>
          </h1>
          <p className="text-xl text-neutral-700 mb-8 max-w-3xl mx-auto">
            Buy and sell pre-loved books in our sustainable marketplace. Every book deserves another reader, and every reader deserves great books at great prices.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/books">
              <Button size="lg" className="w-full sm:w-auto">
                Browse Books
              </Button>
            </Link>
            <Link href="/books/create">
              <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                Sell Your Books
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-primary-600">1000+</div>
              <div className="text-sm text-neutral-600">Books in catalog</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-primary-600">500+</div>
              <div className="text-sm text-neutral-600">Active users</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-primary-600">200+</div>
              <div className="text-sm text-neutral-600">Books sold</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-primary-600">50+</div>
              <div className="text-sm text-neutral-600">Happy customers</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 