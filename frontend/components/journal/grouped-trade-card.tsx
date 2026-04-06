'use client';

import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { OrderGroup } from '@/lib/api/types';
import {
  buildMetrics,
  buildMirrorRows,
} from '@/components/journal/grouped-trade-card.helpers';
import { GroupedTradeCardMetrics } from '@/components/journal/grouped-trade-card-metrics';
import { GroupedTradeCardRow } from '@/components/journal/grouped-trade-card-row';
import { LabelModal, type JournalLabelItem } from '@/components/journal/label-modal';

export function GroupedTradeCard({
  group,
  onOpen,
}: {
  group: OrderGroup;
  onOpen?: (group: OrderGroup) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const [activeExecutionId, setActiveExecutionId] = useState<string | null>(null);
  const [availableLabels, setAvailableLabels] = useState<JournalLabelItem[]>([]);
  const [selectedLabelsByExecution, setSelectedLabelsByExecution] = useState<
    Record<string, string[]>
  >({});

  const executions = useMemo(
    () => [...group.entryOrders, ...group.exitOrders],
    [group.entryOrders, group.exitOrders]
  );

  const rows = useMemo(() => buildMirrorRows(group), [group]);
  const metrics = useMemo(() => buildMetrics(group, executions), [group, executions]);
  const baseLabels = useMemo<JournalLabelItem[]>(
    () =>
      [...group.setupTags, ...group.reviewTags].map((tag) => ({
        id: tag.id,
        name: tag.name,
        color: tag.color,
      })),
    [group.reviewTags, group.setupTags]
  );

  useEffect(() => {
    setAvailableLabels(baseLabels);
  }, [baseLabels]);

  useEffect(() => {
    setSelectedLabelsByExecution((current) =>
      executions.reduce<Record<string, string[]>>((acc, execution) => {
        const defaultMatches = baseLabels
          .filter(
            (label) =>
              label.name === execution.setup || label.name === execution.review
          )
          .map((label) => label.id);

        acc[execution.id] = current[execution.id] ?? defaultMatches;
        return acc;
      }, {})
    );
  }, [baseLabels, executions]);

  const activeLabels = useMemo(() => {
    const selectedIds = activeExecutionId
      ? selectedLabelsByExecution[activeExecutionId] ?? []
      : [];

    return availableLabels.map((label) => ({
      ...label,
      checked: selectedIds.includes(label.id),
    }));
  }, [activeExecutionId, availableLabels, selectedLabelsByExecution]);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.16, ease: 'easeOut' }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={() => onOpen?.(group)}
        onFocus={() => setHovered(true)}
        onBlur={() => setHovered(false)}
        role="button"
        tabIndex={0}
        aria-expanded={hovered}
        className="block w-full overflow-hidden rounded-[8px] border border-[#2a3a4c] bg-[#1d2936] text-left shadow-[0_10px_24px_rgba(3,8,16,0.16)] outline-none"
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            onOpen?.(group);
          }
        }}
      >
        {rows.map((row, index) => (
          <GroupedTradeCardRow
            key={row.id}
            group={group}
            row={row}
            index={index}
            totalRows={rows.length}
            onOpenLabels={(executionId) => {
              setActiveExecutionId(executionId);
            }}
          />
        ))}

        <AnimatePresence initial={false}>
          {hovered ? <GroupedTradeCardMetrics metrics={metrics} /> : null}
        </AnimatePresence>
      </motion.div>
      <LabelModal
        open={activeExecutionId !== null}
        labels={activeLabels}
        onClose={() => setActiveExecutionId(null)}
        onToggle={(labelId) => {
          if (!activeExecutionId) return;

          setSelectedLabelsByExecution((current) => {
            const selected = current[activeExecutionId] ?? [];
            const nextSelected = selected.includes(labelId)
              ? selected.filter((id) => id !== labelId)
              : [...selected, labelId];

            return {
              ...current,
              [activeExecutionId]: nextSelected,
            };
          });
        }}
        onCreateNew={({ name, color }) => {
          const id = `custom-${group.id}-${Date.now()}`;
          setAvailableLabels((current) => [...current, { id, name, color }]);

          if (activeExecutionId) {
            setSelectedLabelsByExecution((current) => ({
              ...current,
              [activeExecutionId]: [...(current[activeExecutionId] ?? []), id],
            }));
          }
        }}
        onEditLabel={(labelId, payload) => {
          setAvailableLabels((current) =>
            current.map((label) =>
              label.id === labelId
                ? { ...label, name: payload.name, color: payload.color }
                : label
            )
          );
        }}
      />
    </>
  );
}
