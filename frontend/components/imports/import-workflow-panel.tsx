'use client';

import { useEffect, useMemo, useRef, useState, useTransition } from 'react';
import {
  CheckCircle2,
  ChevronRight,
  FileUp,
  LoaderCircle,
  Plus,
  TriangleAlert,
} from 'lucide-react';
import {
  createFund,
  getImportById,
  getImports,
  getOrderGroups,
  uploadImportCsv,
} from '@/lib/api/client';
import type {
  Fund,
  ImportDetail,
  ImportHistory,
  ImportRowError,
  ImportUploadResult,
  OrderGroup,
} from '@/lib/api/types';
import { getAccessTokenFromBrowser } from '@/lib/auth';
import { cn } from '@/lib/utils/cn';

function formatImportDate(value: string | null) {
  if (!value) return 'Pending';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Pending';
  return date.toLocaleString();
}

function statusTone(status: ImportHistory['status']) {
  if (status === 'completed') return 'text-emerald-300 bg-emerald-500/10 border-emerald-500/20';
  if (status === 'failed') return 'text-rose-300 bg-rose-500/10 border-rose-500/20';
  if (status === 'processing') return 'text-amber-300 bg-amber-500/10 border-amber-500/20';
  return 'text-slate-300 bg-white/5 border-white/10';
}

function ErrorList({
  errors,
  emptyLabel,
}: {
  errors: ImportRowError[];
  emptyLabel: string;
}) {
  if (errors.length === 0) {
    return <p className="text-xs text-[#91a1b2]">{emptyLabel}</p>;
  }

  return (
    <div className="space-y-2">
      {errors.map((error) => (
        <div
          key={`${error.rowNumber}-${error.messages.join('-')}`}
          className="rounded-[12px] border border-rose-500/15 bg-rose-500/8 px-3 py-2"
        >
          <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-rose-300">
            Row {error.rowNumber}
          </div>
          <div className="mt-1 text-[12px] leading-5 text-rose-100">{error.messages.join(', ')}</div>
        </div>
      ))}
    </div>
  );
}

