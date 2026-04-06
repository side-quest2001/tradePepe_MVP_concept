'use client';

import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';

export function DonutChart({ value, total }: { value: number; total: number }) {
  const data = [
    { name: 'value', value },
    { name: 'rest', value: Math.max(total - value, 0) },
  ];

  return (
    <div className="relative h-40 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="value" innerRadius={40} outerRadius={58} stroke="none">
            <Cell fill="#0fe0b4" />
            <Cell fill="#1b3347" />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-semibold">{value}%</span>
        <span className="text-sm text-muted">Win rate</span>
      </div>
    </div>
  );
}
