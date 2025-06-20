'use client';
import { useEffect, useState } from 'react';
import { AuthService } from '@/lib/services/auth';
import { LocalOrdersService } from '@/lib/services/localOrders';
import { useUserBooks } from '@/hooks/useBooks';
import { useAuthStore } from '@/store/authStore';
import type { User } from '@/types';
import Navigation from '@/components/layout/Navigation';
import Footer from '@/components/layout/Footer';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import OrderList from '@/components/orders/OrderList';
import Link from 'next/link';

// Helper to format date in readable way
function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default function ProfilePage() {
  // Auth store
  const { user: storeUser, isAuthenticated, isLoading: authLoading } = useAuthStore();
  
  // State for user and loading
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);
  
  // Use secure hook for user books
  const { data: userBooks = [], isLoading: booksLoading, error: booksError } = useUserBooks();
  
  // State for local orders count (client-side only)
  const [localOrdersCount, setLocalOrdersCount] = useState<number>(0);
  const [isClient, setIsClient] = useState(false);

  // Set client flag and get local orders count after mount
  useEffect(() => {
    setIsClient(true);
    setLocalOrdersCount(LocalOrdersService.getLocalOrders().length);
  }, []);

  // Fetch user profile on mount
  useEffect(() => {
    const fetchData = async () => {
      if (!isAuthenticated || authLoading) {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      setProfileError(null);
      
      try {
        // Use store user if available, otherwise fetch
        if (storeUser) {
          setUser(storeUser);
        } else {
          const userData = await AuthService.getCurrentUser();
          setUser(userData);
        }
      } catch (e: unknown) {
        setProfileError(e instanceof Error ? e.message : 'Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [isAuthenticated, authLoading, storeUser]);

  // Update local orders count when needed
  const refreshLocalOrders = () => {
    if (isClient) {
      setLocalOrdersCount(LocalOrdersService.getLocalOrders().length);
    }
  };

  // Show auth required if not authenticated
  if (!authLoading && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-accent-cream">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="text-center p-8">
            <h1 className="text-2xl font-bold text-neutral-900 mb-4">Authentication Required</h1>
            <p className="text-neutral-600 mb-6">Please log in to view your profile.</p>
            <Link href="/auth/login">
              <Button>Log In</Button>
            </Link>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-accent-cream">
      <Navigation />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-neutral-900 mb-6">My Profile</h1>
        {/* Loading state */}
        {(loading || authLoading) && (
          <div className="mb-6 p-4 bg-primary-50 text-primary-700 rounded">Loading...</div>
        )}
        {/* Profile error (critical) */}
        {profileError && !loading && (
          <div className="mb-6 p-4 bg-red-100 text-red-700 rounded">{profileError}</div>
        )}
        {/* Profile Info */}
        {user && !loading && !profileError && (
          <Card className="mb-10 shadow-lg border-0 bg-white">
            <div className="flex items-center gap-6 p-6">
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center text-3xl font-bold text-green-700 shadow">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="text-xl font-semibold text-neutral-900 mb-1">{user.name}</div>
                <div className="text-neutral-600 mb-1">{user.email}</div>
                <div className="text-sm text-neutral-500">Member since {formatDate(user.created_at)}</div>
              </div>
            </div>
          </Card>
        )}
        {/* User Books */}
        <h2 className="text-2xl font-bold text-neutral-900 mb-4">My Books</h2>
        {booksLoading && (
          <div className="mb-4 p-3 bg-blue-100 text-blue-800 rounded">Loading your books...</div>
        )}
        {booksError && (
          <div className="mb-4 p-3 bg-yellow-100 text-yellow-800 rounded">
            {booksError instanceof Error ? booksError.message : 'Failed to load your books'}
          </div>
        )}
        {!booksError && !booksLoading && userBooks.length === 0 && (
          <div className="text-neutral-600 mb-8">You have not listed any books yet.</div>
        )}
        {userBooks.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            {userBooks
              .filter(book => {
                // Additional security check: ensure book belongs to current user
                // This is a failsafe in case the API returns incorrect data
                if (!user?.id || !book.owner_id) return true; // Show if we can't verify
                return String(book.owner_id) === String(user.id);
              })
              .map((book) => (
                <Card key={book.id} className="p-4">
                  <div className="font-semibold text-lg mb-2">{book.title}</div>
                  <div className="text-neutral-600 mb-1">by {book.author}</div>
                  <div className="text-sm text-neutral-500 mb-2">{book.status}</div>
                  <div className="text-xs text-neutral-400 mb-2">
                    €{book.price} • {book.condition}
                  </div>
                  <Link href={`/books/${book.id}`}>
                    <Button size="sm">View Details</Button>
                  </Link>
                </Card>
              ))}
          </div>
        )}
        {/* User Orders */}
        <div className="mb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-3 sm:space-y-0">
            <h2 className="text-xl sm:text-2xl font-bold text-neutral-900">My Orders</h2>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
              <span className="text-xs sm:text-sm text-gray-600">
                Local orders: {isClient ? localOrdersCount : '...'}
              </span>
              <div className="flex gap-2 w-full sm:w-auto">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    refreshLocalOrders();
                    window.location.reload();
                  }}
                  className="flex-1 sm:flex-none text-xs sm:text-sm"
                >
                  Refresh
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    if (confirm('Are you sure you want to clear all local orders? This cannot be undone.')) {
                      LocalOrdersService.clearLocalOrders();
                      refreshLocalOrders();
                      window.location.reload();
                    }
                  }}
                  className="flex-1 sm:flex-none bg-red-100 text-red-700 hover:bg-red-200 border-red-200 text-xs sm:text-sm"
                >
                  Clear My Orders
                </Button>
              </div>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 mt-2">
            Orders are temporarily stored locally while backend issues are resolved.
          </p>
        </div>
        <OrderList className="mb-10" />
      </div>
      <Footer />
    </div>
  );
} 