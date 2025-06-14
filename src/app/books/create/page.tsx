'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Image from 'next/image';

import Navigation from '@/components/layout/Navigation';
import Footer from '@/components/layout/Footer';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { useCreateBook, useCategories } from '@/hooks/useBooks';
import { CreateBookData, BOOK_CONDITIONS, BookCondition } from '@/types';
import { extractErrorMessage } from '@/utils';
import { BooksService } from '@/lib/services/books';

// Helper function to get condition description
const getConditionDescription = (condition: BookCondition): string => {
  const descriptions: Record<BookCondition, string> = {
    'New': 'Brand new, never used',
    'Like New': 'Excellent condition, minimal wear',
    'Good': 'Minor wear, all pages intact',
    'Fair': 'Noticeable wear, but readable',
    'Poor': 'Heavy wear, may have damage'
  };
  return descriptions[condition];
};

// Validation schema
const createBookSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title is too long'),
  author: z.string().min(1, 'Author is required').max(255, 'Author name is too long'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(2000, 'Description is too long'),
  price: z.string().min(1, 'Price is required').regex(/^\d+(\.\d{1,2})?$/, 'Invalid price format'),
  category_id: z.number().min(1, 'Please select a category'),
  condition: z.enum(BOOK_CONDITIONS, { errorMap: () => ({ message: 'Please select a valid book condition' }) }),
});

type CreateBookFormData = z.infer<typeof createBookSchema>;

/**
 * Create book page with form and image upload
 */
