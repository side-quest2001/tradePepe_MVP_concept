import { Header } from '@/components/layout/header';
import { TradeDetail } from '@/components/journal/trade-detail';
import { getOrderGroup, getPnlSeries } from '@/lib/api/client';

export default async function TradeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [group, pnlSeries] = await Promise.all([getOrderGroup(id), getPnlSeries()]);

  return (
    <div className="space-y-8">
      <Header title="Trade Detail" subtitle="Focused review layout with chart, grouped executions, notes editor zone, and published trade summary." />
      <TradeDetail group={group} pnlSeries={pnlSeries} />
    </div>
  );
}
