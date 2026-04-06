'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import type { Fund, ImportHistory, OrderGroup } from '@/lib/api/types';
import { ImportWorkflowPanel } from '@/components/imports/import-workflow-panel';

export function JournalImportDrawer({
  open,
  funds,
  imports,
  onClose,
  onGroupsImported,
  onFundsChanged,
  onImportsChanged,
}: {
  open: boolean;
  funds: Fund[];
  imports: ImportHistory[];
  onClose: () => void;
  onGroupsImported?: (groups: OrderGroup[]) => void;
  onFundsChanged?: (funds: Fund[]) => void;
  onImportsChanged?: (imports: ImportHistory[]) => void;
}) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.aside
          initial={{ x: '100%', opacity: 0.85 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: '100%', opacity: 0.85 }}
          transition={{ type: 'spring', stiffness: 220, damping: 28 }}
          className="fixed right-0 top-0 z-30 h-[100dvh] w-[min(620px,calc(100vw-88px))] border-l border-white/8 bg-[#101922]/96 px-5 py-5 backdrop-blur-xl"
        >
          <div className="flex h-full min-h-0 flex-col">
            <div className="flex items-start justify-between gap-4 border-b border-white/8 pb-4">
              <div>
                <p className="text-[19px] font-semibold tracking-tight text-[#eef4fb]">Import CSV</p>
                <p className="mt-1 text-[12px] leading-5 text-[#91a1b2]">
                  Add broker CSV files directly into the journal and review results without leaving this workspace.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-[#dce6ef] transition hover:bg-white/5"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 min-h-0 flex-1 overflow-y-auto pr-1">
              <ImportWorkflowPanel
                initialFunds={funds}
                initialImports={imports}
                onGroupsImported={onGroupsImported}
                onFundsChanged={onFundsChanged}
                onImportsChanged={onImportsChanged}
              />
            </div>
          </div>
        </motion.aside>
      ) : null}
    </AnimatePresence>
  );
}
