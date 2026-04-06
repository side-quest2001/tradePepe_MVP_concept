'use client';

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { AuthUser } from '@/lib/api/types';
import {
  clearAccessTokenCookie,
  clearRefreshToken,
  getAccessTokenFromBrowser,
  getRefreshToken,
  setAccessTokenCookie,
  setRefreshToken,
} from '@/lib/auth';
import {
  getMeRequest,
  refreshSessionRequest,
  signInRequest,
  signOutRequest,
  signUpRequest,
} from '@/lib/api/auth-client';

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  signIn: (input: { email: string; password: string }) => Promise<void>;
  signUp: (input: {
    name: string;
    handle: string;
    email: string;
    password: string;
  }) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

async function hydrateUser() {
  let accessToken = getAccessTokenFromBrowser();
  if (!accessToken) {
    const refreshToken = getRefreshToken();
    if (refreshToken) {
      const refreshed = await refreshSessionRequest(refreshToken);
      setAccessTokenCookie(refreshed.accessToken, refreshed.expiresIn);
      setRefreshToken(refreshed.refreshToken);
      accessToken = refreshed.accessToken;
    }
  }

  if (!accessToken) return null;
  return getMeRequest(accessToken);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    setLoading(true);
    try {
      const currentUser = await hydrateUser();
      setUser(currentUser);
    } catch {
      clearAccessTokenCookie();
      clearRefreshToken();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refreshUser();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      signIn: async (input) => {
        const session = await signInRequest(input);
        setAccessTokenCookie(session.accessToken, session.expiresIn);
        setRefreshToken(session.refreshToken);
        setUser(session.user);
      },
      signUp: async (input) => {
        const session = await signUpRequest(input);
        setAccessTokenCookie(session.accessToken, session.expiresIn);
        setRefreshToken(session.refreshToken);
        setUser(session.user);
      },
      signOut: async () => {
        try {
          const accessToken = getAccessTokenFromBrowser();
          const refreshToken = getRefreshToken();
          if (accessToken) {
            await signOutRequest(accessToken, refreshToken);
          }
        } catch {
          // best-effort signout
        } finally {
          clearAccessTokenCookie();
          clearRefreshToken();
          setUser(null);
        }
      },
      refreshUser,
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
