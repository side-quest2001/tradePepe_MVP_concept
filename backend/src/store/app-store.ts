import { randomBytes, randomUUID } from "node:crypto";
import { hashPassword } from "../utils/password.util.js";
import type {
  AuthSession,
  AuthUser,
  PublicUserProfile,
} from "../types/auth.types.js";
import type {
  CommunityCommentDto,
  FlashNewsDto,
  EconomicIndicatorRowDto,
} from "../types/community.types.js";

const defaultPassword = "TradePepe123!";
const now = new Date().toISOString();

const users: AuthUser[] = [
  {
    id: "11111111-1111-4111-8111-111111111111",
    email: "pepe@tradepepe.dev",
    passwordHash: hashPassword(defaultPassword),
    name: "Siddha PePe",
    handle: "@siddhapepe",
    avatarUrl: "https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?auto=format&fit=crop&w=200&q=80",
    coverUrl: "https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=1600&q=80",
    activeSince: "2021",
    bio: "Execution-first trader building a cleaner review process every month.",
    emailVerifiedAt: now,
    createdAt: now,
  },
  {
    id: "22222222-2222-4222-8222-222222222222",
    email: "flyingtrader11@tradepepe.dev",
    passwordHash: hashPassword(defaultPassword),
    name: "Flyingtrader11",
    handle: "@flyingtrader11",
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
    coverUrl: null,
    activeSince: "2022",
    bio: "Sharing breakout reviews and runner management notes.",
    emailVerifiedAt: now,
    createdAt: now,
  },
  {
    id: "33333333-3333-4333-8333-333333333333",
    email: "roundhog34@tradepepe.dev",
    passwordHash: hashPassword(defaultPassword),
    name: "Roundhog34",
    handle: "@roundhog34",
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=64&q=80",
    coverUrl: null,
    activeSince: "2023",
    bio: "Mostly intraday and index options.",
    emailVerifiedAt: now,
    createdAt: now,
  },
];

const sessions = new Map<string, AuthSession>();
const commentsByPostId = new Map<string, CommunityCommentDto[]>();
const likesByPostId = new Map<string, Set<string>>();
const followsByUserId = new Map<string, Set<string>>();

const flashNews: FlashNewsDto[] = [
  {
    id: randomUUID(),
    title: "Broader Market News",
    summary: "Nifty IT index drops 2% as US tech stocks face selloff; TCS and Infosys lead declines.",
    source: "Market Desk",
    createdAt: now,
  },
  {
    id: randomUUID(),
    title: "RBI Repo Rate",
    summary: "RBI keeps repo rate unchanged at 6.50%; maintains withdrawal of accommodation stance.",
    source: "Macro Wire",
    createdAt: now,
  },
  {
    id: randomUUID(),
    title: "FII/DII Flows",
    summary: "Foreign funds turn net sellers while domestic institutions cushion broader market volatility.",
    source: "Flows Monitor",
    createdAt: now,
  },
];

const economicIndicators: EconomicIndicatorRowDto[] = [
  { country: "India", indicator: "Manufacturing PMI", september: "57.5", october: "57.4", november: "56.9", december: "56.7" },
  { country: "India", indicator: "Services PMI", september: "58.1", october: "58.5", november: "58.8", december: "59.2" },
  { country: "USA", indicator: "Inflation Rate", september: "3.1", october: "3.2", november: "3.1", december: "3.0" },
  { country: "USA", indicator: "GDP Growth Rate", september: "2.8", october: "2.9", november: "2.9", december: "2.7" },
];

export function listUsers() {
  return users;
}

export function findUserByEmail(email: string) {
  return users.find((user) => user.email.toLowerCase() === email.toLowerCase()) ?? null;
}

export function findUserByHandle(handle: string) {
  const normalized = handle.startsWith("@") ? handle.toLowerCase() : `@${handle.toLowerCase()}`;
  return users.find((user) => user.handle.toLowerCase() === normalized) ?? null;
}

export function findUserById(id: string) {
  return users.find((user) => user.id === id) ?? null;
}

export function createUser(input: {
  email: string;
  passwordHash: string;
  name: string;
  handle: string;
}) {
  const user: AuthUser = {
    id: randomUUID(),
    email: input.email,
    passwordHash: input.passwordHash,
    name: input.name,
    handle: input.handle.startsWith("@") ? input.handle : `@${input.handle}`,
    avatarUrl: null,
    coverUrl: null,
    activeSince: new Date().getFullYear().toString(),
    bio: null,
    emailVerifiedAt: null,
    createdAt: new Date().toISOString(),
  };
  users.unshift(user);
  return user;
}

export function toPublicUser(user: AuthUser, includeEmail = false): PublicUserProfile {
  return {
    id: user.id,
    ...(includeEmail ? { email: user.email } : {}),
    name: user.name,
    handle: user.handle,
    avatarUrl: user.avatarUrl,
    coverUrl: user.coverUrl,
    activeSince: user.activeSince,
    bio: user.bio,
  };
}

export function createSession(userId: string, expiresAt: string) {
  const refreshToken = randomBytes(32).toString("hex");
  const session: AuthSession = {
    id: randomUUID(),
    userId,
    refreshToken,
    expiresAt,
    createdAt: new Date().toISOString(),
  };
  sessions.set(refreshToken, session);
  return session;
}

export function getSession(refreshToken: string) {
  return sessions.get(refreshToken) ?? null;
}

export function rotateSession(refreshToken: string, expiresAt: string) {
  const current = sessions.get(refreshToken);
  if (!current) return null;
  sessions.delete(refreshToken);
  return createSession(current.userId, expiresAt);
}

export function revokeSession(refreshToken: string) {
  sessions.delete(refreshToken);
}

export function revokeAllUserSessions(userId: string) {
  for (const [token, session] of sessions.entries()) {
    if (session.userId === userId) sessions.delete(token);
  }
}

export function listComments(postId: string) {
  return commentsByPostId.get(postId) ?? [];
}

export function addComment(postId: string, comment: CommunityCommentDto) {
  const current = commentsByPostId.get(postId) ?? [];
  current.unshift(comment);
  commentsByPostId.set(postId, current);
}

export function getLikeCount(postId: string) {
  return likesByPostId.get(postId)?.size ?? 0;
}

export function toggleLike(postId: string, userId: string) {
  const likes = likesByPostId.get(postId) ?? new Set<string>();
  if (likes.has(userId)) {
    likes.delete(userId);
  } else {
    likes.add(userId);
  }
  likesByPostId.set(postId, likes);
  return likes.size;
}

export function toggleFollow(targetUserId: string, followerUserId: string) {
  const follows = followsByUserId.get(followerUserId) ?? new Set<string>();
  if (follows.has(targetUserId)) {
    follows.delete(targetUserId);
  } else {
    follows.add(targetUserId);
  }
  followsByUserId.set(followerUserId, follows);
  return follows.has(targetUserId);
}

export function getFollowingCount(userId: string) {
  return followsByUserId.get(userId)?.size ?? 21;
}

export function getFollowersCount(userId: string) {
  let total = 0;
  for (const followSet of followsByUserId.values()) {
    if (followSet.has(userId)) total += 1;
  }
  return total || 109;
}

export function getFlashNews() {
  return flashNews;
}

export function getEconomicIndicators() {
  return economicIndicators;
}
