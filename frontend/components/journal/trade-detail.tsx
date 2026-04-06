import { Panel } from '@/components/ui/panel';
import { PnlLineChart } from '@/components/charts/pnl-line-chart';
import { OrderExecution, OrderGroup, PnlPoint } from '@/lib/api/types';
import { formatCurrency } from '@/lib/utils/format';

function formatLedgerDate(value: string) {
  const date = new Date(value);
  return date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' });
}

function formatLedgerTime(value: string) {
  const date = new Date(value);
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
}

function formatCompactPrice(value: number) {
  return `$ ${value.toLocaleString('en-US', { maximumFractionDigits: value % 1 === 0 ? 0 : 2 })}`;
}

function formatCompactCurrency(value: number) {
  const sign = value > 0 ? '+' : value < 0 ? '-' : '';
  return `${sign}${formatCurrency(Math.abs(value))}`;
}

function getToneClasses(label?: string, fallback?: 'neutral' | 'success' | 'warning' | 'danger') {
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

  if (tone === 'success') return 'bg-emerald-500/20 text-emerald-300 ring-1 ring-inset ring-emerald-500/30';
  if (tone === 'warning') return 'bg-amber-500/20 text-amber-300 ring-1 ring-inset ring-amber-500/30';
  if (tone === 'danger') return 'bg-rose-500/20 text-rose-300 ring-1 ring-inset ring-rose-500/30';
  return 'bg-sky-500/20 text-sky-200 ring-1 ring-inset ring-sky-500/30';
}

function LedgerPill({ label, tone }: { label?: string; tone?: 'neutral' | 'success' | 'warning' | 'danger' }) {
  if (!label) return <span className="inline-flex rounded-md bg-slate-500/15 px-2 py-0.5 text-[10px] font-semibold text-slate-300">N/A</span>;

  return (
    <span className={`inline-flex rounded-md px-2 py-0.5 text-[10px] font-semibold ${getToneClasses(label, tone)}`}>
      {label}
    </span>
  );
}

function LedgerCell({ children, align = 'left', emphasis = false }: { children: React.ReactNode; align?: 'left' | 'center' | 'right'; emphasis?: boolean }) {
  return (
    <div
      className={[
        'truncate px-2 py-2 text-[11px] text-slate-300',
        align === 'center' ? 'text-center' : '',
        align === 'right' ? 'text-right' : '',
        emphasis ? 'font-semibold text-slate-100' : '',
      ].join(' ')}
    >
      {children}
    </div>
  );
}

function buildMirrorRows(executions: OrderExecution[], group: OrderGroup) {
  const sorted = [...executions].sort((a, b) => new Date(a.executedAt).getTime() - new Date(b.executedAt).getTime());
  const reversed = [...sorted].reverse();
  const averageEntry = sorted.reduce((sum, item) => sum + item.tradedPrice, 0) / Math.max(sorted.length, 1);

  return sorted.map((left, index) => {
    const right = reversed[index];
    const isResultRow = index === sorted.length - 1;
    const rowPnl = isResultRow ? group.realizedPnl : index === Math.max(sorted.length - 2, 0) ? group.unrealizedPnl : 0;

    return {
      id: `${left.id}-${right?.id ?? index}`,
      left,
      right,
      result: rowPnl,
      averageEntry,
    };
  });
}

