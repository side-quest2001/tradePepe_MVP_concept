import type { OrderGroup, Tag } from '@/lib/api/types';

export type AnalyticsMetricId =
  | 'total-capital'
  | 'intraday-m2m'
  | 'profit-loss'
  | 'avg-win-rate'
  | 'avg-risk-reward'
  | 'average-holding-time'
  | 'max-loss-per-trade'
  | 'max-drawdown'
  | 'total-trades'
  | 'highest-profit'
  | 'loss-streak'
  | 'most-traded-setup'
  | 'most-common-review'
  | 'opening-range'
  | 'breakout-trade'
  | 'gut-instinct'
  | 'trend-entry'
  | 'good-trade'
  | 'booked-profit-early'
  | 'fomo'
  | 'panic-closed';

export type AnalyticsCategory = 'general' | 'setup' | 'review';
export type AnalyticsChartType =
  | 'metric'
  | 'line'
  | 'bar'
  | 'gauge'
  | 'donut'
  | 'calendar';

export type AnalyticsMetricDefinition = {
  id: AnalyticsMetricId;
  label: string;
  category: AnalyticsCategory;
  chartType: AnalyticsChartType;
  formula: string;
  comment: string;
  tags?: string[];
};

export type AnalyticsBuilderSection = {
  id: AnalyticsCategory;
  label: string;
  metrics: AnalyticsMetricDefinition[];
};

function findTagName(group: OrderGroup, fallback: string) {
  const pools: Tag[] = [...group.setupTags, ...group.reviewTags];
  const match = pools.find((tag) => tag.name.toLowerCase() === fallback.toLowerCase());
  return match?.name ?? fallback;
}

