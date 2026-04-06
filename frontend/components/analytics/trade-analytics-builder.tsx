'use client';

import { useMemo, useState } from 'react';
import {
  BarChart3,
  CandlestickChart,
  ChevronDown,
  GripVertical,
  LineChart,
  Search,
} from 'lucide-react';
import type {
  AnalyticsBuilderSection,
  AnalyticsMetricDefinition,
  AnalyticsMetricId,
} from '@/components/analytics/analytics-config';
import { formatChartCurrency } from '@/components/analytics/analytics-helpers';
import { BuilderCanvasChart } from '@/components/analytics/analytics-mini-charts';

type TradeAnalyticsBuilderProps = {
  sections: AnalyticsBuilderSection[];
  selectedMetrics: AnalyticsMetricDefinition[];
  lineSeries: Array<{ label: string; value: number }>;
  tradeDetailRows: Array<{
    id: string;
    left: string[];
    right: string[];
    result: number;
    status: 'win' | 'loss' | 'neutral';
  }>;
};

type SidebarRowProps = {
  item: AnalyticsMetricDefinition;
  checked: boolean;
  onToggle: (id: AnalyticsMetricId) => void;
};

const timeframes = ['1D', '5D', '1M', '3M', '6M', 'YTD', '1Y', '5Y'];

function BuilderChip({
  label,
  active,
  onRemove,
}: {
  label: string;
  active?: boolean;
  onRemove: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onRemove}
      className={[
        'inline-flex h-7 items-center rounded-[6px] border px-2.5 text-[10px] font-medium leading-none transition',
        active
          ? 'border-[#0f9e7b] bg-[#0f9e7b] text-white shadow-[0_8px_20px_rgba(15,158,123,0.16)]'
          : 'border-[#43505d] bg-[#f4f4f4] text-[#1e2935]',
      ].join(' ')}
    >
      {label} ×
    </button>
  );
}

function SidebarRow({ item, checked, onToggle }: SidebarRowProps) {
  return (
    <button
      type="button"
      onClick={() => onToggle(item.id)}
      className="flex h-12 w-full items-center justify-between rounded-[8px] border border-transparent bg-[#162331] px-3 text-left transition hover:border-[#29475e] hover:bg-[#1b2a3a]"
    >
      <div className="flex min-w-0 items-center gap-2">
        <GripVertical className="h-3.5 w-3.5 shrink-0 text-[#6f8092]" />
        <span className="truncate text-[11px] font-medium text-[#cfd9e5]">
          {item.label}
        </span>
      </div>
      <span
        className={[
          'h-[15px] w-[15px] shrink-0 rounded-full border',
          checked
            ? 'border-[#18c99f] bg-[#0f8f73] shadow-[inset_0_0_0_3px_#162331]'
            : 'border-[#8896a7]',
        ].join(' ')}
      />
    </button>
  );
}

