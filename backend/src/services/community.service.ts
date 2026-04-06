import { ApiError } from "../utils/api-error.js";
import { authRepository } from "../repositories/auth.repository.js";
import { communityRepository } from "../repositories/community.repository.js";
import { journalRepository } from "../repositories/journal.repository.js";
import type { CommunityCommentDto, CommunityFeedItemDto } from "../types/community.types.js";

function formatAuthor(user: {
  id: string;
  name: string;
  handle: string;
  avatarUrl: string | null;
}) {
  return {
    id: user.id,
    name: user.name,
    handle: user.handle,
    avatar: user.avatarUrl
  };
}

export class CommunityService {
  async listFeed(): Promise<CommunityFeedItemDto[]> {
    const page = await journalRepository.listOrderGroups({
      page: 1,
      pageSize: 50,
      sortBy: "firstInteractionDate",
      sortOrder: "desc"
    });

    const bundles = await journalRepository.getOrderGroupBundles(page.items.map((group) => group.id));
    const publishedBundles = bundles.filter((bundle) => bundle.publishedTrade?.status === "published");
    const postIds = publishedBundles.map((bundle) => bundle.publishedTrade!.id);
    const commentCounts = await communityRepository.countCommentsByPostIds(postIds);
    const reactionCounts = await communityRepository.countReactionsByPostIds(postIds);

    const authorIds = [...new Set(publishedBundles.map((bundle) => bundle.publishedTrade?.createdByUserId).filter(Boolean))];
    const authorEntries = await Promise.all(authorIds.map((id) => authRepository.findUserById(id!)));
    const authorsById = new Map(authorEntries.filter(Boolean).map((user) => [user!.id, user!]));
    const fallbackAuthor =
      (await authRepository.findUserByEmail("pepe@tradepepe.dev")) ??
      (authorIds[0] ? await authRepository.findUserById(authorIds[0]) : null);

    return publishedBundles.map((bundle) => {
      const postId = bundle.publishedTrade!.id;
      const author =
        (bundle.publishedTrade?.createdByUserId
          ? authorsById.get(bundle.publishedTrade.createdByUserId)
          : null) ?? fallbackAuthor;

      if (!author) {
        throw new ApiError(500, "No community author available");
      }

      return {
        id: postId,
        tradeId: bundle.group.id,
        title: bundle.publishedTrade?.title ?? `${bundle.group.symbol} trade`,
        summary: bundle.publishedTrade?.summary ?? bundle.notes[0]?.content ?? "Published journal review.",
        likes: reactionCounts.get(postId) ?? 0,
        comments: commentCounts.get(postId) ?? 0,
        createdAt: (bundle.publishedTrade?.publishedAt ??
          bundle.group.lastInteractionDate ??
          bundle.group.firstInteractionDate
        ).toISOString(),
        author: formatAuthor(author)
      };
    });
  }

  async listComments(postId: string): Promise<CommunityCommentDto[]> {
    const comments = await communityRepository.listComments(postId);
    return comments.map((comment) => ({
      ...comment,
      createdAt: comment.createdAt.toISOString()
    }));
  }

  async createComment(postId: string, userId: string, content: string): Promise<CommunityCommentDto> {
    const user = await authRepository.findUserById(userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    const comment = await communityRepository.createComment({
      postId,
      authorUserId: userId,
      content
    });

    return {
      ...comment,
      createdAt: comment.createdAt.toISOString()
    };
  }

  async toggleReaction(postId: string, userId: string) {
    const existing = await communityRepository.findReaction(postId, userId);
    if (existing) {
      await communityRepository.removeReaction(postId, userId);
    } else {
      await communityRepository.addReaction(postId, userId);
    }

    return {
      postId,
      liked: !existing,
      likes: await communityRepository.countReactions(postId)
    };
  }
}

export const communityService = new CommunityService();
