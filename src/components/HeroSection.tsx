import Navigation from '@/components/layout/Navigation';

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      <Navigation />
      <div className="absolute inset-0 bg-gradient-to-br from-primary-50 to-secondary-50 opacity-50" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-neutral-900 mb-6">
            Books find new
            <span className="text-primary-600 block">readers</span>
          </h1>
          <p className="text-lg md:text-xl text-neutral-600 mb-8 max-w-2xl mx-auto">
            Online marketplace for buying and selling second-hand books. Give stories a new life and help the planet.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <a href="/books">
              <button className="btn btn-primary w-full sm:w-auto text-lg">🔍 Browse Books</button>
            </a>
            <a href="/books/create">
              <button className="btn btn-secondary w-full sm:w-auto text-lg">💰 Sell Books</button>
            </a>
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