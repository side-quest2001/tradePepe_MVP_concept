export interface AuthUser {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  handle: string;
  avatarUrl: string | null;
  coverUrl: string | null;
  activeSince: string;
  bio: string | null;
  emailVerifiedAt: string | null;
  createdAt: string;
}

export interface PublicUserProfile {
  id: string;
  email?: string;
  name: string;
  handle: string;
  avatarUrl: string | null;
  coverUrl: string | null;
  activeSince: string;
  bio: string | null;
  emailVerifiedAt?: string | null;
}

export interface AuthSession {
  id: string;
  userId: string;
  refreshToken: string;
  expiresAt: string;
  createdAt: string;
}

export interface AuthTokenPayload {
  sub: string;
  email: string;
  handle: string;
  type: "access";
  exp: number;
}
