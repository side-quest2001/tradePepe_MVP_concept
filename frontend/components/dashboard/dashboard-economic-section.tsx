'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Panel } from '@/components/ui/panel';
import type { EconomicIndicatorRow } from '@/lib/api/types';

function MetricMenu({ label }: { label: string }) {
  return (
    <button className="inline-flex h-7 items-center gap-1 rounded-full bg-[#138765]/18 px-3 text-[11px] font-medium text-[#29cf9f]">
      {label}
      <ChevronDown className="h-3 w-3" />
    </button>
  );
}

export function DashboardEconomicSection({
  rows,
}: {
  rows?: EconomicIndicatorRow[];
}) {
  const [view, setView] = useState<'calendar' | 'indicators'>('calendar');

  const calendarRows = [
    {
      country: 'INDIA',
      events: [
        ['Manu PMI India', '-17', '-17', '-17', '-17'],
        ['Services PMI India', '38.1', '38.1', '38.1', '38.1'],
        ['Inflation Rate', '6', '6', '6', '6'],
        ['GDP Growth Rate Quaterly', '38.1', '38.1', '38.1', '38.1'],
        ['Interest Rate', '6', '6', '6', '6'],
      ],
    },
    {
      country: 'USA',
      events: [
        ['Manu PMI India', '-17', '-17', '-17', '-17'],
        ['Services PMI India', '38.1', '38.1', '38.1', '38.1'],
        ['Inflation Rate', '6', '6', '6', '6'],
        ['GDP Growth Rate Quaterly', '38.1', '38.1', '38.1', '38.1'],
        ['Interest Rate', '6', '6', '6', '6'],
      ],
    },
  ];

  const indicatorRows = [
    {
      country: 'INDIA',
      events: [
        ['Manufacturing PMI', '58.1', '57.8', '56.9', 'Bullish'],
        ['Services PMI', '61.2', '60.4', '59.8', 'Bullish'],
        ['Inflation Rate', '6.0', '5.9', '5.7', 'Neutral'],
        ['GDP Growth Rate', '7.1', '6.8', '6.5', 'Positive'],
        ['Interest Rate', '6.50', '6.50', '6.25', 'Steady'],
      ],
    },
    {
      country: 'USA',
      events: [
        ['Manufacturing PMI', '51.4', '50.8', '49.9', 'Neutral'],
        ['Services PMI', '53.7', '53.1', '52.6', 'Positive'],
        ['Inflation Rate', '3.1', '3.0', '2.9', 'Cooling'],
        ['GDP Growth Rate', '2.8', '2.6', '2.4', 'Steady'],
        ['Interest Rate', '5.50', '5.50', '5.25', 'Restrictive'],
      ],
    },
  ];

  const liveRows = rows?.length
    ? rows.reduce<Array<{ country: string; events: string[][] }>>((acc, row) => {
        const country = row.country.toUpperCase();
        const existing = acc.find((item) => item.country === country);
        const event = [row.indicator, row.september, row.october, row.november, row.december];
        if (existing) {
          existing.events.push(event);
        } else {
          acc.push({ country, events: [event] });
        }
        return acc;
      }, [])
    : null;

  const calendarHeaders = liveRows
    ? ['Country', 'Event Indicators', 'Actual', 'Previous', 'Reference', 'Unit']
    : ['Country', 'Event Indicators', 'September', 'October', 'November', 'December'];

  const indicatorHeaders = liveRows
    ? ['Country', 'Indicator', 'Actual', 'Previous', 'Reference', 'Unit']
    : ['Country', 'Indicator', 'Actual', 'Forecast', 'Previous', 'Outlook'];

  return (
    <Panel className="rounded-[10px] border-[#273646] bg-[#1e2935] p-4 shadow-none">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-5">
          <h2 className="text-[14px] font-semibold text-[#eef4fb]">Economic Calendar</h2>
          <div className="text-[12px] font-medium text-[#95a3b4]">
            Powered by <span className="text-[#b7c2cf]">{liveRows ? 'TradePepe Market Layer' : 'dIndiaDataHub'}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <MetricMenu label="Country" />
          <MetricMenu label="Month" />
        </div>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <button
          type="button"
          onClick={() => setView('calendar')}
          className={`rounded-full px-6 py-2 text-[13px] font-medium transition ${
            view === 'calendar'
              ? 'bg-[#26343f] text-[#19c99f]'
              : 'text-[#9faab7]'
          }`}
        >
          Economic Calendar
        </button>
        <button
          type="button"
          onClick={() => setView('indicators')}
          className={`rounded-full px-6 py-2 text-[13px] font-medium transition ${
            view === 'indicators'
              ? 'bg-[#26343f] text-[#19c99f]'
              : 'text-[#9faab7]'
          }`}
        >
          Economic Indicators
        </button>
      </div>

      {view === 'calendar' ? (
        <>
          <div className="mt-4 overflow-hidden rounded-[6px] bg-[#253240]">
            <div className="grid grid-cols-[140px_1.3fr_0.72fr_0.72fr_0.72fr_0.72fr] px-4 py-3 text-[12px] font-semibold text-[#aeb8c4]">
              {calendarHeaders.map((header) => (
                <div key={header}>{header}</div>
              ))}
            </div>
          </div>

          <div className="mt-4 space-y-3">
            {(liveRows ?? calendarRows).map((row) => (
              <div key={row.country} className="overflow-hidden rounded-[6px] bg-[#2b3642]">
                <div className="grid grid-cols-[96px_1fr]">
                  <div className="flex items-center justify-center border-r border-white/10 px-4 py-4">
                    <span className="inline-flex min-w-[78px] items-center justify-center rounded-[6px] bg-[#1e2935] px-3 py-[5px] text-[12px] font-medium text-[#eef4fb]">
                      {row.country}
                    </span>
                  </div>
                  <div className="px-4 py-3">
                    {row.events.map((event) => (
                      <div
                        key={event[0]}
                        className="grid grid-cols-[1.3fr_0.72fr_0.72fr_0.72fr_0.72fr] py-1.5 text-[12px] text-[#eef4fb]"
                      >
                        <div>{event[0]}</div>
                        <div>{event[1]}</div>
                        <div>{event[2]}</div>
                        <div>{event[3]}</div>
                        <div>{event[4]}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <>
          <div className="mt-4 overflow-hidden rounded-[6px] bg-[#253240]">
            <div className="grid grid-cols-[140px_1.4fr_0.72fr_0.72fr_0.72fr_0.72fr] px-4 py-3 text-[12px] font-semibold text-[#aeb8c4]">
              {indicatorHeaders.map((header) => (
                <div key={header}>{header}</div>
              ))}
            </div>
          </div>

          <div className="mt-4 space-y-3">
            {(liveRows ?? indicatorRows).map((row) => (
              <div key={row.country} className="overflow-hidden rounded-[6px] bg-[#2b3642]">
                <div className="grid grid-cols-[96px_1fr]">
                  <div className="flex items-center justify-center border-r border-white/10 px-4 py-4">
                    <span className="inline-flex min-w-[78px] items-center justify-center rounded-[6px] bg-[#1e2935] px-3 py-[5px] text-[12px] font-medium text-[#eef4fb]">
                      {row.country}
                    </span>
                  </div>
                  <div className="px-4 py-3">
                    {row.events.map((event) => (
                      <div
                        key={event[0]}
                        className="grid grid-cols-[1.4fr_0.72fr_0.72fr_0.72fr_0.72fr] py-1.5 text-[12px] text-[#eef4fb]"
                      >
                        <div>{event[0]}</div>
                        <div>{event[1]}</div>
                        <div>{event[2]}</div>
                        <div>{event[3]}</div>
                        <div>{event[4]}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </Panel>
  );
}
