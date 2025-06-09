'use client';

import FallbackImage from '@/components/ui/FallbackImage';
import SmartImage from '@/components/ui/SmartImage';
import Card from '@/components/ui/Card';

export default function ImageTestPage() {
  const testImages = [
    {
      title: 'Working Image (Placeholder)',
      url: '/images/placeholder-book.svg',
    },
    {
      title: 'Broken External Image (404)',
      url: 'http://13.37.117.93/book-images/01JX276RFDNED96YHPW6FYMS3J.png',
    },
    {
      title: 'Another Broken Image',
      url: 'http://13.37.117.93/book-images/01JX2GGXVJZDN9G4DHKY0ZTNXK.jpeg',
    },
  ];

  return (
    <div className="min-h-screen bg-accent-cream py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-3xl font-bold text-neutral-900 mb-8">
          Image Loading Test
        </h1>

        <div className="space-y-8">
          {/* FallbackImage Test */}
          <Card padding="md">
            <h2 className="text-xl font-semibold mb-4">FallbackImage Component</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {testImages.map((image, index) => (
                <div key={index} className="space-y-2">
                  <h3 className="text-sm font-medium text-neutral-700">
                    {image.title}
                  </h3>
                  <div className="relative aspect-[3/4] border border-neutral-200 rounded-lg overflow-hidden">
                    <FallbackImage
                      src={image.url}
                      alt={image.title}
                      className="object-cover absolute inset-0"
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* SmartImage Test */}
          <Card padding="md">
            <h2 className="text-xl font-semibold mb-4">SmartImage Component (Next.js Image)</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {testImages.map((image, index) => (
                <div key={index} className="space-y-2">
                  <h3 className="text-sm font-medium text-neutral-700">
                    {image.title}
                  </h3>
                  <div className="relative aspect-[3/4] border border-neutral-200 rounded-lg overflow-hidden">
                    <SmartImage
                      src={image.url}
                      alt={image.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Info */}
          <Card padding="md" className="bg-blue-50 border-blue-200">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              Testing Notes
            </h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• FallbackImage uses regular &lt;img&gt; tag with error handling</li>
              <li>• SmartImage uses Next.js Image with optimization</li>
              <li>• Both components try alternative URLs when images fail</li>
              <li>• Fallback to placeholder when all URLs fail</li>
              <li>• Check browser console for loading attempts</li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
} 