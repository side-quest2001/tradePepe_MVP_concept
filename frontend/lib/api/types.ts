export type ApiEnvelope<T> = {
  data: T;
  meta?: Record<string, unknown>;
};

export type Tag = {
  id: string;
  name: string;
  slug: string;
  color: string;
  type: 'setup' | 'review';
};

export type OrderExecution = {
  id: string;
  executedAt: string;
  symbol: string;
  side: 'buy' | 'sell';
  qty: number;
  tradedPrice: number;
  setup?: string;
  review?: string;
};

export type PublishedTrade = {
  title: string;
  summary: string;
  likes: number;
  comments: number;
};

export type OrderGroup = {
  id: string;
  symbol: string;
  fundId: string;
  positionType: 'long' | 'short';
  firstInteractionDate: string;
  lastInteractionDate: string;
  remainingQuantity: number;
  realizedPnl: number;
  unrealizedPnl: number;
  returnStatus: 'win' | 'loss' | 'neutral';
  status: 'open' | 'closed';
  entryOrders: OrderExecution[];
  exitOrders: OrderExecution[];
  setupTags: Tag[];
  reviewTags: Tag[];
  notesSummary: string;
  brokerFees?: number;
  charges?: number;
  publishedTrade?: PublishedTrade;
};

export type SummaryAnalytics = {
  totalRealizedPnl: number;
  totalClosedTrades: number;
  winRate: number;
  avgHoldingTimeMinutes: number;
  maxLoss: number;
  maxProfit: number;
};

export type CalendarBucket = {
  date: string;
  pnl: number;
  count: number;
};

export type PnlPoint = {
  label: string;
  value: number;
};

export type WinLoss = {
  wins: number;
  losses: number;
  neutral: number;
  winRate: number;
  currentLossStreak: number;
  longestLossStreak: number;
};

export type CommunityPost = {
  id: string;
  author: {
    id: string;
    name: string;
    handle: string;
    avatar: string | null;
  };
  tradeId: string;
  title: string;
  summary: string;
  likes: number;
  comments: number;
  createdAt: string;
};

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  handle: string;
  avatarUrl: string | null;
  coverUrl: string | null;
  activeSince: string;
  bio: string | null;
  emailVerifiedAt?: string | null;
};

export type AuthResponse = {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
};

export type UserProfile = AuthUser & {
  stats: {
    trades: number;
    following: number;
    followers: number;
    published: number;
  };
  followingIds?: string[];
};

export type CommunityComment = {
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
};

export type FlashNewsItem = {
  id: string;
  title: string;
  summary: string;
  source: string;
  createdAt: string;
  imageUrl: string | null;
  articleUrl: string | null;
};

export type MediaUploadSignature = {
  cloudName: string;
  apiKey: string;
  timestamp: number;
  folder: string;
  signature: string;
};

export type EconomicIndicatorRow = {
  id?: string;
  country: string;
  indicator: string;
  september: string;
  october: string;
  november: string;
  december: string;
};

export type Fund = {
  id: string;
  name: string;
  brokerName: string | null;
  currency: string;
  createdAt: string;
};

export type ImportHistory = {
  importId: string;
  fundId: string;
  brokerName: string | null;
  fileName: string | null;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  totalRows: number;
  importedRows: number;
  skippedRows: number;
  failedRows: number;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
};

export type ImportRowError = {
  rowNumber: number;
  messages: string[];
};

export type ImportDetail = ImportHistory & {
  metadata: {
    rowErrors?: ImportRowError[];
    error?: string;
    details?: unknown;
  } | null;
};

export type ImportUploadResult = {
  importId: string;
  totalRows: number;
  importedRows: number;
  failedRows: number;
  errors: ImportRowError[];
};
