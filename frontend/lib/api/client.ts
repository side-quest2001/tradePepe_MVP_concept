import {
  AuthUser,
  CalendarBucket,
  CommunityComment,
  CommunityPost,
  EconomicIndicatorRow,
  FlashNewsItem,
  Fund,
  ImportDetail,
  ImportHistory,
  ImportUploadResult,
  MediaUploadSignature,
  OrderGroup,
  PnlPoint,
  SummaryAnalytics,
  Tag,
  UserProfile,
  WinLoss,
} from '@/lib/api/types';
import {
  mockCalendar,
  mockGroups,
  mockPnlSeries,
  mockPosts,
  mockSummary,
  mockWinLoss,
} from '@/lib/mocks/data';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4000/api/v1';
const USE_MOCKS = process.env.NEXT_PUBLIC_USE_MOCKS === 'true';

function toNumber(value: number | string | null | undefined) {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function normalizeReturnStatus(value: string | null | undefined): OrderGroup['returnStatus'] {
  if (value === 'profit' || value === 'win') return 'win';
  if (value === 'loss') return 'loss';
  return 'neutral';
}

function normalizeExecution(
  execution: Record<string, unknown>,
  group: Record<string, unknown>
) {
  const executedAt = execution.executedAt ?? execution.executionTime ?? execution.orderTime;
  const qty = execution.qty ?? execution.executedQuantity ?? execution.quantity;
  const tradedPrice = execution.tradedPrice;

  return {
    id: String(execution.id ?? ''),
    executedAt: String(executedAt ?? ''),
    symbol: String(execution.symbol ?? group.symbol ?? ''),
    side: (execution.side === 'sell' ? 'sell' : 'buy') as 'buy' | 'sell',
    qty: toNumber(qty as string | number | null | undefined),
    tradedPrice: toNumber(tradedPrice as string | number | null | undefined),
    setup: typeof execution.setup === 'string' ? execution.setup : undefined,
    review: typeof execution.review === 'string' ? execution.review : undefined,
  };
}

function normalizeGroup(group: Record<string, unknown>): OrderGroup {
  const setupTags = Array.isArray(group.setupTags) ? (group.setupTags as OrderGroup['setupTags']) : [];
  const reviewTags = Array.isArray(group.reviewTags)
    ? (group.reviewTags as OrderGroup['reviewTags'])
    : [];

  return {
    id: String(group.id ?? ''),
    symbol: String(group.symbol ?? ''),
    fundId: String(group.fundId ?? ''),
    positionType: group.positionType === 'short' ? 'short' : 'long',
    firstInteractionDate: String(group.firstInteractionDate ?? ''),
    lastInteractionDate: String(group.lastInteractionDate ?? group.firstInteractionDate ?? ''),
    remainingQuantity: toNumber(group.remainingQuantity as string | number | null | undefined),
    realizedPnl: toNumber(group.realizedPnl as string | number | null | undefined),
    unrealizedPnl: toNumber(group.unrealizedPnl as string | number | null | undefined),
    returnStatus: normalizeReturnStatus(
      typeof group.returnStatus === 'string' ? group.returnStatus : null
    ),
    status: group.status === 'open' ? 'open' : 'closed',
    entryOrders: Array.isArray(group.entryOrders)
      ? group.entryOrders.map((item) => normalizeExecution(item as Record<string, unknown>, group))
      : [],
    exitOrders: Array.isArray(group.exitOrders)
      ? group.exitOrders.map((item) => normalizeExecution(item as Record<string, unknown>, group))
      : [],
    setupTags,
    reviewTags,
    notesSummary:
      typeof group.notesSummary === 'string'
        ? group.notesSummary
        : typeof (group.notesSummary as { latest?: unknown } | null)?.latest === 'string'
          ? ((group.notesSummary as { latest?: string }).latest ?? '')
          : '',
    brokerFees: toNumber(group.brokerFees as string | number | null | undefined),
    charges: toNumber(group.charges as string | number | null | undefined),
    publishedTrade:
      group.publishedTrade && typeof group.publishedTrade === 'object'
        ? {
            title: String((group.publishedTrade as Record<string, unknown>).title ?? ''),
            summary: String((group.publishedTrade as Record<string, unknown>).summary ?? ''),
            likes: toNumber(
              (group.publishedTrade as Record<string, unknown>).likes as
                | string
                | number
                | null
                | undefined
            ),
            comments: toNumber(
              (group.publishedTrade as Record<string, unknown>).comments as
                | string
                | number
                | null
                | undefined
            ),
          }
        : undefined,
  };
}

async function fetcher<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload?.error?.message ?? `Request failed: ${response.status}`);
  }

  const payload = await response.json();
  return payload.data;
}

export async function getOrderGroups(): Promise<OrderGroup[]> {
  if (USE_MOCKS) return mockGroups;
  const data = await fetcher<{ items: OrderGroup[] } | OrderGroup[]>('/order-groups?page=1&pageSize=20');
  const items = Array.isArray(data) ? data : data.items;
  return items.map((item) => normalizeGroup(item as unknown as Record<string, unknown>));
}

