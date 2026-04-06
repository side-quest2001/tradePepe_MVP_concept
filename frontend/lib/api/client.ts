import {
  AuthUser,
  CalendarBucket,
  CommunityComment,
  CommunityPost,
  EconomicIndicatorRow,
  FlashNewsItem,
  Fund,
  ImportHistory,
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

export async function getFlashNews(): Promise<FlashNewsItem[]> {
  return fetcher<FlashNewsItem[]>('/market/flash-news');
}

export async function getEconomicIndicators(): Promise<EconomicIndicatorRow[]> {
  return fetcher<EconomicIndicatorRow[]>('/market/economic-indicators');
}

export async function getFunds(): Promise<Fund[]> {
  return fetcher<Fund[]>('/funds');
}

export async function getImports(): Promise<ImportHistory[]> {
  return fetcher<ImportHistory[]>('/imports?page=1&pageSize=20');
}

export async function uploadImportCsv(input: {
  token: string;
  file: File;
  fundId: string;
  brokerName?: string;
}) {
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

  return payload.data as {
    importId: string;
    totalRows: number;
    importedRows: number;
    failedRows: number;
    errors: Array<{ rowNumber: number; messages: string[] }>;
  };
}
