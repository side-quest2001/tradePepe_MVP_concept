import { cn } from '@/lib/utils/cn';

export function Badge({
  label,
  tone = 'default',
}: {
  label: string;
  tone?: 'default' | 'success' | 'danger' | 'warning';
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em]',
        tone === 'success' && 'bg-success/15 text-success',
        tone === 'danger' && 'bg-danger/15 text-danger',
        tone === 'warning' && 'bg-warning/15 text-warning',
        tone === 'default' && 'bg-accent/15 text-accent',
      )}
    >
      {label}
    </span>
  );
}
