import { FileUp, History, Table2 } from 'lucide-react';
import { Header } from '@/components/layout/header';
import { Panel } from '@/components/ui/panel';

export default function ImportsPage() {
  return (
    <div className="space-y-8">
      <Header title="CSV Imports" subtitle="Upload broker files, inspect import history, and map the CSV structure into the journal workflow." />
      <div className="grid gap-6 xl:grid-cols-[1.1fr,0.9fr]">
        <Panel className="p-6">
          <div className="flex items-center gap-3 text-accent"><FileUp className="h-5 w-5" /><p className="text-sm uppercase tracking-[0.18em]">Upload broker CSV</p></div>
          <div className="mt-5 rounded-3xl border border-dashed border-line bg-panelSoft p-8 text-center">
            <p className="text-lg font-semibold">Drop CSV here or browse</p>
            <p className="mt-2 text-sm text-muted">Wire this card to POST /imports/csv with file, fundId, and brokerName.</p>
            <button className="mt-5 rounded-full bg-accent px-5 py-3 text-sm font-semibold text-bg">Choose file</button>
          </div>
        </Panel>
        <Panel className="p-6">
          <div className="flex items-center gap-3 text-accent"><Table2 className="h-5 w-5" /><p className="text-sm uppercase tracking-[0.18em]">Expected CSV shape</p></div>
          <div className="mt-5 overflow-hidden rounded-3xl border border-line">
            <table className="w-full text-left text-sm">
              <thead className="bg-panelSoft text-muted"><tr>{['Symbol','Buy/Sell','Type','Product Type','Qty','Rem Qty','Limit Price','Stop Price','Traded Price','Status','Order Time'].map((h)=><th key={h} className="px-3 py-3">{h}</th>)}</tr></thead>
              <tbody><tr className="border-t border-line bg-panel/60">{['NSE:NIFTY2612025700PE','Sell','Limit','MARGIN','65','0','161','—','161.1','Filled','19 Jan 2026 13:47:33'].map((v,i)=><td key={i} className="px-3 py-3 text-muted">{v}</td>)}</tr></tbody>
            </table>
          </div>
        </Panel>
      </div>
      <Panel className="p-6">
        <div className="flex items-center gap-3 text-accent"><History className="h-5 w-5" /><p className="text-sm uppercase tracking-[0.18em]">Import history</p></div>
        <div className="mt-5 grid gap-3">
          {[
            ['orders-2026-01-19.csv','Main Fund','9 rows','0 failed','2 min ago'],
            ['nifty-dec-expiry.csv','Main Fund','112 rows','4 failed','Yesterday'],
          ].map(([file, fund, rows, failed, time]) => (
            <div key={file} className="grid gap-3 rounded-3xl border border-line bg-panelSoft p-4 md:grid-cols-5 md:items-center">
              <strong>{file}</strong>
              <span className="text-muted">{fund}</span>
              <span className="text-muted">{rows}</span>
              <span className="text-muted">{failed}</span>
              <span className="text-muted">{time}</span>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
