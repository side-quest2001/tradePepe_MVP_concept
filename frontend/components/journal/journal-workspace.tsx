'use client';

import { useMemo, useState } from 'react';
import { Bell, ChevronDown, Plus, Search, SlidersHorizontal } from 'lucide-react';
import { GroupedTradeCard } from '@/components/journal/grouped-trade-card';
import { JournalDrawer } from '@/components/journal/journal-drawer';
import { Panel } from '@/components/ui/panel';
import { OrderGroup, PnlPoint } from '@/lib/api/types';

export function JournalWorkspace({
  groups,
  pnlSeries,
}: {
  groups: OrderGroup[];
  pnlSeries: PnlPoint[];
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerExpanded, setDrawerExpanded] = useState(false);
  const selectedGroup = useMemo(() => groups[0], [groups]);

  return (
    <div className="relative h-full space-y-0">
      <div
        className={[
          'h-full transition duration-300',
          drawerOpen ? 'pr-[380px]' : '',
          drawerExpanded ? 'pr-[880px]' : '',
        ].join(' ')}
      >
        <Panel className="overflow-hidden rounded-[14px] border-transparent bg-transparent p-0 shadow-none">
          <div className={`transition duration-300 ${drawerOpen ? 'blur-[1.5px] opacity-55' : ''}`}>
            <div className="px-4 pb-2 pt-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-2">
                  <h1 className="text-[20px] font-semibold tracking-tight text-[#eef4fb]">Journal</h1>

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

                <button
                  onClick={() => {
                    setDrawerOpen(true);
                    setDrawerExpanded(false);
                  }}
                  className="text-[#dbe6f2]"
                >
                  <SlidersHorizontal className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-5 flex items-center justify-between">
                <button className="inline-flex h-7 min-w-[86px] items-center justify-center rounded-full bg-[#1f2d3b] px-4 text-[12px] font-semibold text-[#18c99f]">
                  Buy
                </button>

                <div className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#10a886] text-white shadow-[0_0_0_1px_rgba(255,255,255,0.04)]">
                  <Plus className="h-4 w-4" />
                </div>

                <button className="inline-flex h-7 min-w-[86px] items-center justify-center rounded-full bg-[#1f2d3b] px-4 text-[12px] font-semibold text-[#f04f4f]">
                  Sell
                </button>
              </div>
            </div>

            <div className="px-2.5 pb-3 pt-3">
              <div className="rounded-[10px] bg-[#162330] px-2 pb-3 pt-2">
                <div className="overflow-hidden rounded-[8px] bg-[#202d3a]">
                  <div className="grid grid-cols-[0.95fr_0.95fr_0.65fr_0.9fr_1fr_1fr_0.9fr_1fr_0.9fr_1fr_1fr_0.9fr_0.65fr_0.95fr_0.95fr] items-center px-2 py-[9px] text-[11px] font-medium leading-none text-[#95a3b4]">
                    {['Date', 'Time', 'Qty', 'Symbol', 'Setup', 'Review', 'Price', 'Result', 'Price', 'Review', 'Setup', 'Symbol', 'Qty', 'Time', 'Date'].map((heading) => (
                      <div key={heading} className={`text-center ${heading === 'Result' ? 'font-semibold text-[#e2edf8]' : ''}`}>
                        {heading}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-[8px] space-y-[6px]">
                  {groups.map((group) => (
                    <GroupedTradeCard key={group.id} group={group} />
                  ))}
                </div>

                <div className="mt-3 overflow-hidden rounded-[8px] bg-[#121f2c]">
                  <div className="grid grid-cols-[120px_1fr_120px] items-center px-3 py-[10px]">
                    <div className="text-[11px] font-medium uppercase tracking-[0.06em] text-[#8a98aa]">TOTAL</div>
                    <div className="text-center text-[24px] font-semibold leading-none text-[#18d39a]">$ 1,000</div>
                    <div />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Panel>
      </div>

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
