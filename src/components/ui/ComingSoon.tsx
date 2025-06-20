import React from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';

interface ComingSoonProps {
  title: string;
  description?: string;
  icon?: string;
  showBackButton?: boolean;
}

/**
 * Coming Soon placeholder component for pages under development
 */
const ComingSoon: React.FC<ComingSoonProps> = ({
  title,
  description = "This feature is currently under development. We're working hard to bring it to you soon!",
  icon = "🚧",
  showBackButton = true
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Icon */}
          <div className="text-6xl mb-6">{icon}</div>
          
          {/* Title */}
          <h1 className="text-2xl font-bold text-neutral-900 mb-4">
            {title}
          </h1>
          
          {/* Description */}
          <p className="text-neutral-600 mb-8 leading-relaxed">
            {description}
          </p>
          
          {/* Actions */}
          <div className="space-y-3">
            {showBackButton && (
              <Link href="/">
                <Button className="w-full">
                  🏠 Back to Home
                </Button>
              </Link>
            )}
            
            <Link href="/books">
              <Button variant="secondary" className="w-full">
                📚 Browse Books
              </Button>
            </Link>
          </div>
          
          {/* Contact Info */}
          <div className="mt-8 pt-6 border-t border-neutral-200">
            <p className="text-sm text-neutral-500">
              Have questions? Contact us at{' '}
              <a 
                href="mailto:support@bookswap.com" 
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                support@bookswap.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComingSoon; 