import { z } from 'zod';
import type { ApiResponse } from '@cekdulu/shared';
import { clearAuthSession, saveAuthSession } from './auth-session';

// Validation schemas
export const loginSchema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(8, 'Password minimal 8 karakter')
});

export const registerSchema = z
  .object({
    name: z.string().min(2, 'Nama minimal 2 karakter'),
    email: z.string().email('Email tidak valid'),
    password: z.string().min(8, 'Password minimal 8 karakter'),
    confirmPassword: z.string()
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Password tidak sesuai',
    path: ['confirmPassword']
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  status: string;
  roles: string[];
};

export type AuthPayload = {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
};

function resolveApiBase() {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }

  if (typeof window !== 'undefined') {
    return `${window.location.protocol}//${window.location.hostname}:4000/api`;
  }

  return 'http://localhost:4000/api';
}

// Auth API functions
export async function login(credentials: LoginInput): Promise<ApiResponse<AuthPayload>> {
  const apiBase = resolveApiBase();
  let response: Response;

  try {
    response = await fetch(`${apiBase}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
  } catch {
    throw new Error(`Tidak dapat terhubung ke API (${apiBase}). Cek backend API dan konfigurasi NEXT_PUBLIC_API_URL.`);
  }

  if (!response.ok) {
    try {
      const error = await response.json();
      throw new Error(error.message || 'Login gagal');
    } catch {
      throw new Error('Login gagal');
    }
  }

  const data = await response.json();
  if (data.data?.accessToken) {
    saveAuthSession(data.data.accessToken, data.data.refreshToken);
  }

  return data;
}

export async function register(input: RegisterInput): Promise<ApiResponse<AuthPayload>> {
  const { confirmPassword, ...data } = input;
  const apiBase = resolveApiBase();
  let response: Response;

  try {
    response = await fetch(`${apiBase}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  } catch {
    throw new Error(`Tidak dapat terhubung ke API (${apiBase}). Cek backend API dan konfigurasi NEXT_PUBLIC_API_URL.`);
  }

  if (!response.ok) {
    try {
      const error = await response.json();
      throw new Error(error.message || 'Registrasi gagal');
    } catch {
      throw new Error('Registrasi gagal');
    }
  }

  const responseData = await response.json();
  if (responseData.data?.accessToken) {
    saveAuthSession(responseData.data.accessToken, responseData.data.refreshToken);
  }

  return responseData;
}

export async function logout(): Promise<void> {
  clearAuthSession();
}
