'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { LoginCredentials } from '@/types';
import { extractErrorMessage } from '@/utils';

/**
 * Login form component
 */
const LoginForm: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isLoading } = useAuthStore();
  
  const [formData, setFormData] = useState<LoginCredentials>({
    email: '',
    password: '',
    remember: false,
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      await login(formData);
      
      // Check for redirect parameter
      const redirectTo = searchParams.get('redirect');
      router.push(redirectTo || '/'); // Redirect to intended page or home
    } catch (error: unknown) {
      const errorMessage = extractErrorMessage(error);
      
      // Handle validation errors
      if (error && typeof error === 'object' && 'errors' in error) {
        const errors = (error as { errors: Record<string, string[]> }).errors;
        Object.entries(errors).forEach(([field, messages]) => {
          if (Array.isArray(messages) && messages.length > 0) {
            setErrors(prev => ({
              ...prev,
              [field as string]: messages[0]
            }));
          }
        });
      } else {
        setErrors({ general: errorMessage });
      }
    }
  };

  return (
    <div className="min-h-screen bg-accent-cream flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-neutral-900">
            Welcome back
          </h2>
          <p className="mt-2 text-sm text-neutral-600">
            Sign in to your BookSwap account
          </p>
        </div>

        {/* Form */}
        <Card>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* General Error */}
            {errors.general && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-600">{errors.general}</p>
              </div>
            )}

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-2">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                  errors.email ? 'border-red-300' : 'border-neutral-300'
                }`}
                placeholder="Enter your email"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-neutral-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 pr-10 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                    errors.password ? 'border-red-300' : 'border-neutral-300'
                  }`}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-neutral-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-neutral-400" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
            </div>

            {/* Remember Me */}
              <div className="flex items-center">
                <input
                  id="remember"
                  name="remember"
                  type="checkbox"
                  checked={formData.remember}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded"
                />
                <label htmlFor="remember" className="ml-2 block text-sm text-neutral-700">
                  Remember me
                </label>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              loading={isLoading}
              className="w-full"
              size="lg"
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </Button>

            {/* Register Link */}
            <div className="text-center space-y-3">
              <p className="text-sm text-neutral-600">
                Don&apos;t have an account?{' '}
                <Link href="/auth/register" className="text-primary-600 hover:text-primary-500 font-medium">
                  Sign up
                </Link>
              </p>
              
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
      </div>
    </div>
  );
};

export default LoginForm; 