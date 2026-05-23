'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ZodError, z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface AuthFormProps {
  type: 'login' | 'register';
  schema: any;
  onSubmit: (data: any) => Promise<any>;
  fields: Array<{
    name: string;
    label: string;
    type?: string;
    placeholder?: string;
  }>;
  submitButtonText: string;
  footerText: string;
  footerLink: string;
  footerLinkHref: string;
}

interface FieldErrors {
  [key: string]: string;
}

export function AuthForm({
  type,
  schema,
  onSubmit,
  fields,
  submitButtonText,
  footerText,
  footerLink,
  footerLinkHref
}: AuthFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formData, setFormData] = useState<Record<string, string>>(
    fields.reduce(
      (acc, field) => ({
        ...acc,
        [field.name]: ''
      }),
      {}
    )
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear field error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setFieldErrors({});

    try {
      // Validate form data
      const validatedData = schema.parse(formData);

      // Call the API
      await onSubmit(validatedData);

      // Redirect on success
      router.push(type === 'login' ? '/dashboard' : '/login?registered=true');
    } catch (err) {
      if (err instanceof ZodError) {
        // Handle validation errors
        const errors: FieldErrors = {};
        err.errors.forEach((error) => {
          const path = error.path[0] as string;
          errors[path] = error.message;
        });
        setFieldErrors(errors);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Ada kesalahan, silakan coba lagi');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto p-8">
      <div className="space-y-2 mb-8 text-center">
        <h1 className="text-3xl font-bold text-slate-900">
          {type === 'login' ? 'Masuk' : 'Daftar'}
        </h1>
        <p className="text-slate-600">
          {type === 'login'
            ? 'Nikmati pengalaman berbelanja yang dipersonalisasi'
            : 'Buat akun untuk mendapatkan rekomendasi terbaik'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {fields.map((field) => (
          <div key={field.name} className="space-y-2">
            <label
              htmlFor={field.name}
              className="block text-sm font-medium text-slate-700"
            >
              {field.label}
            </label>
            <input
              id={field.name}
              name={field.name}
              type={field.type || 'text'}
              placeholder={field.placeholder}
              value={formData[field.name]}
              onChange={handleChange}
              disabled={isLoading}
              className={`w-full px-4 py-2.5 rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500/20 disabled:bg-slate-50 disabled:cursor-not-allowed ${
                fieldErrors[field.name]
                  ? 'border-red-300 bg-red-50'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            />
            {fieldErrors[field.name] && (
              <p className="text-sm text-red-600">{fieldErrors[field.name]}</p>
            )}
          </div>
        ))}

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full mt-6"
          variant="primary"
        >
          {isLoading ? 'Memproses...' : submitButtonText}
        </Button>
      </form>

      <div className="mt-6 text-center text-sm text-slate-600">
        {footerText}{' '}
        <a href={footerLinkHref} className="font-medium text-orange-600 hover:text-orange-700">
          {footerLink}
        </a>
      </div>
    </Card>
  );
}
