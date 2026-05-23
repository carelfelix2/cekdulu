const accessTokenKey = 'cekdulu.accessToken';
const refreshTokenKey = 'cekdulu.refreshToken';

export function getAccessToken() {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(accessTokenKey);
}

export function saveAuthSession(accessToken: string, refreshToken: string) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(accessTokenKey, accessToken);
  window.localStorage.setItem(refreshTokenKey, refreshToken);
}

export function clearAuthSession() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(accessTokenKey);
  window.localStorage.removeItem(refreshTokenKey);
}
