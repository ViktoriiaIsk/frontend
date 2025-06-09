'use client';

import React from 'react';
import Link from 'next/link';

import Navigation from '@/components/layout/Navigation';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

/**
 * User dashboard page
 */
const DashboardPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-accent-cream">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">
            Dashboard
          </h1>
          <p className="text-lg text-neutral-600">
            Welcome back! Manage your books and orders here.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card hover padding="lg" className="text-center">
            <div className="text-4xl mb-4">📚</div>
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">
              My Books
            </h3>
            <p className="text-neutral-600 mb-4">
              View and manage your listed books
            </p>
            <Link href="/dashboard/books">
              <Button variant="secondary" size="sm" className="w-full">
                View Books
              </Button>
            </Link>
          </Card>

          <Card hover padding="lg" className="text-center">
            <div className="text-4xl mb-4">💰</div>
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">
              Sell Book
            </h3>
            <p className="text-neutral-600 mb-4">
              List a new book for sale
            </p>
            <Link href="/books/create">
              <Button size="sm" className="w-full">
                Add Book
              </Button>
            </Link>
          </Card>

          <Card hover padding="lg" className="text-center">
            <div className="text-4xl mb-4">📦</div>
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">
              Orders
            </h3>
            <p className="text-neutral-600 mb-4">
              Track your purchases and sales
            </p>
            <Link href="/dashboard/orders">
              <Button variant="secondary" size="sm" className="w-full">
                View Orders
              </Button>
            </Link>
          </Card>

          <Card hover padding="lg" className="text-center">
            <div className="text-4xl mb-4">👤</div>
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">
              Profile
            </h3>
            <p className="text-neutral-600 mb-4">
              Update your account settings
            </p>
            <Link href="/profile">
              <Button variant="secondary" size="sm" className="w-full">
                Edit Profile
              </Button>
            </Link>
          </Card>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-600 mb-2">5</div>
              <div className="text-sm text-neutral-600">Books Listed</div>
            </div>
          </Card>
          
          <Card>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">2</div>
              <div className="text-sm text-neutral-600">Books Sold</div>
            </div>
          </Card>
          
          <Card>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">₴450</div>
              <div className="text-sm text-neutral-600">Total Earnings</div>
            </div>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <Card.Header>
            <Card.Title>Recent Activity</Card.Title>
          </Card.Header>
          <Card.Content>
            <div className="space-y-4">
              <div className="flex items-center space-x-4 p-4 bg-neutral-50 rounded-xl">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 text-sm">✓</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-neutral-900">
                    Book "The Great Gatsby" was sold
                  </p>
                  <p className="text-xs text-neutral-500">2 hours ago</p>
                </div>
                <div className="text-sm font-medium text-green-600">+₴150</div>
              </div>

              <div className="flex items-center space-x-4 p-4 bg-neutral-50 rounded-xl">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 text-sm">📚</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-neutral-900">
                    New book "To Kill a Mockingbird" listed
                  </p>
                  <p className="text-xs text-neutral-500">1 day ago</p>
                </div>
              </div>

              <div className="flex items-center space-x-4 p-4 bg-neutral-50 rounded-xl">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                  <span className="text-orange-600 text-sm">🛒</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-neutral-900">
                    Purchased "1984" by George Orwell
                  </p>
                  <p className="text-xs text-neutral-500">3 days ago</p>
                </div>
                <div className="text-sm font-medium text-orange-600">-₴200</div>
              </div>
            </div>
          </Card.Content>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage; 