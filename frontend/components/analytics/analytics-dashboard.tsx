'use client';

import { useMemo, useState } from 'react';
import { ChevronDown, Info } from 'lucide-react';
import type { CalendarBucket, SummaryAnalytics, WinLoss } from '@/lib/api/types';
import { formatCompact, formatCurrency, formatPercent } from '@/lib/utils/format';
import { CalendarHeatGrid, DrawdownLineChart, TradesColumnChart, AnalyticsSparkline, HalfGauge, AnalyticsDonut, PerformanceAreaChart, PerformanceBarChart } from '@/components/analytics/analytics-mini-charts';
import { DerivedAnalytics, formatHoldingTime } from '@/components/analytics/analytics-helpers';

type AnalyticsDashboardProps = {
  summary: SummaryAnalytics;
  winLoss: WinLoss;
  calendar: CalendarBucket[];
  derived: DerivedAnalytics;
  pnlSeries: Array<{ label: string; value: number }>;
};

function CardPill({ label }: { label: string }) {
  return (
    <button className="inline-flex h-5 items-center gap-1 rounded-full bg-[#143629] px-2 text-[9px] font-medium text-[#d8f7eb]">
      {label}
      <ChevronDown className="h-3 w-3" />
    </button>
  );
}

function StatCard({
  title,
  value,
  delta,
  deltaPositive = true,
  chart,
  rightLabel,
}: {
  title: string;
  value: string;
  delta: string;
  deltaPositive?: boolean;
  chart: React.ReactNode;
  rightLabel?: string;
}) {
  return (
    <div className="rounded-[12px] border border-white/6 bg-[linear-gradient(180deg,#222d38,#1d2732)] p-4 shadow-[0_12px_28px_rgba(0,0,0,0.14)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-1">
            <p className="text-[11px] font-semibold text-white">{title}</p>
            <Info className="h-3 w-3 text-[#1ec99f]" />
          </div>
          <div className="mt-4 flex items-end gap-2">
            <p className="text-[20px] font-semibold text-white">{value}</p>
            <p className={`text-[11px] font-semibold ${deltaPositive ? 'text-[#1ec99f]' : 'text-[#ef4444]'}`}>{delta}</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-3">
          {rightLabel ? <CardPill label={rightLabel} /> : null}
          {chart}
        </div>
      </div>
    </div>
  );
}

