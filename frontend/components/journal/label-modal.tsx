'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { Check, Pencil, Search, X } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export type JournalLabelItem = {
  id: string;
  name: string;
  color: string;
  checked?: boolean;
};

type LabelModalProps = {
  open: boolean;
  title?: string;
  labels: JournalLabelItem[];
  onClose: () => void;
  onToggle: (id: string) => void;
  onCreateNew?: (payload: { name: string; color: string }) => void;
  onEditLabel?: (id: string, payload: { name: string; color: string }) => void;
};

function hexToRgba(hex: string, alpha: number) {
  const cleaned = hex.replace('#', '');
  const full =
    cleaned.length === 3
      ? cleaned
          .split('')
          .map((c) => c + c)
          .join('')
      : cleaned;

  const num = parseInt(full, 16);
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

const COLOR_PRESETS = [
  '#22c55e',
  '#f59e0b',
  '#ef4444',
  '#3b82f6',
  '#7c3aed',
  '#14b8a6',
];

export function LabelModal({
  open,
  title = 'Labels',
  labels,
  onClose,
  onToggle,
  onCreateNew,
  onEditLabel,
}: LabelModalProps) {
  const [query, setQuery] = useState('');
  const [draftName, setDraftName] = useState('');
  const [draftColor, setDraftColor] = useState(COLOR_PRESETS[0]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isComposerOpen, setIsComposerOpen] = useState(false);

  useEffect(() => {
    if (!open) {
      setQuery('');
      setDraftName('');
      setDraftColor(COLOR_PRESETS[0]);
      setEditingId(null);
      setIsComposerOpen(false);
      return;
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return labels;
    return labels.filter((label) => label.name.toLowerCase().includes(q));
  }, [labels, query]);

  const composerTitle = editingId ? 'Edit Label' : 'Create Label';

  function handleSubmit() {
    const name = draftName.trim();
    if (!name) return;

    if (editingId) {
      onEditLabel?.(editingId, { name, color: draftColor });
    } else {
      onCreateNew?.({ name, color: draftColor });
    }

    setDraftName('');
    setDraftColor(COLOR_PRESETS[0]);
    setEditingId(null);
    setIsComposerOpen(false);
  }

  function handleEdit(label: JournalLabelItem) {
    setEditingId(label.id);
    setDraftName(label.name);
    setDraftColor(label.color);
    setIsComposerOpen(true);
  }

  return (
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center">
          <motion.button
            type="button"
            aria-label="Close labels modal"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-[#09121d]/52 backdrop-blur-[4px]"
          />

          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.86 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="h-[320px] w-[360px] rounded-full bg-[#74c5ff]/18 blur-[90px]"
            />
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ type: 'spring', stiffness: 240, damping: 24 }}
            className="relative z-[81] w-full max-w-[336px] rounded-[20px] border border-[#324252] bg-[linear-gradient(180deg,rgba(41,53,67,0.97)_0%,rgba(31,43,56,0.97)_100%)] shadow-[0_24px_80px_rgba(0,0,0,0.5)]"
          >
            <div className="flex items-center justify-between px-5 pb-2 pt-4">
              <h3 className="text-[16px] font-semibold text-[#eef4fb]">{title}</h3>

              <button
                type="button"
                onClick={onClose}
                className="text-[#c3cfdb] transition hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="px-5 pb-3">
              <div className="relative">
                <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#93a4b7]" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search"
                  className="h-10 w-full rounded-[9px] border border-[#3f6f9d] bg-[#223140] px-3 pr-10 text-[13px] text-[#e6eef6] outline-none placeholder:text-[#98a9ba]"
                />
              </div>
            </div>

            <div className="max-h-[278px] space-y-[7px] overflow-y-auto px-5 pb-3">
              {filtered.map((label) => (
                <div
                  key={label.id}
                  className="grid grid-cols-[18px_1fr_18px] items-center gap-2"
                >
                  <button
                    type="button"
                    onClick={() => onToggle(label.id)}
                    className={cn(
                      'flex h-[16px] w-[16px] items-center justify-center rounded-[4px] border text-white transition',
                      label.checked
                        ? 'border-[#b9c8d7] bg-[#2e3c4a]'
                        : 'border-[#738396] bg-transparent text-transparent'
                    )}
                  >
                    <Check className="h-3 w-3" />
                  </button>

                  <button
                    type="button"
                    onClick={() => onToggle(label.id)}
                    className="h-[34px] rounded-[5px] border px-3 text-center text-[13px] font-medium text-[#f5f7fa] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
                    style={{
                      background: `linear-gradient(180deg, ${hexToRgba(label.color, 0.92)} 0%, ${hexToRgba(label.color, 0.68)} 100%)`,
                      borderColor: hexToRgba(label.color, 0.88),
                      boxShadow: `0 0 0 1px ${hexToRgba(label.color, 0.08)} inset`,
                    }}
                  >
                    {label.name}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleEdit(label)}
                    className="flex h-[16px] w-[16px] items-center justify-center text-[#d8e2ec] transition hover:text-white"
                  >
                    <Pencil className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>

            <AnimatePresence initial={false}>
              {isComposerOpen ? (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden px-5 pb-4"
                >
                  <div className="rounded-[10px] border border-[#33414f] bg-[#1c2834] p-3">
                    <div className="mb-2 text-[12px] font-medium text-[#d7e0e9]">
                      {composerTitle}
                    </div>
                    <input
                      value={draftName}
                      onChange={(event) => setDraftName(event.target.value)}
                      placeholder="Label name"
                      className="h-9 w-full rounded-[8px] border border-[#324252] bg-[#223140] px-3 text-[13px] text-[#e6eef6] outline-none placeholder:text-[#7f90a1]"
                    />

                    <div className="mt-3 flex flex-wrap gap-2">
                      {COLOR_PRESETS.map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setDraftColor(color)}
                          className={cn(
                            'h-7 w-7 rounded-full border-2 transition',
                            draftColor === color
                              ? 'border-white/90 scale-105'
                              : 'border-transparent opacity-80 hover:opacity-100'
                          )}
                          style={{ backgroundColor: color }}
                          aria-label={`Select ${color}`}
                        />
                      ))}
                    </div>

                    <div className="mt-3 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleSubmit}
                        className="h-9 flex-1 rounded-[8px] bg-[#10a886] text-[13px] font-semibold text-white transition hover:bg-[#16b892]"
                      >
                        {editingId ? 'Save Label' : 'Add Label'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsComposerOpen(false);
                          setEditingId(null);
                          setDraftName('');
                          setDraftColor(COLOR_PRESETS[0]);
                        }}
                        className="h-9 rounded-[8px] px-3 text-[12px] text-[#b7c2ce] transition hover:bg-white/5"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>

            <div className="px-5 pb-5">
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setDraftName('');
                  setDraftColor(COLOR_PRESETS[0]);
                  setIsComposerOpen((value) => !value);
                }}
                className="h-11 w-full rounded-[9px] bg-[#57595c] text-[14px] font-medium text-white transition hover:bg-[#64676b]"
              >
                Create a new label
              </button>
            </div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
