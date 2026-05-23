'use client';

import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';

export function useProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: async () => apiFetch<{ items: unknown[]; pagination: unknown }>('/products').then((response) => response.data)
  });
}
