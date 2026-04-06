'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Panel } from '@/components/ui/panel';
import { cn } from '@/lib/utils/cn';

export function StatCard({
  title,
  value,
  footnote,
  icon,
  danger,
}: {
  title: string;
  value: string;
  footnote?: string;
  icon?: ReactNode;
  danger?: boolean;
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <Panel className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-muted">{title}</p>
            <p className={cn('mt-3 text-3xl font-semibold', danger ? 'text-danger' : 'text-text')}>
              {value}
            </p>
            {footnote ? <p className="mt-2 text-sm text-muted">{footnote}</p> : null}
          </div>
          {icon ? <div className="text-accent">{icon}</div> : null}
        </div>
      </Panel>
    </motion.div>
  );
}
