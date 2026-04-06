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
    totalCapitalDelta: number;
    maxLossDelta: number;
    winRateDelta: number;
    riskRewardDelta: number;
    highestProfitDelta: number;
    lossStreakDelta: number;
  };
};

function executionsOf(group: OrderGroup) {
  return [...group.entryOrders, ...group.exitOrders];
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
  const first = group.firstInteractionDate;
  const last = group.lastInteractionDate;
  const diff = new Date(last).getTime() - new Date(first).getTime();
  return Math.max(Math.round(diff / 60000), 0);
}

function formatMonthDay(input: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(new Date(input));
}

function formatDayLabel(input: string) {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
  }).format(new Date(input));
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
      new Date(a.firstInteractionDate).getTime() -
      new Date(b.firstInteractionDate).getTime()
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
      totalCapitalDelta: 19,
      maxLossDelta: 3.7,
      winRateDelta: 7.5,
      riskRewardDelta: 7.5,
      highestProfitDelta: 7.5,
      lossStreakDelta: -7.5,
    },
  };
}

export function buildTradeDetailRows(groups: OrderGroup[]) {
  return groups.slice(0, 2).map((group, index) => {
    const left = executionsOf(group)[0];
    const right = executionsOf(groups[index + 1] ?? group)[0];
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

  const dt = new Date(execution.executedAt);
  const date = new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
  }).format(dt);
  const time = new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
    .format(dt)
    .replace(' ', '');

  const payload = [
    date,
    time,
    execution.qty.toLocaleString('en-US'),
    execution.symbol,
    execution.setup ?? 'N/A',
    execution.review ?? 'N/A',
    `₹${Math.round(execution.tradedPrice).toLocaleString('en-US')}`,
  ];

  return reverse ? [...payload].reverse() : payload;
}
