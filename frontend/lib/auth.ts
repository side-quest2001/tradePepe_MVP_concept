export const ACCESS_TOKEN_COOKIE = 'tradepepe_access_token';
export const REFRESH_TOKEN_STORAGE = 'tradepepe_refresh_token';

export function setAccessTokenCookie(token: string, maxAgeSeconds = 60 * 60) {
  if (typeof document === 'undefined') return;
  document.cookie = `${ACCESS_TOKEN_COOKIE}=${token}; Path=/; Max-Age=${maxAgeSeconds}; SameSite=Lax`;
}

export function clearAccessTokenCookie() {
  if (typeof document === 'undefined') return;
  document.cookie = `${ACCESS_TOKEN_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`;
}

export function getAccessTokenFromBrowser() {
  if (typeof document === 'undefined') return null;
  const match = document.cookie
    .split('; ')
    .find((part) => part.startsWith(`${ACCESS_TOKEN_COOKIE}=`));
  return match?.split('=').slice(1).join('=') ?? null;
}

export function setRefreshToken(token: string) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(REFRESH_TOKEN_STORAGE, token);
}

export function getRefreshToken() {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(REFRESH_TOKEN_STORAGE);
}

export function clearRefreshToken() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(REFRESH_TOKEN_STORAGE);
}
