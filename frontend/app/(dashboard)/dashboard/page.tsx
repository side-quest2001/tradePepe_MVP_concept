import { Bell, ChevronDown, Info } from 'lucide-react';
import { DashboardEconomicSection } from '@/components/dashboard/dashboard-economic-section';
import { DashboardPerformanceSection } from '@/components/dashboard/dashboard-performance-section';
import { Panel } from '@/components/ui/panel';
import {
  getPerformanceCalendar,
  getPnlSeries,
  getSummary,
  getWinLoss,
} from '@/lib/api/client';

function MetricMenu({ label }: { label: string }) {
  return (
    <button className="inline-flex h-7 items-center gap-1 rounded-full bg-[#138765]/18 px-3 text-[11px] font-medium text-[#29cf9f]">
      {label}
      <ChevronDown className="h-3 w-3" />
    </button>
  );
}

function TinySparkline({
  stroke,
  path,
}: {
  stroke: string;
  path: string;
}) {
  return (
    <svg viewBox="0 0 150 56" className="h-[56px] w-[150px]">
      <path d="M10 46 H140" stroke="#314151" strokeWidth="1" />
      <path d={path} fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function TopMetricCard({
  title,
  menu,
  value,
  change,
  changeColor,
  visual,
}: {
  title: string;
  menu: string;
  value: string;
  change: string;
  changeColor: string;
  visual: React.ReactNode;
}) {
  return (
    <div className="flex min-h-[110px] flex-col justify-between rounded-[10px] border border-[#273646] bg-[#1e2935] px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-1.5">
          <h3 className="text-[14px] font-semibold text-[#eef4fb]">{title}</h3>
          <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-[#16886b]/20 text-[#28cb9e]">
            <Info className="h-2.5 w-2.5" />
          </span>
        </div>
        <MetricMenu label={menu} />
      </div>

      <div className="mt-2 flex items-end justify-between gap-4">
        <div className="flex items-end gap-3">
          <div className="text-[22px] font-semibold leading-none text-[#f5f8fc]">{value}</div>
          <div className={`pb-[3px] text-[13px] font-semibold ${changeColor}`}>{change}</div>
        </div>
        <div className="shrink-0">{visual}</div>
      </div>
    </div>
  );
}

function TopWinRateCard({
  value,
  change,
}: {
  value: number;
  change: string;
}) {
  const circumference = 2 * Math.PI * 26;
  const dashOffset = circumference * (1 - value / 100);

  return (
    <div className="flex min-h-[110px] flex-col justify-between rounded-[10px] border border-[#273646] bg-[#1e2935] px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-1.5">
          <h3 className="text-[14px] font-semibold text-[#eef4fb]">Win-rate</h3>
          <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-[#16886b]/20 text-[#28cb9e]">
            <Info className="h-2.5 w-2.5" />
          </span>
        </div>
        <MetricMenu label="This Month" />
      </div>

      <div className="mt-2 flex items-end justify-between gap-4">
        <div className="flex items-end gap-3">
          <div className="text-[22px] font-semibold leading-none text-[#f5f8fc]">{value} %</div>
          <div className="pb-[3px] text-[13px] font-semibold text-[#21cf98]">{change}</div>
        </div>
        <div className="flex h-[66px] w-[66px] shrink-0 items-center justify-center">
          <svg viewBox="0 0 64 64" className="h-[64px] w-[64px] -rotate-90">
            <circle cx="32" cy="32" r="26" stroke="#d8dde5" strokeWidth="4" fill="none" opacity="0.95" />
            <circle
              cx="32"
              cy="32"
              r="26"
              stroke="#00c88f"
              strokeWidth="6"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
            />
          </svg>
        </div>
      </div>
    </div>
  );
}

export default async function DashboardPage() {
  const [summary, calendar, pnlSeries, winLoss] = await Promise.all([
    getSummary(),
    getPerformanceCalendar(),
    getPnlSeries(),
    getWinLoss(),
  ]);

  const flashNews = [
    {
      title: 'Broader Market News',
      body: 'Nifty IT index drops 2% as US tech stocks face selloff; TCS, Infosys lead declines',
      image:
        'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=120&q=80',
    },
    {
      title: 'RBI Repo Rate',
      body: "RBI keeps repo rate unchanged at 6.50%; maintains 'withdrawal of accommodation' stance",
      image:
        'https://images.unsplash.com/photo-1642790551116-18e150f248e5?auto=format&fit=crop&w=120&q=80',
    },
    {
      title: 'FIIDII',
      body: 'FIIs turn net sellers in cash market, offload shares worth ₹3,245 cr amid global volatility',
      image:
        'https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=120&q=80',
    },
  ];

  return (
    <div className="space-y-6">
      <section className="space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <h1 className="text-[20px] font-semibold tracking-tight text-[#eef4fb]">
              Dashboard
            </h1>
            <button className="inline-flex h-8 items-center gap-1 rounded-full border border-[#0f8f73]/45 bg-[#0f8f73]/10 px-3 text-[12px] font-semibold text-[#18c99f]">
              Fund
              <ChevronDown className="h-3 w-3" />
            </button>
          </div>

          <button className="mt-0.5 text-[#aeb9c6]">
            <Bell className="h-4 w-4" />
          </button>
        </div>

        <div className="grid gap-4 xl:grid-cols-4">
          <TopMetricCard
            title="Total Capital"
            menu="All Time"
            value="$ 81000"
            change="19% ↑"
            changeColor="text-[#1fcf98]"
            visual={
              <TinySparkline
                stroke="#00b58a"
                path="M12 44 C24 38, 30 40, 42 32 S60 30, 72 22 S94 18, 106 10 S124 6, 138 2"
              />
            }
          />

          <TopMetricCard
            title="Max. Loss Per Trade"
            menu="This Month"
            value="$ 700"
            change="3.7% ↓"
            changeColor="text-[#da342f]"
            visual={
              <TinySparkline
                stroke="#d82828"
                path="M10 10 C26 18, 40 14, 52 28 S78 10, 92 18 S114 40, 126 36 S136 18, 144 10"
              />
            }
          />

          <TopWinRateCard value={Math.round(winLoss.winRate)} change="7.5% ↑" />

          <TopMetricCard
            title="Closed Trades"
            menu="This Month"
            value={`${summary.totalClosedTrades}`}
            change="12% ↑"
            changeColor="text-[#1fcf98]"
            visual={
              <TinySparkline
                stroke="#15c996"
                path="M12 36 C24 28, 30 30, 44 20 S72 18, 84 26 S102 30, 114 20 S132 12, 142 16"
              />
            }
          />
        </div>
      </section>

      <DashboardPerformanceSection calendar={calendar} pnlSeries={pnlSeries} />

      <section className="grid gap-4 xl:grid-cols-[1.7fr_0.83fr]">
        <DashboardEconomicSection />

        <Panel className="rounded-[10px] border-[#273646] bg-[#1e2935] p-4 shadow-none">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-[14px] font-semibold text-[#eef4fb]">Flash News</h2>
            <MetricMenu label="Popular" />
          </div>

          <div className="mt-4 space-y-4">
            {flashNews.map((item, index) => (
              <div key={item.title}>
                <div className="flex gap-3">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="h-[40px] w-[40px] rounded-[10px] object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="min-w-0 flex-1">
                    <h3 className="text-[13px] font-semibold leading-5 text-[#eef4fb]">
                      {item.title}
                    </h3>
                    <p className="mt-1 text-[12px] leading-5 text-[#d4dde6]">
                      {item.body}
                    </p>
                    <p className="mt-2 text-[11px] text-[#98a4b1]">Today, 9:45 am</p>
                  </div>
                </div>
                {index !== flashNews.length - 1 ? (
                  <div className="mt-4 border-b border-white/12" />
                ) : null}
              </div>
            ))}
          </div>
        </Panel>
      </section>
    </div>
  );
}
