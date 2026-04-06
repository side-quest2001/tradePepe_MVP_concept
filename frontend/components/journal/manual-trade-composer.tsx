'use client';

import { useMemo, useState } from 'react';
import { CalendarDays, Check, ClipboardPenLine, Clock3, DollarSign, X } from 'lucide-react';
import type { OrderGroup, OrderExecution, Tag } from '@/lib/api/types';

type ManualTradeComposerProps = {
  onCancel: () => void;
  onSave: (group: OrderGroup) => void;
};

type DraftState = {
  symbol: string;
  positionType: 'long' | 'short';
  entryDate: string;
  entryTime: string;
  entryQty: string;
  entryPrice: string;
  entrySetup: string;
  entryReview: string;
  exitDate: string;
  exitTime: string;
  exitQty: string;
  exitPrice: string;
  exitSetup: string;
  exitReview: string;
};

function getNowDate() {
  return new Date().toISOString().slice(0, 10);
}

function getNowTime() {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
}

function createIso(date: string, time: string) {
  if (!date) return new Date().toISOString();
  return new Date(`${date}T${time || '00:00'}:00`).toISOString();
}

function inferTagColor(value: string, kind: 'setup' | 'review') {
  const label = value.toLowerCase();

  if (label.includes('good')) return '#22c55e';
  if (label.includes('break')) return '#f59e0b';
  if (label.includes('retrace')) return '#3b82f6';
  if (label.includes('fomo') || label.includes('sl')) return '#ef4444';
  if (label.includes('early')) return '#f59e0b';
  return kind === 'setup' ? '#14b8a6' : '#8b5cf6';
}

function makeTag(name: string, type: 'setup' | 'review'): Tag | null {
  const trimmed = name.trim();
  if (!trimmed) return null;

  return {
    id: `${type}-${trimmed.toLowerCase().replace(/\s+/g, '-')}`,
    name: trimmed,
    slug: trimmed.toLowerCase().replace(/\s+/g, '-'),
    color: inferTagColor(trimmed, type),
    type,
  };
}

function ComposerInput({
  value,
  onChange,
  placeholder,
  type = 'text',
  className = '',
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
  className?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      className={`h-10 rounded-[9px] border border-[#334453] bg-[#17232f] px-3 text-[13px] text-[#e7eef6] outline-none placeholder:text-[#6f8194] focus:border-[#4d728f] ${className}`}
    />
  );
}

