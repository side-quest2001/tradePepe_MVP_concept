import { CalendarBucket } from '@/lib/api/types';
import { cn } from '@/lib/utils/cn';

const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function CalendarGrid({ data }: { data: CalendarBucket[] }) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-7 gap-2 text-xs uppercase tracking-[0.18em] text-muted">
        {weekdays.map((day) => (
          <span key={day}>{day}</span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-2">
        {Array.from({ length: 28 }).map((_, index) => {
          const bucket = data[index];
          return (
            <div
              key={index}
              className={cn(
                'min-h-[78px] rounded-2xl border border-line p-3',
                !bucket && 'bg-panelSoft/50',
                bucket?.pnl && bucket.pnl > 0 && 'bg-success/10',
                bucket?.pnl && bucket.pnl < 0 && 'bg-danger/10',
              )}
            >
              {bucket ? (
                <>
                  <p className="text-xs text-muted">{new Date(bucket.date).getDate()}</p>
                  <p className={cn('mt-3 text-sm font-semibold', bucket.pnl >= 0 ? 'text-success' : 'text-danger')}>
                    {bucket.pnl >= 0 ? '+' : ''}{bucket.pnl}
                  </p>
                  <p className="mt-1 text-xs text-muted">{bucket.count} trades</p>
                </>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
