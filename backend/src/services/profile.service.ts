import { authRepository } from "../repositories/auth.repository.js";
import { communityRepository } from "../repositories/community.repository.js";
import { ApiError } from "../utils/api-error.js";
import { communityService } from "./community.service.js";
import type { UserProfileDto } from "../types/community.types.js";

function toPublicProfile(
  user: NonNullable<Awaited<ReturnType<typeof authRepository.findUserById>>>,
  includeEmail: boolean,
  stats: UserProfileDto["stats"]
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
    stats
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

  async toggleFollow(targetUserId: string, followerUserId: string) {
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

    const [feed, following, followers] = await Promise.all([
      communityService.listFeed(),
      communityRepository.countFollowing(user.id),
      communityRepository.countFollowers(user.id)
    ]);

    const published = feed.filter((item) => item.author.id === user.id).length;

    return toPublicProfile(user, includeEmail, {
      trades: 300,
      following,
      followers,
      published
    });
  }
}

export const profileService = new ProfileService();
