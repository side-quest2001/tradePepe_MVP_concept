'use client';

import { useMemo, useRef, useState, useTransition } from 'react';
import { FileUp, LoaderCircle } from 'lucide-react';
import { uploadImportCsv } from '@/lib/api/client';
import type { Fund, ImportHistory } from '@/lib/api/types';
import { getAccessTokenFromBrowser } from '@/lib/auth';
import { Header } from '@/components/layout/header';
import { Panel } from '@/components/ui/panel';

export function ImportsPageShell({
  funds,
  imports,
}: {
  funds: Fund[];
  imports: ImportHistory[];
}) {
  const [selectedFundId, setSelectedFundId] = useState(funds[0]?.id ?? '');
  const [brokerName, setBrokerName] = useState(funds[0]?.brokerName ?? '');
  const [uploadResult, setUploadResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const selectedFund = useMemo(
    () => funds.find((fund) => fund.id === selectedFundId) ?? null,
    [funds, selectedFundId]
  );

  const openPicker = () => fileInputRef.current?.click();

  const handleUpload = (file: File | null) => {
    if (!file || !selectedFundId) return;

    const token = getAccessTokenFromBrowser();
    if (!token) {
      setError('Please sign in again before uploading imports.');
      return;
    }

    startTransition(async () => {
      setError(null);
      setUploadResult(null);
      try {
        const result = await uploadImportCsv({
          token,
          file,
          fundId: selectedFundId,
          brokerName: brokerName || selectedFund?.brokerName || undefined,
        });
        setUploadResult(
          `Imported ${result.importedRows}/${result.totalRows} rows with ${result.failedRows} failed row(s).`
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to upload CSV');
      }
    });
  };

  return (
    <div className="space-y-8">
      <Header
        title="CSV Imports"
        subtitle="Upload broker files, inspect import history, and map the CSV structure into the journal workflow."
      />

      <div className="grid gap-6 xl:grid-cols-[1.1fr,0.9fr]">
        <Panel className="p-6">
          <div className="flex items-center gap-3 text-accent">
            <FileUp className="h-5 w-5" />
            <p className="text-sm uppercase tracking-[0.18em]">Upload broker CSV</p>
          </div>

          <div className="mt-5 space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-xs font-medium text-white">Fund</span>
                <select
                  value={selectedFundId}
                  onChange={(event) => {
                    const fund = funds.find((item) => item.id === event.target.value);
                    setSelectedFundId(event.target.value);
                    setBrokerName(fund?.brokerName ?? '');
                  }}
                  className="h-11 w-full rounded-[12px] border border-line bg-panelSoft px-4 text-sm text-white outline-none"
                >
                  {funds.map((fund) => (
                    <option key={fund.id} value={fund.id}>
                      {fund.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-2 block text-xs font-medium text-white">Broker</span>
                <input
                  value={brokerName}
                  onChange={(event) => setBrokerName(event.target.value)}
                  placeholder="Zerodha"
                  className="h-11 w-full rounded-[12px] border border-line bg-panelSoft px-4 text-sm text-white outline-none placeholder:text-muted"
                />
              </label>
            </div>

            <div
              className="rounded-3xl border border-dashed border-line bg-panelSoft p-8 text-center"
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();
                handleUpload(event.dataTransfer.files[0] ?? null);
              }}
            >
              <p className="text-lg font-semibold">Drop CSV here or browse</p>
              <p className="mt-2 text-sm text-muted">
                Upload directly into the live import pipeline and the history below will reflect the new run.
              </p>
              <button
                type="button"
                onClick={openPicker}
                className="mt-5 inline-flex items-center gap-2 rounded-full bg-accent px-5 py-3 text-sm font-semibold text-bg"
              >
                {isPending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
                Choose file
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,text/csv"
                className="hidden"
                onChange={(event) => handleUpload(event.target.files?.[0] ?? null)}
              />
            </div>

            {uploadResult ? (
              <div className="rounded-[12px] border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
                {uploadResult}
              </div>
            ) : null}

            {error ? (
              <div className="rounded-[12px] border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
                {error}
              </div>
            ) : null}
          </div>
        </Panel>

        <Panel className="p-6">
          <div className="flex items-center gap-3 text-accent">
            <FileUp className="h-5 w-5" />
            <p className="text-sm uppercase tracking-[0.18em]">Expected CSV shape</p>
          </div>
          <div className="mt-5 overflow-hidden rounded-3xl border border-line">
            <table className="w-full text-left text-sm">
              <thead className="bg-panelSoft text-muted">
                <tr>
                  {[
                    'Symbol',
                    'Buy/Sell',
                    'Type',
                    'Product Type',
                    'Qty',
                    'Rem Qty',
                    'Limit Price',
                    'Stop Price',
                    'Traded Price',
                    'Status',
                    'Order Time',
                  ].map((heading) => (
                    <th key={heading} className="px-3 py-3">
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-line bg-panel/60">
                  {[
                    'NSE:NIFTY2612025700PE',
                    'Sell',
                    'Limit',
                    'MARGIN',
                    '65',
                    '0',
                    '161',
                    '—',
                    '161.1',
                    'Filled',
                    '19 Jan 2026 13:47:33',
                  ].map((value, index) => (
                    <td key={index} className="px-3 py-3 text-muted">
                      {value}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </Panel>
      </div>

      <Panel className="p-6">
        <div className="flex items-center gap-3 text-accent">
          <FileUp className="h-5 w-5" />
          <p className="text-sm uppercase tracking-[0.18em]">Import history</p>
        </div>
        <div className="mt-5 grid gap-3">
          {imports.map((item) => (
            <div
              key={item.importId}
              className="grid gap-3 rounded-3xl border border-line bg-panelSoft p-4 md:grid-cols-5 md:items-center"
            >
              <strong>{item.fileName ?? 'Untitled import'}</strong>
              <span className="text-muted">{funds.find((fund) => fund.id === item.fundId)?.name ?? 'Unknown fund'}</span>
              <span className="text-muted">
                {item.importedRows}/{item.totalRows} rows
              </span>
              <span className="text-muted">{item.failedRows} failed</span>
              <span className="text-muted">{new Date(item.createdAt).toLocaleString()}</span>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
