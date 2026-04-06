export interface CommunityFeedItemDto {
  id: string;
  tradeId: string;
  title: string;
  summary: string;
  likes: number;
  comments: number;
  createdAt: string;
  author: {
    id: string;
    name: string;
    handle: string;
    avatar: string | null;
  };
}

export interface CommunityCommentDto {
  id: string;
  postId: string;
  content: string;
  createdAt: string;
  author: {
    id: string;
    name: string;
    handle: string;
    avatar: string | null;
  };
}

export interface UserProfileDto {
  id: string;
  name: string;
  handle: string;
  email?: string;
  avatarUrl: string | null;
  coverUrl: string | null;
  activeSince: string;
  bio: string | null;
  stats: {
    trades: number;
    following: number;
    followers: number;
    published: number;
  };
}

export interface FlashNewsDto {
  id: string;
  title: string;
  summary: string;
  source: string;
  createdAt: string;
}

export interface EconomicIndicatorRowDto {
  country: string;
  indicator: string;
  september: string;
  october: string;
  november: string;
  december: string;
}
