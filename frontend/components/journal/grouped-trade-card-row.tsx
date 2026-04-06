import type { ReactNode } from 'react';
import { ChevronDown, Pencil } from 'lucide-react';
import { OrderGroup } from '@/lib/api/types';
import {
  formatCompactCurrency,
  formatCompactPrice,
  formatLedgerDate,
  formatLedgerTime,
  getToneClasses,
} from '@/components/journal/grouped-trade-card.helpers';
import { GroupedTradeRow } from '@/components/journal/grouped-trade-card.types';

function LedgerPill({
  label,
  tone,
}: {
  label?: string;
  tone?: 'neutral' | 'success' | 'warning' | 'danger';
}) {
  if (!label) {
    return (
      <span className="inline-flex min-w-[62px] items-center justify-center rounded-[3px] bg-slate-500/20 px-2 py-[5px] text-[11px] font-semibold leading-none text-slate-300">
        N/A
      </span>
    );
  }

  return (
    <span
      className={`inline-flex min-w-[62px] items-center justify-center rounded-[3px] px-2 py-[5px] text-[11px] font-semibold leading-none ${getToneClasses(
        label,
        tone
      )}`}
    >
      {label}
    </span>
  );
}

function EditableLedgerPill({
  label,
  executionId,
  onOpenLabels,
}: {
  label?: string;
  executionId?: string;
  onOpenLabels?: (executionId: string) => void;
}) {
  return (
    <div className="group relative flex items-center justify-center px-1.5">
      <LedgerPill label={label} />
      {executionId ? (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onOpenLabels?.(executionId);
          }}
          className="absolute right-0 top-1/2 inline-flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full border border-[#486077] bg-[#243140] text-[#d6e0ea] opacity-0 transition duration-150 hover:border-[#6b87a4] hover:bg-[#2d3c4d] group-hover:opacity-100"
          aria-label="Edit labels"
        >
          <Pencil className="h-2.5 w-2.5" />
        </button>
      ) : null}
    </div>
  );
}

function LedgerCell({
  children,
  emphasis = false,
  className = '',
}: {
  children: ReactNode;
  emphasis?: boolean;
  className?: string;
}) {
  return (
    <div
      className={[
        'truncate px-2 py-[12px] text-center text-[12px] leading-none text-slate-200',
        emphasis ? 'font-semibold text-slate-100' : '',
        className,
      ].join(' ')}
    >
      {children}
    </div>
  );
}

export function GroupedTradeCardRow({
  group,
  row,
  index,
  totalRows,
  onOpenLabels,
}: {
  group: OrderGroup;
  row: GroupedTradeRow;
  index: number;
  totalRows: number;
  onOpenLabels?: (executionId: string) => void;
}) {
  const indicatorTone =
    group.returnStatus === 'win'
      ? 'bg-emerald-400'
      : group.returnStatus === 'loss'
        ? 'bg-rose-400'
        : 'bg-amber-400';

  return (
    <div
      className={[
        'grid grid-cols-[8px_0.95fr_0.95fr_0.65fr_0.9fr_1fr_1fr_0.9fr_1.1fr_0.9fr_1fr_1fr_0.9fr_0.65fr_0.95fr_0.95fr_8px] items-center transition-colors',
        index !== totalRows - 1 ? 'border-b border-[#314255]' : '',
        index % 2 === 0 ? 'bg-[#1d2936]' : 'bg-[#182432]',
        'hover:bg-[#223141]',
      ].join(' ')}
    >
      <div className="flex h-full items-center justify-center">
        {group.returnStatus !== 'loss' ? (
          <span className={`h-[34px] w-[3px] rounded-full ${indicatorTone}`} />
        ) : null}
      </div>

      <LedgerCell>{row.left ? formatLedgerDate(row.left.executedAt) : '--'}</LedgerCell>
      <LedgerCell>{row.left ? formatLedgerTime(row.left.executedAt) : '--'}</LedgerCell>
      <LedgerCell>{row.left?.qty ?? '--'}</LedgerCell>
      <LedgerCell>{row.left?.symbol ?? '--'}</LedgerCell>
      <LedgerCell>
        <EditableLedgerPill
          label={row.left?.setup}
          executionId={row.left?.id}
          onOpenLabels={onOpenLabels}
        />
      </LedgerCell>
      <LedgerCell>
        <EditableLedgerPill
          label={row.left?.review}
          executionId={row.left?.id}
          onOpenLabels={onOpenLabels}
        />
      </LedgerCell>
      <LedgerCell emphasis>
        {row.left ? formatCompactPrice(row.left.tradedPrice) : '--'}
      </LedgerCell>

      <LedgerCell emphasis className="text-[13px]">
        <div className="flex items-center justify-center gap-1">
          <span
            className={
              row.result > 0
                ? 'text-emerald-400'
                : row.result < 0
                  ? 'text-rose-400'
                  : 'text-slate-500'
            }
          >
            {row.result === 0 ? '•' : formatCompactCurrency(row.result)}
          </span>
          {row.result !== 0 ? (
            <ChevronDown
              className={`h-3.5 w-3.5 ${
                row.result > 0 ? 'rotate-180 text-emerald-400' : 'text-rose-400'
              }`}
            />
          ) : null}
        </div>
      </LedgerCell>

      <LedgerCell emphasis>
        {row.right ? formatCompactPrice(row.right.tradedPrice) : '--'}
      </LedgerCell>
      <LedgerCell>
        <EditableLedgerPill
          label={row.right?.review}
          executionId={row.right?.id}
          onOpenLabels={onOpenLabels}
        />
      </LedgerCell>
      <LedgerCell>
        <EditableLedgerPill
          label={row.right?.setup}
          executionId={row.right?.id}
          onOpenLabels={onOpenLabels}
        />
      </LedgerCell>
      <LedgerCell>{row.right?.symbol ?? '--'}</LedgerCell>
      <LedgerCell>{row.right?.qty ?? '--'}</LedgerCell>
      <LedgerCell>{row.right ? formatLedgerTime(row.right.executedAt) : '--'}</LedgerCell>
      <LedgerCell>{row.right ? formatLedgerDate(row.right.executedAt) : '--'}</LedgerCell>

      <div className="flex h-full items-center justify-center">
        {group.returnStatus === 'loss' ? (
          <span className={`h-[34px] w-[3px] rounded-full ${indicatorTone}`} />
        ) : null}
      </div>
    </div>
  );
}