function buildMetrics(group: OrderGroup, executions: OrderExecution[]) {
  const firstTime = new Date(group.firstInteractionDate).getTime();
  const lastTime = new Date(group.lastInteractionDate).getTime();
  const holdingMinutes = Math.max(Math.round((lastTime - firstTime) / 60000), 0);
  const transactionCost = (group.brokerFees ?? 0) + (group.charges ?? 0);
  const totalQty = executions.reduce((sum, item) => sum + item.qty, 0);
  const capitalAmount = executions.reduce((sum, item) => sum + item.qty * item.tradedPrice, 0);
  const stopLoss =
    group.positionType === 'long'
      ? Math.min(...executions.map((item) => item.tradedPrice))
      : Math.max(...executions.map((item) => item.tradedPrice));
  const riskReward = group.realizedPnl > 0 ? '1 : 4' : group.realizedPnl < 0 ? '1 : 1' : '1 : 0';

  return [
    { label: 'Capital Amount', value: formatCurrency(capitalAmount) },
    { label: 'Average Holding Time', value: `${holdingMinutes} minutes` },
    { label: 'Transaction Cost', value: formatCurrency(transactionCost), tone: 'danger' as const },
    { label: 'R : R', value: riskReward },
    { label: 'Enter SL', value: formatCompactPrice(stopLoss) },
    { label: 'Net Result', value: formatCompactCurrency(group.realizedPnl), tone: group.realizedPnl >= 0 ? ('success' as const) : ('danger' as const) },
    { label: 'Remaining Qty', value: `${group.remainingQuantity}` },
    { label: 'Realised', value: formatCompactCurrency(group.realizedPnl), tone: group.realizedPnl >= 0 ? ('success' as const) : ('danger' as const) },
    { label: 'Unrealised', value: formatCompactCurrency(group.unrealizedPnl), tone: group.unrealizedPnl >= 0 ? ('success' as const) : ('danger' as const) },
    { label: 'Transaction Qty', value: `${totalQty}` },
  ];
}

