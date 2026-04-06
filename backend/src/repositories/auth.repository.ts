import { and, desc, eq, gt, isNull } from "drizzle-orm";
import { db } from "../db/client.js";
import {
  authSessions,
  emailVerificationTokens,
  passwordResetTokens,
  users
} from "../db/schema/app.schema.js";
import type {
  AuthSession,
  EmailVerificationToken,
  NewAuthSession,
  NewUser,
  PasswordResetToken,
  User
} from "../db/schema/app.schema.js";
import type { DbExecutor } from "../types/db.types.js";

export class AuthRepository {
  constructor(private readonly executor: DbExecutor = db) {}

  async findUserByEmail(email: string): Promise<User | null> {
    const results = await this.executor
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase()))
      .limit(1);
    return results[0] ?? null;
  }

  async findUserByHandle(handle: string): Promise<User | null> {
    const normalized = handle.startsWith("@") ? handle.toLowerCase() : `@${handle.toLowerCase()}`;
    const results = await this.executor.select().from(users).where(eq(users.handle, normalized)).limit(1);
    return results[0] ?? null;
  }

  async findUserById(id: string): Promise<User | null> {
    const results = await this.executor.select().from(users).where(eq(users.id, id)).limit(1);
    return results[0] ?? null;
  }

  async createUser(input: NewUser): Promise<User> {
    const results = await this.executor.insert(users).values(input).returning();
    return results[0];
  }

  async markEmailVerified(userId: string) {
    const results = await this.executor
      .update(users)
      .set({
        emailVerifiedAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(users.id, userId))
      .returning();
    return results[0] ?? null;
  }

  async updatePassword(userId: string, passwordHash: string) {
    const results = await this.executor
      .update(users)
      .set({
        passwordHash,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId))
      .returning();
    return results[0] ?? null;
  }

  async createSession(input: NewAuthSession): Promise<AuthSession> {
    const results = await this.executor.insert(authSessions).values(input).returning();
    return results[0];
  }

  async getActiveSessionByRefreshTokenHash(refreshTokenHash: string): Promise<AuthSession | null> {
    const results = await this.executor
      .select()
      .from(authSessions)
      .where(
        and(
          eq(authSessions.refreshTokenHash, refreshTokenHash),
          isNull(authSessions.revokedAt),
          gt(authSessions.expiresAt, new Date())
        )
      )
      .limit(1);
    return results[0] ?? null;
  }

  async revokeSessionById(id: string): Promise<void> {
    await this.executor
      .update(authSessions)
      .set({
        revokedAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(authSessions.id, id));
  }

  async revokeSessionByRefreshTokenHash(refreshTokenHash: string): Promise<void> {
    await this.executor
      .update(authSessions)
      .set({
        revokedAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(authSessions.refreshTokenHash, refreshTokenHash));
  }

  async revokeAllSessionsForUser(userId: string): Promise<void> {
    await this.executor
      .update(authSessions)
      .set({
        revokedAt: new Date(),
        updatedAt: new Date()
      })
      .where(and(eq(authSessions.userId, userId), isNull(authSessions.revokedAt)));
  }

  async createPasswordResetToken(input: {
    userId: string;
    tokenHash: string;
    expiresAt: Date;
  }): Promise<PasswordResetToken> {
    const results = await this.executor.insert(passwordResetTokens).values(input).returning();
    return results[0];
  }

  async getUsablePasswordResetToken(tokenHash: string): Promise<PasswordResetToken | null> {
    const results = await this.executor
      .select()
      .from(passwordResetTokens)
      .where(
        and(
          eq(passwordResetTokens.tokenHash, tokenHash),
          isNull(passwordResetTokens.consumedAt),
          gt(passwordResetTokens.expiresAt, new Date())
        )
      )
      .orderBy(desc(passwordResetTokens.createdAt))
      .limit(1);
    return results[0] ?? null;
  }

  async consumePasswordResetToken(id: string): Promise<void> {
    await this.executor
      .update(passwordResetTokens)
      .set({
        consumedAt: new Date()
      })
      .where(eq(passwordResetTokens.id, id));
  }

  async createEmailVerificationToken(input: {
    userId: string;
    tokenHash: string;
    expiresAt: Date;
  }): Promise<EmailVerificationToken> {
    const results = await this.executor.insert(emailVerificationTokens).values(input).returning();
    return results[0];
  }

  async getUsableEmailVerificationToken(tokenHash: string): Promise<EmailVerificationToken | null> {
    const results = await this.executor
      .select()
      .from(emailVerificationTokens)
      .where(
        and(
          eq(emailVerificationTokens.tokenHash, tokenHash),
          isNull(emailVerificationTokens.consumedAt),
          gt(emailVerificationTokens.expiresAt, new Date())
        )
      )
      .orderBy(desc(emailVerificationTokens.createdAt))
      .limit(1);
    return results[0] ?? null;
  }

  async consumeEmailVerificationToken(id: string): Promise<void> {
    await this.executor
      .update(emailVerificationTokens)
      .set({
        consumedAt: new Date()
      })
      .where(eq(emailVerificationTokens.id, id));
  }
}

export const authRepository = new AuthRepository();
