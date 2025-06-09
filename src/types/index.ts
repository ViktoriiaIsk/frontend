// User types
export interface User {
  id: number;
  name: string;
  email: string;
  email_verified_at?: string;
  created_at: string;
  updated_at: string;
}

// Authentication types
export interface LoginCredentials {
  email: string;
  password: string;
  remember?: boolean;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// Book types
export interface Book {
  id: number;
  title: string;
  author: string;
  description: string;
  price: string;
  condition: string;
  category_id: number;
  owner_id: number;
  status: 'available' | 'reserved' | 'sold';
  created_at: string;
  updated_at: string;
  images: BookImage[];
  first_image?: string;
  category?: Category;
  owner?: User;
}

export interface BookImage {
  id: number;
  book_id?: number;
  image_path?: string;
  url?: string; // API uses 'url' instead of 'image_path'
  is_primary?: boolean;
  created_at?: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  created_at: string;
}

export interface CreateBookData {
  title: string;
  author: string;
  description: string;
  price: string;
  category_id: number;
}

// Review types
export interface Review {
  id: number;
  book_id: number;
  user_id: number;
  rating: number;
  comment: string;
  created_at: string;
  updated_at: string;
  user: User;
}

export interface CreateReviewData {
  rating: number;
  comment: string;
}

// Order types
export interface Order {
  id: number;
  user_id: number;
  book_id: number;
  total_amount: string;
  status: 'pending' | 'completed' | 'cancelled';
  payment_intent_id?: string;
  shipping_address: ShippingAddress;
  created_at: string;
  updated_at: string;
  book: Book;
  user: User;
}

export interface ShippingAddress {
  street: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

export interface CreateOrderData {
  book_id: number;
  shipping_address: ShippingAddress;
}

// Payment types
export interface PaymentIntentData {
  book_id: number;
  shipping_address: ShippingAddress;
}

export interface PaymentIntentResponse {
  client_secret: string;
  order_id: number;
}

export interface PaymentConfirmData {
  payment_intent_id: string;
  order_id: number;
}

export interface PaymentResult {
  success: boolean;
  orderId?: number;
  clientSecret?: string;
  error?: string;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  links: {
    first: string;
    last: string;
    prev?: string;
    next?: string;
  };
}

// Filter types
export interface BookFilters extends Record<string, unknown> {
  search?: string;
  category_id?: number;
  min_price?: number;
  max_price?: number;
  status?: Book['status'];
  sort_by?: 'price_asc' | 'price_desc' | 'newest' | 'oldest' | 'title_asc' | 'title_desc';
  page?: number;
  per_page?: number;
}

// Form types
export interface FormError {
  field: string;
  message: string;
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
  status?: number;
}

// UI Component types
export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

// Store types
export interface AuthStore {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  setUser: (user: User) => void;
  setToken: (token: string) => void;
}

export interface BookStore {
  books: Book[];
  currentBook: Book | null;
  categories: Category[];
  filters: BookFilters;
  isLoading: boolean;
  error: string | null;
  pagination: {
    currentPage: number;
    lastPage: number;
    total: number;
  };
  fetchBooks: (filters?: BookFilters) => Promise<void>;
  fetchBook: (id: number) => Promise<void>;
  fetchCategories: () => Promise<void>;
  createBook: (data: CreateBookData) => Promise<Book>;
  updateBook: (id: number, data: Partial<CreateBookData>) => Promise<Book>;
  deleteBook: (id: number) => Promise<void>;
  setFilters: (filters: Partial<BookFilters>) => void;
  clearFilters: () => void;
}

// Utility types
export type Nullable<T> = T | null;
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
}; 