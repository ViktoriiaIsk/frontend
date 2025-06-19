'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { useAuthStore } from '@/store/authStore';
import { RegisterData } from '@/types';
import { extractErrorMessage } from '@/utils';

// Validation schema
const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(255, 'Name is too long'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters').max(255, 'Password is too long'),
  password_confirmation: z.string(),
}).refine(data => data.password === data.password_confirmation, {
  message: "Passwords don't match",
  path: ["password_confirmation"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

/**
 * Register page component content
 */
const RegisterPageContent: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [serverError, setServerError] = useState<string | null>(null);
  
  // Auth store
  const { register: registerUser, isLoading } = useAuthStore();

  // Form setup
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  // Handle form submission
  const onSubmit = async (data: RegisterFormData) => {
    setServerError(null);

    try {
      const registerData: RegisterData = {
        name: data.name,
        email: data.email,
        password: data.password,
        password_confirmation: data.password_confirmation,
      };

      await registerUser(registerData);
      
      // Check for redirect parameter
      const redirectTo = searchParams.get('redirect');
      router.push(redirectTo || '/profile'); // Redirect to intended page or profile
    } catch (error: unknown) {
      const errorMessage = extractErrorMessage(error);
      
      // Handle validation errors
      if (error && typeof error === 'object' && 'errors' in error) {
        const errors = (error as { errors: Record<string, string[]> }).errors;
        Object.entries(errors).forEach(([field, messages]) => {
          if (Array.isArray(messages) && messages.length > 0) {
            setError(field as keyof RegisterFormData, {
              type: 'server',
              message: messages[0],
            });
          }
        });
      } else {
        setServerError(errorMessage);
      }
    }
  };

  return (
    <div className="min-h-screen bg-accent-cream flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <Link href="/" className="inline-block">
            <div className="flex items-center justify-center space-x-2">
              <span className="text-3xl">📖</span>
              <span className="text-2xl font-bold text-primary-700">BookSwap</span>
            </div>
          </Link>
          <h2 className="mt-6 text-3xl font-bold text-neutral-900">
            Create Account
          </h2>
          <p className="mt-2 text-sm text-neutral-600">
            Join our community of book lovers
          </p>
        </div>

        {/* Register Form */}
        <Card className="max-w-md mx-auto">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Server Error */}
            {serverError && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <div className="flex">
                  <div className="text-red-400 mr-3">⚠️</div>
                  <div className="text-sm text-red-700">{serverError}</div>
                </div>
              </div>
            )}

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                {...register('name')}
                className={`input ${errors.name ? 'input-error' : ''}`}
                placeholder="Enter your full name"
                autoComplete="name"
              />
              {errors.name && (
                <p className="text-red-600 text-sm mt-1">{errors.name.message}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                {...register('email')}
                className={`input ${errors.email ? 'input-error' : ''}`}
                placeholder="Enter your email"
                autoComplete="email"
              />
              {errors.email && (
                <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Password
              </label>
              <input
                type="password"
                {...register('password')}
                className={`input ${errors.password ? 'input-error' : ''}`}
                placeholder="Create a strong password"
                autoComplete="new-password"
              />
              {errors.password && (
                <p className="text-red-600 text-sm mt-1">{errors.password.message}</p>
              )}
              <p className="text-xs text-neutral-500 mt-1">
                Password must be at least 8 characters long
              </p>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                {...register('password_confirmation')}
                className={`input ${errors.password_confirmation ? 'input-error' : ''}`}
                placeholder="Confirm your password"
                autoComplete="new-password"
              />
              {errors.password_confirmation && (
                <p className="text-red-600 text-sm mt-1">{errors.password_confirmation.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              loading={isLoading}
              disabled={isLoading}
              className="w-full"
              size="lg"
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </Button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-neutral-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-neutral-500">Already have an account?</span>
              </div>
            </div>

            {/* Login Link */}
            <div className="space-y-3">
              <Link href="/auth/login">
                <Button variant="secondary" className="w-full" size="lg">
                  Sign In
                </Button>
              </Link>
              
              {/* Back button if redirect parameter exists */}
              {searchParams.get('redirect') && (
                <Button
                  type="button"
                  onClick={() => router.back()}
                  variant="secondary"
                  className="w-full border border-gray-300"
                  size="sm"
                >
                  Go Back
                </Button>
              )}
            </div>
          </form>
        </Card>

        {/* Benefits */}
        <div className="text-center space-y-4">
          <h3 className="text-lg font-medium text-neutral-900">
            Why join BookSwap?
          </h3>
          <div className="grid grid-cols-1 gap-3 text-sm text-neutral-600">
            <div className="flex items-center justify-center space-x-2">
              <span>📚</span>
              <span>Buy and sell books easily</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <span>🔒</span>
              <span>Secure payments and transactions</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <span>🌍</span>
              <span>Connect with readers worldwide</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Loading fallback component
function RegisterPageFallback() {
  return (
    <div className="min-h-screen bg-accent-cream flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Link href="/" className="inline-block">
            <div className="flex items-center justify-center space-x-2">
              <span className="text-3xl">📖</span>
              <span className="text-2xl font-bold text-primary-700">BookSwap</span>
            </div>
          </Link>
          <div className="mt-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-neutral-600">Loading...</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Register page component with Suspense boundary
 */
const RegisterPage: React.FC = () => {
  return (
    <Suspense fallback={<RegisterPageFallback />}>
      <RegisterPageContent />
    </Suspense>
  );
};

export default RegisterPage; 