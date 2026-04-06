import { authRepository } from "../repositories/auth.repository.js";
import { communityRepository } from "../repositories/community.repository.js";
import { ApiError } from "../utils/api-error.js";
import { communityService } from "./community.service.js";
import type { UserProfileDto } from "../types/community.types.js";

function toPublicProfile(
  user: NonNullable<Awaited<ReturnType<typeof authRepository.findUserById>>>,
  includeEmail: boolean,
  stats: UserProfileDto["stats"],
  followingIds?: string[]
): UserProfileDto {
  return {
    id: user.id,
    ...(includeEmail ? { email: user.email } : {}),
    name: user.name,
    handle: user.handle,
    avatarUrl: user.avatarUrl,
    coverUrl: user.coverUrl,
    activeSince: user.activeSince,
    bio: user.bio,
    stats,
    ...(includeEmail ? { followingIds } : {})
  };
}

export class ProfileService {
  async getMyProfile(userId: string): Promise<UserProfileDto> {
    const user = await authRepository.findUserById(userId);
    if (!user) throw new ApiError(404, "User not found");
    return this.buildProfile(user.id, true);
  }

  async getPublicProfile(handle: string): Promise<UserProfileDto> {
    const user = await authRepository.findUserByHandle(handle);
    if (!user) throw new ApiError(404, "Profile not found");
    return this.buildProfile(user.id, false);
  }

  async updateMyProfile(
    userId: string,
    input: {
      name?: string;
      handle?: string;
      bio?: string | null;
      avatarUrl?: string | null;
      coverUrl?: string | null;
    }
  ): Promise<UserProfileDto> {
    const currentUser = await authRepository.findUserById(userId);
    if (!currentUser) throw new ApiError(404, "User not found");

    const normalizedHandle =
      typeof input.handle === "string" && input.handle.trim().length > 0
        ? input.handle.trim().startsWith("@")
          ? input.handle.trim().toLowerCase()
          : `@${input.handle.trim().toLowerCase()}`
        : undefined;

    if (normalizedHandle && normalizedHandle !== currentUser.handle) {
      const existing = await authRepository.findUserByHandle(normalizedHandle);
      if (existing && existing.id !== userId) {
        throw new ApiError(409, "That handle is already taken");
      }
    }

    await authRepository.updateUserProfile(userId, {
      name: input.name?.trim() || currentUser.name,
      handle: normalizedHandle ?? currentUser.handle,
      bio: input.bio === undefined ? currentUser.bio : input.bio,
      avatarUrl: input.avatarUrl === undefined ? currentUser.avatarUrl : input.avatarUrl,
      coverUrl: input.coverUrl === undefined ? currentUser.coverUrl : input.coverUrl
    });

    return this.buildProfile(userId, true);
  }

  async toggleFollow(targetUserId: string, followerUserId: string) {
    if (targetUserId === followerUserId) {
      throw new ApiError(400, "You cannot follow your own profile");
    }

    const existing = await communityRepository.findFollow(targetUserId, followerUserId);
    if (existing) {
      await communityRepository.removeFollow(targetUserId, followerUserId);
    } else {
      await communityRepository.addFollow(targetUserId, followerUserId);
    }

    return {
      targetUserId,
      following: !existing
    };
  }

  private async buildProfile(userId: string, includeEmail: boolean): Promise<UserProfileDto> {
    const user = await authRepository.findUserById(userId);
    if (!user) throw new ApiError(404, "User not found");

    const [feed, following, followers, followingIds] = await Promise.all([
      communityService.listFeed(),
      communityRepository.countFollowing(user.id),
      communityRepository.countFollowers(user.id),
      includeEmail ? communityRepository.listFollowingTargetIds(user.id) : Promise.resolve([])
    ]);

    const published = feed.filter((item) => item.author.id === user.id).length;

    return toPublicProfile(user, includeEmail, {
      trades: published,
      following,
      followers,
      published
    }, includeEmail ? followingIds : undefined);
  }
}

export const profileService = new ProfileService();