export function TradeDetail({ group, pnlSeries }: { group: OrderGroup; pnlSeries: PnlPoint[] }) {
  const executions = [...group.entryOrders, ...group.exitOrders];
  const rows = buildMirrorRows(executions, group);
  const metrics = buildMetrics(group, executions);

  return (
    <div className="space-y-6">
      <Panel className="overflow-hidden border-white/10 bg-[#1f2731] p-3 shadow-[0_24px_60px_rgba(0,0,0,0.35)]">
        <div className="rounded-[28px] border border-white/10 bg-[#202832] p-3">
          <div className="overflow-hidden rounded-[22px] border border-white/5 bg-[#1f2731]">
            <div className="grid grid-cols-[18px_minmax(74px,1fr)_minmax(84px,1fr)_minmax(52px,0.7fr)_minmax(68px,0.8fr)_minmax(104px,1fr)_minmax(88px,0.8fr)_minmax(120px,1fr)_minmax(88px,0.8fr)_minmax(104px,1fr)_minmax(68px,0.8fr)_minmax(52px,0.7fr)_minmax(84px,1fr)_minmax(74px,1fr)] border-b border-white/5 bg-[#27313d] text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
              <LedgerCell />
              <LedgerCell align="center">Date</LedgerCell>
              <LedgerCell align="center">Time</LedgerCell>
              <LedgerCell align="center">Qty</LedgerCell>
              <LedgerCell align="center">Symbol</LedgerCell>
              <LedgerCell align="center">Setup</LedgerCell>
              <LedgerCell align="center">Review</LedgerCell>
              <LedgerCell align="center">Price</LedgerCell>
              <LedgerCell align="center">Result</LedgerCell>
              <LedgerCell align="center">Price</LedgerCell>
              <LedgerCell align="center">Review</LedgerCell>
              <LedgerCell align="center">Setup</LedgerCell>
              <LedgerCell align="center">Symbol</LedgerCell>
              <LedgerCell align="center">Qty</LedgerCell>
            </div>
            {rows.map((row, index) => (
              <div
                key={row.id}
                className="grid grid-cols-[18px_minmax(74px,1fr)_minmax(84px,1fr)_minmax(52px,0.7fr)_minmax(68px,0.8fr)_minmax(104px,1fr)_minmax(88px,0.8fr)_minmax(120px,1fr)_minmax(88px,0.8fr)_minmax(120px,1fr)_minmax(88px,0.8fr)_minmax(104px,1fr)_minmax(68px,0.8fr)_minmax(52px,0.7fr)] border-b border-white/5 bg-[#222b36] even:bg-[#252f3a]"
              >
                <div className="flex items-center justify-center px-1">
                  <span className={`h-7 w-1 rounded-full ${group.realizedPnl >= 0 ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                </div>
                <LedgerCell align="center">{formatLedgerDate(row.left.executedAt)}</LedgerCell>
                <LedgerCell align="center">{formatLedgerTime(row.left.executedAt)}</LedgerCell>
                <LedgerCell align="center">{row.left.qty}</LedgerCell>
                <LedgerCell align="center">{row.left.symbol}</LedgerCell>
                <LedgerCell align="center"><LedgerPill label={row.left.setup} /></LedgerCell>
                <LedgerCell align="center"><LedgerPill label={row.left.review} /></LedgerCell>
                <LedgerCell align="center" emphasis>{formatCompactPrice(row.left.tradedPrice)}</LedgerCell>
                <LedgerCell align="center" emphasis>
                  <span className={row.result > 0 ? 'text-emerald-400' : row.result < 0 ? 'text-rose-400' : 'text-slate-500'}>
                    {row.result === 0 ? '•' : formatCompactCurrency(row.result)}
                  </span>
                </LedgerCell>
                <LedgerCell align="center" emphasis>{row.right ? formatCompactPrice(row.right.tradedPrice) : '--'}</LedgerCell>
                <LedgerCell align="center"><LedgerPill label={row.right?.review} /></LedgerCell>
                <LedgerCell align="center"><LedgerPill label={row.right?.setup} /></LedgerCell>
                <LedgerCell align="center">{row.right?.symbol ?? '--'}</LedgerCell>
                <LedgerCell align="center">{row.right?.qty ?? '--'}</LedgerCell>
              </div>
            ))}
            <div className="grid grid-cols-2 gap-px bg-white/5 border-t border-white/5">
              <div className="grid grid-cols-5 gap-px bg-white/5">
                {metrics.slice(0, 5).map((metric) => (
                  <div key={metric.label} className="bg-[#27313d] px-3 py-2">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">{metric.label}</div>
                    <div className={`mt-1 text-[11px] font-semibold ${metric.tone === 'danger' ? 'text-rose-400' : metric.tone === 'success' ? 'text-emerald-400' : 'text-slate-200'}`}>
                      {metric.value}
                    </div>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-5 gap-px bg-white/5">
                {metrics.slice(5).map((metric) => (
                  <div key={metric.label} className="bg-[#27313d] px-3 py-2">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">{metric.label}</div>
                    <div className={`mt-1 text-[11px] font-semibold ${metric.tone === 'danger' ? 'text-rose-400' : metric.tone === 'success' ? 'text-emerald-400' : 'text-slate-200'}`}>
                      {metric.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Panel>

      <div className="grid gap-6 xl:grid-cols-[1.1fr,0.9fr]">
        <Panel className="border-white/10 bg-[#1f2731] p-5">
          <p className="text-sm uppercase tracking-[0.2em] text-muted">Equity curve</p>
          <div className="mt-4 rounded-3xl border border-white/10 bg-black/30 p-3">
            <PnlLineChart data={pnlSeries} />
          </div>
        </Panel>
        <Panel className="border-white/10 bg-[#1f2731] p-5">
          <p className="text-sm uppercase tracking-[0.2em] text-muted">Trade notes</p>
          <div className="mt-4 rounded-3xl border border-white/10 bg-white/[0.03] p-4">
            <h3 className="text-lg font-semibold text-slate-100">{group.positionType === 'long' ? 'Long' : 'Short'} {group.symbol}</h3>
            <p className="mt-3 text-sm leading-7 text-slate-300">{group.notesSummary}</p>
            <div className="mt-5 grid gap-3 text-sm">
              <div className="flex items-center justify-between"><span className="text-slate-400">Status</span><strong className={group.status === 'open' ? 'text-amber-300' : 'text-emerald-300'}>{group.status}</strong></div>
              <div className="flex items-center justify-between"><span className="text-slate-400">Return status</span><strong className={group.returnStatus === 'win' ? 'text-emerald-300' : group.returnStatus === 'loss' ? 'text-rose-300' : 'text-amber-300'}>{group.returnStatus}</strong></div>
              <div className="flex items-center justify-between"><span className="text-slate-400">Broker fees</span><strong>{formatCurrency(group.brokerFees ?? 0)}</strong></div>
              <div className="flex items-center justify-between"><span className="text-slate-400">Charges</span><strong>{formatCurrency(group.charges ?? 0)}</strong></div>
              <div className="flex items-center justify-between"><span className="text-slate-400">Open quantity</span><strong>{group.remainingQuantity}</strong></div>
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );
}
