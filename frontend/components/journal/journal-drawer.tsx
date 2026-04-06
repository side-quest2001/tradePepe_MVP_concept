'use client';

import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ChevronLeft,
  Expand,
  Maximize2,
  Minimize2,
  MoreHorizontal,
  Save,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  formatCompactPrice,
  formatLedgerDate,
  formatLedgerTime,
} from '@/components/journal/grouped-trade-card.helpers';
import { JournalRichTextEditor } from '@/components/journal/journal-rich-text-editor';
import type { OrderGroup, PnlPoint } from '@/lib/api/types';

type DrawerPnlDatum = {
  label: string;
  value: number;
};

function PriceActionChart({ expanded }: { expanded: boolean }) {
  const candles = [
    { x: 26, open: 196, close: 191, high: 203, low: 186, color: '#00d0a6' },
    { x: 56, open: 191, close: 188, high: 198, low: 182, color: '#ef4444' },
    { x: 86, open: 188, close: 202, high: 207, low: 185, color: '#00d0a6' },
    { x: 116, open: 202, close: 197, high: 209, low: 193, color: '#ef4444' },
    { x: 146, open: 197, close: 214, high: 220, low: 194, color: '#00d0a6' },
    { x: 176, open: 214, close: 228, high: 234, low: 210, color: '#00d0a6' },
    { x: 206, open: 228, close: 222, high: 234, low: 218, color: '#ef4444' },
    { x: 236, open: 222, close: 236, high: 242, low: 218, color: '#00d0a6' },
    { x: 266, open: 236, close: 252, high: 258, low: 230, color: '#00d0a6' },
    { x: 296, open: 252, close: 244, high: 256, low: 239, color: '#ef4444' },
    { x: 326, open: 244, close: 256, high: 262, low: 241, color: '#00d0a6' },
    { x: 356, open: 256, close: 268, high: 275, low: 252, color: '#00d0a6' },
    { x: 386, open: 268, close: 262, high: 272, low: 257, color: '#ef4444' },
    { x: 416, open: 262, close: 276, high: 282, low: 258, color: '#00d0a6' },
    { x: 446, open: 276, close: 284, high: 292, low: 272, color: '#00d0a6' },
    { x: 476, open: 284, close: 279, high: 288, low: 274, color: '#ef4444' },
    { x: 506, open: 279, close: 288, high: 296, low: 275, color: '#00d0a6' },
    { x: 536, open: 288, close: 294, high: 300, low: 284, color: '#00d0a6' },
    { x: 566, open: 294, close: 286, high: 299, low: 280, color: '#ef4444' },
    { x: 596, open: 286, close: 291, high: 295, low: 282, color: '#00d0a6' },
  ];

  const width = expanded ? 880 : 440;
  const height = expanded ? 280 : 248;
  const viewHeight = expanded ? 310 : 278;
  const priceLabels = ['25,845.4', '25,826.0', '25,801.0', '25,775.7', '25,750.9', '25,704.0', '24,658.0'];
  const movingAverageFast = 'MAV(9) 25,771.8';
  const movingAverageSlow = 'MAV(21) 25,744.2';
  const timeline = expanded
    ? ['09:30', '10:30', '11:30', '12:30', '13:30', '14:30', '15:30']
    : ['09:30', '11:00', '12:30', '14:00', '15:30'];

  return (
    <div className="relative overflow-hidden rounded-[8px] border border-[#263443] bg-[#040506]">
      <div className="absolute inset-x-0 top-4 h-9 bg-[#511a1d]/38" />
      <div className="absolute inset-x-0 top-14 h-7 bg-[#6a211f]/30" />
      <div className="absolute inset-x-0 bottom-12 h-14 bg-[#14391f]/48" />
      <div className="absolute inset-x-0 top-2 z-[1] flex items-center justify-between px-3 text-[9px] font-medium text-[#9fb0c0]">
        <div className="flex items-center gap-3">
          <span className="text-[#f4a34d]">{movingAverageFast}</span>
          <span className="text-[#ff6464]">{movingAverageSlow}</span>
        </div>
        <span className="rounded bg-[#1d2a35] px-1.5 py-0.5 text-[#d7e0e8]">5m</span>
      </div>
      <svg viewBox={`0 0 ${width} ${viewHeight}`} className={`block w-full ${expanded ? 'h-[246px]' : 'h-[216px]'}`}>
        <rect x="0" y="0" width={width} height={viewHeight} fill="#050709" />
        {[46, 94, 142, 190, 238].map((y) => (
          <line key={y} x1="0" x2={width} y1={y} y2={y} stroke="#223241" strokeWidth="1" />
        ))}
        {[0.12, 0.24, 0.36, 0.48, 0.6, 0.72, 0.84].map((fraction) => (
          <line
            key={fraction}
            x1={width * fraction}
            x2={width * fraction}
            y1="0"
            y2={viewHeight}
            stroke="#18222d"
            strokeWidth="1"
          />
        ))}
        <path
          d={`M 12 176 C 82 172, 126 160, 176 146 S 276 138, 336 118 S 432 124, 596 108`}
          fill="none"
          stroke="#f3a63f"
          strokeWidth="2.1"
          opacity="0.78"
        />
        <path
          d={`M 16 188 C 90 185, 146 173, 212 162 S 318 142, 392 136 S 504 132, 606 126`}
          fill="none"
          stroke="#b63b42"
          strokeWidth="1.9"
          opacity="0.82"
        />
        <line x1="0" x2={width} y1="156" y2="156" stroke="#e5e7eb" strokeWidth="1" opacity="0.58" />
        <line x1="0" x2={width} y1="134" y2="134" stroke="#00d0a6" strokeWidth="1" opacity="0.45" />
        <line x1="0" x2={width} y1={height} y2={height} stroke="#e67c2f" strokeDasharray="4 4" opacity="0.4" />
        {candles.map((candle) => (
          <g key={candle.x}>
            <line x1={candle.x} x2={candle.x} y1={candle.high} y2={candle.low} stroke={candle.color} strokeWidth="1.5" />
            <rect
              x={candle.x - 6}
              y={Math.min(candle.open, candle.close)}
              width="12"
              height={Math.max(Math.abs(candle.open - candle.close), 6)}
              fill={candle.color}
              rx="2"
            />
          </g>
        ))}
        {timeline.map((label, index) => {
          const x = 14 + (index * (width - 48)) / Math.max(timeline.length - 1, 1);
          return (
            <text key={label} x={x} y={viewHeight - 10} fill="#7e8f9f" fontSize="9">
              {label}
            </text>
          );
        })}
      </svg>
      <div className="absolute inset-y-3 right-1 flex flex-col justify-between text-[9px] font-medium text-[#b8c4cf]">
        {priceLabels.map((label) => (
          <span key={label} className="rounded bg-[#2a3442] px-1 py-[1px] text-right">
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}

function DrawerExecutionTable({
  group,
  expanded,
}: {
  group: OrderGroup;
  expanded: boolean;
}) {
  const executions = [...group.entryOrders, ...group.exitOrders].slice(0, 3);

  return (
    <div className="overflow-hidden rounded-[7px] border border-[#2a3440] bg-[#202933]">
      {expanded ? (
        <div className="grid grid-cols-[8px_0.95fr_0.95fr_0.7fr_0.9fr_1fr_1fr_0.9fr_0.95fr_1fr_1fr_0.9fr_0.7fr_0.95fr_0.95fr] items-center px-2 py-[8px] text-[9px] font-medium text-[#8f9cad]">
          <div />
          {['Date', 'Time', 'Qty', 'Symbol', 'Setup', 'Review', 'Price', 'Result', 'Price', 'Review', 'Setup', 'Qty', 'Time', 'Date'].map((heading, index) => (
            <div key={`${heading}-${index}`} className="text-center">
              {heading}
            </div>
          ))}
        </div>
      ) : null}
      {executions.map((execution, index) => (
        <div
          key={execution.id}
          className={`grid grid-cols-[8px_0.95fr_0.95fr_0.7fr_0.9fr_1fr_1fr_0.9fr_0.95fr_1fr_1fr_0.9fr_0.7fr_0.95fr_0.95fr] items-center ${
            index !== executions.length - 1 ? 'border-t border-[#2b3744]' : ''
          }`}
        >
          <div className="flex justify-center">
            <span className={`h-10 w-[3px] rounded-full ${group.returnStatus === 'loss' ? 'bg-[#f04f4f]' : 'bg-[#19c39d]'}`} />
          </div>
          <div className="px-2 py-[11px] text-center text-[10px] text-[#d5dfeb]">{formatLedgerDate(execution.executedAt)}</div>
          <div className="px-2 py-[11px] text-center text-[10px] text-[#d5dfeb]">{formatLedgerTime(execution.executedAt)}</div>
          <div className="px-2 py-[11px] text-center text-[10px] text-[#d5dfeb]">{execution.qty}</div>
          <div className="px-2 py-[11px] text-center text-[10px] text-[#d5dfeb]">{execution.symbol}</div>
          <div className="px-2 py-[11px] text-center">
            <span className="inline-flex rounded bg-[#2b6ea2] px-2 py-[3px] text-[9px] font-semibold text-white/90">
              {execution.setup ?? 'Yolo'}
            </span>
          </div>
          <div className="px-2 py-[11px] text-center">
            <span className="inline-flex rounded bg-[#7b2d2d] px-2 py-[3px] text-[9px] font-semibold text-white/90">
              {execution.review ?? 'Good Entry'}
            </span>
          </div>
          <div className="px-2 py-[11px] text-center text-[10px] text-[#d5dfeb]">{formatCompactPrice(execution.tradedPrice)}</div>
          <div className={`px-2 py-[11px] text-center text-[11px] font-semibold ${group.realizedPnl >= 0 ? 'text-[#1fd19b]' : 'text-[#f04f4f]'}`}>
            {index === 0 ? `$ ${Math.abs(group.realizedPnl).toLocaleString()}` : index === 1 ? '$ 0' : '$ 195'}
          </div>
          <div className="px-2 py-[11px] text-center text-[10px] text-[#d5dfeb]">{formatCompactPrice(execution.tradedPrice + (index + 1) * 180)}</div>
          <div className="px-2 py-[11px] text-center">
            <span className="inline-flex rounded bg-[#9f6b2a] px-2 py-[3px] text-[9px] font-semibold text-white/90">Early Exit</span>
          </div>
          <div className="px-2 py-[11px] text-center">
            <span className="inline-flex rounded bg-[#b47b33] px-2 py-[3px] text-[9px] font-semibold text-white/90">Partial Exit</span>
          </div>
          <div className="px-2 py-[11px] text-center text-[10px] text-[#d5dfeb]">{Math.max(0.1, execution.qty / 250)}</div>
          <div className="px-2 py-[11px] text-center text-[10px] text-[#d5dfeb]">{formatLedgerTime(execution.executedAt)}</div>
          <div className="px-2 py-[11px] text-center text-[10px] text-[#d5dfeb]">{formatLedgerDate(execution.executedAt)}</div>
        </div>
      ))}
    </div>
  );
}

function PnlMiniChart({ data }: { data: DrawerPnlDatum[] }) {
  return (
    <div className="h-[210px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 6, right: 0, left: -18, bottom: 0 }}>
          <defs>
            <linearGradient id="drawerPnlGreen" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22c55e" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="#2a3440" />
          <ReferenceArea x1="12pm" x2="2pm" y1={0} y2={2000} fill="#1f7a47" fillOpacity={0.18} />
          <ReferenceArea x1="5pm" x2="7pm" y1={0} y2={1600} fill="#b64747" fillOpacity={0.18} />
          <ReferenceLine y={0} stroke="#7c8794" />
          <XAxis dataKey="label" tick={{ fill: '#8aa3ba', fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: '#8aa3ba', fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{
              background: '#15212b',
              border: '1px solid #2a3440',
              borderRadius: 12,
              color: '#dce6ef',
            }}
          />
          <Area type="monotone" dataKey="value" stroke="#d9e3ee" strokeWidth={1.6} fill="url(#drawerPnlGreen)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function JournalDrawer({
  open,
  expanded,
  group,
  pnlSeries,
  onClose,
  onToggleExpanded,
}: {
  open: boolean;
  expanded: boolean;
  group?: OrderGroup;
  pnlSeries: PnlPoint[];
  onClose: () => void;
  onToggleExpanded: () => void;
}) {
  const [notes, setNotes] = useState(group?.notesSummary ?? '');

  useEffect(() => {
    setNotes(group?.notesSummary ?? '');
  }, [group?.id, group?.notesSummary]);

  const width = expanded ? 920 : 456;
  const expandedWidth = 'calc(100vw - 88px)';
  const asideClassName = 'fixed inset-y-0 right-0 z-40 h-[100dvh] overflow-hidden';
  const pnlSummary = useMemo<DrawerPnlDatum[]>(
    () =>
      pnlSeries.map((point) => ({
        label: point.label,
        value: Math.max(Math.round(point.value / 10), 0),
      })),
    [pnlSeries]
  );

  if (!group) {
    return null;
  }

  return (
    <AnimatePresence>
      {open ? (
        <motion.aside
          initial={{ width: 0, opacity: 0 }}
          animate={expanded ? { width: expandedWidth, opacity: 1 } : { width, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 220, damping: 28 }}
          className={asideClassName}
        >
          <div className={`h-full min-h-0 ${expanded ? '' : 'pl-4'}`}>
            <div
              className={`flex h-full min-h-0 w-full flex-col overflow-hidden border-l border-[#2b3744] bg-[#182129] ${
                expanded
                  ? 'rounded-none shadow-[-18px_0_48px_rgba(0,0,0,0.2)]'
                  : 'rounded-l-[22px] shadow-[-18px_0_48px_rgba(0,0,0,0.35)]'
              }`}
            >
              <div className="flex flex-none items-center justify-between border-b border-[#27323c] px-4 py-3">
                <div className="flex items-center gap-3 text-[#d9e3ee]">
                  <button
                    onClick={onClose}
                    className="rounded-[8px] border border-[#33414f] p-1.5 text-[#b6c1cb] transition hover:bg-white/5"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    onClick={onToggleExpanded}
                    className="rounded-[8px] border border-transparent p-1.5 text-[#b6c1cb] transition hover:bg-white/5"
                  >
                    {expanded ? (
                      <Minimize2 className="h-4 w-4" />
                    ) : (
                      <Maximize2 className="h-4 w-4" />
                    )}
                  </button>
                  {!expanded ? <Expand className="h-4 w-4 text-[#b6c1cb]" /> : null}
                </div>

                <button className="rounded-full border border-[#46515d] p-1 text-[#c8d1da]">
                  <MoreHorizontal className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-5 pt-4">
                <h2 className="mb-3 text-[18px] font-semibold text-[#eef4fb]">
                  Long {group.symbol}
                </h2>

                <PriceActionChart expanded={expanded} />

                <div className="mt-3">
                  <DrawerExecutionTable group={group} expanded={expanded} />
                </div>

                {expanded ? (
                  <div className="mt-4 grid min-h-[400px] grid-cols-[1.15fr_0.95fr] gap-4">
                    <div className="flex min-h-0 min-w-0 flex-col overflow-hidden rounded-[10px] bg-[#202933] p-4">
                      <JournalRichTextEditor
                        key={`${group.id}-expanded`}
                        initialHtml={notes}
                        onChange={setNotes}
                      />
                      <div className="mt-4 flex flex-none items-center justify-between">
                        <button className="inline-flex items-center gap-2 rounded-full bg-[#10a886] px-4 py-2 text-[12px] font-semibold text-white transition hover:bg-[#13b992]">
                          <Save className="h-3.5 w-3.5" />
                          Save
                        </button>
                        <button className="text-[12px] text-[#b0bbc7]">Cancel</button>
                      </div>
                    </div>

                    <div className="flex min-h-0 min-w-0 flex-col overflow-hidden rounded-[10px] bg-[#202933] p-4">
                      <p className="text-[13px] font-semibold text-white">
                        Running Profit and Loss
                      </p>
                      <div className="mt-4 min-h-0 flex-1 overflow-y-auto">
                        <PnlMiniChart data={pnlSummary} />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 flex min-h-[390px] flex-col overflow-hidden rounded-[10px] bg-[#202933] p-4">
                    <JournalRichTextEditor
                      key={`${group.id}-compact`}
                      initialHtml={notes}
                      onChange={setNotes}
                    />
                    <div className="mt-4 flex flex-none items-center justify-between">
                      <button className="inline-flex items-center gap-2 rounded-full bg-[#10a886] px-4 py-2 text-[12px] font-semibold text-white transition hover:bg-[#13b992]">
                        <Save className="h-3.5 w-3.5" />
                        Save
                      </button>
                      <button className="text-[12px] text-[#b0bbc7]">Cancel</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.aside>
      ) : null}
    </AnimatePresence>
  );
}
