'use client';

import React from 'react';
import Link from 'next/link';

import Navigation from '@/components/layout/Navigation';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import BookCard from '@/components/books/BookCard';
import { useBooks } from '@/hooks/useBooks';

/**
 * Home page component with hero section and features
 */
function HomePage() {
  // Fetch latest books for display
  const { data: booksResponse, isLoading: isBooksLoading } = useBooks({
    per_page: 8,
    sort_by: 'newest'
  });
  // Featured categories for quick navigation
  const featuredCategories = [
    { name: 'Fiction', icon: '📖', color: 'bg-primary-100 text-primary-800' },
    { name: 'Science', icon: '🔬', color: 'bg-secondary-100 text-secondary-800' },
    { name: 'History', icon: '🏛️', color: 'bg-accent-sage/20 text-accent-forest' },
    { name: 'Children', icon: '🧸', color: 'bg-pink-100 text-pink-800' },
  ];

  // App features highlights
  const features = [
    {
      title: 'Buy Books Online',
      description: 'Browse and purchase books from verified sellers',
      icon: '🛒',
    },
    {
      title: 'Secure Payments',
      description: 'Safe transactions through Stripe with buyer protection',
      icon: '💳',
    },
    {
      title: 'Sell Your Books',
      description: 'List your books and earn money from your collection',
      icon: '💰',
    },
  ];

  return (
    <div className="min-h-screen bg-accent-cream">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 to-secondary-50 opacity-50" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
          <div className="text-center">
                         {/* Main headline */}
             <h1 className="text-4xl md:text-6xl font-bold text-neutral-900 mb-6">
               Books find new
               <span className="text-primary-600 block">readers</span>
             </h1>
             
             {/* Subtitle */}
             <p className="text-lg md:text-xl text-neutral-600 mb-8 max-w-2xl mx-auto">
               Online marketplace for buying and selling books. Find your next great read or sell your collection.
             </p>
            
                         {/* CTA Buttons */}
             <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
               <Link href="/books">
                 <Button size="lg" className="w-full sm:w-auto">
                   🔍 Browse Books
                 </Button>
               </Link>
               <Link href="/books/create">
                 <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                   💰 Sell Books
                 </Button>
               </Link>
             </div>
            
                         {/* Quick stats */}
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
                 <div className="text-sm text-neutral-600">Cities in Ukraine</div>
               </div>
             </div>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                     <h2 className="text-2xl md:text-3xl font-bold text-center text-neutral-900 mb-8">
             Popular Categories
           </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {featuredCategories.map((category, index) => (
              <Link key={index} href={`/books?category=${category.name}`}>
                <Card 
                  hover 
                  padding="md" 
                  className="text-center cursor-pointer h-full"
                >
                  <div className={`w-16 h-16 rounded-2xl ${category.color} flex items-center justify-center text-2xl mx-auto mb-3`}>
                    {category.icon}
                  </div>
                  <h3 className="font-medium text-neutral-900">{category.name}</h3>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-accent-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                     <h2 className="text-2xl md:text-3xl font-bold text-center text-neutral-900 mb-12">
             Why BookSwap?
           </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} padding="lg" className="text-center">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-neutral-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-neutral-600">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Latest Books Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-neutral-900 mb-4">
              Latest Books
            </h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              Discover newly added books from our community of sellers
            </p>
          </div>

          {isBooksLoading ? (
            // Loading skeleton
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-neutral-200 aspect-[3/4] rounded-2xl mb-4"></div>
                  <div className="h-4 bg-neutral-200 rounded mb-2"></div>
                  <div className="h-3 bg-neutral-200 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          ) : booksResponse?.data?.length ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {booksResponse.data.map((book) => (
                  <BookCard key={book.id} book={book} />
                ))}
              </div>
              
              {/* View All Button */}
              <div className="text-center">
                <Link href="/books">
                  <Button size="lg">
                    View All Books
                  </Button>
                </Link>
              </div>
            </>
          ) : (
            // Empty state
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📚</div>
              <h3 className="text-xl font-semibold text-neutral-900 mb-2">
                No books available yet
              </h3>
              <p className="text-neutral-600 mb-6">
                Be the first to add a book to our marketplace!
              </p>
              <Link href="/books/create">
                <Button>
                  Add First Book
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-eco text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Ready to join the community?
          </h2>
          <p className="text-lg mb-8 opacity-90">
            Create an account and start buying or selling books today
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/register">
              <Button 
                variant="secondary" 
                size="lg" 
                className="w-full sm:w-auto bg-white text-primary-700 hover:bg-neutral-50"
              >
                Sign Up
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button 
                variant="ghost" 
                size="lg" 
                className="w-full sm:w-auto text-white border border-white hover:bg-white hover:text-primary-700"
              >
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

/**
 * Main page component (providers are now in layout)
 */
export default function Page() {
  return <HomePage />;
}
