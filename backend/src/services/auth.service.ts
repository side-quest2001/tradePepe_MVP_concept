import { createHash, randomBytes } from "node:crypto";
import { env } from "../config/env.js";
import { authRepository } from "../repositories/auth.repository.js";
import { ApiError } from "../utils/api-error.js";
import { createAccessToken } from "../utils/jwt.util.js";
import { hashPassword, verifyPassword } from "../utils/password.util.js";
import type { User } from "../db/schema/app.schema.js";
import type {
  ForgotPasswordInput,
  RefreshSessionInput,
  RequestEmailVerificationInput,
  ResetPasswordInput,
  SigninInput,
  SignoutInput,
  SignupInput,
  VerifyEmailInput
} from "../validators/auth.validator.js";

const RESET_TTL_SECONDS = 60 * 30;
const VERIFY_TTL_SECONDS = 60 * 60 * 24;

function normalizeHandle(handle: string) {
  return handle.startsWith("@") ? handle.toLowerCase() : `@${handle.toLowerCase()}`;
}

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function buildPublicUser(user: User, includeEmail = false) {
  return {
    id: user.id,
    ...(includeEmail ? { email: user.email } : {}),
    name: user.name,
    handle: user.handle,
    avatarUrl: user.avatarUrl,
    coverUrl: user.coverUrl,
    activeSince: user.activeSince,
    bio: user.bio,
    emailVerifiedAt: user.emailVerifiedAt?.toISOString() ?? null
  };
}

function createOpaqueToken() {
  return randomBytes(32).toString("hex");
}

function buildAuthPayload(user: User, refreshToken: string) {
  return {
    user: buildPublicUser(user, true),
    accessToken: createAccessToken({
      sub: user.id,
      email: user.email,
      handle: user.handle
    }),
    refreshToken,
    expiresIn: env.AUTH_ACCESS_TTL_SECONDS
  };
}

export class AuthService {
  async signup(input: SignupInput) {
    const existingEmail = await authRepository.findUserByEmail(input.email);
    if (existingEmail) {
      throw new ApiError(409, "Email is already registered");
    }

    const normalizedHandle = normalizeHandle(input.handle);
    const existingHandle = await authRepository.findUserByHandle(normalizedHandle);
    if (existingHandle) {
      throw new ApiError(409, "Handle is already taken");
    }

    const user = await authRepository.createUser({
      email: input.email.toLowerCase(),
      passwordHash: hashPassword(input.password),
      name: input.name.trim(),
      handle: normalizedHandle,
      avatarUrl: null,
      coverUrl: null,
      activeSince: new Date().getFullYear().toString(),
      bio: null
    });

    const refreshToken = createOpaqueToken();
    await authRepository.createSession({
      userId: user.id,
      refreshTokenHash: hashToken(refreshToken),
      expiresAt: new Date(Date.now() + env.AUTH_REFRESH_TTL_SECONDS * 1000)
    });

    const verificationToken = createOpaqueToken();
    await authRepository.createEmailVerificationToken({
      userId: user.id,
      tokenHash: hashToken(verificationToken),
      expiresAt: new Date(Date.now() + VERIFY_TTL_SECONDS * 1000)
    });

    return {
      ...buildAuthPayload(user, refreshToken),
      verificationPreviewToken: verificationToken
    };
  }

  async signin(input: SigninInput) {
    const user = await authRepository.findUserByEmail(input.email);
    if (!user || !verifyPassword(input.password, user.passwordHash)) {
      throw new ApiError(401, "Invalid email or password");
    }

    const refreshToken = createOpaqueToken();
    await authRepository.createSession({
      userId: user.id,
      refreshTokenHash: hashToken(refreshToken),
      expiresAt: new Date(Date.now() + env.AUTH_REFRESH_TTL_SECONDS * 1000)
    });

    return buildAuthPayload(user, refreshToken);
  }

  async refresh(input: RefreshSessionInput) {
    const currentSession = await authRepository.getActiveSessionByRefreshTokenHash(hashToken(input.refreshToken));
    if (!currentSession) {
      throw new ApiError(401, "Refresh session is invalid or expired");
    }

    const user = await authRepository.findUserById(currentSession.userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    await authRepository.revokeSessionById(currentSession.id);

    const refreshToken = createOpaqueToken();
    await authRepository.createSession({
      userId: user.id,
      refreshTokenHash: hashToken(refreshToken),
      expiresAt: new Date(Date.now() + env.AUTH_REFRESH_TTL_SECONDS * 1000)
    });

    return buildAuthPayload(user, refreshToken);
  }

  async signout(userId: string, input: SignoutInput) {
    if (input.refreshToken) {
      await authRepository.revokeSessionByRefreshTokenHash(hashToken(input.refreshToken));
    } else {
      await authRepository.revokeAllSessionsForUser(userId);
    }

    return { signedOut: true };
  }

  async getCurrentUser(userId: string) {
    const user = await authRepository.findUserById(userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    return buildPublicUser(user, true);
  }

  async forgotPassword(input: ForgotPasswordInput) {
    const user = await authRepository.findUserByEmail(input.email);
    if (!user) {
      return {
        sent: true
      };
    }

    const resetToken = createOpaqueToken();
    await authRepository.createPasswordResetToken({
      userId: user.id,
      tokenHash: hashToken(resetToken),
      expiresAt: new Date(Date.now() + RESET_TTL_SECONDS * 1000)
    });

    return {
      sent: true,
      resetPreviewToken: resetToken
    };
  }

  async resetPassword(input: ResetPasswordInput) {
    const resetToken = await authRepository.getUsablePasswordResetToken(hashToken(input.token));
    if (!resetToken) {
      throw new ApiError(400, "Password reset token is invalid or expired");
    }

    await authRepository.updatePassword(resetToken.userId, hashPassword(input.password));
    await authRepository.consumePasswordResetToken(resetToken.id);
    await authRepository.revokeAllSessionsForUser(resetToken.userId);

    return {
      reset: true
    };
  }

  async requestEmailVerification(userId: string, _input?: RequestEmailVerificationInput) {
    const user = await authRepository.findUserById(userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    if (user.emailVerifiedAt) {
      return {
        sent: true,
        alreadyVerified: true
      };
    }

    const verificationToken = createOpaqueToken();
    await authRepository.createEmailVerificationToken({
      userId: user.id,
      tokenHash: hashToken(verificationToken),
      expiresAt: new Date(Date.now() + VERIFY_TTL_SECONDS * 1000)
    });

    return {
      sent: true,
      verificationPreviewToken: verificationToken
    };
  }

  async verifyEmail(input: VerifyEmailInput) {
    const verification = await authRepository.getUsableEmailVerificationToken(hashToken(input.token));
    if (!verification) {
      throw new ApiError(400, "Verification token is invalid or expired");
    }

    const user = await authRepository.markEmailVerified(verification.userId);
    await authRepository.consumeEmailVerificationToken(verification.id);

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    return {
      verified: true,
      user: buildPublicUser(user, true)
    };
  }
}

export const authService = new AuthService();
