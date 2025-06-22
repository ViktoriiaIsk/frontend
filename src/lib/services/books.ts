import { api, endpoints, buildQueryString, getAuthToken } from '@/lib/api';
import { initializeCsrfCookie, getCsrfToken } from '@/lib/csrf';
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
      const queryString = buildQueryString(filters);
      
      const response = await api.get<PaginatedResponse<Book>>(
        `${endpoints.books.list}${queryString}`
      );
      
      let books = response.data.data || [];
      
      // Remove duplicates by ID (in case API returns duplicates)
      books = books.filter((book, index, array) => 
        array.findIndex(b => b.id === book.id) === index
      );
      
      // Backend now handles all filtering (deleted books, search, categories, prices)

      // Return the data preserving original pagination info from backend
      return {
        ...response.data,
        data: books
      };
    } catch (error: unknown) {
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
        throw new Error('Invalid book data from server');
      }
      
      return book;
    } catch (error: unknown) {
      throw error;
    }
  }

  /**
   * Create a new book
   * @param data - Book creation data
   * @returns Promise with created book
   */
  static async createBook(data: CreateBookData): Promise<Book> {
    try {
      // Ensure CSRF token is available before creating book
      await initializeCsrfCookie();
      
      const response = await api.post<ApiResponse<Book>>('/books', data);
      
      // Handle both response.data.data and response.data structures
      let book: Book;
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        book = response.data.data;
      } else {
        book = response.data as Book;
      }
      
      return book;
    } catch (error: unknown) {
      throw error;
    }
  }

  /**
   * Update an existing book
   * @param id - Book ID
   * @param data - Book update data
   * @returns Promise with updated book
   */
  static async updateBook(id: number, data: Partial<CreateBookData>): Promise<Book> {
    try {
      const response = await api.put<ApiResponse<Book>>(`/books/${id}`, data);
      
      // Handle both response.data.data and response.data structures
      let book: Book;
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        book = response.data.data;
      } else {
        book = response.data as Book;
      }
      
      return book;
    } catch (error: unknown) {
      throw error;
    }
  }

  /**
   * Delete a book
   * @param id - Book ID
   * @returns Promise that resolves when book is deleted
   */
  static async deleteBook(id: number): Promise<void> {
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('Authentication required to delete book');
      }

      // Make DELETE request directly to backend
      const deleteResponse = await fetch(`https://api.bookswap.space/api/books/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include',
      });

      if (deleteResponse.ok) {
        alert('Book deleted successfully!');
        return;
      } else {
        // Handle specific error responses from backend
        const errorData = await deleteResponse.json();

        // Handle different error types with user-friendly messages
        if (errorData.error === 'PENDING_ORDERS_EXIST') {
          alert('Cannot delete book with pending orders. Please wait for completion or cancel the orders.');
        } else if (errorData.error === 'ACTIVE_ORDERS_EXIST') {
          // Keep for backward compatibility
          alert('Cannot delete book with active orders. Please complete or cancel all orders first.');
        } else if (errorData.error === 'DELETION_FAILED') {
          alert('Technical error while deleting book. Please try again later or contact support.');
        } else if (deleteResponse.status === 500) {
          alert('Server error. Please try again later or contact support.');
        } else if (deleteResponse.status === 403) {
          alert('You do not have permission to delete this book.');
        } else {
          alert(`Error deleting book: ${errorData.message || 'Unknown error'}`);
        }

        throw new Error(errorData.message || 'Failed to delete book');
      }

    } catch (error: any) {
      // Show user-friendly message only if not already shown
      if (!error.message.includes('Authentication') &&
          !error.message.includes('PENDING_ORDERS_EXIST') &&
          !error.message.includes('ACTIVE_ORDERS_EXIST') &&
          !error.message.includes('DELETION_FAILED')) {
        alert(`Error deleting book: ${error.message}`);
      }

      throw error;
    }
  }

  /**
   * Upload images for a book according to backend API specification
   * @param bookId - Book ID
   * @param images - Array of image files
   * @returns Promise with upload result containing image URLs
   */
  static async uploadImages(bookId: number, images: File[]): Promise<{ 
    success: boolean; 
    message?: string;
    images?: Array<{
      id: number;
      book_id: number;
      image_path: string;
      image_url: string;
    }>
  }> {
    try {
      // Ensure CSRF token is available
      await initializeCsrfCookie();
      
      // Create FormData according to API spec
      const formData = new FormData();
      
      // Append each image with the correct field name: images[]
      images.forEach((image) => {
        formData.append('images[]', image);
      });

      // Get auth token and CSRF token
      const token = getAuthToken();
      const csrfToken = getCsrfToken();
      
      const headers: Record<string, string> = {
        'X-Requested-With': 'XMLHttpRequest',
      };
      
      // Authorization header is required
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      // CSRF token for security
      if (csrfToken) {
        headers['X-XSRF-TOKEN'] = csrfToken;
      }

      // Use direct HTTPS backend
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.bookswap.space/api'}/books/${bookId}/images`, {
        method: 'POST',
        headers,
        body: formData,
        // Only include credentials in production to avoid CORS issues in development
        credentials: process.env.NODE_ENV === 'production' ? 'include' : 'omit',
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `Upload failed: ${response.status} ${response.statusText}`;
        
        try {
          const errorData = JSON.parse(errorText);
          if (errorData.message) {
            errorMessage = errorData.message;
          }
        } catch {
          // Use default error message if parsing fails
        }
        
        throw new Error(errorMessage);
      }

      const result = await response.json();
      
      // Expected response format:
      // {
      //   "message": "Images uploaded successfully",
      //   "images": [
      //     {
      //       "id": 1,
      //       "book_id": 1,
      //       "image_path": "books/1/image1.jpg",
      //       "image_url": "http://domain.com/storage/books/1/image1.jpg"
      //     }
      //   ]
      // }
      
      return {
        success: true,
        message: result.message,
        images: result.images
      };
    } catch (error: unknown) {
      throw error;
    }
  }

  /**
   * Fetch all categories
   * @returns Promise with categories array
   */
  static async getCategories(): Promise<Category[]> {
    try {
      const response = await api.get<ApiResponse<Category[]> | Category[]>('/categories');
      
      // Handle both response.data.data and response.data structures
      let categories: Category[];
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        categories = (response.data as ApiResponse<Category[]>).data;
      } else {
        categories = response.data as Category[];
      }
      
      return Array.isArray(categories) ? categories : [];
    } catch (error: unknown) {
             // Return fallback categories if API fails
       return [
         { id: 1, name: 'Fiction', slug: 'fiction', description: 'Fictional stories and novels', created_at: '', updated_at: '' },
         { id: 2, name: 'Non-fiction', slug: 'non-fiction', description: 'Real-world topics and factual content', created_at: '', updated_at: '' },
         { id: 3, name: 'Science', slug: 'science', description: 'Scientific topics and research', created_at: '', updated_at: '' },
         { id: 4, name: 'History', slug: 'history', description: 'Historical events and periods', created_at: '', updated_at: '' },
         { id: 5, name: 'Mystery', slug: 'mystery', description: 'Mystery and thriller novels', created_at: '', updated_at: '' }
       ];
    }
  }

  /**
   * Fetch reviews for a book
   * @param bookId - Book ID
   * @returns Promise with reviews array
   */
  static async getBookReviews(bookId: number): Promise<Review[]> {
    try {
      const response = await api.get<ApiResponse<Review[]> | Review[]>(`/books/${bookId}/reviews`);
      
      // Handle both response.data.data and response.data structures
      let reviews: Review[];
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        reviews = (response.data as ApiResponse<Review[]>).data;
      } else {
        reviews = response.data as Review[];
      }
      
      return Array.isArray(reviews) ? reviews : [];
    } catch (error: unknown) {
      // Return empty array if reviews fetch fails
      return [];
    }
  }

  /**
   * Create a review for a book
   * @param bookId - Book ID
   * @param data - Review data
   * @returns Promise with created review
   */
  static async createReview(bookId: number, data: CreateReviewData): Promise<Review> {
    try {
      const response = await api.post<ApiResponse<Review>>(`/books/${bookId}/reviews`, data);
      
      // Handle both response.data.data and response.data structures
      let review: Review;
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        review = response.data.data;
      } else {
        review = response.data as Review;
      }
      
      return review;
    } catch (error: unknown) {
      throw error;
    }
  }

  /**
   * Get books by current user using /api/my-books endpoint
   * @returns Promise with user's books
   */
  static async getUserBooks(): Promise<Book[]> {
    try {
      // Get auth token to ensure user is authenticated
      const token = getAuthToken();
      if (!token) {
        return [];
      }

      // Call the correct endpoint for user's books
      const response = await api.get<Book[]>('/my-books');
      
      // The API returns an array of books directly
      let books: Book[] = [];
      
      if (response.data) {
        // Handle both direct array and wrapped response
        if (Array.isArray(response.data)) {
          books = response.data;
        } else if (response.data && typeof response.data === 'object' && 'data' in response.data) {
          books = (response.data as any).data || [];
        } else {
          books = [];
        }
      }
      
      // Ensure we return an array and filter out any invalid entries
      const validBooks = books.filter(book => 
        book && 
        typeof book === 'object' && 
        book.id && 
        book.title && 
        book.author
      );
      
      return validBooks;
      
    } catch (error: unknown) {
      // If the /my-books endpoint fails, return empty array
      // Don't fallback to other methods to avoid security issues
      return [];
    }
  }

  /**
   * Get user ID from stored token or user data
   * @returns User ID or null if not found
   */
  private static getCurrentUserId(): string | null {
    if (typeof window === 'undefined') return null;
    
    try {
      // Try to get user from auth store
      const userDataStr = localStorage.getItem('auth-storage');
      if (userDataStr) {
        const userData = JSON.parse(userDataStr);
        if (userData?.state?.user?.id) {
          return userData.state.user.id.toString();
        }
      }
      
      // Fallback to token-based identification
      const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
      if (token) {
        return token.substring(0, 8) + token.length;
      }
      
      return null;
    } catch (error) {
      return null;
    }
  }
}

// Test function to check API connectivity
export const testApiConnection = async () => {
  try {
    const response = await api.get('/books?page=1&limit=1');
    console.log('✅ API connection test successful:', response.status);
    return true;
  } catch (error: any) {
    console.error('❌ API connection test failed:', error.response?.status, error.response?.data);
    return false;
  }
}; 