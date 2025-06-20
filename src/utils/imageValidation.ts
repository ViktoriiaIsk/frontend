/**
 * Image validation utilities according to backend API specification
 */

// Supported image formats according to API
const SUPPORTED_IMAGE_FORMATS = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'] as const;

// Maximum file size (2MB as specified in API docs)
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB in bytes

export interface ImageValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validate a single image file according to API requirements
 * @param file - File to validate
 * @returns Validation result
 */
export const validateImageFile = (file: File): ImageValidationResult => {
  // Check file type
  if (!SUPPORTED_IMAGE_FORMATS.includes(file.type as any)) {
    return {
      isValid: false,
      error: `Unsupported file format. Please use: ${SUPPORTED_IMAGE_FORMATS.join(', ')}`
    };
  }

  // Check file size (max 2MB)
  if (file.size > MAX_FILE_SIZE) {
    const maxSizeMB = MAX_FILE_SIZE / (1024 * 1024);
    const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
    return {
      isValid: false,
      error: `File size too large. Maximum ${maxSizeMB}MB allowed, but file is ${fileSizeMB}MB`
    };
  }

  return { isValid: true };
};

/**
 * Validate multiple image files
 * @param files - Array of files to validate
 * @returns Validation results for all files
 */
export const validateImageFiles = (files: File[]): {
  isValid: boolean;
  errors: string[];
  validFiles: File[];
} => {
  const errors: string[] = [];
  const validFiles: File[] = [];

  files.forEach((file, index) => {
    const result = validateImageFile(file);
    if (result.isValid) {
      validFiles.push(file);
    } else {
      errors.push(`File ${index + 1} (${file.name}): ${result.error}`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    validFiles
  };
};

/**
 * Get human-readable file size
 * @param bytes - Size in bytes
 * @returns Formatted size string
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Check if file is an image
 * @param file - File to check
 * @returns True if file is an image
 */
export const isImageFile = (file: File): boolean => {
  return file.type.startsWith('image/');
};

/**
 * Create image preview URL
 * @param file - Image file
 * @returns Preview URL or null if not an image
 */
export const createImagePreview = (file: File): string | null => {
  if (!isImageFile(file)) return null;
  return URL.createObjectURL(file);
};

/**
 * Cleanup image preview URL
 * @param url - Preview URL to cleanup
 */
export const cleanupImagePreview = (url: string): void => {
  if (url.startsWith('blob:')) {
    URL.revokeObjectURL(url);
  }
}; 