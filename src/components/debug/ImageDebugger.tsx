'use client';

import { useState } from 'react';
import { getImageUrlAlternatives } from '@/utils';

interface ImageDebuggerProps {
  imagePath: string;
  bookId?: number | string;
}

export default function ImageDebugger({ imagePath, bookId }: ImageDebuggerProps) {
  const [showDebug, setShowDebug] = useState(false);
  const [testResults, setTestResults] = useState<Record<string, boolean>>({});

  if (process.env.NODE_ENV === 'production' && !showDebug) {
    return (
      <button
        onClick={() => setShowDebug(true)}
        className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded"
      >
        Debug Image
      </button>
    );
  }

  if (!showDebug) return null;

  const alternatives = getImageUrlAlternatives(imagePath);

  const testImageUrl = async (url: string) => {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      setTestResults(prev => ({ ...prev, [url]: response.ok }));
    } catch (error) {
      setTestResults(prev => ({ ...prev, [url]: false }));
    }
  };

  return (
    <div className="mt-4 p-4 bg-gray-100 rounded-lg text-sm">
      <div className="flex justify-between items-center mb-2">
        <h4 className="font-semibold">Image Debug Info</h4>
        <button
          onClick={() => setShowDebug(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          ×
        </button>
      </div>
      
      <div className="space-y-2">
        <div>
          <strong>Original Path:</strong> {imagePath}
        </div>
        
        <div>
          <strong>Book ID:</strong> {bookId}
        </div>
        
        <div>
          <strong>Environment:</strong> {process.env.NODE_ENV}
        </div>
        
        <div>
          <strong>Hostname:</strong> {typeof window !== 'undefined' ? window.location.hostname : 'SSR'}
        </div>
        
        <div>
          <strong>Alternative URLs:</strong>
          <div className="ml-4 space-y-1">
            {alternatives.map((url, index) => (
              <div key={index} className="flex items-center gap-2">
                <button
                  onClick={() => testImageUrl(url)}
                  className="text-blue-600 hover:underline text-xs"
                >
                  Test
                </button>
                <span className={`text-xs ${
                  testResults[url] === true ? 'text-green-600' : 
                  testResults[url] === false ? 'text-red-600' : 
                  'text-gray-600'
                }`}>
                  {testResults[url] === true ? '✓' : testResults[url] === false ? '✗' : '?'}
                </span>
                <a 
                  href={url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:underline break-all"
                >
                  {url}
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 