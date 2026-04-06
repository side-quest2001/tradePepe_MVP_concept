import { JournalShell } from '@/components/journal/journal-shell';
import { getFunds, getImports, getOrderGroups, getPnlSeries } from '@/lib/api/client';

export default async function JournalPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const importParam = resolvedSearchParams.import;
  const onboardingParam = resolvedSearchParams.onboarding;
  const startWithImportDrawerOpen =
    importParam === '1' || (Array.isArray(importParam) && importParam.includes('1'));
  const requireFirstImport =
    onboardingParam === 'csv' ||
    (Array.isArray(onboardingParam) && onboardingParam.includes('csv'));

  const [groups, pnlSeries, funds, imports] = await Promise.all([
    getOrderGroups(),
    getPnlSeries(),
    getFunds().catch(() => []),
    getImports().catch(() => []),
  ]);

  return (
    <JournalShell
      groups={groups}
      pnlSeries={pnlSeries}
      funds={funds}
      imports={imports}
      startWithImportDrawerOpen={startWithImportDrawerOpen}
      requireFirstImport={requireFirstImport}
    />
  );
}
