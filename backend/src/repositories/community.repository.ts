import { and, count, desc, eq, inArray } from "drizzle-orm";
import { db } from "../db/client.js";
import {
  communityComments,
  communityReactions,
  profileFollows,
  users
} from "../db/schema/app.schema.js";
import type { DbExecutor } from "../types/db.types.js";

export class CommunityRepository {
  constructor(private readonly executor: DbExecutor = db) {}

  async listComments(postId: string) {
    return this.executor
      .select({
        id: communityComments.id,
        postId: communityComments.postId,
        content: communityComments.content,
        createdAt: communityComments.createdAt,
        author: {
          id: users.id,
          name: users.name,
          handle: users.handle,
          avatar: users.avatarUrl
        }
      })
      .from(communityComments)
      .innerJoin(users, eq(users.id, communityComments.authorUserId))
      .where(eq(communityComments.postId, postId))
      .orderBy(desc(communityComments.createdAt));
  }

  async createComment(input: {
    postId: string;
    authorUserId: string;
    content: string;
  }) {
    const inserted = await this.executor.insert(communityComments).values(input).returning();
    const comment = inserted[0];
    const results = await this.executor
      .select({
        id: communityComments.id,
        postId: communityComments.postId,
        content: communityComments.content,
        createdAt: communityComments.createdAt,
        author: {
          id: users.id,
          name: users.name,
          handle: users.handle,
          avatar: users.avatarUrl
        }
      })
      .from(communityComments)
      .innerJoin(users, eq(users.id, communityComments.authorUserId))
      .where(eq(communityComments.id, comment.id))
      .limit(1);

    return results[0]!;
  }

  async countCommentsByPostIds(postIds: string[]) {
    if (postIds.length === 0) return new Map<string, number>();
    const rows = await this.executor
      .select({
        postId: communityComments.postId,
        total: count()
      })
      .from(communityComments)
      .where(inArray(communityComments.postId, postIds))
      .groupBy(communityComments.postId);

    return new Map(rows.map((row) => [row.postId, row.total]));
  }

  async countReactionsByPostIds(postIds: string[]) {
    if (postIds.length === 0) return new Map<string, number>();
    const rows = await this.executor
      .select({
        postId: communityReactions.postId,
        total: count()
      })
      .from(communityReactions)
      .where(inArray(communityReactions.postId, postIds))
      .groupBy(communityReactions.postId);

    return new Map(rows.map((row) => [row.postId, row.total]));
  }

  async findReaction(postId: string, userId: string) {
    const results = await this.executor
      .select()
      .from(communityReactions)
      .where(and(eq(communityReactions.postId, postId), eq(communityReactions.userId, userId)))
      .limit(1);
    return results[0] ?? null;
  }

  async addReaction(postId: string, userId: string) {
    await this.executor.insert(communityReactions).values({ postId, userId });
  }

  async removeReaction(postId: string, userId: string) {
    await this.executor
      .delete(communityReactions)
      .where(and(eq(communityReactions.postId, postId), eq(communityReactions.userId, userId)));
  }

  async countReactions(postId: string) {
    const [row] = await this.executor
      .select({ total: count() })
      .from(communityReactions)
      .where(eq(communityReactions.postId, postId));
    return row?.total ?? 0;
  }

  async findFollow(targetUserId: string, followerUserId: string) {
    const results = await this.executor
      .select()
      .from(profileFollows)
      .where(
        and(eq(profileFollows.targetUserId, targetUserId), eq(profileFollows.followerUserId, followerUserId))
      )
      .limit(1);
    return results[0] ?? null;
  }

  async addFollow(targetUserId: string, followerUserId: string) {
    await this.executor.insert(profileFollows).values({ targetUserId, followerUserId });
  }

  async removeFollow(targetUserId: string, followerUserId: string) {
    await this.executor
      .delete(profileFollows)
      .where(
        and(eq(profileFollows.targetUserId, targetUserId), eq(profileFollows.followerUserId, followerUserId))
      );
  }

  async countFollowers(targetUserId: string) {
    const [row] = await this.executor
      .select({ total: count() })
      .from(profileFollows)
      .where(eq(profileFollows.targetUserId, targetUserId));
    return row?.total ?? 0;
  }

  async countFollowing(followerUserId: string) {
    const [row] = await this.executor
      .select({ total: count() })
      .from(profileFollows)
      .where(eq(profileFollows.followerUserId, followerUserId));
    return row?.total ?? 0;
  }
}

export const communityRepository = new CommunityRepository();
