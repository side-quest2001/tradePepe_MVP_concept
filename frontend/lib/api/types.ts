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
    name: string;
    handle: string;
    avatar: string;
  };
  tradeId: string;
  title: string;
  summary: string;
  likes: number;
  comments: number;
  createdAt: string;
};
