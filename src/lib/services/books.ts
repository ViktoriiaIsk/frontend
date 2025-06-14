import { api, endpoints, buildQueryString, createFormData } from '@/lib/api';
import type {
  Book,
  CreateBookData,
  BookFilters,
  PaginatedResponse,
  ApiResponse,
  Category,
  Review,
  CreateReviewData
} from '@/types';

/**
 * Books service for handling all book-related API operations
 */
export class BooksService {
  /**
   * Fetch paginated list of books with optional filters
   * @param filters - Search and filter parameters
   * @returns Promise with paginated book data
   */
  static async getBooks(filters: BookFilters = {}): Promise<PaginatedResponse<Book>> {
    try {
      if (process.env.NODE_ENV === 'development') {
        console.log('BooksService.getBooks called with filters:', filters);
      }
      
      const queryString = buildQueryString(filters);
      
      if (process.env.NODE_ENV === 'development') {
        console.log('Generated query string:', queryString);
        console.log('Full URL:', `${endpoints.books.list}${queryString}`);
      }
      
      const response = await api.get<PaginatedResponse<Book>>(
        `${endpoints.books.list}${queryString}`
      );
      
      let books = response.data.data || [];
      
      // Client-side filtering for search since backend is not accurate
      if (filters.search && filters.search.trim()) {
        const searchTerm = filters.search.toLowerCase().trim();
        
        if (process.env.NODE_ENV === 'development') {
          console.log('=== CLIENT-SIDE FILTERING ===');
          console.log('Search term:', searchTerm);
          console.log('Books before filtering:', books.length);
          console.log('Sample book data:', books[0]);
        }
        
        books = books.filter((book, index) => {
          const title = book.title?.toLowerCase() || '';
          const author = book.author?.toLowerCase() || '';
          const description = book.description?.toLowerCase() || '';
          
          const matches = title.includes(searchTerm) || 
                         author.includes(searchTerm) || 
                         description.includes(searchTerm);
          
          if (process.env.NODE_ENV === 'development' && index < 3) {
            console.log(`Book ${index + 1}:`, {
              title: book.title,
              author: book.author,
              matches,
              titleIncludes: title.includes(searchTerm),
              authorIncludes: author.includes(searchTerm),
              descIncludes: description.includes(searchTerm)
            });
          }
          
          return matches;
        });
        
        if (process.env.NODE_ENV === 'development') {
          console.log('Books after filtering:', books.length);
          console.log('=== END FILTERING ===');
        }
      }
      
      // Return the filtered results with original pagination structure
      return {
        ...response.data,
        data: books,
        // Update total count if we filtered results
        total: filters.search ? books.length : response.data.total,
        // Recalculate pagination info
        last_page: filters.search ? Math.ceil(books.length / (filters.per_page || 12)) : response.data.last_page
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Fetch single book by ID with all related data
   * @param id - Book ID
   * @returns Promise with book data
   */
  static async getBook(id: number): Promise<Book> {
    try {
      console.log(`Fetching book with ID: ${id}`);
      console.log(`Full URL: ${api.defaults.baseURL}/books/${id}`);
      
      const response = await api.get<ApiResponse<Book> | Book>(`/books/${id}`);
      console.log('Book response status:', response.status);
      console.log('Book response data:', response.data);
      
      // Handle both response.data.data and response.data structures
      let book: Book;
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        // API wrapped response
        book = (response.data as ApiResponse<Book>).data;
        console.log('Using wrapped response data:', book);
      } else {
        // Direct book data
        book = response.data as Book;
        console.log('Using direct response data:', book);
      }
      
      // Validate that we have book data
      if (!book || !book.id) {
        console.error('Invalid book data received:', book);
        throw new Error('Invalid book data from server');
      }
      
      return book;
    } catch (error: unknown) {
      console.error('Get book error details:', error);
      
      // More detailed error logging
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as any;
        console.error('Response status:', axiosError.response?.status);
        console.error('Response data:', axiosError.response?.data);
        console.error('Request URL:', axiosError.config?.url);
      }
      
      throw error;
    }
  }

  /**
   * Create new book listing
   * @param bookData - Book creation data
   * @returns Promise with created book
   */
  static async createBook(bookData: CreateBookData): Promise<Book> {
    try {
      const response = await api.post<ApiResponse<Book>>(
        endpoints.books.create,
        bookData
      );
      
      // Handle both response.data.data and response.data structures
      const book = response.data.data || response.data;
      
      // Validate that we have book data
      if (!book) {
        throw new Error('Invalid book data from server');
      }
      
      return book;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update existing book (owner only)
   * @param id - Book ID
   * @param bookData - Updated book data
   * @returns Promise with updated book
   */
  static async updateBook(id: number, bookData: Partial<CreateBookData>): Promise<Book> {
    try {
      const response = await api.put<ApiResponse<Book>>(
        endpoints.books.update(id),
        bookData
      );
      
      // Handle both response.data.data and response.data structures
      const book = response.data.data || response.data;
      
      // Validate that we have book data
      if (!book) {
        throw new Error('Invalid book data from server');
      }
      
      return book;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete book listing (owner only)
   * @param id - Book ID
   * @returns Promise that resolves when deletion is complete
   */
  static async deleteBook(id: number): Promise<void> {
    try {
      await api.delete(`/books/${id}`);
    } catch (error: unknown) {
      console.error('Delete book error:', error);
      throw error;
    }
  }

  /**
   * Upload images for a book (up to 5 images)
   * @param bookId - Book ID
   * @param images - Array of image files
   * @returns Promise with updated book data
   */
  static async uploadBookImages(bookId: number, images: File[]): Promise<{ success: boolean; message: string }> {
    try {
      const formData = new FormData();
      
      // Add each image with the key 'images[]' (Laravel expects array format)
      images.forEach((image) => {
        formData.append('images[]', image);
      });
      
      const response = await api.post(`/books/${bookId}/images`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
      });
      
      return response.data;
    } catch (error: unknown) {
      console.error('Upload images error:', error);
      throw error;
    }
  }

  /**
   * Get all book categories
   * @returns Promise with categories array
   */
  static async getCategories(): Promise<Category[]> {
    try {
      const response = await api.get<ApiResponse<Category[]>>(
        endpoints.categories.list
      );
      
      // Handle both response.data.data and response.data structures
      const categories = response.data.data || response.data;
      
      // Validate that we have categories data
      if (!Array.isArray(categories)) {
        console.warn('Invalid categories data from server:', categories);
        return [];
      }
      
      return categories;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  }

  /**
   * Get single category by ID
   * @param id - Category ID
   * @returns Promise with category data
   */
  static async getCategory(id: number): Promise<Category> {
    try {
      const response = await api.get<ApiResponse<Category>>(
        endpoints.categories.show(id)
      );
      
      // Handle both response.data.data and response.data structures
      const category = response.data.data || response.data;
      
      // Validate that we have category data
      if (!category) {
        throw new Error('Invalid category data from server');
      }
      
      return category;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get reviews for a specific book
   * @param bookId - Book ID
   * @returns Promise with reviews array
   */
  static async getBookReviews(bookId: number): Promise<Review[]> {
    try {
      const response = await api.get<ApiResponse<Review[]>>(
        endpoints.books.reviews(bookId)
      );
      
      // Handle both response.data.data and response.data structures
      const reviews = response.data.data || response.data;
      
      // Validate that we have reviews data
      if (!Array.isArray(reviews)) {
        console.warn('Invalid reviews data from server:', reviews);
        return [];
      }
      
      return reviews;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Create a review for a book
   * @param bookId - Book ID
   * @param reviewData - Review data (rating and comment)
   * @returns Promise with created review
   */
  static async createReview(bookId: number, reviewData: CreateReviewData): Promise<Review> {
    try {
      const response = await api.post<ApiResponse<Review>>(
        endpoints.reviews.create(bookId),
        reviewData
      );
      
      // Handle both response.data.data and response.data structures
      const review = response.data.data || response.data;
      
      // Validate that we have review data
      if (!review) {
        throw new Error('Invalid review data from server');
      }
      
      return review;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update existing review (author only)
   * @param reviewId - Review ID
   * @param reviewData - Updated review data
   * @returns Promise with updated review
   */
  static async updateReview(reviewId: number, reviewData: Partial<CreateReviewData>): Promise<Review> {
    try {
      const response = await api.put<ApiResponse<Review>>(
        endpoints.reviews.update(reviewId),
        reviewData
      );
      
      // Handle both response.data.data and response.data structures
      const review = response.data.data || response.data;
      
      // Validate that we have review data
      if (!review) {
        throw new Error('Invalid review data from server');
      }
      
      return review;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete review (author only)
   * @param reviewId - Review ID
   * @returns Promise that resolves when deletion is complete
   */
  static async deleteReview(reviewId: number): Promise<void> {
    try {
      await api.delete(endpoints.reviews.delete(reviewId));
    } catch (error) {
      throw error;
    }
  }

  /**
   * Search books by text query
   * @param query - Search query string
   * @param limit - Maximum number of results (default: 10)
   * @returns Promise with search results
   */
  static async searchBooks(query: string, limit: number = 10): Promise<Book[]> {
    try {
      const filters: BookFilters = {
        search: query,
        per_page: limit,
      };
      
      const response = await this.getBooks(filters);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get user's own book listings
   * @returns Promise with user's books
   */
  static async getUserBooks(): Promise<Book[]> {
    try {
      const response = await api.get<ApiResponse<Book[]>>(
        endpoints.user.books
      );
      // Handle both response.data.data and response.data structures
      const books = response.data.data || response.data;
      // Validate that we have books data
      if (!Array.isArray(books)) {
        console.warn('Invalid user books data from server:', books);
        return [];
      }
      return books;
    } catch (error: any) {
      // Log full error for debugging
      console.error('Error fetching user books:', error);
      // Handle specific error status
      if (error?.status === 401) {
        throw new Error('Session expired. Please log in again.');
      }
      if (error?.status === 404) {
        throw new Error('No books found for your account.');
      }
      throw new Error(error?.message || 'Failed to fetch your books.');
    }
  }
} 