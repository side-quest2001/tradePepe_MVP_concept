import { Bell, Search } from 'lucide-react';

export function Header({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex flex-col gap-3 border-b border-line/70 pb-3 md:flex-row md:items-center md:justify-between">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <h1 className="text-[22px] font-semibold tracking-tight text-text">
            {title}
          </h1>
          <span className="rounded-full border border-accent/30 bg-accent/10 px-2 py-[3px] text-[11px] font-medium leading-none text-accent">
            Fund
          </span>
        </div>

        <p className="mt-1 max-w-[720px] text-[12px] leading-6 text-muted">
          {subtitle}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex h-10 min-w-[240px] items-center gap-2 rounded-full border border-line bg-panelSoft px-3 text-[12px] text-muted md:min-w-[270px]">
          <Search className="h-4 w-4 shrink-0" />
          <span className="truncate">Search symbol, setup, review or notes</span>
        </div>

        <button className="flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-panelSoft text-muted transition hover:text-text">
          <Bell className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
