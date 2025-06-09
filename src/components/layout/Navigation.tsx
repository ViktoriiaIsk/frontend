'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/utils';
import Button from '@/components/ui/Button';

/**
 * Main navigation component with mobile-first responsive design
 */
const Navigation: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  // Navigation items configuration
  const navItems = [
    { href: '/', label: 'Home', icon: '🏠' },
    { href: '/books', label: 'Books', icon: '📚' },
    { href: '/books/create', label: 'Sell Book', icon: '💰' },
    { href: '/dashboard', label: 'Profile', icon: '👤' },
    // Show dev tools only in development
    ...(process.env.NODE_ENV === 'development' ? [
      { href: '/payment-test', label: 'Payment Test', icon: '💳' },
      { href: '/image-test', label: 'Image Test', icon: '🖼️' }
    ] : []),
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

  return (
    <nav className="bg-white border-b border-neutral-200 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link 
            href="/" 
            className="flex items-center space-x-2 font-bold text-xl text-primary-700"
          >
            <span className="text-2xl">📖</span>
            <span>BookSwap</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
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
                <span className="mr-2">{item.icon}</span>
                {item.label}
              </Link>
            ))}
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
                  <span className="mr-3 text-lg">{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation; 