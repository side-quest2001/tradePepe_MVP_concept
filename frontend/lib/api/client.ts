import {
  CalendarBucket,
  CommunityPost,
  OrderGroup,
  PnlPoint,
  SummaryAnalytics,
  Tag,
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

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3000/api/v1';
const USE_MOCKS = process.env.NEXT_PUBLIC_USE_MOCKS !== 'false';

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
  return Array.isArray(data) ? data : data.items;
}

export async function getOrderGroup(id: string): Promise<OrderGroup> {
  if (USE_MOCKS) {
    const found = mockGroups.find((group) => group.id === id);
    if (!found) throw new Error('Trade not found');
    return found;
  }
  return fetcher<OrderGroup>(`/order-groups/${id}`);
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
  const groups = await getOrderGroups();
  return groups
    .filter((group) => group.publishedTrade)
    .map((group) => ({
      id: group.id,
      tradeId: group.id,
      title: group.publishedTrade?.title ?? group.symbol,
      summary: group.publishedTrade?.summary ?? group.notesSummary,
      likes: group.publishedTrade?.likes ?? 0,
      comments: group.publishedTrade?.comments ?? 0,
      createdAt: group.lastInteractionDate,
      author: { name: 'TradePepe User', handle: '@trader', avatar: 'T' },
    }));
}
