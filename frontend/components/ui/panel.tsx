import { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';

type PanelProps = HTMLAttributes<HTMLDivElement> & {
  variant?: 'default' | 'flat' | 'dense';
};

export function Panel({
  className,
  variant = 'default',
  ...props
}: PanelProps) {
  return (
    <div
      className={cn(
        'border border-line bg-panel',

        // variants
        variant === 'default' && 'rounded-2xl shadow-sm',
        variant === 'flat' && 'rounded-xl shadow-none',
        variant === 'dense' && 'rounded-[10px] shadow-none',

        className
      )}
      {...props}
    />
  );
}