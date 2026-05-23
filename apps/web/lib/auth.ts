import { z } from 'zod';
import type { ApiResponse } from '@cekdulu/shared';

// Validation schemas
export const loginSchema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter')
});

export const registerSchema = z
  .object({
    name: z.string().min(2, 'Nama minimal 2 karakter'),
    email: z.string().email('Email tidak valid'),
    password: z.string().min(6, 'Password minimal 6 karakter'),
    confirmPassword: z.string()
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Password tidak sesuai',
    path: ['confirmPassword']
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;

// Auth API functions
export async function login(credentials: LoginInput): Promise<ApiResponse<{ token: string; user: any }>> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api'}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Login gagal');
  }

  const data = await response.json();
  
  // Store token in localStorage
  if (data.data?.token) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('authToken', data.data.token);
    }
  }

  return data;
}

export async function register(input: RegisterInput): Promise<ApiResponse<{ token: string; user: any }>> {
  const { confirmPassword, ...data } = input;

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api'}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Registrasi gagal');
  }

  const responseData = await response.json();

  // Store token in localStorage
  if (responseData.data?.token) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('authToken', responseData.data.token);
    }
  }

  return responseData;
}

export async function logout(): Promise<void> {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('authToken');
  }
}
