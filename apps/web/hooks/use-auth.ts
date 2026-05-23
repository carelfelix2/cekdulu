'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { clearAuthSession, getAccessToken } from '@/lib/auth-session';
import type { AuthUser } from '@/lib/auth';

interface UseAuthReturn {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  logout: () => void;
}

export function useAuth(): UseAuthReturn {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const bootstrap = async () => {
      const storedToken = getAccessToken();
      setToken(storedToken);

      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await apiFetch<AuthUser>('/auth/me');
        setUser(response.data);
      } catch {
        clearAuthSession();
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    void bootstrap();
  }, []);

  const logout = useCallback(() => {
    clearAuthSession();
    setToken(null);
    setUser(null);
    router.push('/auth/login');
  }, [router]);

  return {
    user,
    token,
    isLoading,
    isAuthenticated: !!token,
    logout
  };
}
