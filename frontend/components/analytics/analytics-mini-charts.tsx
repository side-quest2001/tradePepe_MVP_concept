'use client';

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Line,
  LineChart,
} from 'recharts';
import { cn } from '@/lib/utils/cn';

type Point = { label: string; value: number };

function ensureChartData(data: Point[]) {
  const safe = data.filter(
    (point) => typeof point.value === 'number' && Number.isFinite(point.value)
  );
  return safe.length > 0 ? safe : [{ label: '-', value: 0 }];
}

export function AnalyticsSparkline({
  data,
  color = '#18c99f',
}: {
  data: Point[];
  color?: string;
}) {
  const safeData = ensureChartData(data);
  return (
    <div className="h-12 w-[118px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={safeData} margin={{ top: 4, right: 2, left: 2, bottom: 0 }}>
          <defs>
            <linearGradient id={`spark-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.35} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            dataKey="value"
            type="monotone"
            stroke={color}
            strokeWidth={2}
            fill={`url(#spark-${color.replace('#', '')})`}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function BuilderCanvasChart({
  data,
  mode,
}: {
  data: Point[];
  mode: 'line' | 'bar' | 'candles';
}) {
  const safeData = ensureChartData(data);
  if (mode === 'bar') {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={safeData} margin={{ top: 8, right: 10, left: -18, bottom: 0 }}>
          <XAxis dataKey="label" tick={{ fill: '#7f8ea3', fontSize: 10 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: '#7f8ea3', fontSize: 10 }} axisLine={false} tickLine={false} />
          <CartesianGrid stroke="#203142" vertical={false} />
          <Tooltip contentStyle={{ background: '#122536', border: '1px solid #1b3347', borderRadius: 12 }} />
          <Bar dataKey="value" radius={[4, 4, 0, 0]} fill="#1693e8" />
        </BarChart>
      </ResponsiveContainer>
    );
  }

  if (mode === 'candles') {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={safeData} margin={{ top: 8, right: 10, left: -18, bottom: 0 }}>
          <XAxis dataKey="label" tick={{ fill: '#7f8ea3', fontSize: 10 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: '#7f8ea3', fontSize: 10 }} axisLine={false} tickLine={false} />
          <CartesianGrid stroke="#203142" vertical={false} />
          <Tooltip contentStyle={{ background: '#122536', border: '1px solid #1b3347', borderRadius: 12 }} />
          <Line dataKey="value" type="linear" stroke="#168de3" strokeWidth={1.6} dot={false} />
          <Line dataKey="value" type="monotone" stroke="#ffffff22" strokeWidth={7} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={safeData} margin={{ top: 8, right: 10, left: -18, bottom: 0 }}>
        <defs>
          <linearGradient id="builder-line-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1797e9" stopOpacity={0.2} />
            <stop offset="100%" stopColor="#1797e9" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis dataKey="label" tick={{ fill: '#7f8ea3', fontSize: 10 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: '#7f8ea3', fontSize: 10 }} axisLine={false} tickLine={false} />
        <CartesianGrid stroke="#203142" vertical={false} />
        <Tooltip contentStyle={{ background: '#122536', border: '1px solid #1b3347', borderRadius: 12 }} />
        <Area dataKey="value" type="monotone" stroke="#1797e9" strokeWidth={2} fill="url(#builder-line-fill)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function PerformanceAreaChart({ data }: { data: Point[] }) {
  const safeData = ensureChartData(data);
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={safeData} margin={{ top: 16, right: 0, left: -22, bottom: 0 }}>
        <defs>
          <linearGradient id="analytics-performance-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#39c88a" stopOpacity={0.35} />
            <stop offset="100%" stopColor="#39c88a" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis dataKey="label" tick={{ fill: '#a7b6c7', fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: '#a7b6c7', fontSize: 11 }} axisLine={false} tickLine={false} orientation="right" />
        <Tooltip contentStyle={{ background: '#162331', border: '1px solid #24384a', borderRadius: 12 }} />
        <Area dataKey="value" type="monotone" stroke="#39c88a" strokeWidth={4} fill="url(#analytics-performance-fill)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function PerformanceBarChart({ data }: { data: Point[] }) {
  const safeData = ensureChartData(data);
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={safeData} margin={{ top: 16, right: 0, left: -18, bottom: 0 }}>
        <XAxis dataKey="label" tick={{ fill: '#a7b6c7', fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: '#a7b6c7', fontSize: 11 }} axisLine={false} tickLine={false} />
        <CartesianGrid stroke="#233443" vertical={false} />
        <Tooltip contentStyle={{ background: '#162331', border: '1px solid #24384a', borderRadius: 12 }} />
        <Bar dataKey="value" radius={[8, 8, 0, 0]}>
          {safeData.map((point, index) => (
            <Cell key={`${point.label}-${index}`} fill={point.value >= 0 ? '#36ba7f' : '#bf5a42'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function DrawdownLineChart({ data }: { data: Point[] }) {
  const safeData = ensureChartData(data);
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={safeData} margin={{ top: 12, right: 6, left: -10, bottom: 0 }}>
        <XAxis dataKey="label" tick={{ fill: '#8fa1b5', fontSize: 10 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: '#8fa1b5', fontSize: 10 }} axisLine={false} tickLine={false} orientation="right" />
        <Tooltip contentStyle={{ background: '#162331', border: '1px solid #24384a', borderRadius: 12 }} />
        <Line dataKey="value" type="monotone" stroke="#ee3a39" strokeWidth={4} dot={false} filter="url(#drawdown-glow)" />
        <defs>
          <filter id="drawdown-glow">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
      </LineChart>
    </ResponsiveContainer>
  );
}

export function TradesColumnChart({ data }: { data: Point[] }) {
  const safeData = ensureChartData(data);
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={safeData} margin={{ top: 4, right: 0, left: -12, bottom: 0 }}>
        <CartesianGrid stroke="#233443" vertical={false} />
        <XAxis dataKey="label" tick={{ fill: '#8fa1b5', fontSize: 10 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: '#8fa1b5', fontSize: 10 }} axisLine={false} tickLine={false} />
        <Bar dataKey="value" radius={[6, 6, 0, 0]} fill="#1e8de1" />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function HalfGauge({
  value,
  max = 100,
}: {
  value: number;
  max?: number;
}) {
  const data = [
    { name: 'value', value: Math.min(value, max) },
    { name: 'rest', value: Math.max(max - value, 0) },
  ];

  return (
    <div className="relative h-[150px] w-[200px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            startAngle={180}
            endAngle={0}
            innerRadius={58}
            outerRadius={74}
            stroke="none"
          >
            <Cell fill="#12c488" />
            <Cell fill="#d82c28" />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export function AnalyticsDonut({
  value,
  remainder,
  centerLabel,
}: {
  value: number;
  remainder: number;
  centerLabel?: string;
}) {
  const data = [
    { name: 'value', value },
    { name: 'rest', value: remainder },
  ];

  return (
    <div className="relative h-[122px] w-[122px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="value" innerRadius={34} outerRadius={50} stroke="none">
            <Cell fill="#17c78c" />
            <Cell fill="#6f8194" />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      {centerLabel ? (
        <div className="absolute inset-0 flex items-center justify-center text-[11px] font-semibold text-white">
          {centerLabel}
        </div>
      ) : null}
    </div>
  );
}

export function CalendarHeatGrid({
  data,
}: {
  data: Array<{ label: string; value: number; count?: number }>;
}) {
  const cells = Array.from({ length: 35 }).map((_, index) => data[index]);
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-7 gap-2 text-[11px] text-[#a8b7c6]">
        {weekdays.map((day) => (
          <span key={day}>{day}</span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-2">
        {cells.map((cell, index) => {
          const positive = (cell?.value ?? 0) >= 0;
          return (
            <div
              key={index}
              className={cn(
                'min-h-[72px] rounded-[8px] border border-white/5 px-3 py-2',
                !cell && 'bg-[#182633]',
                cell && positive && 'bg-[#2f8b52]',
                cell && !positive && 'bg-[#b5533f]',
                cell && cell.value === 0 && 'bg-[#3a3a3a]'
              )}
            >
              {cell ? (
                <>
                  <p className="text-[11px] font-semibold text-white">{index + 1 < 10 ? `0${index + 1}` : index + 1}</p>
                  <p className="mt-2 text-[13px] text-white">
                    {cell.value >= 0 ? '$' : '-$'}
                    {Math.abs(cell.value)}
                  </p>
                  <p className="mt-1 text-[10px] text-white/75">
                    {cell.count ?? Math.max(Math.round(Math.abs(cell.value) / 100), 1)} trades
                  </p>
                </>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
