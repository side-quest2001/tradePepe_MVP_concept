'use client';

import { Bell, Camera, ChevronDown } from 'lucide-react';

export function AnalyticsHeader({
  activeView,
  onChangeView,
}: {
  activeView: 'builder' | 'dashboard';
  onChangeView: (view: 'builder' | 'dashboard') => void;
}) {
  return (
    <div className="flex flex-col gap-4 border-b border-white/6 bg-[linear-gradient(180deg,rgba(18,33,47,0.78),rgba(8,20,32,0.18))] px-5 pb-4 pt-5">
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-[21px] font-semibold tracking-tight text-[#eef4fb]">
              {activeView === 'builder' ? 'Trade Analytics' : 'Analytics Dashboard'}
            </h1>
            <button className="inline-flex h-6 items-center gap-1 rounded-full border border-[#0f8f73]/35 bg-[#0f8f73]/10 px-2 text-[10px] font-medium text-[#18c99f]">
              Fund
              <ChevronDown className="h-3 w-3" />
            </button>
            {activeView === 'dashboard' ? (
              <button className="inline-flex h-5 items-center gap-1 rounded-full bg-[#143629] px-2 text-[9px] font-medium text-[#d8f7eb]">
                All Time
                <ChevronDown className="h-3 w-3" />
              </button>
            ) : null}
          </div>
          <p className="text-[12px] text-[#7f93a8]">
            {activeView === 'builder'
              ? 'Build focused trade views, compare metrics, and inspect supporting executions.'
              : 'Scan the high-signal metrics first, then drill into performance behavior below.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button className="rounded-full border border-white/8 p-2 text-[#aeb9c6] transition hover:bg-white/5">
            <Camera className="h-4 w-4" />
          </button>
          <button className="rounded-[6px] border border-[#314151] bg-[#141f2a] px-3 py-[6px] text-[10px] font-medium text-[#d6deea] transition hover:border-[#45617b]">
            Publish
          </button>
          <button className="rounded-full border border-white/8 p-2 text-[#aeb9c6] transition hover:bg-white/5">
            <Bell className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="inline-flex w-fit items-center gap-2 rounded-[10px] border border-white/6 bg-[#101c28] p-1">
        {[
          { id: 'builder' as const, label: 'Trade Analytics' },
          { id: 'dashboard' as const, label: 'Analytics Dashboard' },
        ].map((tab) => {
          const active = activeView === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChangeView(tab.id)}
              className={[
                'inline-flex h-9 items-center rounded-[8px] border px-4 text-[11px] font-medium transition',
                active
                  ? 'border-[#0f8f73] bg-[#0d2b22] text-[#18c99f] shadow-[0_10px_24px_rgba(15,143,115,0.12)]'
                  : 'border-transparent text-[#7f8ea3] hover:bg-white/5',
              ].join(' ')}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
