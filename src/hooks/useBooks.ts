import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BooksService } from '@/lib/services/books';
import {
  BookFilters,
  CreateBookData,
  CreateReviewData,
} from '@/types';

/**
 * Hook for fetching paginated books with filters
 */
export const useBooks = (filters: BookFilters = {}) => {
  return useQuery({
    queryKey: ['books', filters],
    queryFn: () => BooksService.getBooks(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

/**
 * Hook for fetching a single book by ID
 */
export const useBook = (id: number, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['book', id],
    queryFn: () => BooksService.getBook(id),
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Hook for fetching book categories
 */
export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => BooksService.getCategories(),
    staleTime: 15 * 60 * 1000, // 15 minutes (categories change rarely)
  });
};

/**
 * Hook for creating a new book
 */
export const useCreateBook = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (bookData: CreateBookData) => BooksService.createBook(bookData),
    onSuccess: () => {
      // Invalidate books list to show the new book
      queryClient.invalidateQueries({ queryKey: ['books'] });
      // Add the new book to user's books cache
      queryClient.invalidateQueries({ queryKey: ['user-books'] });
    },
  });
};

/**
 * Hook for updating a book
 */
export const useUpdateBook = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CreateBookData> }) =>
      BooksService.updateBook(id, data),
    onSuccess: (updatedBook) => {
      // Update the specific book in cache
      queryClient.setQueryData(['book', updatedBook.id], updatedBook);
      // Invalidate books list
      queryClient.invalidateQueries({ queryKey: ['books'] });
      queryClient.invalidateQueries({ queryKey: ['user-books'] });
    },
  });
};

/**
 * Hook for deleting a book
 */
export const useDeleteBook = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => BooksService.deleteBook(id),
    onSuccess: (_, deletedId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: ['book', deletedId] });
      // Invalidate books list
      queryClient.invalidateQueries({ queryKey: ['books'] });
      queryClient.invalidateQueries({ queryKey: ['user-books'] });
    },
  });
};

/**
 * Hook for uploading book images
 */
export const useUploadBookImages = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ bookId, images }: { bookId: number; images: File[] }) =>
      BooksService.uploadBookImages(bookId, images),
    onSuccess: (_, { bookId }) => {
      // Invalidate the book cache to refetch with new images
      queryClient.invalidateQueries({ queryKey: ['book', bookId] });
      queryClient.invalidateQueries({ queryKey: ['books'] });
    },
  });
};

/**
 * Hook for fetching book reviews
 */
export const useBookReviews = (bookId: number, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['book-reviews', bookId],
    queryFn: () => BooksService.getBookReviews(bookId),
    enabled: enabled && !!bookId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

/**
 * Hook for creating a book review
 */
export const useCreateReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ bookId, reviewData }: { bookId: number; reviewData: CreateReviewData }) =>
      BooksService.createReview(bookId, reviewData),
    onSuccess: (_, { bookId }) => {
      // Invalidate reviews for this book
      queryClient.invalidateQueries({ queryKey: ['book-reviews', bookId] });
      // Also invalidate the book itself as it might have rating updates
      queryClient.invalidateQueries({ queryKey: ['book', bookId] });
    },
  });
};

/**
 * Hook for searching books
 */
export const useSearchBooks = (query: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['search-books', query],
    queryFn: () => BooksService.searchBooks(query),
    enabled: enabled && query.length > 2, // Only search if query is longer than 2 chars
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

/**
 * Hook for fetching user's own books
 */
export const useUserBooks = () => {
  return useQuery({
    queryKey: ['user-books'],
    queryFn: () => BooksService.getUserBooks(),
    staleTime: 2 * 60 * 1000,
  });
}; 