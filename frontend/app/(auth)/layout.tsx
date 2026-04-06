export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[100dvh] bg-[radial-gradient(circle_at_top,rgba(23,47,63,0.55),rgba(8,21,35,1)_34%)] px-6 py-10">
      <div className="mx-auto flex min-h-[calc(100dvh-5rem)] max-w-[1220px] items-center justify-center">
        <div className="grid w-full items-center gap-10 lg:grid-cols-[1fr_520px]">
          <div className="hidden lg:block">
            <p className="text-[14px] font-semibold uppercase tracking-[0.18em] text-[#1ec99f]">
              TradePepe
            </p>
            <h1 className="mt-4 max-w-[520px] text-[52px] font-semibold leading-[1.02] text-white">
              A focused trading workspace for journal, analytics, and shared reviews.
            </h1>
            <p className="mt-5 max-w-[500px] text-[16px] leading-7 text-[#8ba0b4]">
              Keep your execution notes, performance views, and public trade reviews in one place with the same dark product system you have already built.
            </p>
          </div>
          <div className="flex justify-center">{children}</div>
        </div>
      </div>
    </div>
  );
}
