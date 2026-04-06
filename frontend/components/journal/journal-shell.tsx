'use client';

import { useEffect, useMemo, useState } from 'react';
import { Bell, ChevronDown, ChevronLeft, ChevronRight, Plus, Search, SlidersHorizontal } from 'lucide-react';
import { motion } from 'framer-motion';
import { GroupedTradeCard } from '@/components/journal/grouped-trade-card';
import { JournalDrawer } from '@/components/journal/journal-drawer';
import { ManualTradeComposer } from '@/components/journal/manual-trade-composer';
import { Panel } from '@/components/ui/panel';
import type { OrderGroup, PnlPoint } from '@/lib/api/types';

export function JournalShell({
  groups,
  pnlSeries,
}: {
  groups: OrderGroup[];
  pnlSeries: PnlPoint[];
}) {
  const pageSize = 5;
  const [journalGroups, setJournalGroups] = useState(groups);
  const [manualComposerOpen, setManualComposerOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerExpanded, setDrawerExpanded] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedGroupId, setSelectedGroupId] = useState(groups[0]?.id ?? '');
  const selectedGroup = useMemo(
    () => journalGroups.find((group) => group.id === selectedGroupId) ?? journalGroups[0],
    [journalGroups, selectedGroupId]
  );
  const totalValue = useMemo(
    () => journalGroups.reduce((sum, group) => sum + group.realizedPnl, 0),
    [journalGroups]
  );
  const totalPages = Math.max(1, Math.ceil(journalGroups.length / pageSize));
  const paginatedGroups = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return journalGroups.slice(start, start + pageSize);
  }, [currentPage, journalGroups]);

  const drawerWidth = drawerOpen && !drawerExpanded ? 456 : 0;

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, totalPages));
  }, [totalPages]);

  return (
    <div className="relative flex h-full min-h-0">
      <motion.div
        animate={{
          paddingRight: drawerWidth,
          filter: drawerOpen ? 'blur(1.5px)' : 'blur(0px)',
          opacity: drawerOpen ? 0.58 : 1,
        }}
        transition={{ type: 'spring', stiffness: 210, damping: 28 }}
        className="min-h-0 flex-1"
      >
        <Panel className="h-full overflow-hidden rounded-[14px] border-transparent bg-transparent p-0 shadow-none">
          <div className="flex h-full min-h-0 flex-col">
            <div className="px-4 pb-2 pt-1">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-2">
                  <h1 className="text-[20px] font-semibold tracking-tight text-[#eef4fb]">
                    Journal
                  </h1>

                  <button className="inline-flex h-7 items-center gap-1 rounded-full border border-[#0f8f73]/35 bg-[#0f8f73]/10 px-2.5 text-[11px] font-medium text-[#18c99f]">
                    Fund
                    <ChevronDown className="h-3 w-3" />
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <button className="rounded-[4px] border border-[#314151] bg-transparent px-2.5 py-[4px] text-[11px] font-medium text-[#aeb9c6]">
                    Publish
                  </button>

                  <button className="text-[#aeb9c6]">
                    <Bell className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="relative w-[282px]">
                    <Search className="pointer-events-none absolute left-4 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#738396]" />
                    <input
                      type="text"
                      placeholder="Search"
                      className="h-9 w-full rounded-full border border-[#314151] bg-transparent pl-10 pr-4 text-[12px] text-[#dbe6f2] outline-none placeholder:text-[#738396]"
                    />
                  </div>

                  <button className="inline-flex h-9 items-center gap-2 rounded-full bg-[#0f8f73] px-4 text-[12px] font-medium text-white">
                    1 Week
                    <ChevronDown className="h-3 w-3" />
                  </button>
                </div>

                <button className="rounded-full p-1 text-[#dbe6f2] transition hover:bg-white/5">
                  <SlidersHorizontal className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-5 flex items-center justify-between">
                <button className="inline-flex h-7 min-w-[86px] items-center justify-center rounded-full bg-[#1f2d3b] px-4 text-[12px] font-semibold text-[#18c99f]">
                  Buy
                </button>

                <button
                  type="button"
                  onClick={() => setManualComposerOpen((value) => !value)}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#10a886] text-white shadow-[0_0_0_1px_rgba(255,255,255,0.04)] transition hover:bg-[#16b892]"
                >
                  <Plus className={`h-4 w-4 transition-transform ${manualComposerOpen ? 'rotate-45' : ''}`} />
                </button>

                <button className="inline-flex h-7 min-w-[86px] items-center justify-center rounded-full bg-[#1f2d3b] px-4 text-[12px] font-semibold text-[#f04f4f]">
                  Sell
                </button>
              </div>
            </div>

            <div className="min-h-0 flex-1 px-2.5 pb-2 pt-2">
              <div className="flex h-full min-h-0 flex-col rounded-[12px] bg-[#182533] px-2.5 pb-4 pt-2.5">
                <div className="overflow-hidden rounded-[9px] bg-[#22303d]">
                  <div className="grid grid-cols-[0.95fr_0.95fr_0.65fr_0.9fr_1fr_1fr_0.9fr_1fr_0.9fr_1fr_1fr_0.9fr_0.65fr_0.95fr_0.95fr] items-center px-2 py-[11px] text-[11px] font-medium leading-none text-[#9eadbf]">
                    {[
                      'Date',
                      'Time',
                      'Qty',
                      'Symbol',
                      'Setup',
                      'Review',
                      'Price',
                      'Result',
                      'Price',
                      'Review',
                      'Setup',
                      'Symbol',
                      'Qty',
                      'Time',
                      'Date',
                    ].map((heading, index) => (
                      <div
                        key={`${heading}-${index}`}
                        className={`text-center ${
                          heading === 'Result' ? 'font-semibold text-[#e2edf8]' : ''
                        }`}
                      >
                        {heading}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-[10px] min-h-0 flex-1 overflow-y-auto space-y-[10px] pr-1">
                  {manualComposerOpen ? (
                    <ManualTradeComposer
                      onCancel={() => setManualComposerOpen(false)}
                      onSave={(group) => {
                        setJournalGroups((current) => [group, ...current]);
                        setCurrentPage(1);
                        setSelectedGroupId(group.id);
                        setManualComposerOpen(false);
                      }}
                    />
                  ) : null}

                  {paginatedGroups.map((group) => (
                    <GroupedTradeCard
                      key={group.id}
                      group={group}
                      onOpen={(clickedGroup) => {
                        setSelectedGroupId(clickedGroup.id);
                        setDrawerOpen(true);
                        setDrawerExpanded(false);
                      }}
                    />
                  ))}
                </div>

                <div className="mt-5 flex items-center justify-between px-1">
                  <div className="text-[11px] text-[#7f92a4]">
                    Page {currentPage} of {totalPages}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                      disabled={currentPage === 1}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#2d3d4e] bg-[#16222d] text-[#dce6ef] transition disabled:cursor-not-allowed disabled:opacity-35"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                      disabled={currentPage === totalPages}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#2d3d4e] bg-[#16222d] text-[#dce6ef] transition disabled:cursor-not-allowed disabled:opacity-35"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="mt-6 overflow-hidden rounded-[9px] bg-[#13202c]">
                  <div className="grid grid-cols-[120px_1fr_120px] items-center px-3 py-[12px]">
                    <div className="text-[11px] font-medium uppercase tracking-[0.06em] text-[#8a98aa]">
                      TOTAL
                    </div>
                    <div className="text-center text-[24px] font-semibold leading-none text-[#18d39a]">
                      $ {totalValue.toLocaleString()}
                    </div>
                    <div />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Panel>
      </motion.div>

      <JournalDrawer
        open={drawerOpen}
        expanded={drawerExpanded}
        group={selectedGroup}
        pnlSeries={pnlSeries}
        onClose={() => {
          setDrawerOpen(false);
          setDrawerExpanded(false);
        }}
        onToggleExpanded={() => {
          setDrawerOpen(true);
          setDrawerExpanded((value) => !value);
        }}
      />
    </div>
  );
}
