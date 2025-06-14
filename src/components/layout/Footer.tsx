import Link from 'next/link';

/**
 * Footer component with company info, links, and eco message
 */
const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-neutral-900 text-neutral-300">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">📖</span>
              <span className="font-bold text-xl text-white">BookSwap</span>
            </div>
            <p className="text-sm text-neutral-400 leading-relaxed">
              Online marketplace for buying and selling second-hand books. 
              Give stories a new life and help the planet through sustainable reading.
            </p>
            <div className="flex space-x-4">
              <a 
                href="#" 
                className="text-neutral-400 hover:text-primary-400 transition-colors"
                aria-label="Facebook"
              >
                📘
              </a>
              <a 
                href="#" 
                className="text-neutral-400 hover:text-primary-400 transition-colors"
                aria-label="Twitter"
              >
                🐦
              </a>
              <a 
                href="#" 
                className="text-neutral-400 hover:text-primary-400 transition-colors"
                aria-label="Instagram"
              >
                📷
              </a>
              <a 
                href="#" 
                className="text-neutral-400 hover:text-primary-400 transition-colors"
                aria-label="LinkedIn"
              >
                💼
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-white">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/books" className="hover:text-primary-400 transition-colors">
                  Browse Books
                </Link>
              </li>
              <li>
                <Link href="/books/create" className="hover:text-primary-400 transition-colors">
                  Sell Your Books
                </Link>
              </li>
              <li>
                <Link href="/profile" className="hover:text-primary-400 transition-colors">
                  My Profile
                </Link>
              </li>
              <li>
                <Link href="/auth/register" className="hover:text-primary-400 transition-colors">
                  Join BookSwap
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div className="space-y-4">
            <h3 className="font-semibold text-white">Popular Categories</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/books?category=fiction" className="hover:text-primary-400 transition-colors">
                  📚 Fiction
                </Link>
              </li>
              <li>
                <Link href="/books?category=non-fiction" className="hover:text-primary-400 transition-colors">
                  📖 Non-Fiction
                </Link>
              </li>
              <li>
                <Link href="/books?category=textbooks" className="hover:text-primary-400 transition-colors">
                  🎓 Textbooks
                </Link>
              </li>
              <li>
                <Link href="/books?category=children" className="hover:text-primary-400 transition-colors">
                  🧸 Children's Books
                </Link>
              </li>
            </ul>
          </div>

          {/* Support & Legal */}
          <div className="space-y-4">
            <h3 className="font-semibold text-white">Support & Legal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/help" className="hover:text-primary-400 transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-primary-400 transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-primary-400 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-primary-400 transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Eco Message Section */}
      <div className="border-t border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">🌱</span>
              <div>
                <p className="text-sm font-medium text-green-400">
                  Sustainable Reading Initiative
                </p>
                <p className="text-xs text-neutral-400">
                  Every book sold saves trees and reduces waste
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-6 text-xs text-neutral-400">
              <div className="text-center">
                <div className="font-semibold text-green-400">2.5kg</div>
                <div>CO₂ saved per book</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-green-400">15L</div>
                <div>Water saved per book</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-green-400">100%</div>
                <div>Circular economy</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-2 md:space-y-0">
            <p className="text-xs text-neutral-400">
              © {currentYear} BookSwap. All rights reserved. Made with 💚 for sustainable reading.
            </p>
            <div className="flex items-center space-x-4 text-xs text-neutral-400">
              <span>🇧🇪 Belgium</span>
              <span>•</span>
              <span>💳 Secure payments</span>
              <span>•</span>
              <span>📦 Free shipping</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 