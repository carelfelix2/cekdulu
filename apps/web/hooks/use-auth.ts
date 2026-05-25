'use client';

import { useEffect, useState, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { authSessionChangedEventName, clearAuthSession, getAccessToken } from '@/lib/auth-session';
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
  const pathname = usePathname();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const syncAuth = useCallback(async () => {
    const storedToken = getAccessToken();
    setToken(storedToken);

    if (!storedToken) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
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
  }, []);

  useEffect(() => {
    void syncAuth();
  }, [syncAuth, pathname]);

  useEffect(() => {
    const onSessionChanged = () => {
      void syncAuth();
    };

    const onStorage = (event: StorageEvent) => {
      if (!event.key || event.key.startsWith('cekdulu.')) {
        void syncAuth();
      }
    };

    window.addEventListener(authSessionChangedEventName, onSessionChanged);
    window.addEventListener('storage', onStorage);

    return () => {
      window.removeEventListener(authSessionChangedEventName, onSessionChanged);
      window.removeEventListener('storage', onStorage);
    };
  }, [syncAuth]);

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
    isAuthenticated: !!user,
    logout
  };
}