export function AnalyticsDashboard({
  summary,
  winLoss,
  calendar,
  derived,
  pnlSeries,
}: AnalyticsDashboardProps) {
  const [performanceTab, setPerformanceTab] = useState<'calendar' | 'line' | 'bar'>('calendar');
  const holding = formatHoldingTime(derived.averageHoldingMinutes);
  const calendarData = useMemo(
    () =>
      calendar.map((bucket) => ({
        label: bucket.date,
        value: Math.round(bucket.pnl),
        count: bucket.count,
      })),
    [calendar]
  );

  return (
    <div className="px-5 pb-5 pt-5">
      <div className="grid gap-4 xl:grid-cols-4">
        <StatCard
          title="Total Capital"
          value={formatCurrency(summary.totalRealizedPnl)}
          delta={`${derived.dashboardCards.totalCapitalDelta}% ↑`}
          chart={<AnalyticsSparkline data={pnlSeries} color="#18c99f" />}
          rightLabel="All Time"
        />
        <StatCard
          title="Max. Loss Per Trade"
          value={formatCurrency(Math.abs(summary.maxLoss))}
          delta={`${derived.dashboardCards.maxLossDelta}% ↓`}
          deltaPositive={false}
          chart={<AnalyticsSparkline data={derived.drawdownSeries} color="#ee4646" />}
          rightLabel="This Month"
        />
        <StatCard
          title="Win-rate"
          value={formatPercent(winLoss.winRate).replace('.0', '')}
          delta={`${derived.dashboardCards.winRateDelta}% ↑`}
          chart={<AnalyticsDonut value={winLoss.winRate} remainder={100 - winLoss.winRate} />}
          rightLabel="This Month"
        />
        <StatCard
          title="Avg. Risk to Reward"
          value={`${derived.riskRewardRatio.toFixed(1)} R`}
          delta={`${derived.dashboardCards.riskRewardDelta}% ↑`}
          chart={<AnalyticsSparkline data={pnlSeries} color="#18c99f" />}
          rightLabel="This Month"
        />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1.45fr_1fr]">
        <div className="rounded-[12px] border border-white/6 bg-[linear-gradient(180deg,#222d38,#1d2732)] p-4 shadow-[0_12px_28px_rgba(0,0,0,0.14)]">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold text-white">Performance</p>
              <p className="mt-1 text-[11px] text-[#7e92a7]">Switch between calendar, line, and bar views without losing context.</p>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-[9px]">
                {[
                  ['calendar', 'Calendar View'],
                  ['line', 'Line Graph'],
                  ['bar', 'Bar Graph'],
                ].map(([id, label]) => (
                  <button
                    key={id}
                    onClick={() => setPerformanceTab(id as 'calendar' | 'line' | 'bar')}
                    className={`inline-flex rounded-full px-3 py-1.5 ${performanceTab === id ? 'bg-[#143629] text-[#1ec99f]' : 'text-[#76879a]'}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <CardPill label="Week" />
          </div>

          <div className="mt-5 h-[320px]">
            {performanceTab === 'calendar' ? (
              <CalendarHeatGrid data={calendarData} />
            ) : performanceTab === 'line' ? (
              <PerformanceAreaChart data={derived.calendarLineSeries} />
            ) : (
              <PerformanceBarChart data={derived.calendarLineSeries} />
            )}
          </div>
        </div>

        <div className="rounded-[12px] border border-white/6 bg-[linear-gradient(180deg,#222d38,#1d2732)] p-4 shadow-[0_12px_28px_rgba(0,0,0,0.14)]">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px]">↖</span>
                <p className="text-[11px] font-semibold text-white">Max. Drawdown</p>
              </div>
              <p className="mt-3 text-[18px] font-semibold text-[#ef4444]">
                {formatCurrency(Math.max(...derived.drawdownSeries.map((item) => item.value), 0))}
              </p>
            </div>
            <CardPill label="1 Month" />
          </div>
          <div className="mt-5 h-[320px]">
            <DrawdownLineChart data={derived.drawdownSeries} />
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1fr_1fr]">
        <div className="rounded-[12px] border border-white/6 bg-[linear-gradient(180deg,#222d38,#1d2732)] p-4 shadow-[0_12px_28px_rgba(0,0,0,0.14)]">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold text-white">Total Trades</p>
              <div className="mt-3">
                <button className="inline-flex rounded-full bg-[#143629] px-3 py-1.5 text-[9px] text-[#1ec99f]">
                  Column Graph
                </button>
              </div>
            </div>
            <CardPill label="Three Months" />
          </div>
          <div className="mt-5 h-[176px]">
            <TradesColumnChart data={derived.tradeBars} />
          </div>
        </div>

        <div className="rounded-[12px] border border-white/6 bg-[linear-gradient(180deg,#222d38,#1d2732)] p-4 shadow-[0_12px_28px_rgba(0,0,0,0.14)]">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold text-white">Avg. Holding Time</p>
              <p className="mt-4 text-[18px] font-semibold leading-tight text-white">
                {holding.hours} Hours
                <br />
                {holding.minutes} Minutes
                <br />
                {holding.seconds} Seconds
              </p>
              <p className="mt-2 text-[11px] text-[#1ec99f]">↗ 7.5%</p>
            </div>
            <Info className="h-3 w-3 text-[#1ec99f]" />
          </div>
          <div className="mt-[-10px] flex justify-end">
            <HalfGauge value={Math.min(derived.averageHoldingMinutes, 100)} />
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <StatCard
          title="Highest Profit"
          value={formatCompact(derived.highestProfit)}
          delta={`${derived.dashboardCards.highestProfitDelta}% ↑`}
          chart={<AnalyticsSparkline data={pnlSeries} color="#18c99f" />}
          rightLabel="All Time"
        />
        <StatCard
          title="Loss Streak"
          value={`${derived.currentLossStreak}`}
          delta={`${Math.abs(derived.dashboardCards.lossStreakDelta)}% ↓`}
          deltaPositive={false}
          chart={<AnalyticsSparkline data={derived.drawdownSeries} color="#ef4444" />}
          rightLabel="All Time"
        />
        <div className="rounded-[12px] border border-white/6 bg-[linear-gradient(180deg,#222d38,#1d2732)] p-4 shadow-[0_12px_28px_rgba(0,0,0,0.14)]">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold text-white">Most Traded Setup</p>
              <div className="mt-4 inline-flex rounded-[4px] bg-[#9c6c21] px-3 py-2 text-[11px] text-white">
                {derived.mostTradedSetup.label}
              </div>
              <p className="mt-3 text-[11px] text-[#1ec99f]">7.5% ↑</p>
            </div>
            <div className="flex items-center gap-2">
              <AnalyticsDonut
                value={derived.mostTradedSetup.share}
                remainder={100 - derived.mostTradedSetup.share}
                centerLabel={`${derived.mostTradedSetup.share}%`}
              />
              <Info className="h-3 w-3 text-[#1ec99f]" />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <div className="rounded-[12px] border border-white/6 bg-[linear-gradient(180deg,#222d38,#1d2732)] p-4 shadow-[0_12px_28px_rgba(0,0,0,0.14)] xl:col-span-2">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold text-white">Most Common Review</p>
              <div className="mt-4 inline-flex rounded-[4px] bg-[#1a875b] px-3 py-2 text-[11px] text-white">
                {derived.mostCommonReview.label}
              </div>
              <p className="mt-3 text-[11px] text-[#1ec99f]">7.5% ↑</p>
            </div>
            <div className="flex items-center gap-2">
              <AnalyticsDonut
                value={derived.mostCommonReview.share}
                remainder={100 - derived.mostCommonReview.share}
                centerLabel={`${derived.mostCommonReview.share}%`}
              />
              <Info className="h-3 w-3 text-[#1ec99f]" />
            </div>
          </div>
        </div>
        <div className="rounded-[12px] border border-white/6 bg-[linear-gradient(180deg,#222d38,#1d2732)] p-4 shadow-[0_12px_28px_rgba(0,0,0,0.14)]">
          <p className="text-[11px] font-semibold text-white">Loss Streak</p>
          <div className="mt-5 space-y-4 text-[13px] text-[#d2dbe5]">
            <div className="flex items-center justify-between">
              <span>Current</span>
              <span className="font-semibold text-white">{derived.currentLossStreak}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Longest</span>
              <span className="font-semibold text-white">{derived.longestLossStreak}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Max profit</span>
              <span className="font-semibold text-white">{formatCurrency(summary.maxProfit)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
