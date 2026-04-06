import type {
  CalendarBucket,
  OrderExecution,
  OrderGroup,
  PnlPoint,
  SummaryAnalytics,
  WinLoss,
} from '@/lib/api/types';

export type DerivedAnalytics = {
  riskRewardRatio: number;
  averageHoldingMinutes: number;
  highestProfit: number;
  totalTrades: number;
  currentLossStreak: number;
  longestLossStreak: number;
  mostTradedSetup: { label: string; value: number; share: number };
  mostCommonReview: { label: string; value: number; share: number };
  drawdownSeries: Array<{ label: string; value: number }>;
  tradeBars: Array<{ label: string; value: number }>;
  calendarLineSeries: Array<{ label: string; value: number }>;
  dashboardCards: {
    totalCapitalDelta: number | null;
    maxLossDelta: number | null;
    winRateDelta: number | null;
    riskRewardDelta: number | null;
    highestProfitDelta: number | null;
    lossStreakDelta: number | null;
  };
};

function executionsOf(group: OrderGroup) {
  return [...group.entryOrders, ...group.exitOrders];
}

function toNumber(value: number | string | null | undefined) {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function toValidDate(value: string | null | undefined) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function countLabels<T>(values: T[]) {
  return values.reduce<Map<T, number>>((map, value) => {
    map.set(value, (map.get(value) ?? 0) + 1);
    return map;
  }, new Map());
}

function bestCount(map: Map<string, number>) {
  const entries = [...map.entries()].sort((a, b) => b[1] - a[1]);
  const [label = 'N/A', value = 0] = entries[0] ?? [];
  const total = [...map.values()].reduce((sum, item) => sum + item, 0);
  return {
    label,
    value,
    share: total ? Math.round((value / total) * 100) : 0,
  };
}

function calculateHoldingMinutes(group: OrderGroup) {
  const first = toValidDate(group.firstInteractionDate);
  const last = toValidDate(group.lastInteractionDate ?? group.firstInteractionDate);
  if (!first || !last) return 0;
  const diff = last.getTime() - first.getTime();
  return Math.max(Math.round(diff / 60000), 0);
}

function formatMonthDay(input: string) {
  const date = toValidDate(input);
  if (!date) return '-';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(date);
}

function formatDayLabel(input: string) {
  const date = toValidDate(input);
  if (!date) return '-';
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
  }).format(date);
}

export function formatHoldingTime(totalMinutes: number) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const seconds = 23;
  return { hours, minutes, seconds };
}

export function formatChartCurrency(value: number) {
  return `${Math.round(value).toLocaleString('en-US')}`;
}

function calculateSeriesDelta(series: Array<{ value: number }>) {
  if (series.length < 2) return null;
  const previous = series[series.length - 2]?.value ?? 0;
  const current = series[series.length - 1]?.value ?? 0;

  if (!Number.isFinite(previous) || !Number.isFinite(current)) return null;
  if (previous === 0) {
    return current === 0 ? 0 : null;
  }

  return Number((((current - previous) / Math.abs(previous)) * 100).toFixed(1));
}

