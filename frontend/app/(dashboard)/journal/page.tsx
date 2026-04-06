import { JournalShell } from '@/components/journal/journal-shell';
import { getOrderGroups, getPnlSeries } from '@/lib/api/client';

export default async function JournalPage() {
  const [groups, pnlSeries] = await Promise.all([getOrderGroups(), getPnlSeries()]);

  return <JournalShell groups={groups} pnlSeries={pnlSeries} />;
}
