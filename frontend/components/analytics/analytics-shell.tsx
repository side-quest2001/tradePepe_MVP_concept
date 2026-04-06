'use client';

import { useMemo, useState } from 'react';
import { Panel } from '@/components/ui/panel';
import {
  analyticsMetricDefinitions,
  buildAnalyticsSections,
  defaultBuilderMetricIds,
} from '@/components/analytics/analytics-config';
import {
  buildDerivedAnalytics,
  buildTradeDetailRows,
} from '@/components/analytics/analytics-helpers';
import { AnalyticsDashboard } from '@/components/analytics/analytics-dashboard';
import { AnalyticsHeader } from '@/components/analytics/analytics-header';
import { TradeAnalyticsBuilder } from '@/components/analytics/trade-analytics-builder';
import type {
  CalendarBucket,
  OrderGroup,
  PnlPoint,
  SummaryAnalytics,
  WinLoss,
} from '@/lib/api/types';

type AnalyticsShellProps = {
  summary: SummaryAnalytics;
  pnlSeries: PnlPoint[];
  calendar: CalendarBucket[];
  winLoss: WinLoss;
  orderGroups: OrderGroup[];
};

export function AnalyticsShell({
  summary,
  pnlSeries,
  calendar,
  winLoss,
  orderGroups,
}: AnalyticsShellProps) {
  const [activeView, setActiveView] = useState<'builder' | 'dashboard'>('builder');

  const derived = useMemo(
    () => buildDerivedAnalytics(summary, pnlSeries, calendar, winLoss, orderGroups),
    [summary, pnlSeries, calendar, winLoss, orderGroups]
  );
  const sections = useMemo(() => buildAnalyticsSections(orderGroups), [orderGroups]);
  const selectedMetrics = useMemo(
    () =>
      analyticsMetricDefinitions.filter((metric) =>
        defaultBuilderMetricIds.includes(metric.id)
      ),
    []
  );
  const tradeDetailRows = useMemo(() => buildTradeDetailRows(orderGroups), [orderGroups]);

  return (
    <div className="space-y-0">
      <Panel className="overflow-hidden rounded-[18px] border-[#172535] bg-[radial-gradient(circle_at_top,rgba(23,43,60,0.55),rgba(7,21,35,1)_32%)] p-0 shadow-none">
        <AnalyticsHeader activeView={activeView} onChangeView={setActiveView} />
        {activeView === 'builder' ? (
          <TradeAnalyticsBuilder
            sections={sections}
            selectedMetrics={selectedMetrics}
            lineSeries={pnlSeries}
            tradeDetailRows={tradeDetailRows}
          />
        ) : (
          <AnalyticsDashboard
            summary={summary}
            winLoss={winLoss}
            calendar={calendar}
            derived={derived}
            pnlSeries={pnlSeries}
          />
        )}
      </Panel>
    </div>
  );
}