export async function getOrderGroup(id: string): Promise<OrderGroup> {
  if (USE_MOCKS) {
    const found = mockGroups.find((group) => group.id === id);
    if (!found) throw new Error('Trade not found');
    return found;
  }
  const data = await fetcher<OrderGroup>(`/order-groups/${id}`);
  return normalizeGroup(data as unknown as Record<string, unknown>);
}

export async function getSummary(): Promise<SummaryAnalytics> {
  if (USE_MOCKS) return mockSummary;
  return fetcher<SummaryAnalytics>('/analytics/summary');
}

export async function getPerformanceCalendar(): Promise<CalendarBucket[]> {
  if (USE_MOCKS) return mockCalendar;
  return fetcher<CalendarBucket[]>('/analytics/performance-calendar');
}

export async function getPnlSeries(): Promise<PnlPoint[]> {
  if (USE_MOCKS) return mockPnlSeries;
  return fetcher<PnlPoint[]>('/analytics/pnl-series');
}

export async function getWinLoss(): Promise<WinLoss> {
  if (USE_MOCKS) return mockWinLoss;
  return fetcher<WinLoss>('/analytics/win-loss');
}

export async function getTags(type?: 'setup' | 'review'): Promise<Tag[]> {
  if (USE_MOCKS) {
    return mockGroups.flatMap((group) => [...group.setupTags, ...group.reviewTags]);
  }
  return fetcher<Tag[]>(`/tags${type ? `?type=${type}` : ''}`);
}

export async function getCommunityPosts(): Promise<CommunityPost[]> {
  if (USE_MOCKS) return mockPosts;
  return fetcher<CommunityPost[]>('/community/feed');
}

export async function getCommunityComments(postId: string): Promise<CommunityComment[]> {
  if (USE_MOCKS) return [];
  return fetcher<CommunityComment[]>(`/community/posts/${postId}/comments`);
}

export async function createCommunityComment(
  postId: string,
  token: string,
  content: string
): Promise<CommunityComment> {
  return fetcher<CommunityComment>(`/community/posts/${postId}/comments`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ content }),
  });
}

export async function toggleCommunityReaction(
  postId: string,
  token: string
): Promise<{ postId: string; likes: number; liked: boolean }> {
  return fetcher<{ postId: string; likes: number; liked: boolean }>(
    `/community/posts/${postId}/reactions`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
}

export async function getMyProfile(token: string): Promise<UserProfile> {
  return fetcher<UserProfile>('/profiles/me', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function getPublicProfile(handle: string): Promise<UserProfile> {
  return fetcher<UserProfile>(`/profiles/${handle.replace(/^@/, '')}`);
}

export async function updateMyProfile(
  token: string,
  input: {
    name?: string;
    handle?: string;
    bio?: string | null;
    avatarUrl?: string | null;
    coverUrl?: string | null;
  }
): Promise<UserProfile> {
  return fetcher<UserProfile>('/profiles/me', {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(input),
  });
}

export async function toggleProfileFollow(
  targetUserId: string,
  token: string
): Promise<{ targetUserId: string; following: boolean }> {
  return fetcher<{ targetUserId: string; following: boolean }>(`/profiles/${targetUserId}/follow`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function getProfileMediaSignature(
  token: string,
  kind: 'avatar' | 'cover' | 'shared-trade'
): Promise<MediaUploadSignature> {
  return fetcher<MediaUploadSignature>('/profiles/media/signature', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ kind }),
  });
}

export async function getFlashNews(): Promise<FlashNewsItem[]> {
  return fetcher<FlashNewsItem[]>('/market/flash-news');
}

export async function getEconomicIndicators(): Promise<EconomicIndicatorRow[]> {
  return fetcher<EconomicIndicatorRow[]>('/market/economic-indicators');
}

export async function getFunds(): Promise<Fund[]> {
  return fetcher<Fund[]>('/funds');
}

export async function createFund(
  input: { name: string; brokerName?: string; currency: string },
  token: string
): Promise<Fund> {
  return fetcher<Fund>('/funds', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(input),
  });
}

export async function getImports(): Promise<ImportHistory[]> {
  return fetcher<ImportHistory[]>('/imports?page=1&pageSize=20');
}

export async function getImportById(importId: string): Promise<ImportDetail> {
  return fetcher<ImportDetail>(`/imports/${importId}`);
}

export async function uploadImportCsv(input: {
  token: string;
  file: File;
  fundId: string;
  brokerName?: string;
}): Promise<ImportUploadResult> {
  const formData = new FormData();
  formData.append('file', input.file);
  formData.append('fundId', input.fundId);
  if (input.brokerName) {
    formData.append('brokerName', input.brokerName);
  }

  const response = await fetch(`${API_BASE}/imports/csv`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${input.token}`,
    },
    body: formData,
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload?.error?.message ?? 'Import failed');
  }

  return payload.data as ImportUploadResult;
}
