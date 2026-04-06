'use client';

import type { ReactNode } from 'react';
import { useMemo, useRef } from 'react';
import {
  $createParagraphNode,
  $createTextNode,
  $getRoot,
  $isElementNode,
  $getSelection,
  $isRangeSelection,
  type LexicalNode,
  type LexicalEditor,
  FORMAT_TEXT_COMMAND,
} from 'lexical';
import { $generateHtmlFromNodes, $generateNodesFromDOM } from '@lexical/html';
import { $patchStyleText } from '@lexical/selection';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  Bold,
  Italic,
  Link2,
  Underline,
  Unlink2,
} from 'lucide-react';
import { LinkNode, TOGGLE_LINK_COMMAND } from '@lexical/link';

function ToolbarButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className="inline-flex h-8 min-w-8 items-center justify-center rounded-[8px] border border-transparent px-2 text-[#aeb9c6] transition hover:border-[#344252] hover:bg-white/5 hover:text-[#eef4fb]"
    >
      {children}
    </button>
  );
}

function editorTheme() {
  return {
    paragraph: 'mb-3',
    link: 'text-[#5bc8ff] underline',
    text: {
      bold: 'font-semibold text-[#eef4fb]',
      italic: 'italic',
      underline: 'underline',
    },
  };
}

function buildInitialEditorState(initialHtml: string) {
  return (editor: LexicalEditor) => {
    const root = $getRoot();
    root.clear();

    if (typeof window !== 'undefined' && initialHtml.trim()) {
      const parser = new DOMParser();
      const dom = parser.parseFromString(initialHtml, 'text/html');
      const nodes = $generateNodesFromDOM(editor, dom);
      if (nodes.length > 0) {
        root.append(...normalizeRootNodes(nodes));
        return;
      }
    }

    const paragraph = $createParagraphNode();
    paragraph.append($createTextNode(''));
    root.append(paragraph);
  };
}

function normalizeRootNodes(nodes: LexicalNode[]) {
  const normalized: LexicalNode[] = [];
  let paragraph = $createParagraphNode();
  let hasInlineContent = false;

  for (const node of nodes) {
    if ($isElementNode(node)) {
      if (hasInlineContent) {
        normalized.push(paragraph);
        paragraph = $createParagraphNode();
        hasInlineContent = false;
      }
      normalized.push(node);
      continue;
    }

    paragraph.append(node);
    hasInlineContent = true;
  }

  if (hasInlineContent) {
    normalized.push(paragraph);
  }

  if (normalized.length === 0) {
    const emptyParagraph = $createParagraphNode();
    emptyParagraph.append($createTextNode(''));
    normalized.push(emptyParagraph);
  }

  return normalized;
}

function Toolbar({
  onRequestLink,
  onRemoveLink,
}: {
  onRequestLink: () => void;
  onRemoveLink: () => void;
}) {
  const [editor] = useLexicalComposerContext();

  function setFontSize(size: string) {
    editor.update(() => {
      const selection = $getSelection();
      if (!$isRangeSelection(selection)) return;
      $patchStyleText(selection, {
        'font-size': `${size}px`,
      });
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-[10px] border-t border-[#3a4652] pt-3 text-[#aeb9c6]">
      <div className="relative">
        <select
          defaultValue="16"
          onChange={(event) => setFontSize(event.target.value)}
          className="h-7 appearance-none rounded-[6px] border border-[#33414f] bg-[#182029] px-2 pr-6 text-[12px] font-medium text-[#d8e0e8] outline-none"
        >
          <option value="14">14</option>
          <option value="16">16</option>
          <option value="18">18</option>
          <option value="20">20</option>
        </select>
        <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-[#8ea0b1]">
          v
        </span>
      </div>

      <div className="flex items-center gap-1">
        <ToolbarButton
          label="Bold"
          onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')}
        >
          <Bold className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Italic"
          onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')}
        >
          <Italic className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Underline"
          onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline')}
        >
          <Underline className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton label="Insert link" onClick={onRequestLink}>
          <Link2 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton label="Remove link" onClick={onRemoveLink}>
          <Unlink2 className="h-4 w-4" />
        </ToolbarButton>
      </div>
    </div>
  );
}

function LinkHandler() {
  const [editor] = useLexicalComposerContext();

  function handleRequestLink() {
    const url = window.prompt('Enter link URL');
    if (!url) return;
    editor.dispatchCommand(TOGGLE_LINK_COMMAND, url);
  }

  function handleRemoveLink() {
    editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
  }

  return <Toolbar onRequestLink={handleRequestLink} onRemoveLink={handleRemoveLink} />;
}

export function JournalRichTextEditor({
  initialHtml,
  onChange,
}: {
  initialHtml: string;
  onChange: (value: string) => void;
}) {
  const initialHtmlRef = useRef(initialHtml);
  const initialConfig = useMemo(
    () => ({
      namespace: 'tradepepe-journal-editor',
      theme: editorTheme(),
      onError(error: Error) {
        throw error;
      },
      editorState: buildInitialEditorState(initialHtmlRef.current),
      nodes: [LinkNode],
    }),
    []
  );

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <div className="flex h-full min-h-[250px] flex-col">
        <LinkHandler />
        <div className="relative mt-4 min-h-0 flex-1 overflow-hidden rounded-[8px] border border-[#2b3744] bg-[#182029]">
          <RichTextPlugin
            contentEditable={
              <ContentEditable className="h-full min-h-[220px] overflow-y-auto px-3 py-3 text-[13px] leading-7 text-[#d6dee7] outline-none" />
            }
            placeholder={
              <div className="pointer-events-none absolute left-3 top-3 text-[13px] text-[#7f8da1]">
                Write your trade review here...
              </div>
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
          <HistoryPlugin />
          <AutoFocusPlugin />
          <LinkPlugin />
          <OnChangePlugin
            onChange={(editorState, editor) => {
              editorState.read(() => {
                onChange($generateHtmlFromNodes(editor, null));
              });
            }}
          />
        </div>
      </div>
    </LexicalComposer>
  );
}
