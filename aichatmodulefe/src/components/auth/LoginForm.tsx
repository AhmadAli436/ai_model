'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { z } from 'zod';
import { useAuth } from '@/lib/auth/context';
import { LoginSchema } from '@/lib/api/auth';

type LoginFormData = z.infer<typeof LoginSchema>;

export default function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<
    Partial<Record<keyof LoginFormData, string>>
  >({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name as keyof LoginFormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
    if (apiError) setApiError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);

    // Validate form
    try {
      LoginSchema.parse(formData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Partial<Record<keyof LoginFormData, string>> = {};
        error.errors.forEach(err => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as keyof LoginFormData] = err.message;
          }
        });
        setErrors(fieldErrors);
        return;
      }
    }

    setIsLoading(true);
    try {
      await login(formData.email, formData.password);
      router.push('/dashboard');
    } catch (error: any) {
      let errorMessage = 'Login failed. Please try again.';

      // Handle Zod validation errors (from schema parsing)
      if (error instanceof z.ZodError) {
        const messages = error.errors.map(e => {
          const field =
            e.path && e.path.length > 0 ? e.path.join('.') : 'field';
          return `${field}: ${e.message}`;
        });
        errorMessage = `Validation error: ${messages.join(', ')}`;
      } else if (error.response?.data) {
        const data = error.response.data;

        // Handle Zod validation error array from backend
        if (Array.isArray(data) && data.length > 0) {
          const messages = data
            .map((err: any) => {
              if (typeof err === 'object' && err.message) {
                const field =
                  err.path && err.path.length > 0
                    ? err.path.join('.')
                    : 'field';
                return `${field}: ${err.message}`;
              }
              return null;
            })
            .filter((msg: string | null) => msg !== null);

          if (messages.length > 0) {
            errorMessage = `Validation error: ${messages.join('. ')}`;
          }
        }
        // Handle object with {message, code} structure
        else if (data && typeof data === 'object' && !Array.isArray(data)) {
          if (typeof data.message === 'string') {
            errorMessage = data.message;
          } else if (typeof data.error === 'string') {
            errorMessage = data.error;
          } else if (
            data.error &&
            typeof data.error === 'object' &&
            typeof data.error.message === 'string'
          ) {
            errorMessage = data.error.message;
          } else if (data.code && data.message) {
            // Handle {code, message} structure
            errorMessage =
              typeof data.message === 'string'
                ? data.message
                : String(data.message);
          }
        } else if (typeof data === 'string') {
          errorMessage = data;
        }
      } else if (error.message && typeof error.message === 'string') {
        errorMessage = error.message;
      }

      // Ensure errorMessage is always a string
      setApiError(String(errorMessage));
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-1 items-center justify-center overflow-y-auto bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-md py-4">
        <div className="mb-6 sm:mb-8">
          <h2 className="mb-2 text-2xl font-bold text-gray-900 sm:text-3xl">
            Log in
          </h2>
          <p className="text-sm text-gray-600 sm:text-base">
            Monitor AI chat performance, uncover weak spots, and optimize your
            inbound and outbound conversation operations.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          {apiError && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-xs text-red-700 sm:px-4 sm:py-3 sm:text-sm">
              {apiError}
            </div>
          )}

          <div>
            <label
              htmlFor="email"
              className="mb-1.5 block text-sm font-medium text-gray-700 sm:mb-2"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-purple-500 sm:px-4 sm:py-3 sm:text-base ${
                errors.email
                  ? 'border-red-300 bg-red-50'
                  : 'border-gray-300 bg-white'
              }`}
              placeholder="Enter your email"
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-600 sm:text-sm">
                {errors.email}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-1.5 block text-sm font-medium text-gray-700 sm:mb-2"
            >
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`w-full rounded-lg border px-3 py-2.5 pr-10 text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-purple-500 sm:px-4 sm:py-3 sm:pr-12 sm:text-base ${
                  errors.password
                    ? 'border-red-300 bg-red-50'
                    : 'border-gray-300 bg-white'
                }`}
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none sm:right-3"
              >
                {showPassword ? (
                  <svg
                    className="h-4 w-4 sm:h-5 sm:w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                    />
                  </svg>
                ) : (
                  <svg
                    className="h-4 w-4 sm:h-5 sm:w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                )}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-xs text-red-600 sm:text-sm">
                {errors.password}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between">
            <Link
              href="/forgot-password"
              className="text-xs font-medium text-purple-600 hover:text-purple-700 sm:text-sm"
            >
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-lg bg-purple-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 sm:py-3 sm:text-base"
          >
            {isLoading ? 'Logging in...' : 'Log in'}
          </button>
        </form>

        <div className="mt-4 text-center sm:mt-6">
          <p className="text-xs text-gray-600 sm:text-sm">
            Don&apos;t have an account?{' '}
            <Link
              href="/signup"
              className="font-medium text-purple-600 hover:text-purple-700"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
