import { OrderExecution, OrderGroup } from '@/lib/api/types';
import {
  GroupedTradeMetrics,
  GroupedTradeRow,
} from '@/components/journal/grouped-trade-card.types';

export function formatLedgerDate(value: string) {
  const date = new Date(value);
  return date.toLocaleDateString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: '2-digit',
  });
}

export function formatLedgerTime(value: string) {
  const date = new Date(value);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

export function formatCompactPrice(value: number) {
  return `$ ${value.toLocaleString('en-US', {
    maximumFractionDigits: value % 1 === 0 ? 0 : 2,
  })}`;
}

export function formatCompactCurrency(value: number) {
  const sign = value > 0 ? '' : value < 0 ? '-' : '';
  return `${sign}$ ${Math.abs(value).toLocaleString('en-US', {
    maximumFractionDigits: value % 1 === 0 ? 0 : 2,
  })}`;
}

export function getToneClasses(
  label?: string,
  fallback?: 'neutral' | 'success' | 'warning' | 'danger'
) {
  const value = label?.toLowerCase() ?? '';

  const tone =
    fallback ??
    (value.includes('good')
      ? 'success'
      : value.includes('break')
        ? 'warning'
        : value.includes('retrace') || value.includes('range')
          ? 'neutral'
          : value.includes('early')
            ? 'warning'
            : value.includes('sl') || value.includes('fomo')
              ? 'danger'
              : 'neutral');

  if (tone === 'success') return 'bg-emerald-500/18 text-emerald-300';
  if (tone === 'warning') return 'bg-amber-500/18 text-amber-300';
  if (tone === 'danger') return 'bg-rose-500/18 text-rose-300';
  return 'bg-sky-500/18 text-sky-200';
}

export function buildMirrorRows(group: OrderGroup): GroupedTradeRow[] {
  const executions = [...group.entryOrders, ...group.exitOrders].sort(
    (a, b) => new Date(a.executedAt).getTime() - new Date(b.executedAt).getTime()
  );

  const leftRows = executions;
  const rightRows = [...executions].reverse();
  const maxRows = Math.max(leftRows.length, 1);

  return Array.from({ length: maxRows }).map((_, index) => {
    const left = leftRows[index];
    const right = rightRows[index];

    let result = 0;

    if (index === 0 && group.unrealizedPnl !== 0 && maxRows > 1) {
      result = group.unrealizedPnl;
    }

    if (index === maxRows - 1) {
      result = group.realizedPnl;
    }

    return {
      id: `${left?.id ?? 'left'}-${right?.id ?? 'right'}-${index}`,
      left,
      right,
      result,
    };
  });
}

export function buildMetrics(
  group: OrderGroup,
  executions: OrderExecution[]
): GroupedTradeMetrics {
  const firstTime = new Date(group.firstInteractionDate).getTime();
  const lastTime = new Date(group.lastInteractionDate).getTime();
  const holdingMinutes = Math.max(Math.round((lastTime - firstTime) / 60000), 0);

  const transactionCost = (group.brokerFees ?? 0) + (group.charges ?? 0);
  const capitalAmount = executions.reduce(
    (sum, item) => sum + item.qty * item.tradedPrice,
    0
  );

  const stopLoss =
    executions.length > 0
      ? group.positionType === 'long'
        ? Math.min(...executions.map((item) => item.tradedPrice))
        : Math.max(...executions.map((item) => item.tradedPrice))
      : 0;

  return {
    left: [
      {
        label: 'Capital Amount',
        value: formatCompactCurrency(capitalAmount),
        subValue: group.realizedPnl > 0 ? '(75%)' : undefined,
        tone: group.realizedPnl >= 0 ? ('success' as const) : undefined,
      },
      {
        label: 'Average Holding Time',
        value: `${holdingMinutes} minutes`,
      },
      {
        label: 'Transaction Cost',
        value: formatCompactCurrency(transactionCost),
        tone: 'danger' as const,
      },
      {
        label: 'R : R',
        value:
          group.realizedPnl > 0 ? '1 : 4' : group.realizedPnl < 0 ? '1 : 1' : '1 : 0',
      },
      {
        label: 'Enter SL',
        value: formatCompactPrice(stopLoss),
      },
    ],
    center: {
      value: formatCompactCurrency(group.realizedPnl),
      tone: group.realizedPnl >= 0 ? ('success' as const) : ('danger' as const),
    },
    right: [
      {
        label: 'Remaining Qty',
        value: `${group.remainingQuantity}`,
      },
      {
        label: 'Realised',
        value: formatCompactCurrency(group.realizedPnl),
        tone: group.realizedPnl >= 0 ? ('success' as const) : ('danger' as const),
      },
      {
        label: 'Unrealised',
        value: formatCompactCurrency(group.unrealizedPnl),
        tone: group.unrealizedPnl >= 0 ? ('success' as const) : ('danger' as const),
      },
    ],
  };
}