export function ImportWorkflowPanel({
  initialFunds,
  initialImports,
  onGroupsImported,
  onFundsChanged,
  onImportsChanged,
  className,
}: {
  initialFunds: Fund[];
  initialImports: ImportHistory[];
  onGroupsImported?: (groups: OrderGroup[]) => void;
  onFundsChanged?: (funds: Fund[]) => void;
  onImportsChanged?: (imports: ImportHistory[]) => void;
  className?: string;
}) {
  const [funds, setFunds] = useState(initialFunds);
  const [imports, setImports] = useState(initialImports);
  const [selectedFundId, setSelectedFundId] = useState(initialFunds[0]?.id ?? '');
  const [brokerName, setBrokerName] = useState(initialFunds[0]?.brokerName ?? '');
  const [currency, setCurrency] = useState('INR');
  const [newFundName, setNewFundName] = useState('');
  const [creatingFund, setCreatingFund] = useState(false);
  const [uploadResult, setUploadResult] = useState<ImportUploadResult | null>(null);
  const [selectedImport, setSelectedImport] = useState<ImportDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const selectedFund = useMemo(
    () => funds.find((fund) => fund.id === selectedFundId) ?? null,
    [funds, selectedFundId]
  );

  useEffect(() => {
    if (!selectedFundId && funds[0]?.id) {
      setSelectedFundId(funds[0].id);
      setBrokerName((current) => current || funds[0]?.brokerName || '');
    }
  }, [funds, selectedFundId]);

  const uploadErrors = uploadResult?.errors ?? [];
  const importErrors = Array.isArray(selectedImport?.metadata?.rowErrors)
    ? selectedImport?.metadata?.rowErrors ?? []
    : [];

  const chooseFile = () => fileInputRef.current?.click();

  const refreshImports = async () => {
    const items = await getImports().catch(() => []);
    setImports(items);
    onImportsChanged?.(items);
    return items;
  };

  const handleCreateFund = () => {
    const token = getAccessTokenFromBrowser();
    if (!token) {
      setError('Please sign in again before creating a fund.');
      return;
    }

    if (!newFundName.trim()) {
      setError('Fund name is required.');
      return;
    }

    setCreatingFund(true);
    setError(null);
    void createFund(
      {
        name: newFundName.trim(),
        brokerName: brokerName.trim() || undefined,
        currency,
      },
      token
    )
      .then((fund) => {
        const nextFunds = [fund, ...funds];
        setFunds(nextFunds);
        onFundsChanged?.(nextFunds);
        setSelectedFundId(fund.id);
        setBrokerName((current) => current || fund.brokerName || '');
        setNewFundName('');
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Unable to create fund');
      })
      .finally(() => setCreatingFund(false));
  };

  const handleUpload = (file: File | null) => {
    if (!file) return;

    if (!selectedFundId) {
      setError('Create or select a fund before uploading.');
      return;
    }

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
        setUploadResult(result);
        await refreshImports();
        const detail = await getImportById(result.importId).catch(() => null);
        setSelectedImport(detail);
        if (onGroupsImported) {
          const groups = await getOrderGroups().catch(() => []);
          onGroupsImported(groups);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to upload CSV');
      }
    });
  };

  const handleSelectImport = (importId: string) => {
    setDetailLoading(true);
    setSelectedImport(null);
    setError(null);
    void getImportById(importId)
      .then((detail) => setSelectedImport(detail))
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Unable to load import details');
      })
      .finally(() => setDetailLoading(false));
  };

  return (
    <div className={cn('space-y-4', className)}>
      <div className="rounded-[20px] border border-white/8 bg-[#1a2734] p-4 shadow-[0_18px_44px_rgba(0,0,0,0.22)]">
        <div className="flex items-center gap-2 text-[#19c99f]">
          <FileUp className="h-4 w-4" />
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em]">Import CSV</p>
        </div>

        <div className="mt-4 grid gap-4">
          {funds.length === 0 ? (
            <div className="rounded-[16px] border border-dashed border-[#355066] bg-[#172330] p-4">
              <div className="flex items-center gap-2 text-[#eef4fb]">
                <Plus className="h-4 w-4 text-[#19c99f]" />
                <p className="text-sm font-semibold">Create your first fund</p>
              </div>
              <p className="mt-1 text-[12px] leading-5 text-[#91a1b2]">
                You do not need seed data. Create a fund here and continue directly into the import flow.
              </p>

              <div className="mt-4 grid gap-3 md:grid-cols-3">
                <input
                  value={newFundName}
                  onChange={(event) => setNewFundName(event.target.value)}
                  placeholder="Fund name"
                  className="h-11 rounded-[12px] border border-[#324253] bg-[#111c27] px-4 text-sm text-white outline-none placeholder:text-[#6e8093]"
                />
                <input
                  value={brokerName}
                  onChange={(event) => setBrokerName(event.target.value)}
                  placeholder="Broker name"
                  className="h-11 rounded-[12px] border border-[#324253] bg-[#111c27] px-4 text-sm text-white outline-none placeholder:text-[#6e8093]"
                />
                <input
                  value={currency}
                  onChange={(event) => setCurrency(event.target.value.toUpperCase())}
                  placeholder="INR"
                  className="h-11 rounded-[12px] border border-[#324253] bg-[#111c27] px-4 text-sm text-white outline-none placeholder:text-[#6e8093]"
                />
              </div>

              <button
                type="button"
                onClick={handleCreateFund}
                disabled={creatingFund}
                className="mt-4 inline-flex h-10 items-center gap-2 rounded-full bg-[#14a785] px-4 text-[12px] font-semibold text-white disabled:opacity-50"
              >
                {creatingFund ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
                Create fund
              </button>
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-[1.2fr,1fr]">
              <label className="block">
                <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8fa0b2]">
                  Fund
                </span>
                <select
                  value={selectedFundId}
                  onChange={(event) => {
                    const fund = funds.find((item) => item.id === event.target.value);
                    setSelectedFundId(event.target.value);
                    setBrokerName((current) => current || fund?.brokerName || '');
                  }}
                  className="h-11 w-full rounded-[12px] border border-[#324253] bg-[#111c27] px-4 text-sm text-white outline-none"
                >
                  {funds.map((fund) => (
                    <option key={fund.id} value={fund.id}>
                      {fund.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8fa0b2]">
                  Broker
                </span>
                <input
                  value={brokerName}
                  onChange={(event) => setBrokerName(event.target.value)}
                  placeholder="Zerodha"
                  className="h-11 w-full rounded-[12px] border border-[#324253] bg-[#111c27] px-4 text-sm text-white outline-none placeholder:text-[#6e8093]"
                />
              </label>
            </div>
          )}

          <div
            className="rounded-[18px] border border-dashed border-[#355066] bg-[#16222e] px-5 py-7 text-center"
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();
              handleUpload(event.dataTransfer.files?.[0] ?? null);
            }}
          >
            <p className="text-[15px] font-semibold text-[#eef4fb]">Drop CSV here or browse</p>
            <p className="mt-2 text-[12px] leading-5 text-[#8fa0b2]">
              Upload directly into the journal import pipeline with live validation and import history below.
            </p>
            <button
              type="button"
              onClick={chooseFile}
              className="mt-5 inline-flex h-10 items-center gap-2 rounded-full bg-[#14a785] px-4 text-[12px] font-semibold text-white"
            >
              {isPending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
              Choose CSV
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
            <div className="rounded-[14px] border border-emerald-500/20 bg-emerald-500/10 px-4 py-3">
              <div className="flex items-center gap-2 text-emerald-300">
                <CheckCircle2 className="h-4 w-4" />
                <p className="text-[12px] font-semibold">
                  Imported {uploadResult.importedRows}/{uploadResult.totalRows} rows
                </p>
              </div>
              <p className="mt-1 text-[12px] text-emerald-100/90">
                {uploadResult.failedRows} row(s) failed and are listed below.
              </p>
            </div>
          ) : null}

          {error ? (
            <div className="rounded-[14px] border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-[12px] text-rose-200">
              {error}
            </div>
          ) : null}
        </div>
      </div>

      <div className="rounded-[20px] border border-white/8 bg-[#1a2734] p-4">
        <div className="flex items-center gap-2 text-[#19c99f]">
          <FileUp className="h-4 w-4" />
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em]">Expected CSV shape</p>
        </div>
        <div className="mt-4 overflow-hidden rounded-[16px] border border-[#304152] bg-[#16222e]">
          <div className="grid grid-cols-5 bg-[#22303d] px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8ea0b2] md:grid-cols-11">
            {['Symbol', 'Buy/Sell', 'Type', 'Product', 'Qty', 'Rem Qty', 'Limit', 'Stop', 'Traded', 'Status', 'Order Time'].map((heading) => (
              <div key={heading} className="text-center">
                {heading}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-5 border-t border-white/5 px-4 py-3 text-[11px] text-[#d9e3ed] md:grid-cols-11">
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
              <div key={index} className="truncate text-center text-[#94a7b9]">
                {value}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[0.95fr,1.05fr]">
        <div className="rounded-[20px] border border-white/8 bg-[#1a2734] p-4">
          <div className="flex items-center gap-2 text-[#19c99f]">
            <TriangleAlert className="h-4 w-4" />
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em]">Import issues</p>
          </div>
          <div className="mt-4">
            <ErrorList
              errors={uploadErrors.length > 0 ? uploadErrors : importErrors}
              emptyLabel="No upload errors yet. Row-level issues will appear here after upload or when viewing a failed import."
            />
          </div>
        </div>

        <div className="rounded-[20px] border border-white/8 bg-[#1a2734] p-4">
          <div className="flex items-center gap-2 text-[#19c99f]">
            <FileUp className="h-4 w-4" />
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em]">Recent import history</p>
          </div>
          <div className="mt-4 space-y-3">
            {imports.length === 0 ? (
              <div className="rounded-[14px] border border-dashed border-[#314457] bg-[#16222e] px-4 py-5 text-[12px] text-[#8ea0b2]">
                No imports yet. Your first successful upload will appear here.
              </div>
            ) : (
              imports.map((item) => (
                <button
                  key={item.importId}
                  type="button"
                  onClick={() => handleSelectImport(item.importId)}
                  className="grid w-full gap-3 rounded-[16px] border border-[#2d3f50] bg-[#16222e] px-4 py-3 text-left transition hover:border-[#3f5a70]"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-[13px] font-semibold text-[#eef4fb]">
                        {item.fileName ?? 'Untitled import'}
                      </div>
                      <div className="mt-1 text-[11px] text-[#8ea0b2]">
                        {formatImportDate(item.createdAt)}
                      </div>
                    </div>
                    <span
                      className={cn(
                        'rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em]',
                        statusTone(item.status)
                      )}
                    >
                      {item.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-[11px] text-[#c9d5df]">
                    <div>{item.importedRows}/{item.totalRows} imported</div>
                    <div>{item.failedRows} failed</div>
                    <div>{funds.find((fund) => fund.id === item.fundId)?.name ?? 'Unknown fund'}</div>
                  </div>
                </button>
              ))
            )}
          </div>

          <div className="mt-4 rounded-[14px] border border-white/8 bg-[#13202b] px-4 py-3">
            <div className="flex items-center justify-between">
              <p className="text-[12px] font-semibold text-[#eef4fb]">Selected import</p>
              {detailLoading ? <LoaderCircle className="h-4 w-4 animate-spin text-[#8ea0b2]" /> : null}
            </div>
            {selectedImport ? (
              <div className="mt-3 space-y-2 text-[12px] text-[#9eb0c1]">
                <div className="flex items-center justify-between"><span>Status</span><span className="text-[#eef4fb]">{selectedImport.status}</span></div>
                <div className="flex items-center justify-between"><span>Rows</span><span className="text-[#eef4fb]">{selectedImport.importedRows}/{selectedImport.totalRows}</span></div>
                <div className="flex items-center justify-between"><span>Failed</span><span className="text-[#eef4fb]">{selectedImport.failedRows}</span></div>
                <div className="flex items-center justify-between"><span>Completed</span><span className="text-[#eef4fb]">{formatImportDate(selectedImport.completedAt ?? selectedImport.createdAt)}</span></div>
              </div>
            ) : (
              <div className="mt-3 flex items-center gap-2 text-[12px] text-[#8ea0b2]">
                <ChevronRight className="h-4 w-4" />
                Select an import to inspect its persisted details.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
