'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Image from 'next/image';

import Navigation from '@/components/layout/Navigation';
import Footer from '@/components/layout/Footer';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { useCategories, useUpdateBook, useDeleteBook } from '@/hooks/useBooks';
import { CreateBookData, BOOK_CONDITIONS, BookCondition, Book } from '@/types';
import { extractErrorMessage } from '@/utils';
import { BooksService } from '@/lib/services/books';
import { AuthService } from '@/lib/services/auth';

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
const editBookSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title is too long'),
  author: z.string().min(1, 'Author is required').max(255, 'Author name is too long'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(2000, 'Description is too long'),
  price: z.string().min(1, 'Price is required').regex(/^\d+(\.\d{1,2})?$/, 'Invalid price format'),
  category_id: z.number().min(1, 'Please select a category'),
  condition: z.enum(BOOK_CONDITIONS, { errorMap: () => ({ message: 'Please select a valid book condition' }) }),
});

type EditBookFormData = z.infer<typeof editBookSchema>;

/**
 * Edit book page - allows owner to update book details
 */
export default function EditBookPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  // API hooks
  const { data: categoriesResponse, isLoading: isCategoriesLoading } = useCategories();
  const { mutate: updateBook, isPending: isUpdating } = useUpdateBook();
  const { mutate: deleteBook, isPending: isDeleting } = useDeleteBook();

  // Form setup
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError: setFormError,
    reset,
  } = useForm<EditBookFormData>({
    resolver: zodResolver(editBookSchema),
  });

  // Load book data
  useEffect(() => {
    const loadBook = async () => {
      try {
        const resolvedParams = await params;
        const bookId = parseInt(resolvedParams.id);
        
        // Fetch book data
        const bookData = await BooksService.getBook(bookId);
        
        // Check if user is the owner
        const currentUser = await AuthService.getCurrentUser();
        if (bookData.owner_id !== currentUser.id) {
          setError('You are not authorized to edit this book');
          return;
        }
        
        setBook(bookData);
        
        // Populate form with existing data
        reset({
          title: bookData.title,
          author: bookData.author,
          description: bookData.description,
          price: bookData.price,
          category_id: bookData.category_id,
          condition: bookData.condition,
        });
        
      } catch (err: unknown) {
        console.error('Error loading book:', err);
        setError(err instanceof Error ? err.message : 'Failed to load book');
      } finally {
        setLoading(false);
      }
    };

    loadBook();
  }, [params, reset]);

  // Handle image selection
  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    if (files.length + selectedImages.length > 5) {
      alert('You can upload maximum 5 images');
      return;
    }

    // Validate file types and sizes
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'];
    const maxSize = 2048 * 1024; // 2MB
    
    const validFiles = files.filter(file => {
      if (!allowedTypes.includes(file.type)) {
        alert(`${file.name} must be a file of type: jpeg, png, jpg, gif`);
        return false;
      }
      
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
  const onSubmit = async (data: EditBookFormData) => {
    if (!book) return;
    
    updateBook(
      { id: book.id, data },
      {
        onSuccess: async (updatedBook) => {
          // Upload new images if any
          if (selectedImages.length > 0) {
            try {
              await BooksService.uploadBookImages(book.id, selectedImages);
            } catch (imgErr) {
              console.error('Image upload error:', imgErr);
              alert('Book updated, but failed to upload new images.');
            }
          }
          
          // Redirect to book details
          router.push(`/books/${updatedBook.id}`);
        },
        onError: (error: unknown) => {
          const errorMessage = extractErrorMessage(error);
          
          // Handle validation errors
          if (error && typeof error === 'object' && 'errors' in error) {
            const errors = (error as { errors: Record<string, string[]> }).errors;
            Object.entries(errors).forEach(([field, messages]) => {
              if (Array.isArray(messages) && messages.length > 0) {
                setFormError(field as keyof EditBookFormData, {
                  type: 'server',
                  message: messages[0],
                });
              }
            });
          } else {
            alert(errorMessage);
          }
        }
      }
    );
  };

  // Handle book deletion
  const handleDelete = () => {
    if (!book) return;
    
    const confirmed = confirm(
      `Are you sure you want to delete "${book.title}"? This action cannot be undone.`
    );
    
    if (confirmed) {
      deleteBook(book.id, {
        onSuccess: () => {
          router.push('/books');
        },
        onError: (error: unknown) => {
          const errorMessage = extractErrorMessage(error);
          alert(`Failed to delete book: ${errorMessage}`);
        }
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-accent-cream">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-neutral-900 mb-2">Loading Book Details</h2>
            <p className="text-neutral-600">Please wait while we fetch the book information...</p>
          </Card>
        </div>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="min-h-screen bg-accent-cream">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="text-center py-12">
            <div className="text-6xl mb-4">❌</div>
            <h1 className="text-2xl font-bold text-neutral-900 mb-2">Cannot Edit Book</h1>
            <p className="text-neutral-600 mb-6">{error || "Book not found or you don't have permission to edit it."}</p>
            <Button onClick={() => router.back()}>Go Back</Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-accent-cream">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <Button variant="ghost" onClick={() => router.back()} className="mb-4">
            ← Back to Book
          </Button>
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">
            Edit Book
          </h1>
          <p className="text-lg text-neutral-600">
            Update your book listing details
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
                Minimum 10 characters. Be honest about the book&apos;s condition.
              </p>
            </div>

            {/* Current Images */}
            {book.images && book.images.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Current Images
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                  {book.images.map((image, index) => (
                    <div key={index} className="relative">
                      <Image
                        src={image.image_url || '/images/placeholder-book.svg'}
                        alt={`${book.title} - Image ${index + 1}`}
                        width={100}
                        height={120}
                        className="w-full h-full object-cover rounded"
                        unoptimized
                      />
                    </div>
                  ))}
                </div>
                <p className="text-sm text-neutral-500">
                  To replace images, upload new ones below. Note: This will add to existing images.
                </p>
              </div>
            )}

            {/* Add New Images */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Add New Images (Optional)
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
                    Click to upload additional book images
                  </p>
                  <p className="text-sm text-neutral-600 mb-4">
                    Upload up to 5 photos total. Accepted formats: JPEG, PNG, JPG, GIF. Max size: 2MB per image.
                  </p>
                </label>
              </div>

              {/* New Image Previews */}
              {previewUrls.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                  {previewUrls.map((url, index) => (
                    <div key={index} className="relative">
                      <Image
                        src={url}
                        alt={`New Preview ${index + 1}`}
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

            {/* Action Buttons */}
            <div className="space-y-4">
              {/* Delete Button */}
              <div className="border-t pt-4">
                <Button
                  type="button"
                  variant="danger"
                  onClick={handleDelete}
                  loading={isDeleting}
                  disabled={isUpdating || isDeleting}
                  className="w-full"
                >
                  {isDeleting ? 'Deleting...' : 'Delete Book'}
                </Button>
                <p className="text-sm text-neutral-500 mt-2 text-center">
                  This action cannot be undone. The book will be permanently removed.
                </p>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => router.back()}
                  className="flex-1"
                  disabled={isUpdating || isDeleting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  loading={isUpdating}
                  disabled={isUpdating || isDeleting}
                  className="flex-1"
                >
                  {isUpdating ? 'Updating...' : 'Update Book'}
                </Button>
              </div>
            </div>
          </form>
        </Card>
      </div>
      <Footer />
    </div>
  );
} 