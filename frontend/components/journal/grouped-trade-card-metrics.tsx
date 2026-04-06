import { motion } from 'framer-motion';
import { GroupedTradeMetrics, MetricTone } from '@/components/journal/grouped-trade-card.types';

function MetricCell({
  label,
  value,
  tone,
  subValue,
}: {
  label: string;
  value: string;
  tone?: MetricTone;
  subValue?: string;
}) {
  return (
    <div className="flex min-w-0 flex-col justify-center px-[10px] py-[6px]">
      <div className="truncate text-[10px] font-medium leading-none text-[#9aa8b7]">
        {label}
      </div>

      <div className="mt-[4px] flex items-center gap-1 text-[12px] font-semibold leading-none">
        <span
          className={
            tone === 'success'
              ? 'text-[#1fcb95]'
              : tone === 'danger'
                ? 'text-[#eb5a5a]'
                : 'text-[#e2eaf2]'
          }
        >
          {value}
        </span>

        {subValue ? (
          <span className="text-[9px] leading-none text-[#1fcb95]/65">
            {subValue}
          </span>
        ) : null}
      </div>
    </div>
  );
}

export function GroupedTradeCardMetrics({
  metrics,
}: {
  metrics: GroupedTradeMetrics;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -2 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -2 }}
      transition={{ duration: 0.1, ease: 'easeOut' }}
      className="overflow-hidden bg-[#2a3848] px-2.5 py-2"
    >
      <div className="grid min-h-[52px] w-full grid-cols-[1.62fr_138px_0.98fr] items-stretch bg-[#2a3848]">
        <div className="grid grid-cols-5">
          {metrics.left.map((metric) => (
            <div key={metric.label}>
              <MetricCell
                label={metric.label}
                value={metric.value}
                tone={metric.tone}
                subValue={metric.subValue}
              />
            </div>
          ))}
        </div>

        <div className="flex items-center justify-center bg-[#2a3848] px-[8px]">
          <div
            className={[
              'flex items-center text-[14px] font-semibold leading-none tracking-tight',
              metrics.center.tone === 'success'
                ? 'text-[#18d39a]'
                : 'text-[#eb5a5a]',
            ].join(' ')}
          >
            <span>{metrics.center.value}</span>
            <span className="ml-1 text-[12px] leading-none opacity-90">
              {metrics.center.tone === 'success' ? '^' : 'v'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-3">
          {metrics.right.map((metric) => (
            <div key={metric.label}>
              <MetricCell
                label={metric.label}
                value={metric.value}
                tone={metric.tone}
              />
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