const CreateBookPage: React.FC = () => {
  const router = useRouter();
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isRedirecting, setIsRedirecting] = useState(false);

  // API hooks
  const { mutate: createBook, isPending: isCreating } = useCreateBook();
  const { data: categoriesResponse, isLoading: isCategoriesLoading } = useCategories();

  // Form setup
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<CreateBookFormData>({
    resolver: zodResolver(createBookSchema),
  });

  // Handle image selection with proper validation
  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    if (files.length + selectedImages.length > 5) {
      alert('You can upload maximum 5 images');
      return;
    }

    // Validate file types and sizes according to backend requirements
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'];
    const maxSize = 2048 * 1024; // 2MB (2048 kilobytes)
    
    const validFiles = files.filter(file => {
      // Check file type
      if (!allowedTypes.includes(file.type)) {
        alert(`${file.name} must be a file of type: jpeg, png, jpg, gif`);
        return false;
      }
      
      // Check file size
      if (file.size > maxSize) {
        alert(`${file.name} may not be greater than 2048 kilobytes (2MB)`);
        return false;
      }
      
      return true;
    });

    if (validFiles.length === 0) return;

    // Create preview URLs
    const newPreviewUrls = validFiles.map(file => URL.createObjectURL(file));
    
    setSelectedImages(prev => [...prev, ...validFiles]);
    setPreviewUrls(prev => [...prev, ...newPreviewUrls]);
  };

  // Remove selected image
  const removeImage = (index: number) => {
    URL.revokeObjectURL(previewUrls[index]);
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  // Handle form submission
  const onSubmit = async (data: CreateBookFormData) => {
      createBook(data, {
        onSuccess: async (createdBook) => {
          console.log('Book created:', createdBook);
          console.log('Selected images:', selectedImages);
          
          let finalBook = createdBook;
          
          // Upload images if any
          if (selectedImages.length > 0) {
            try {
              const uploadResult = await BooksService.uploadBookImages(createdBook.id, selectedImages);
              console.log('Upload result:', uploadResult);
              // Fetch updated book after image upload
              finalBook = await BooksService.getBook(createdBook.id);
              console.log('Updated book after image upload:', finalBook);
            } catch (imgErr) {
              console.error('Image upload error:', imgErr);
              alert('Book created, but failed to upload images.');
            }
          }
          
          // Show success message and prepare for redirect
          setIsRedirecting(true);
          
          // Add a small delay to ensure backend consistency
          await new Promise(resolve => setTimeout(resolve, 1500));
          
          // Navigate to book details
          router.push(`/books/${finalBook.id}`);
        },
        onError: (error) => {
          const errorMessage = extractErrorMessage(error);
          // Handle validation errors
          if (error && typeof error === 'object' && 'errors' in error) {
            const errors = (error as { errors: Record<string, string[]> }).errors;
            Object.entries(errors).forEach(([field, messages]) => {
              if (Array.isArray(messages) && messages.length > 0) {
                setError(field as keyof CreateBookFormData, {
                  type: 'server',
                  message: messages[0],
                });
              }
            });
          } else {
            alert(errorMessage);
          }
        },
      });
  };

  return (
    <div className="min-h-screen bg-accent-cream">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">
            Sell Your Book
          </h1>
          <p className="text-lg text-neutral-600">
            List your book for sale and reach thousands of readers
          </p>
        </div>

        <Card className="max-w-2xl mx-auto">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Book Title */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Book Title *
              </label>
              <input
                type="text"
                {...register('title')}
                className={`input ${errors.title ? 'input-error' : ''}`}
                placeholder="Enter the book title"
              />
              {errors.title && (
                <p className="text-red-600 text-sm mt-1">{errors.title.message}</p>
              )}
            </div>

            {/* Author */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Author *
              </label>
              <input
                type="text"
                {...register('author')}
                className={`input ${errors.author ? 'input-error' : ''}`}
                placeholder="Enter the author name"
              />
              {errors.author && (
                <p className="text-red-600 text-sm mt-1">{errors.author.message}</p>
              )}
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Category *
              </label>
              <select
                {...register('category_id', { valueAsNumber: true })}
                className={`input ${errors.category_id ? 'input-error' : ''}`}
                disabled={isCategoriesLoading}
              >
                <option value="">Select a category</option>
                {categoriesResponse?.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              {errors.category_id && (
                <p className="text-red-600 text-sm mt-1">{errors.category_id.message}</p>
              )}
            </div>

            {/* Book Condition */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Book Condition *
              </label>
              <select
                {...register('condition')}
                className={`input ${errors.condition ? 'input-error' : ''}`}
              >
                <option value="">Select book condition</option>
                {BOOK_CONDITIONS.map((condition) => (
                  <option key={condition} value={condition}>
                    {condition} - {getConditionDescription(condition)}
                  </option>
                ))}
              </select>
              {errors.condition && (
                <p className="text-red-600 text-sm mt-1">{errors.condition.message}</p>
              )}
              <p className="text-sm text-neutral-500 mt-1">
                Be honest about the book&apos;s condition to set proper expectations
              </p>
            </div>

            {/* Price */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Price (EUR) *
              </label>
              <input
                type="text"
                {...register('price')}
                className={`input ${errors.price ? 'input-error' : ''}`}
                placeholder="0.00"
              />
              {errors.price && (
                <p className="text-red-600 text-sm mt-1">{errors.price.message}</p>
              )}
              <p className="text-sm text-neutral-500 mt-1">
                Enter the price in Euro (EUR)
              </p>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Description *
              </label>
              <textarea
                {...register('description')}
                rows={6}
                className={`input ${errors.description ? 'input-error' : ''}`}
                placeholder="Describe the book condition, any wear, and why you're selling it..."
              />
              {errors.description && (
                <p className="text-red-600 text-sm mt-1">{errors.description.message}</p>
              )}
              <p className="text-sm text-neutral-500 mt-1">
                Minimum 10 characters. Be honest about the book's condition.
              </p>
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Book Images (Optional)
              </label>
              <div className="border-2 border-dashed border-neutral-300 rounded-xl p-6 hover:border-primary-400 transition-colors">
                <input
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/jpg,image/gif"
                  onChange={handleImageSelect}
                  className="hidden"
                  id="book-images"
                />
                <label
                  htmlFor="book-images"
                  className="cursor-pointer flex flex-col items-center"
                >
                  <div className="text-4xl mb-2">📸</div>
                  <p className="text-neutral-600 text-center">
                    Click to upload book images
                  </p>
                  <p className="text-sm text-neutral-600 mb-4">
                    Upload up to 5 photos of your book. First photo will be the main image. Accepted formats: JPEG, PNG, JPG, GIF. Max size: 2MB per image.
                  </p>
                  <p className="text-xs text-neutral-500 mb-4">
                    Don&apos;t have good photos? Take clear, well-lit pictures showing the book cover, spine, and any notable wear or damage.
                  </p>
                </label>
              </div>

              {/* Image Previews */}
              {previewUrls.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                  {previewUrls.map((url, index) => (
                    <div key={index} className="relative">
                      <Image
                        src={url}
                        alt={`Preview ${index + 1}`}
                        width={100}
                        height={120}
                        className="w-full h-full object-cover rounded"
                        unoptimized
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600 transition-colors"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Success Message */}
            {isRedirecting && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-600 mr-3"></div>
                  <div>
                    <h3 className="text-green-800 font-medium">Book Created Successfully!</h3>
                    <p className="text-green-600 text-sm">Redirecting to your book page...</p>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex gap-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => router.back()}
                className="flex-1"
                disabled={isCreating || isRedirecting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                loading={isCreating || isRedirecting}
                disabled={isCreating || isRedirecting}
                className="flex-1"
              >
                {isRedirecting ? 'Redirecting...' : isCreating ? 'Creating...' : 'List Book for Sale'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
      <Footer />
    </div>
  );
};

export default CreateBookPage; 