'use client';

import { useMemo, useState } from 'react';
import { ChevronDown, Pin } from 'lucide-react';
import type { CalendarBucket, PnlPoint } from '@/lib/api/types';

function PerformanceChart({ data }: { data: PnlPoint[] }) {
  const values = data.map((point) => point.value);
  const min = Math.min(...values, 0);
  const max = Math.max(...values, 1);
  const width = 760;
  const height = 310;
  const left = 28;
  const top = 24;
  const chartWidth = width - left - 84;
  const chartHeight = height - top - 48;

  const points = data.map((point, index) => {
    const x = left + (index * chartWidth) / Math.max(data.length - 1, 1);
    const y =
      top + chartHeight - ((point.value - min) / Math.max(max - min, 1)) * chartHeight;
    return { ...point, x, y };
  });

  const linePath = points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
    .join(' ');

  const areaPath = `${linePath} L ${points[points.length - 1]?.x ?? left} ${
    top + chartHeight
  } L ${points[0]?.x ?? left} ${top + chartHeight} Z`;

  const focusPoint = points[Math.min(2, points.length - 1)];
  const ticks = [0, 50000, 55000, 60000, 65000, 70000, 75000];

  return (
    <div className="relative h-[360px] w-full">
      <svg viewBox={`0 0 ${width} ${height}`} className="h-full w-full">
        <defs>
          <linearGradient id="performanceFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#43c98c" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#43c98c" stopOpacity="0.03" />
          </linearGradient>
        </defs>

        <rect x="0" y="0" width={width} height={height} fill="transparent" />

        {ticks.map((tick, index) => {
          const y = top + chartHeight - (index / Math.max(ticks.length - 1, 1)) * chartHeight;
          return (
            <g key={tick}>
              <line
                x1={left}
                x2={left + chartWidth}
                y1={y}
                y2={y}
                stroke="#243241"
                strokeWidth="1"
                opacity="0.3"
              />
              <text x={left + chartWidth + 18} y={y + 4} fill="#b2bcc8" fontSize="11">
                ${tick}
              </text>
            </g>
          );
        })}

        <path d={areaPath} fill="url(#performanceFill)" />
        <path d={linePath} fill="none" stroke="#43c98c" strokeWidth="4" strokeLinecap="round" />

        {focusPoint ? (
          <g>
            <line
              x1={focusPoint.x}
              x2={focusPoint.x}
              y1={focusPoint.y}
              y2={top + chartHeight}
              stroke="#6d8179"
              strokeWidth="1"
              opacity="0.55"
            />
            <circle cx={focusPoint.x} cy={focusPoint.y} r="10" fill="#f8fafb" />
          </g>
        ) : null}

        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((label, index) => {
          const x = left + (index * chartWidth) / 4;
          return (
            <text key={label} x={x} y={height - 14} fill="#b2bcc8" fontSize="12">
              {label}
            </text>
          );
        })}
      </svg>
    </div>
  );
}

