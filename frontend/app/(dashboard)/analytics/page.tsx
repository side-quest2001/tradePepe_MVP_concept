import {
  getOrderGroups,
  getPerformanceCalendar,
  getPnlSeries,
  getSummary,
  getWinLoss,
} from '@/lib/api/client';
import { AnalyticsShell } from '@/components/analytics/analytics-shell';

export default async function AnalyticsPage() {
  const [summary, pnlSeries, calendar, winLoss, orderGroups] = await Promise.all([
    getSummary(),
    getPnlSeries(),
    getPerformanceCalendar(),
    getWinLoss(),
    getOrderGroups(),
  ]);

  return (
    <AnalyticsShell
      summary={summary}
      pnlSeries={pnlSeries}
      calendar={calendar}
      winLoss={winLoss}
      orderGroups={orderGroups}
    />
  );
}