export const analyticsMetricDefinitions: AnalyticsMetricDefinition[] = [
  {
    id: 'total-capital',
    label: 'Total Fund Value',
    category: 'general',
    chartType: 'metric',
    formula: 'Realized PnL + starting capital',
    comment: 'Headline capital value for the selected fund.',
  },
  {
    id: 'intraday-m2m',
    label: 'Intraday M2M',
    category: 'general',
    chartType: 'line',
    formula: 'Open trade unrealized PnL',
    comment: 'Tracks mark-to-market swings during the session.',
  },
  {
    id: 'profit-loss',
    label: 'Profit or Loss',
    category: 'general',
    chartType: 'line',
    formula: 'Total realized outcome over time',
    comment: 'Primary line chart for builder mode.',
  },
  {
    id: 'avg-win-rate',
    label: 'Avg. Win Rate',
    category: 'general',
    chartType: 'donut',
    formula: 'Winning trades / closed trades',
    comment: 'Percent of profitable trades.',
  },
  {
    id: 'avg-risk-reward',
    label: 'Avg. Risk to Reward',
    category: 'general',
    chartType: 'metric',
    formula: 'Average winner / average loser',
    comment: 'Measures reward relative to risk.',
  },
  {
    id: 'average-holding-time',
    label: 'Average Holding Time',
    category: 'general',
    chartType: 'gauge',
    formula: 'Average exit time - entry time',
    comment: 'Average time a position remains open.',
  },
  {
    id: 'max-loss-per-trade',
    label: 'Max. Loss Per Trade',
    category: 'general',
    chartType: 'line',
    formula: 'Worst losing trade',
    comment: 'Largest loss taken on a single trade.',
  },
  {
    id: 'max-drawdown',
    label: 'Max Drawdown',
    category: 'general',
    chartType: 'line',
    formula: 'Peak-to-trough equity decline',
    comment: 'Largest decline in capital from a prior peak.',
  },
  {
    id: 'total-trades',
    label: 'Total Trades',
    category: 'general',
    chartType: 'bar',
    formula: 'Count of executions',
    comment: 'Tracks the total trading activity.',
  },
  {
    id: 'highest-profit',
    label: 'Highest Profit',
    category: 'general',
    chartType: 'metric',
    formula: 'Best realized winner',
    comment: 'Largest positive realized outcome.',
  },
  {
    id: 'loss-streak',
    label: 'Loss Streak',
    category: 'general',
    chartType: 'metric',
    formula: 'Longest consecutive losses',
    comment: 'Captures losing-trade clusters.',
  },
  {
    id: 'most-traded-setup',
    label: 'Most Traded Setup',
    category: 'setup',
    chartType: 'donut',
    formula: 'Setup with highest trade count',
    comment: 'Most-used setup tag across executions.',
  },
  {
    id: 'most-common-review',
    label: 'Most Common Review',
    category: 'review',
    chartType: 'donut',
    formula: 'Review with highest trade count',
    comment: 'Most-frequent review label across executions.',
  },
  {
    id: 'opening-range',
    label: 'Opening Range',
    category: 'setup',
    chartType: 'metric',
    formula: 'Frequency of setup label',
    comment: 'Tracks opening range trades.',
    tags: ['Opening Range'],
  },
  {
    id: 'breakout-trade',
    label: 'Breakout Trade',
    category: 'setup',
    chartType: 'metric',
    formula: 'Frequency of setup label',
    comment: 'Tracks breakout trades.',
    tags: ['Breakout'],
  },
  {
    id: 'gut-instinct',
    label: 'Gut Instinct',
    category: 'setup',
    chartType: 'metric',
    formula: 'Frequency of setup label',
    comment: 'Manual discretionary entries.',
    tags: ['Gut Instinct'],
  },
  {
    id: 'trend-entry',
    label: 'Trend Entry',
    category: 'setup',
    chartType: 'metric',
    formula: 'Frequency of setup label',
    comment: 'Trend continuation entries.',
    tags: ['Trend Entry'],
  },
  {
    id: 'good-trade',
    label: 'Good Trade',
    category: 'review',
    chartType: 'metric',
    formula: 'Frequency of review label',
    comment: 'Good execution quality.',
    tags: ['Good Entry', 'Good Trade'],
  },
  {
    id: 'booked-profit-early',
    label: 'Booked Profit Early',
    category: 'review',
    chartType: 'metric',
    formula: 'Frequency of review label',
    comment: 'Early exits on winning trades.',
    tags: ['Early Exit', 'Booked Profit Early'],
  },
  {
    id: 'fomo',
    label: 'FOMO',
    category: 'review',
    chartType: 'metric',
    formula: 'Frequency of review label',
    comment: 'Emotion-driven chasing behaviour.',
    tags: ['FOMO'],
  },
  {
    id: 'panic-closed',
    label: 'Panic Closed a Good Trade',
    category: 'review',
    chartType: 'metric',
    formula: 'Frequency of review label',
    comment: 'Tracks panic exits from viable setups.',
    tags: ['Panic Closed a Good Trade'],
  },
];

export const defaultBuilderMetricIds: AnalyticsMetricId[] = [
  'avg-risk-reward',
  'breakout-trade',
  'profit-loss',
  'opening-range',
  'total-capital',
  'good-trade',
  'most-common-review',
  'max-loss-per-trade',
];

export function buildAnalyticsSections(groups: OrderGroup[]): AnalyticsBuilderSection[] {
  return [
    {
      id: 'general',
      label: 'General',
      metrics: analyticsMetricDefinitions.filter((metric) => metric.category === 'general'),
    },
    {
      id: 'setup',
      label: 'Setup',
      metrics: analyticsMetricDefinitions
        .filter((metric) => metric.category === 'setup')
        .map((metric) => ({
          ...metric,
          label:
            metric.tags?.[0] && groups[0]
              ? findTagName(groups[0], metric.tags[0])
              : metric.label,
        })),
    },
    {
      id: 'review',
      label: 'Review',
      metrics: analyticsMetricDefinitions
        .filter((metric) => metric.category === 'review')
        .map((metric) => ({
          ...metric,
          label:
            metric.tags?.[0] && groups[0]
              ? findTagName(groups[0], metric.tags[0])
              : metric.label,
        })),
    },
  ];
}
