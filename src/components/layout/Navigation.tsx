'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/utils';
import Button from '@/components/ui/Button';
import { useAuthStore } from '@/store/authStore';

/**
 * Main navigation component with authentication integration
 */
const Navigation: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  
  // Auth state from Zustand store
  const { 
    user, 
    isAuthenticated, 
    isLoading, 
    logout, 
    checkAuth 
  } = useAuthStore();

  // Check authentication status on mount with a small delay to avoid race conditions
  useEffect(() => {
    const timer = setTimeout(() => {
      checkAuth();
    }, 100);
    
    return () => clearTimeout(timer);
  }, [checkAuth]);

  // Public navigation items (always visible)
  const publicNavItems = [
    { href: '/', label: 'Home' },
    { href: '/books', label: 'Books' },
  ];

  // Authenticated user navigation items
  const authNavItems = [
    { href: '/books/create', label: 'Sell Book' },
    { href: '/profile', label: 'Profile' },
  ];

  // Combine navigation items based on auth status
  const navItems = [
    ...publicNavItems,
    ...(isAuthenticated ? authNavItems : []),
  ];

  /**
   * Check if the current path matches the nav item
   */
  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  /**
   * Toggle mobile menu visibility
   */
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  /**
   * Close mobile menu when item is clicked
   */
  const handleMenuItemClick = () => {
    setIsMenuOpen(false);
  };

  /**
   * Handle logout functionality
   */
  const handleLogout = () => {
    logout();
    router.push('/');
    setIsMenuOpen(false);
  };

  /**
   * Handle login navigation
   */
  const handleLogin = () => {
    router.push('/auth/login');
    setIsMenuOpen(false);
  };

  return (
    <nav className="bg-white border-b border-neutral-200 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link 
            href="/" 
            className="flex items-center space-x-2 font-bold text-xl text-primary-700"
          >
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z"/>
              </svg>
            </div>
            <span>BookSwap</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {/* Navigation Links */}
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'px-4 py-2 rounded-xl font-medium transition-all duration-200',
                  'hover:bg-primary-50 hover:text-primary-700',
                  isActive(item.href)
                    ? 'bg-primary-100 text-primary-800'
                    : 'text-neutral-600 hover:text-primary-700'
                )}
              >
                {item.label}
              </Link>
            ))}

            {/* Authentication Buttons */}
            <div className="ml-4 pl-4 border-l border-neutral-200">
              {isLoading ? (
                <div className="w-8 h-8 animate-spin rounded-full border-2 border-primary-600 border-t-transparent"></div>
              ) : isAuthenticated ? (
                <div className="flex items-center space-x-3">
                  {/* User Info */}
                  <div className="flex items-center space-x-2 text-sm text-neutral-600">
                    <span className="hidden lg:inline">Hi,</span>
                    <span className="font-medium text-primary-700">
                      {user?.name || user?.email}
                    </span>
                  </div>
                  
                  {/* Logout Button */}
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleLogout}
                    className="text-neutral-600 hover:text-red-600 hover:border-red-200"
                  >
                    Logout
                  </Button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogin}
                    className="text-neutral-600 hover:text-primary-700"
                  >
                    Sign In
                  </Button>
                  <Link href="/auth/register">
                    <Button
                      variant="primary"
                      size="sm"
                    >
                      Sign Up
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMenu}
              className="p-2"
              aria-label="Toggle menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </Button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="md:hidden pb-4 pt-2 border-t border-neutral-100 mt-2">
            <div className="flex flex-col space-y-1">
              {/* Navigation Links */}
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={handleMenuItemClick}
                  className={cn(
                    'flex items-center px-4 py-3 rounded-xl font-medium transition-all duration-200',
                    'hover:bg-primary-50 hover:text-primary-700 mobile-touch-target',
                    isActive(item.href)
                      ? 'bg-primary-100 text-primary-800'
                      : 'text-neutral-600'
                  )}
                >
                  {item.label}
                </Link>
              ))}

              {/* Mobile Authentication Section */}
              <div className="pt-2 mt-2 border-t border-neutral-100">
                {isLoading ? (
                  <div className="flex justify-center py-4">
                    <div className="w-6 h-6 animate-spin rounded-full border-2 border-primary-600 border-t-transparent"></div>
                  </div>
                ) : isAuthenticated ? (
                  <>
                    {/* User Info */}
                    <div className="px-4 py-2 text-sm text-neutral-600">
                      <span className="font-medium text-primary-700">
                        {user?.name || user?.email}
                      </span>
                    </div>
                    
                    {/* Logout Button */}
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-3 rounded-xl font-medium transition-all duration-200 text-red-600 hover:bg-red-50 mobile-touch-target"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <div className="space-y-1">
                    <button
                      onClick={handleLogin}
                      className="w-full text-left px-4 py-3 rounded-xl font-medium transition-all duration-200 text-neutral-600 hover:bg-primary-50 hover:text-primary-700 mobile-touch-target"
                                          >
                        Sign In
                      </button>
                    <Link
                      href="/auth/register"
                      onClick={handleMenuItemClick}
                      className="flex items-center px-4 py-3 rounded-xl font-medium transition-all duration-200 text-primary-600 hover:bg-primary-50 hover:text-primary-700 mobile-touch-target"
                                          >
                        Sign Up
                      </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation; 