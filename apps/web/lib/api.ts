import type { ApiResponse } from '@cekdulu/shared';
import { getAccessToken } from './auth-session';

function resolveApiBase() {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }

  // Keep API reachable when frontend is opened from non-localhost domains.
  if (typeof window !== 'undefined') {
    return `${window.location.protocol}//${window.location.hostname}:4000/api`;
  }

  return 'http://localhost:4000/api';
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<ApiResponse<T>> {
  const token = getAccessToken();
  const apiBase = resolveApiBase();
  let response: Response;

  try {
    response = await fetch(`${apiBase}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(init?.headers ?? {})
      },
      cache: 'no-store'
    });
  } catch {
    throw new Error(`Tidak dapat terhubung ke API (${apiBase}). Pastikan backend aktif dan URL API benar.`);
  }

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  return response.json() as Promise<ApiResponse<T>>;
}
