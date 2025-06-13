import Link from 'next/link';
import Card from '@/components/ui/Card';

const categoryIcons: Record<string, string> = {
  'fiction': '📖',
  'non-fiction': '📚',
  'science': '🔬',
  'history': '🏛️',
  'children': '🧸',
  'romance': '💕',
  'mystery': '🕵️',
  'fantasy': '🐉',
  'biography': '👤',
  'self-help': '💪',
  'technology': '💻',
  'cooking': '👨‍🍳',
  'travel': '✈️',
  'art': '🎨',
  'education': '🎓'
};

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function getCategoryIcon(categoryName: string) {
  const key = categoryName.toLowerCase().replace(/\s+/g, '-');
  return categoryIcons[key] || '📘';
}

export default function FeaturedCategories({ categories }: { categories: any[] }) {
  const randomCategories = shuffleArray(categories).slice(0, 4);
  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl md:text-3xl font-bold text-center text-neutral-900 mb-8">
          Popular Categories
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {randomCategories.map((category) => (
            <Link key={category.id} href={`/books?category=${category.id}`}>
              <Card hover padding="md" className="text-center cursor-pointer h-full">
                <div className="w-16 h-16 rounded-2xl bg-primary-100 text-primary-800 flex items-center justify-center text-2xl mx-auto mb-3">
                  {getCategoryIcon(category.name)}
                </div>
                <h3 className="font-medium text-neutral-900">{category.name}</h3>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
} 