export function buildDerivedAnalytics(
  summary: SummaryAnalytics,
  pnlSeries: PnlPoint[],
  calendar: CalendarBucket[],
  winLoss: WinLoss,
  groups: OrderGroup[]
): DerivedAnalytics {
  const closedGroups = groups.filter((group) => group.status === 'closed');
  const winning = closedGroups.filter((group) => group.realizedPnl > 0);
  const losing = closedGroups.filter((group) => group.realizedPnl < 0);
  const avgWin =
    winning.reduce((sum, group) => sum + group.realizedPnl, 0) / Math.max(winning.length, 1);
  const avgLoss =
    Math.abs(
      losing.reduce((sum, group) => sum + Math.abs(group.realizedPnl), 0) /
        Math.max(losing.length, 1)
    ) || 1;
  const riskRewardRatio = avgWin / avgLoss;

  const holdingMinutes =
    groups.reduce((sum, group) => sum + calculateHoldingMinutes(group), 0) /
    Math.max(groups.length, 1);

  const sortedGroups = [...groups].sort(
    (a, b) =>
      (toValidDate(a.firstInteractionDate)?.getTime() ?? 0) -
      (toValidDate(b.firstInteractionDate)?.getTime() ?? 0)
  );
  let currentLossRun = 0;
  let longestLossRun = 0;
  sortedGroups.forEach((group) => {
    if (group.realizedPnl < 0) {
      currentLossRun += 1;
      longestLossRun = Math.max(longestLossRun, currentLossRun);
    } else {
      currentLossRun = 0;
    }
  });

  const recentCurrentLoss = [...sortedGroups]
    .reverse()
    .reduce((streak, group) => {
      if (streak.locked) return streak;
      if (group.realizedPnl < 0) {
        return { count: streak.count + 1, locked: false };
      }
      return { ...streak, locked: true };
    }, { count: 0, locked: false }).count;

  const setupCounts = countLabels(
    groups.flatMap((group) =>
      executionsOf(group)
        .map((execution) => execution.setup)
        .filter((value): value is string => Boolean(value))
    )
  );
  const reviewCounts = countLabels(
    groups.flatMap((group) =>
      executionsOf(group)
        .map((execution) => execution.review)
        .filter((value): value is string => Boolean(value))
    )
  );

  let peak = 0;
  const drawdownSeries = sortedGroups.map((group) => {
    peak = Math.max(peak, group.realizedPnl + peak);
    const equity = peak - Math.max(group.realizedPnl, 0);
    const drawdown = Math.max(peak - equity, Math.abs(Math.min(group.realizedPnl, 0)));
    return {
      label: formatMonthDay(group.firstInteractionDate),
      value: Math.round(drawdown),
    };
  });

  const tradeBars = calendar.slice(0, 7).map((bucket) => ({
    label: formatDayLabel(bucket.date),
    value: bucket.count * 100,
  }));

  const calendarLineSeries = calendar.map((bucket) => ({
    label: formatDayLabel(bucket.date),
    value: bucket.pnl,
  }));

  return {
    riskRewardRatio,
    averageHoldingMinutes: Math.round(holdingMinutes),
    highestProfit: Math.max(summary.maxProfit, ...groups.map((group) => group.realizedPnl), 0),
    totalTrades: groups.reduce((sum, group) => sum + executionsOf(group).length, 0),
    currentLossStreak: recentCurrentLoss || winLoss.currentLossStreak,
    longestLossStreak: Math.max(longestLossRun, winLoss.longestLossStreak),
    mostTradedSetup: bestCount(setupCounts as Map<string, number>),
    mostCommonReview: bestCount(reviewCounts as Map<string, number>),
    drawdownSeries:
      drawdownSeries.length > 0
        ? drawdownSeries
        : pnlSeries.map((point) => ({ label: point.label, value: Math.abs(point.value) })),
    tradeBars,
    calendarLineSeries,
    dashboardCards: {
      totalCapitalDelta: calculateSeriesDelta(pnlSeries),
      maxLossDelta: calculateSeriesDelta(drawdownSeries),
      winRateDelta: null,
      riskRewardDelta: null,
      highestProfitDelta: null,
      lossStreakDelta:
        winLoss.longestLossStreak > 0
          ? Number(((-recentCurrentLoss / winLoss.longestLossStreak) * 100).toFixed(1))
          : null,
    },
  };
}

export function buildTradeDetailRows(groups: OrderGroup[]) {
  return groups.slice(0, 2).map((group) => {
    const left = [...group.entryOrders].sort(
      (a, b) => (toValidDate(a.executedAt)?.getTime() ?? 0) - (toValidDate(b.executedAt)?.getTime() ?? 0)
    )[0];
    const right = [...group.exitOrders].sort(
      (a, b) => (toValidDate(b.executedAt)?.getTime() ?? 0) - (toValidDate(a.executedAt)?.getTime() ?? 0)
    )[0];
    return {
      id: group.id,
      left: buildTradeEdge(left),
      result: group.realizedPnl,
      right: buildTradeEdge(right, true),
      status: group.returnStatus,
    };
  });
}

function buildTradeEdge(execution: OrderExecution | undefined, reverse = false) {
  if (!execution) {
    return ['-', '-', '-', '-', '-', '-', '-'];
  }

  const dt = toValidDate(execution.executedAt);
  const quantity = toNumber(execution.qty);
  const tradedPrice = toNumber(execution.tradedPrice);
  const date = dt
    ? new Intl.DateTimeFormat('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit',
      }).format(dt)
    : '-';
  const time = dt
    ? new Intl.DateTimeFormat('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      })
        .format(dt)
        .replace(' ', '')
    : '-';

  const payload = [
    date,
    time,
    quantity.toLocaleString('en-US'),
    execution.symbol,
    execution.setup ?? 'N/A',
    execution.review ?? 'N/A',
    `$${Math.round(tradedPrice).toLocaleString('en-US')}`,
  ];

  return reverse ? [...payload].reverse() : payload;
}
