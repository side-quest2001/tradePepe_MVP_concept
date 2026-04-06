'use client';

import type { Fund, ImportHistory } from '@/lib/api/types';
import { Header } from '@/components/layout/header';
import { ImportWorkflowPanel } from '@/components/imports/import-workflow-panel';

export function ImportsPageShell({
  funds,
  imports,
}: {
  funds: Fund[];
  imports: ImportHistory[];
}) {
  return (
    <div className="space-y-8">
      <Header
        title="CSV Imports"
        subtitle="Upload broker files, inspect import history, and map the CSV structure into the journal workflow."
      />

      <ImportWorkflowPanel initialFunds={funds} initialImports={imports} />
    </div>
  );
}