function PerformanceCalendar({ data }: { data: CalendarBucket[] }) {
  const byDay = useMemo(() => {
    const map = new Map<number, CalendarBucket>();
    data.forEach((bucket) => {
      map.set(new Date(bucket.date).getDate(), bucket);
    });
    return map;
  }, [data]);

  const monthDays = Array.from({ length: 31 }, (_, index) => index + 1);
  const firstDayOffset = 1;
  const cells = [...Array.from({ length: firstDayOffset }, () => null), ...monthDays];
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-7 gap-3 px-1 text-[12px] text-[#adb9c5]">
        {weekdays.map((day) => (
          <div key={day}>{day}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-3">
        {cells.map((day, index) => {
          if (day === null) {
            return <div key={`empty-${index}`} />;
          }

          const bucket = byDay.get(day);
          const positive = (bucket?.pnl ?? 0) > 0;
          const negative = (bucket?.pnl ?? 0) < 0;

          return (
            <div
              key={day}
              className={`min-h-[74px] rounded-[8px] border px-3 py-2 ${
                !bucket
                  ? 'border-[#414247] bg-[#3a393e] text-[#8a8f95]'
                  : positive
                    ? 'border-[#2e7f53] bg-[#2d824a]'
                    : negative
                      ? 'border-[#935041] bg-[#b5533f]'
                      : 'border-[#273646] bg-[#22303d]'
              }`}
            >
              {bucket ? (
                <>
                  <div className="text-[11px] font-semibold text-white">{String(day).padStart(2, '0')}</div>
                  <div className="mt-1 text-[18px] font-medium text-[#eef4fb]">
                    {bucket.pnl >= 0 ? '$' : '-$'}
                    {Math.abs(bucket.pnl)}
                  </div>
                  <div className="mt-1 text-right text-[10px] text-white/90">
                    {bucket.count} trades
                  </div>
                </>
              ) : (
                <>
                  <div className="text-[11px] font-semibold text-[#c3c6ca]">{String(day).padStart(2, '0')}</div>
                  <div className="mt-3 text-center text-[11px] text-[#a5a8ad]">No trade</div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function NoteCard({
  title,
  body,
}: {
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-[6px] bg-[#2b3642] p-4">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-[14px] font-semibold text-[#dce4ec]">{title}</h3>
        <Pin className="mt-0.5 h-4 w-4 text-[#dbe3eb]" />
      </div>
      <p className="mt-3 text-[12px] leading-6 text-[#e1e7ee]">{body}</p>
      <p className="mt-7 text-[11px] text-[#8f9baa]">Today, 9:45 am</p>
    </div>
  );
}

export function DashboardPerformanceSection({
  calendar,
  pnlSeries,
}: {
  calendar: CalendarBucket[];
  pnlSeries: PnlPoint[];
}) {
  const [view, setView] = useState<'chart' | 'calendar'>('chart');

  return (
    <section className="grid gap-4 xl:grid-cols-[1.68fr_0.82fr]">
      <div className="rounded-[10px] border border-[#273646] bg-[#1e2935] p-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-[14px] font-semibold text-[#eef4fb]">
              {view === 'chart' ? 'Performance' : 'Performance Overview'}
            </h2>
          </div>
          <button className="inline-flex h-8 items-center gap-1 rounded-full bg-[#138765]/18 px-3 text-[11px] font-medium text-[#29cf9f]">
            {view === 'chart' ? 'Week' : 'October'}
            <ChevronDown className="h-3 w-3" />
          </button>
        </div>

        <div className="mt-3 flex items-center gap-3">
          <button
            type="button"
            onClick={() => setView('chart')}
            className={`rounded-full px-6 py-2 text-[13px] font-medium transition ${
              view === 'chart'
                ? 'bg-[#26343f] text-[#19c99f]'
                : 'text-[#9faab7]'
            }`}
          >
            Chart View
          </button>
          <button
            type="button"
            onClick={() => setView('calendar')}
            className={`rounded-full px-6 py-2 text-[13px] font-medium transition ${
              view === 'calendar'
                ? 'bg-[#26343f] text-[#19c99f]'
                : 'text-[#9faab7]'
            }`}
          >
            Calendar View
          </button>
        </div>

        <div className="mt-4">
          {view === 'chart' ? (
            <PerformanceChart data={pnlSeries} />
          ) : (
            <PerformanceCalendar data={calendar} />
          )}
        </div>
      </div>

      <div className="rounded-[10px] border border-[#273646] bg-[#1e2935] p-4">
        <h2 className="text-[14px] font-semibold text-[#eef4fb]">Today&apos;s Notes</h2>
        <div className="mt-4 space-y-4">
          <NoteCard
            title="Market Analysis"
            body="Key level breach at 19750 in Nifty. Multiple resistance breakouts in Bank Nifty component stocks. Increased position size in HDFC Bank swing trade. Watching 42800 as next resistance."
          />
          <NoteCard
            title="Trade Review"
            body="Stopped out of Reliance long position -0.8R. Poor entry on momentum break. Need to wait for consolidation next time. IT sector showing relative strength."
          />
          <NoteCard
            title="Risk Management"
            body="Kept position sizes at 1% per trade today due to high VIX. Overall exposure at 15%. Reduced leverage in commodity trades."
          />
        </div>
      </div>
    </section>
  );
}
