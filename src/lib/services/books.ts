import { api, endpoints, buildQueryString } from '@/lib/api';
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
      }
      
      const queryString = buildQueryString(filters);
      
      if (process.env.NODE_ENV === 'development') {
      }
      
      const response = await api.get<PaginatedResponse<Book>>(
        `${endpoints.books.list}${queryString}`
      );
      
      let books = response.data.data || [];
      
      // Client-side filtering for search since backend is not accurate
      if (filters.search && filters.search.trim()) {
        const searchTerm = filters.search.toLowerCase().trim();
        
        if (process.env.NODE_ENV === 'development') {
        }
        
        books = books.filter((book, index) => {
          const title = book.title?.toLowerCase() || '';
          const author = book.author?.toLowerCase() || '';
          const description = book.description?.toLowerCase() || '';
          
          const matches = title.includes(searchTerm) || 
                         author.includes(searchTerm) || 
                         description.includes(searchTerm);
          
          if (process.env.NODE_ENV === 'development' && index < 3) {
            console.log('Search debug:', {
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
      
      const response = await api.get<ApiResponse<Book> | Book>(`/books/${id}`);
      
      // Handle both response.data.data and response.data structures
      let book: Book;
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        // API wrapped response
        book = (response.data as ApiResponse<Book>).data;
      } else {
        // Direct book data
        book = response.data as Book;
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
        return this.getFallbackCategories();
      }
      
      if (categories.length === 0) {
        return this.getFallbackCategories();
      }
      
      return categories;
    } catch (error) {
      console.error('Error fetching categories, using fallback:', error);
      return this.getFallbackCategories();
    }
  }

  /**
   * Get fallback categories when backend is unavailable
   * @returns Array of default categories
   */
  static getFallbackCategories(): Category[] {
    return [
      { id: 1, name: 'Fiction', slug: null, description: 'Books that tell made-up stories to entertain, inspire, or move the reader.', created_at: '', updated_at: '' },
      { id: 2, name: 'Non-Fiction', slug: null, description: 'Books based on real events, people, or facts — perfect for those who love learning.', created_at: '', updated_at: '' },
      { id: 3, name: 'Science', slug: null, description: 'Explore the wonders of the universe, nature, and technology through scientific literature.', created_at: '', updated_at: '' },
      { id: 4, name: 'History', slug: null, description: 'Books that dive into past civilizations, wars, cultures, and historical figures.', created_at: '', updated_at: '' },
      { id: 5, name: 'Technology', slug: null, description: 'Discover the latest in coding, innovation, and the digital world.', created_at: '', updated_at: '' },
      { id: 6, name: 'Children', slug: null, description: 'Fun, educational, and heartwarming stories for young readers.', created_at: '', updated_at: '' },
      { id: 7, name: 'Romance', slug: null, description: 'Love stories that make your heart flutter and bring emotions to life.', created_at: '', updated_at: '' },
      { id: 8, name: 'Mystery', slug: null, description: 'Thrilling tales full of secrets, puzzles, and unexpected twists.', created_at: '', updated_at: '' },
      { id: 9, name: 'Fantasy', slug: null, description: 'Step into magical worlds filled with dragons, heroes, and epic adventures.', created_at: '', updated_at: '' },
      { id: 10, name: 'Self-help', slug: null, description: 'Books that motivate, heal, and guide you through personal growth.', created_at: '', updated_at: '' }
    ];
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
      
      // Get current user ID from token
      const userId = this.getCurrentUserId();
      if (!userId) {
        return [];
      }
      
      // Get all books and filter by current user
      const response = await api.get<PaginatedResponse<Book>>('/books');
      
      // Handle both response.data.data and response.data structures
      const allBooks = response.data.data || response.data;
      
      if (Array.isArray(allBooks)) {
        // Filter books by current user (owner_id should match current user)
        const userBooks = allBooks.filter(book => 
          book.owner_id === parseInt(userId)
        );
        
        return userBooks;
      } else {
        return [];
      }
    } catch (error: any) {
      console.error('Error fetching user books:', error);
      console.error('Error status:', error?.status);
      console.error('Error response:', error?.response?.data);
      
      // If authentication failed, return empty array
      if (error?.status === 401 || error?.response?.status === 401) {
        return [];
      }
      
      // For other errors, also return empty array to prevent UI crashes
      return [];
    }
  }

  /**
   * Get current user ID from stored token
   */
  private static getCurrentUserId(): string | null {
    if (typeof window === 'undefined') return null;
    
    try {
      // Try to get user ID from stored auth token
      const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
      if (!token) return null;
      
      // Decode JWT token to get user ID (basic decode, not verified)
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      
      const payload = JSON.parse(atob(parts[1]));
      return payload.sub || payload.user_id || payload.id || null;
    } catch (error) {
      console.error('Failed to extract user ID from token:', error);
      return null;
    }
  }
} 