export function ManualTradeComposer({
  onCancel,
  onSave,
}: ManualTradeComposerProps) {
  const [draft, setDraft] = useState<DraftState>({
    symbol: '',
    positionType: 'long',
    entryDate: getNowDate(),
    entryTime: getNowTime(),
    entryQty: '',
    entryPrice: '',
    entrySetup: '',
    entryReview: '',
    exitDate: getNowDate(),
    exitTime: getNowTime(),
    exitQty: '',
    exitPrice: '',
    exitSetup: '',
    exitReview: '',
  });

  const computedResult = useMemo(() => {
    const entryQty = Number(draft.entryQty || 0);
    const exitQty = Number(draft.exitQty || draft.entryQty || 0);
    const matchedQty = Math.min(entryQty, exitQty);
    const entryPrice = Number(draft.entryPrice || 0);
    const exitPrice = Number(draft.exitPrice || 0);

    if (!matchedQty || !entryPrice || !exitPrice) return 0;

    const delta =
      draft.positionType === 'long'
        ? exitPrice - entryPrice
        : entryPrice - exitPrice;

    return Math.round(delta * matchedQty);
  }, [draft.entryPrice, draft.entryQty, draft.exitPrice, draft.exitQty, draft.positionType]);

  function update<K extends keyof DraftState>(key: K, value: DraftState[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function handleSave() {
    const symbol = draft.symbol.trim();
    const entryQty = Number(draft.entryQty);
    const entryPrice = Number(draft.entryPrice);

    if (!symbol || !entryQty || !entryPrice) return;

    const entryExecution: OrderExecution = {
      id: `manual-entry-${Date.now()}`,
      executedAt: createIso(draft.entryDate, draft.entryTime),
      symbol,
      side: draft.positionType === 'long' ? 'buy' : 'sell',
      qty: entryQty,
      tradedPrice: entryPrice,
      setup: draft.entrySetup.trim() || undefined,
      review: draft.entryReview.trim() || undefined,
    };

    const exitQty = Number(draft.exitQty);
    const exitPrice = Number(draft.exitPrice);
    const hasExit = Boolean(exitQty && exitPrice && draft.exitDate);

    const exitExecution: OrderExecution[] = hasExit
      ? [
          {
            id: `manual-exit-${Date.now()}`,
            executedAt: createIso(draft.exitDate, draft.exitTime),
            symbol,
            side: draft.positionType === 'long' ? 'sell' : 'buy',
            qty: exitQty,
            tradedPrice: exitPrice,
            setup: draft.exitSetup.trim() || undefined,
            review: draft.exitReview.trim() || undefined,
          },
        ]
      : [];

    const setupTags = [makeTag(draft.entrySetup, 'setup'), makeTag(draft.exitSetup, 'setup')].filter(
      Boolean
    ) as Tag[];
    const reviewTags = [
      makeTag(draft.entryReview, 'review'),
      makeTag(draft.exitReview, 'review'),
    ].filter(Boolean) as Tag[];

    const group: OrderGroup = {
      id: `manual-group-${Date.now()}`,
      symbol,
      fundId: 'fund-manual',
      positionType: draft.positionType,
      firstInteractionDate: entryExecution.executedAt,
      lastInteractionDate: hasExit ? exitExecution[0].executedAt : entryExecution.executedAt,
      remainingQuantity: hasExit ? Math.max(entryQty - exitQty, 0) : entryQty,
      realizedPnl: hasExit ? computedResult : 0,
      unrealizedPnl: 0,
      returnStatus: !hasExit ? 'neutral' : computedResult > 0 ? 'win' : computedResult < 0 ? 'loss' : 'neutral',
      status: hasExit ? 'closed' : 'open',
      entryOrders: [entryExecution],
      exitOrders: exitExecution,
      setupTags,
      reviewTags,
      notesSummary: 'Manually added trade.',
      brokerFees: 0,
      charges: 0,
    };

    onSave(group);
  }

  return (
    <div className="overflow-hidden rounded-[11px] border border-[#2b3b4d] bg-[linear-gradient(180deg,#213041_0%,#182430_100%)] shadow-[0_18px_40px_rgba(0,0,0,0.22)]">
      <div className="flex items-center justify-between border-b border-[#2f4253] px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0f8f73]/18 text-[#19c99f]">
            <ClipboardPenLine className="h-4 w-4" />
          </div>
          <div>
            <p className="text-[13px] font-semibold text-[#eef4fb]">Add Manual Trade</p>
            <p className="text-[11px] text-[#8ea1b4]">Start with entry details, then fill exit if you have it.</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => update('positionType', 'long')}
            className={`rounded-full px-3 py-1 text-[11px] font-semibold transition ${
              draft.positionType === 'long'
                ? 'bg-[#114f42] text-[#2fe0b1]'
                : 'bg-[#182633] text-[#94a5b6]'
            }`}
          >
            Buy
          </button>
          <button
            type="button"
            onClick={() => update('positionType', 'short')}
            className={`rounded-full px-3 py-1 text-[11px] font-semibold transition ${
              draft.positionType === 'short'
                ? 'bg-[#5a2026] text-[#ff7a7a]'
                : 'bg-[#182633] text-[#94a5b6]'
            }`}
          >
            Sell
          </button>
        </div>
      </div>

      <div className="grid gap-4 px-4 py-4 xl:grid-cols-[1fr_132px_1fr]">
        <div className="rounded-[10px] border border-[#2c3c4d] bg-[#16222d] p-3">
          <div className="mb-3 flex items-center gap-2 text-[12px] font-semibold text-[#dfe9f3]">
            <CalendarDays className="h-4 w-4 text-[#8da4ba]" />
            Entry
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <ComposerInput value={draft.symbol} onChange={(value) => update('symbol', value)} placeholder="Symbol" className="md:col-span-2" />
            <ComposerInput value={draft.entryDate} onChange={(value) => update('entryDate', value)} placeholder="Date" type="date" />
            <ComposerInput value={draft.entryTime} onChange={(value) => update('entryTime', value)} placeholder="Time" type="time" />
            <ComposerInput value={draft.entryQty} onChange={(value) => update('entryQty', value)} placeholder="Qty" type="number" />
            <ComposerInput value={draft.entryPrice} onChange={(value) => update('entryPrice', value)} placeholder="Price" type="number" />
            <ComposerInput value={draft.entrySetup} onChange={(value) => update('entrySetup', value)} placeholder="Setup" />
            <ComposerInput value={draft.entryReview} onChange={(value) => update('entryReview', value)} placeholder="Review" />
          </div>
        </div>

        <div className="flex min-h-[160px] flex-col items-center justify-center rounded-[10px] border border-[#2c3c4d] bg-[#16222d] px-3 text-center">
          <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-full bg-[#203243] text-[#8ea1b4]">
            <DollarSign className="h-4 w-4" />
          </div>
          <p className="text-[11px] uppercase tracking-[0.08em] text-[#7f93a8]">Projected Result</p>
          <p className={`mt-2 text-[26px] font-semibold leading-none ${computedResult > 0 ? 'text-[#1ed39b]' : computedResult < 0 ? 'text-[#ef5b5b]' : 'text-[#dbe5ee]'}`}>
            ${computedResult.toLocaleString()}
          </p>
          <p className="mt-2 text-[11px] text-[#78899b]">You can save with only entry details too.</p>
        </div>

        <div className="rounded-[10px] border border-[#2c3c4d] bg-[#16222d] p-3">
          <div className="mb-3 flex items-center gap-2 text-[12px] font-semibold text-[#dfe9f3]">
            <Clock3 className="h-4 w-4 text-[#8da4ba]" />
            Exit
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <ComposerInput value={draft.exitDate} onChange={(value) => update('exitDate', value)} placeholder="Date" type="date" />
            <ComposerInput value={draft.exitTime} onChange={(value) => update('exitTime', value)} placeholder="Time" type="time" />
            <ComposerInput value={draft.exitQty} onChange={(value) => update('exitQty', value)} placeholder="Qty" type="number" />
            <ComposerInput value={draft.exitPrice} onChange={(value) => update('exitPrice', value)} placeholder="Price" type="number" />
            <ComposerInput value={draft.exitSetup} onChange={(value) => update('exitSetup', value)} placeholder="Setup" />
            <ComposerInput value={draft.exitReview} onChange={(value) => update('exitReview', value)} placeholder="Review" />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-[#2f4253] bg-[#14202a] px-4 py-3">
        <p className="text-[11px] text-[#8092a5]">Tip: Save a partial trade now and complete the exit later.</p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center gap-2 rounded-[8px] px-3 py-2 text-[12px] font-medium text-[#b6c3cf] transition hover:bg-white/5"
          >
            <X className="h-3.5 w-3.5" />
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="inline-flex items-center gap-2 rounded-[8px] bg-[#11a684] px-4 py-2 text-[12px] font-semibold text-white transition hover:bg-[#18ba94]"
          >
            <Check className="h-3.5 w-3.5" />
            Save Trade
          </button>
        </div>
      </div>
    </div>
  );
}
