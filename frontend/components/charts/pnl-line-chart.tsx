'use client';

import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { PnlPoint } from '@/lib/api/types';

export function PnlLineChart({ data }: { data: PnlPoint[] }) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 0, left: -24, bottom: 0 }}>
          <defs>
            <linearGradient id="pnlFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0fe0b4" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#0fe0b4" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="label" tick={{ fill: '#8aa3ba', fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: '#8aa3ba', fontSize: 12 }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={{ background: '#122536', border: '1px solid #1b3347', borderRadius: 16 }} />
          <Area type="monotone" dataKey="value" stroke="#0fe0b4" strokeWidth={2} fill="url(#pnlFill)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
