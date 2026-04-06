'use client';

import type { AuthResponse, AuthUser } from '@/lib/api/types';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4000/api/v1';

async function authFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload?.error?.message ?? 'Request failed');
  }
  return payload.data as T;
}

export function signInRequest(input: { email: string; password: string }) {
  return authFetch<AuthResponse>('/auth/signin', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function signUpRequest(input: {
  name: string;
  handle: string;
  email: string;
  password: string;
}) {
  return authFetch<AuthResponse>('/auth/signup', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function refreshSessionRequest(refreshToken: string) {
  return authFetch<AuthResponse>('/auth/refresh', {
    method: 'POST',
    body: JSON.stringify({ refreshToken }),
  });
}

export function forgotPasswordRequest(email: string) {
  return authFetch<{ sent: boolean; resetPreviewToken?: string }>('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

export function resetPasswordRequest(input: { token: string; password: string }) {
  return authFetch<{ reset: boolean }>('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function getMeRequest(accessToken: string) {
  return authFetch<AuthUser>('/auth/me', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export function signOutRequest(accessToken: string, refreshToken?: string | null) {
  return authFetch<{ signedOut: boolean }>('/auth/signout', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(refreshToken ? { refreshToken } : {}),
  });
}
