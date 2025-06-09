import { api, endpoints, buildQueryString, createFormData } from '@/lib/api';
import {
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
      const queryString = buildQueryString(filters);
      const response = await api.get<PaginatedResponse<Book>>(
        `${endpoints.books.list}${queryString}`
      );
      return response.data;
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
      const response = await api.get<ApiResponse<Book>>(
        endpoints.books.show(id)
      );
      return response.data.data;
    } catch (error) {
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
      return response.data.data;
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
      return response.data.data;
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
      await api.delete(endpoints.books.delete(id));
    } catch (error) {
      throw error;
    }
  }

  /**
   * Upload images for a book (up to 5 images)
   * @param bookId - Book ID
   * @param images - Array of image files
   * @returns Promise with updated book data
   */
  static async uploadBookImages(bookId: number, images: File[]): Promise<Book> {
    try {
      const formData = createFormData({ images });
      
      const response = await api.post<ApiResponse<Book>>(
        endpoints.books.images(bookId),
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      
      return response.data.data;
    } catch (error) {
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
      return response.data.data;
    } catch (error) {
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
      return response.data.data;
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
      return response.data.data;
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
      return response.data.data;
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
      return response.data.data;
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
      return response.data.data;
    } catch (error) {
      throw error;
    }
  }
} 