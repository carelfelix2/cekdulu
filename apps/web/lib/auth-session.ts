const accessTokenKey = 'cekdulu.accessToken';
const refreshTokenKey = 'cekdulu.refreshToken';
const authChangedEvent = 'cekdulu-auth-changed';

function emitAuthChanged() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event(authChangedEvent));
}

export function getAccessToken() {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(accessTokenKey);
}

export function saveAuthSession(accessToken: string, refreshToken: string) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(accessTokenKey, accessToken);
  window.localStorage.setItem(refreshTokenKey, refreshToken);
  emitAuthChanged();
}

export function clearAuthSession() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(accessTokenKey);
  window.localStorage.removeItem(refreshTokenKey);
  emitAuthChanged();
}

export const authSessionChangedEventName = authChangedEvent;