export function TradeAnalyticsBuilder({
  sections,
  selectedMetrics,
  lineSeries,
  tradeDetailRows,
}: TradeAnalyticsBuilderProps) {
  const [builderTab, setBuilderTab] = useState<'create' | 'default' | 'custom'>('default');
  const [mode, setMode] = useState<'line' | 'bar' | 'candles'>('line');
  const [activeSidebarTab, setActiveSidebarTab] = useState<'data' | 'dashboard'>('data');
  const [selectedIds, setSelectedIds] = useState<AnalyticsMetricId[]>(
    selectedMetrics.map((metric) => metric.id)
  );

  const visibleMetrics = useMemo(
    () =>
      sections
        .flatMap((section) => section.metrics)
        .filter((metric) => selectedIds.includes(metric.id)),
    [sections, selectedIds]
  );

  const toggleMetric = (id: AnalyticsMetricId) => {
    setSelectedIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    );
  };

  return (
    <div className="px-5 pb-5 pt-5">
      <div className="flex flex-wrap items-center gap-2">
        {[
          { id: 'create' as const, label: 'Create Analytics' },
          { id: 'default' as const, label: 'Default Dashboard' },
          { id: 'custom' as const, label: 'Custom Dashboard' },
        ].map((tab) => {
          const active = builderTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setBuilderTab(tab.id)}
              className={[
                'inline-flex h-8 items-center rounded-[8px] border px-4 text-[10px] font-medium transition',
                active
                  ? 'border-[#0f8f73] bg-[#0d2b22] text-[#18c99f]'
                  : 'border-[#244053] bg-transparent text-[#7f8ea3] hover:bg-white/5',
              ].join(' ')}
            >
              {tab.label}
            </button>
          );
        })}
        <div className="ml-1 hidden h-5 w-px bg-[#223344] md:block" />
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1.55fr_0.62fr]">
        <div className="min-w-0">
          <div className="rounded-[12px] border border-white/6 bg-[#101c28] p-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2 text-[12px] font-medium text-[#d8e2ed]">
                {timeframes.map((item) => (
                  <button
                    key={item}
                    type="button"
                    className={`rounded-full px-2.5 py-1 leading-none transition ${item === '1M' ? 'bg-[#143629] text-[#1ec99f]' : 'text-[#93a5b8] hover:bg-white/5'}`}
                  >
                    {item}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-1 rounded-full border border-white/8 bg-[#0d1721] p-1 text-[#d8e2ed]">
                <button type="button" onClick={() => setMode('candles')} className={`rounded-full p-2 transition ${mode === 'candles' ? 'bg-[#143629] text-[#18c99f]' : 'text-[#88a0b5] hover:bg-white/5'}`}>
                  <CandlestickChart className="h-4 w-4" />
                </button>
                <button type="button" onClick={() => setMode('line')} className={`rounded-full p-2 transition ${mode === 'line' ? 'bg-[#143629] text-[#18c99f]' : 'text-[#88a0b5] hover:bg-white/5'}`}>
                  <LineChart className="h-4 w-4" />
                </button>
                <button type="button" onClick={() => setMode('bar')} className={`rounded-full p-2 transition ${mode === 'bar' ? 'bg-[#143629] text-[#18c99f]' : 'text-[#88a0b5] hover:bg-white/5'}`}>
                  <BarChart3 className="h-4 w-4" />
                </button>
                <button type="button" className="rounded-full p-2 text-[12px] text-[#88a0b5] transition hover:bg-white/5">
                  🗓
                </button>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold text-white">Widget Builder</p>
                <p className="mt-1 text-[11px] text-[#8093a6]">
                  Curate the metrics you want to compare, then inspect the chart and ledger together.
                </p>
              </div>
              <div className="inline-flex h-8 items-center rounded-[8px] border border-[#3b4f64] bg-[#121d27] px-3 text-[10px] font-medium text-[#dce6f2]">
                Create Widget
              </div>
            </div>
          </div>

          <div className="mt-3 rounded-[12px] border border-white/6 bg-[#101c28] p-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[11px] font-semibold text-white">Selected Data Points</p>
              <p className="text-[10px] text-[#6f8499]">{visibleMetrics.length} active</p>
            </div>
            <div className="mt-3 flex flex-wrap gap-[8px]">
              {visibleMetrics.map((metric) => (
                <BuilderChip
                  key={metric.id}
                  label={metric.label}
                  active={metric.chartType === 'line' || metric.chartType === 'metric'}
                  onRemove={() => toggleMetric(metric.id)}
                />
              ))}
            </div>
          </div>

          <div className="mt-5 overflow-hidden rounded-[14px] border border-[#203142] bg-[#0e1822] shadow-[0_14px_40px_rgba(0,0,0,0.16)]">
            <div className="relative h-[430px] overflow-hidden">
              <div className="absolute left-5 top-4 z-10">
                <p className="text-[11px] font-semibold text-white">Profit / Loss Canvas</p>
                <p className="mt-1 text-[10px] text-[#7f93a8]">
                  Multi-point view for selected analytics signals.
                </p>
              </div>
              <div className="absolute right-7 top-4 text-[10px] text-[#cfd9e5]">
                USD <span className="text-[#7f8ea3]">▾</span>
              </div>
              <div className="absolute inset-0 px-2 pb-3 pt-16">
                <BuilderCanvasChart data={lineSeries} mode={mode} />
              </div>
            </div>
          </div>

          <div className="mt-5">
            <div className="mb-3 inline-flex h-6 items-center rounded-full bg-[#1c2a39] px-3 text-[10px] font-medium text-[#7f8ea3]">
              Trade Detail
            </div>
            <div className="overflow-hidden rounded-[12px] border border-[#1a2837] bg-[#162331]">
              <div className="grid grid-cols-[0.95fr_0.95fr_0.65fr_0.9fr_1fr_1fr_0.9fr_1fr_0.9fr_1fr_1fr_0.9fr_0.65fr_0.95fr_0.95fr] items-center px-2 py-[5px] text-[9px] font-medium leading-none text-[#7f8da1]">
                {['Date', 'Time', 'Qty', 'Symbol', 'Setup', 'Review', 'Price', 'Result', 'Price', 'Review', 'Setup', 'Symbol', 'Qty', 'Time', 'Date'].map((label, index) => (
                  <div key={`${label}-${index}`} className={`text-center ${label === 'Result' ? 'font-semibold text-[#dbe6f2]' : ''}`}>
                    {label}
                  </div>
                ))}
              </div>
              <div className="space-y-[2px] bg-[#111c29] p-[3px]">
                {tradeDetailRows.map((row) => (
                  <div
                    key={row.id}
                    className="grid grid-cols-[4px_0.95fr_0.95fr_0.65fr_0.9fr_1fr_1fr_0.9fr_1fr_0.9fr_1fr_1fr_0.9fr_0.65fr_0.95fr_0.95fr] items-center rounded-[4px] bg-[#182534]"
                  >
                    <div
                      className={`mx-auto h-[28px] w-[3px] rounded-full ${row.status === 'loss' ? 'bg-[#ef4444]' : 'bg-[#18c99f]'}`}
                    />
                    {row.left.map((item, index) => (
                      <div key={`${row.id}-left-${index}`} className="truncate px-2 py-[7px] text-center text-[9.5px] leading-none text-[#d7e1eb]">
                        {item}
                      </div>
                    ))}
                    <div className={`truncate px-2 py-[7px] text-center text-[10px] font-semibold leading-none ${row.result >= 0 ? 'text-[#18d39a]' : 'text-[#ef5350]'}`}>
                      ₹ {formatChartCurrency(Math.abs(row.result))}
                    </div>
                    {row.right.map((item, index) => (
                      <div key={`${row.id}-right-${index}`} className="truncate px-2 py-[7px] text-center text-[9.5px] leading-none text-[#d7e1eb]">
                        {item}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="min-w-0">
          <div className="sticky top-4 h-full rounded-[14px] border border-[#203142] bg-[#0f1822] px-4 pb-4 pt-4">
            <div className="mb-4">
              <p className="text-[11px] font-semibold text-white">Analytics Library</p>
              <p className="mt-1 text-[11px] text-[#7e92a7]">
                Search, filter, and toggle the metrics that shape your builder canvas.
              </p>
            </div>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#738396]" />
              <input
                type="text"
                placeholder="Search"
                className="h-10 w-full rounded-full border border-[#314151] bg-transparent pl-9 pr-4 text-[11px] text-[#dbe6f2] outline-none placeholder:text-[#738396]"
              />
            </div>
            <button type="button" className="mt-4 text-[10px] font-medium text-[#18c99f]">
              Select All
            </button>
            <div className="mt-4 flex items-center gap-3 border-b border-[#203142] pb-3">
              <button
                onClick={() => setActiveSidebarTab('data')}
                className={`inline-flex h-8 items-center rounded-full px-3 text-[10px] font-semibold transition ${activeSidebarTab === 'data' ? 'bg-[#0f8f73]/14 text-[#18c99f]' : 'text-[#7f8ea3] hover:bg-white/5'}`}
              >
                Data Points
              </button>
              <button
                onClick={() => setActiveSidebarTab('dashboard')}
                className={`inline-flex h-8 items-center rounded-full px-3 text-[10px] font-medium transition ${activeSidebarTab === 'dashboard' ? 'bg-[#0f8f73]/14 text-[#18c99f]' : 'text-[#7f8ea3] hover:bg-white/5'}`}
              >
                Dashboard Analytics
              </button>
            </div>

            {sections.map((section) => (
              <div key={section.id} className="mt-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.05em] text-[#7f8ea3]">
                  {section.label}
                </p>
                <div className="mt-3 space-y-[6px]">
                  {section.metrics.map((item) => (
                    <SidebarRow
                      key={item.id}
                      item={item}
                      checked={selectedIds.includes(item.id)}
                      onToggle={toggleMetric}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
