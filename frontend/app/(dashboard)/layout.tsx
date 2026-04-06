import { Sidebar } from '@/components/layout/sidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-[100dvh] max-h-[100dvh] overflow-hidden bg-[#081523]">
      <div className="flex h-full max-h-full w-full items-stretch bg-[#081523]">
        <Sidebar />
        <main className="min-h-0 h-full max-h-full min-w-0 flex-1 self-stretch overflow-y-auto bg-transparent px-6 pb-6 pt-3 md:px-9 md:pb-9 md:pt-4">
          {children}
        </main>
      </div>
    </div>
  );
}
