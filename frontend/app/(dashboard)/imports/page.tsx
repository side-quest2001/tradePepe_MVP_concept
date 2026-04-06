import { ImportsPageShell } from '@/components/imports/imports-page-shell';
import { getFunds, getImports } from '@/lib/api/client';

export default async function ImportsPage() {
  const [funds, imports] = await Promise.all([
    getFunds().catch(() => []),
    getImports().catch(() => []),
  ]);

  return <ImportsPageShell funds={funds} imports={imports} />;
}
