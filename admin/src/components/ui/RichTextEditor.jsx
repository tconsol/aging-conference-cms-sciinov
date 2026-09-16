import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import TextStyle from '@tiptap/extension-text-style';
import FontFamily from '@tiptap/extension-font-family';
import Color from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough, List, ListOrdered, ListTree,
  AlignLeft, AlignCenter, AlignRight, AlignJustify, Link as LinkIcon, Unlink,
  Quote, Undo, Redo, Minus, Code, RemoveFormatting, Baseline, Highlighter,
  Table as TableIcon, Superscript as SuperIcon, Subscript as SubIcon, ChevronDown,
  IndentIncrease, IndentDecrease, ArrowDownAZ, Pilcrow, CaseSensitive,
  PaintBucket, Square, AArrowUp, AArrowDown, LineChart,
} from 'lucide-react';
import { FontSize, UnderlineStyle, BlockFormatting, CHANGE_CASE } from './editorExtensions';
import EditorFontSelect from './EditorFontSelect';
import EditorDropdown from './EditorDropdown';

const SIZES = [8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 72];
const LINE_HEIGHTS = ['1', '1.15', '1.5', '2', '2.5', '3'];

const COLORS = [
  '#000000', '#0f172a', '#475569', '#94a3b8', '#ffffff', '#b91c1c',
  '#dc2626', '#ea580c', '#b45309', '#15803d', '#0f766e', '#0891b2',
  '#1d4ed8', '#4338ca', '#6d28d9', '#be185d',
];
const HIGHLIGHTS = ['#fef08a', '#bbf7d0', '#bfdbfe', '#fecaca', '#e9d5ff', '#fed7aa', '#cffafe', '#fce7f3'];
const SHADES = ['#f1f5f9', '#fef3c7', '#dcfce7', '#dbeafe', '#fee2e2', '#ede9fe'];

const BLOCKS = [
  { label: 'Normal text', level: 0 },
  { label: 'Heading 1', level: 1 },
  { label: 'Heading 2', level: 2 },
  { label: 'Heading 3', level: 3 },
  { label: 'Heading 4', level: 4 },
];

const CASE_OPTIONS = [
  { key: 'sentence', label: 'Sentence case.' },
  { key: 'lower',    label: 'lowercase' },
  { key: 'upper',    label: 'UPPERCASE' },
  { key: 'title',    label: 'Capitalise Each Word' },
  { key: 'toggle',   label: 'tOGGLE cASE' },
];

const UNDERLINE_STYLES = [
  { key: 'solid',  label: 'Single' },
  { key: 'double', label: 'Double' },
  { key: 'dotted', label: 'Dotted' },
  { key: 'dashed', label: 'Dashed' },
  { key: 'wavy',   label: 'Wavy' },
];

function Btn({ onClick, active, title, disabled, children }) {
  return (
    <button
      type="button"
      // mouseDown + preventDefault keeps the selection alive; a plain click
      // blurs the editor first and the command applies to nothing.
      onMouseDown={(e) => { e.preventDefault(); if (!disabled) onClick(); }}
      title={title}
      disabled={disabled}
      className={`p-1.5 rounded transition-colors disabled:opacity-40 ${
        active ? 'bg-teal-100 text-teal-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'
      }`}
    >
      {children}
    </button>
  );
}

function Sep() {
  return <span className="w-px h-5 bg-slate-200 mx-1" />;
}

/**
 * Dropdown rendered into <body>.
 *
 * The editor shell uses `overflow-hidden` for its rounded corners, which clips
 * any absolutely-positioned child — the colour panels were being cut off at the
 * toolbar edge. A portal escapes that, and fixed coordinates are measured from
 * the trigger, flipping above and clamping to the viewport when there is no
 * room below or to the right.
 */
function Menu({ title, icon, children, width = 190, active, onOpen }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const triggerRef = useRef(null);
  const panelRef = useRef(null);

  const place = () => {
    const el = triggerRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const h = panelRef.current?.offsetHeight ?? 220;
    const GAP = 4;
    const EDGE = 8;

    const below = window.innerHeight - r.bottom - GAP - EDGE;
    const flipUp = h > below && r.top - GAP - EDGE > below;

    setPos({
      top: flipUp ? Math.max(EDGE, r.top - GAP - h) : r.bottom + GAP,
      left: Math.min(Math.max(EDGE, r.left), window.innerWidth - width - EDGE),
    });
  };

  useLayoutEffect(() => { if (open) place(); }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      if (triggerRef.current?.contains(e.target)) return;
      if (panelRef.current?.contains(e.target)) return;
      setOpen(false);
    };
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    // Scrolling the page would leave a fixed panel stranded beside nothing.
    // Capture phase catches scrolls from any element, including this panel's
    // own list — closing on those made a scrollable dropdown unusable. Only an
    // outside scroll should dismiss it, since a fixed panel would otherwise be
    // left floating beside nothing.
    const onScroll = (e) => {
      if (panelRef.current?.contains(e.target)) return;
      setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', onScroll);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', onScroll);
    };
  }, [open]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        title={title}
        onMouseDown={(e) => { e.preventDefault(); if (!open) onOpen?.(); setOpen((o) => !o); }}
        className={`p-1.5 rounded transition-colors inline-flex items-center gap-0.5 ${
          open || active ? 'bg-teal-100 text-teal-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'
        }`}
      >
        {icon}
        <ChevronDown size={9} />
      </button>
      {open && createPortal(
        <div
          ref={panelRef}
          className="fixed z-[100] rounded-lg border border-slate-200 bg-white shadow-xl p-2"
          style={{ top: pos.top, left: pos.left, width }}
        >
          {children(() => setOpen(false))}
        </div>,
        document.body
      )}
    </>
  );
}

const HEX_RE = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;

/** #abc and #aabbcc → {r,g,b}. Returns null for anything else. */
const hexToRgb = (hex) => {
  const m = HEX_RE.exec(hex);
  if (!m) return null;
  let h = m[1];
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
};

function Swatches({ colors, onPick, onClear, clearLabel, cols = 8 }) {
  const [custom, setCustom] = useState('#000000');
  const [hex, setHex] = useState('');
  // `<input type="color">` has no alpha channel, so transparency gets its own
  // control and is folded in when the colour is applied.
  const [alpha, setAlpha] = useState(100);

  // Full opacity stays a plain hex string — shorter, and what the swatches
  // already produce. Anything less becomes rgba(), which every browser accepts.
  const withAlpha = (color) => {
    if (alpha >= 100) return color;
    const rgb = hexToRgb(color);
    if (!rgb) return color;
    return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${(alpha / 100).toFixed(2)})`;
  };

  const pick = (color) => onPick(withAlpha(color));

  const applyHex = () => {
    const v = hex.trim().startsWith('#') ? hex.trim() : `#${hex.trim()}`;
    if (HEX_RE.test(v)) pick(v);
  };

  return (
    <>
      <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0,1fr))` }}>
        {colors.map((c) => (
          <button
            key={c}
            type="button"
            onMouseDown={(e) => { e.preventDefault(); pick(c); }}
            className="w-5 h-5 rounded border border-slate-200 hover:scale-110 transition-transform"
            style={{ background: c }}
            title={c}
          />
        ))}
      </div>

      {/* Custom colour. The native picker fires `change` when the OS dialog is
          dismissed — applying on mouse-up instead fired the moment the swatch
          was clicked, i.e. before anything had been chosen. */}
      <div className="mt-2 pt-2 border-t border-slate-100">
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Custom</p>
        <div className="flex items-center gap-1.5">
          <input
            type="color"
            value={custom}
            onChange={(e) => { setCustom(e.target.value); setHex(e.target.value); pick(e.target.value); }}
            className="w-7 h-7 rounded border border-slate-200 cursor-pointer bg-white p-0.5"
            title="Pick a colour"
          />
          <input
            type="text"
            value={hex}
            onChange={(e) => setHex(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); applyHex(); } }}
            placeholder="#1d4ed8"
            spellCheck={false}
            className="flex-1 min-w-0 h-7 px-2 rounded border border-slate-200 text-[11px] font-mono focus:outline-none focus:border-teal-500"
          />
          <button
            type="button"
            onMouseDown={(e) => { e.preventDefault(); applyHex(); }}
            disabled={!HEX_RE.test(hex.trim().startsWith('#') ? hex.trim() : `#${hex.trim()}`)}
            className="h-7 px-2 rounded bg-teal-700 text-white text-[11px] font-bold disabled:opacity-40"
          >
            Set
          </button>
        </div>
      </div>

      {/* Transparency. The preview sits on a checkerboard so a low opacity is
          actually visible rather than just looking like a lighter colour. */}
      <div className="mt-2 pt-2 border-t border-slate-100">
        <div className="flex items-center justify-between mb-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Transparency</p>
          <span className="text-[10px] font-mono text-slate-500">{100 - alpha}%</span>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="range"
            min={0}
            max={100}
            value={alpha}
            onChange={(e) => setAlpha(Number(e.target.value))}
            className="flex-1 h-1.5 accent-teal-700 cursor-pointer"
            title="Opacity"
          />
          <span
            className="w-7 h-7 rounded border border-slate-200 shrink-0"
            style={{
              backgroundImage:
                'linear-gradient(45deg,#e2e8f0 25%,transparent 25%,transparent 75%,#e2e8f0 75%),' +
                'linear-gradient(45deg,#e2e8f0 25%,transparent 25%,transparent 75%,#e2e8f0 75%)',
              backgroundSize: '8px 8px',
              backgroundPosition: '0 0, 4px 4px',
            }}
          >
            <span className="block w-full h-full rounded" style={{ background: withAlpha(custom) }} />
          </span>
        </div>
      </div>

      <button
        type="button"
        onMouseDown={(e) => { e.preventDefault(); onClear(); }}
        className="mt-2 w-full text-[11px] font-semibold text-slate-500 hover:text-slate-700"
      >
        {clearLabel}
      </button>
    </>
  );
}

const MenuItem = ({ onClick, children, style }) => (
  <button
    type="button"
    onMouseDown={(e) => { e.preventDefault(); onClick(); }}
    className="w-full text-left px-2 py-1.5 rounded text-xs text-slate-700 hover:bg-slate-100 transition-colors"
    style={style}
  >
    {children}
  </button>
);


export default function RichTextEditor({ value, onChange, placeholder = 'Start writing...', label, error }) {
  // Word's ¶ button: editor-only, never part of the saved HTML.
  const [showMarks, setShowMarks] = useState(false);
  const savedRange = useRef(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({ openOnClick: false, HTMLAttributes: { class: 'text-blue-600 underline' } }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      // TextStyle carries family, colour, size and underline style, so combining
      // them produces one <span> rather than four nested ones.
      TextStyle,
      FontFamily.configure({ types: ['textStyle'] }),
      Color.configure({ types: ['textStyle'] }),
      FontSize,
      UnderlineStyle,
      BlockFormatting,
      Highlight.configure({ multicolor: true }),
      Subscript,
      Superscript,
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: value || '',
    onUpdate: ({ editor }) => onChange?.(editor.getHTML()),
    editorProps: {
      attributes: {
        class: 'prose-editor-inner focus:outline-none min-h-[260px]',
        'data-placeholder': placeholder,
      },
    },
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || '', false);
    }
  }, [value]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!editor) return null;

  // Clicking into a hex field or the OS colour dialog blurs the editor and
  // collapses its selection, so a command run afterwards would style a cursor
  // rather than the highlighted text. The range is stashed when a menu opens
  // and restored before the command runs.
  const rememberSelection = () => {
    const { from, to } = editor.state.selection;
    savedRange.current = from === to ? null : { from, to };
  };

  const withSelection = (apply) => {
    const chain = editor.chain().focus();
    if (savedRange.current) chain.setTextSelection(savedRange.current);
    apply(chain).run();
  };

  const addLink = () => {
    const previous = editor.getAttributes('link').href || '';
    const url = window.prompt('Enter URL:', previous);
    if (url === null) return;
    if (url === '') return editor.chain().focus().unsetLink().run();
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  const currentSizePx = parseInt(editor.getAttributes('textStyle').fontSize, 10);

  // Word's A^ / A˅ step through the size list rather than adding a fixed amount.
  const stepSize = (dir) => {
    const base = Number.isFinite(currentSizePx) ? currentSizePx : 16;
    const idx = SIZES.findIndex((s) => s >= base);
    const at = idx === -1 ? SIZES.length - 1 : idx;
    const next = SIZES[Math.min(Math.max(at + dir, 0), SIZES.length - 1)];
    editor.chain().focus().setFontSize(`${next}px`).run();
  };

  const changeCase = (kind) => {
    const { from, to } = editor.state.selection;
    if (from === to) return;
    const text = editor.state.doc.textBetween(from, to, ' ');
    if (!text) return;
    editor.chain().focus().insertContentAt({ from, to }, CHANGE_CASE[kind](text)).run();
  };

  // Sorts the selected lines alphabetically, replacing them in place.
  const sortLines = () => {
    const { from, to } = editor.state.selection;
    if (from === to) return;
    const lines = editor.state.doc.textBetween(from, to, '\n').split('\n').filter((l) => l.trim());
    if (lines.length < 2) return;
    const sorted = [...lines].sort((a, b) => a.trim().localeCompare(b.trim()));
    editor.chain().focus()
      .insertContentAt({ from, to }, sorted.map((l) => `<p>${l}</p>`).join(''))
      .run();
  };

  const currentBlock = BLOCKS.find((b) => b.level && editor.isActive('heading', { level: b.level }))?.level ?? 0;
  const currentFont = editor.getAttributes('textStyle').fontFamily || '';
  const currentSize = editor.getAttributes('textStyle').fontSize || '';
  const inList = editor.isActive('bulletList') || editor.isActive('orderedList');

  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-medium text-slate-700">{label}</label>}

      <div className={`prose-editor border rounded-xl overflow-hidden ${error ? 'border-red-400' : 'border-slate-200'}`}>
        <div className="border-b border-slate-100 bg-slate-50">

          {/* ── Font row ─────────────────────────────────────────────── */}
          <div className="flex flex-wrap items-center gap-0.5 px-3 pt-2 pb-1">
            <EditorDropdown
              title="Paragraph style"
              width={130}
              value={currentBlock}
              options={BLOCKS.map((b) => ({ value: b.level, label: b.label }))}
              renderOptionStyle={(o) => (o.value
                ? { fontWeight: 800, fontSize: `${19 - o.value * 2}px` }
                : undefined)}
              onChange={(level) => {
                if (Number(level) === 0) editor.chain().focus().setParagraph().run();
                else editor.chain().focus().toggleHeading({ level: Number(level) }).run();
              }}
            />

            <EditorFontSelect
              value={currentFont}
              onChange={(font) => {
                if (!font) editor.chain().focus().unsetFontFamily().run();
                else editor.chain().focus().setFontFamily(font).run();
              }}
            />

            <EditorDropdown
              title="Font size"
              width={72}
              panelWidth={180}
              value={currentSize}
              displayLabel={currentSize ? currentSize.replace('px', '') : 'Size'}
              options={SIZES.map((n) => ({ value: `${n}px`, label: String(n) }))}
              onOpen={rememberSelection}
              custom={{
                label: 'Custom size',
                placeholder: 'e.g. 26 or 1.5rem',
                // A bare number means px, the unit Word's size box implies;
                // anything with a CSS unit is passed through as typed.
                parse: (raw) => {
                  const v = String(raw || '').trim();
                  if (!v) return null;
                  if (/^\d+(\.\d+)?$/.test(v)) return `${v}px`;
                  return /^\d+(\.\d+)?(px|pt|rem|em|%)$/i.test(v) ? v : null;
                },
              }}
              onChange={(size) => {
                if (!size) withSelection((ch) => ch.unsetFontSize());
                else withSelection((ch) => ch.setFontSize(size));
              }}
            />

            <Btn onClick={() => stepSize(1)} title="Grow font">
              <AArrowUp size={15} />
            </Btn>
            <Btn onClick={() => stepSize(-1)} title="Shrink font">
              <AArrowDown size={15} />
            </Btn>

            <Menu title="Change case" icon={<CaseSensitive size={15} />}>
              {(close) => CASE_OPTIONS.map((c) => (
                <MenuItem key={c.key} onClick={() => { changeCase(c.key); close(); }}>{c.label}</MenuItem>
              ))}
            </Menu>

            <Btn
              onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
              title="Clear all formatting"
            >
              <RemoveFormatting size={15} />
            </Btn>

            <Sep />

            <Btn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Bold (Ctrl+B)">
              <Bold size={14} />
            </Btn>
            <Btn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Italic (Ctrl+I)">
              <Italic size={14} />
            </Btn>
            <Btn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} title="Underline (Ctrl+U)">
              <UnderlineIcon size={14} />
            </Btn>
            <Menu title="Underline style" icon={<span className="text-[10px] font-bold underline">U</span>} width={150}>
              {(close) => (
                <>
                  {UNDERLINE_STYLES.map((u) => (
                    <MenuItem
                      key={u.key}
                      onClick={() => { editor.chain().focus().setUnderlineStyle(u.key).run(); close(); }}
                      style={{ textDecoration: `underline ${u.key}` }}
                    >
                      {u.label}
                    </MenuItem>
                  ))}
                  <MenuItem onClick={() => { editor.chain().focus().unsetUnderlineStyle().run(); close(); }}>
                    Remove
                  </MenuItem>
                </>
              )}
            </Menu>
            <Btn onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} title="Strikethrough">
              <Strikethrough size={14} />
            </Btn>
            <Btn onClick={() => editor.chain().focus().toggleSubscript().run()} active={editor.isActive('subscript')} title="Subscript">
              <SubIcon size={14} />
            </Btn>
            <Btn onClick={() => editor.chain().focus().toggleSuperscript().run()} active={editor.isActive('superscript')} title="Superscript">
              <SuperIcon size={14} />
            </Btn>

            <Sep />

            <Menu title="Highlight" icon={<Highlighter size={15} />} width={190} onOpen={rememberSelection}>
              {(close) => (
                <Swatches
                  colors={HIGHLIGHTS}
                  cols={8}
                  onPick={(c) => withSelection((ch) => ch.setHighlight({ color: c }))}
                  onClear={() => { withSelection((ch) => ch.unsetHighlight()); close(); }}
                  clearLabel="No highlight"
                />
              )}
            </Menu>
            <Menu title="Font colour" icon={<Baseline size={15} />} width={190} onOpen={rememberSelection}>
              {(close) => (
                <Swatches
                  colors={COLORS}
                  cols={8}
                  onPick={(c) => withSelection((ch) => ch.setColor(c))}
                  onClear={() => { withSelection((ch) => ch.unsetColor()); close(); }}
                  clearLabel="Automatic"
                />
              )}
            </Menu>
          </div>

          {/* ── Paragraph row ────────────────────────────────────────── */}
          <div className="flex flex-wrap items-center gap-0.5 px-3 pt-1 pb-2 border-t border-slate-100">
            <Btn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Bullets">
              <List size={14} />
            </Btn>
            <Btn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Numbering">
              <ListOrdered size={14} />
            </Btn>
            <Menu title="Multilevel list" icon={<ListTree size={15} />} width={200}>
              {(close) => (
                <>
                  <MenuItem
                    onClick={() => { editor.chain().focus().sinkListItem('listItem').run(); close(); }}
                  >
                    Demote one level (Tab)
                  </MenuItem>
                  <MenuItem
                    onClick={() => { editor.chain().focus().liftListItem('listItem').run(); close(); }}
                  >
                    Promote one level (Shift+Tab)
                  </MenuItem>
                  {!inList && (
                    <p className="px-2 pt-1 text-[10px] text-slate-400">Place the cursor in a list first.</p>
                  )}
                </>
              )}
            </Menu>

            <Sep />

            <Btn onClick={() => editor.chain().focus().outdentBlock().run()} title="Decrease indent">
              <IndentDecrease size={14} />
            </Btn>
            <Btn onClick={() => editor.chain().focus().indentBlock().run()} title="Increase indent">
              <IndentIncrease size={14} />
            </Btn>
            <Btn onClick={sortLines} title="Sort A → Z (select lines first)">
              <ArrowDownAZ size={14} />
            </Btn>
            <Btn
              onClick={() => setShowMarks((s) => !s)}
              active={showMarks}
              title="Show formatting marks"
            >
              <Pilcrow size={14} />
            </Btn>

            <Sep />

            <Btn onClick={() => editor.chain().focus().setTextAlign('left').run()} active={editor.isActive({ textAlign: 'left' })} title="Align left">
              <AlignLeft size={14} />
            </Btn>
            <Btn onClick={() => editor.chain().focus().setTextAlign('center').run()} active={editor.isActive({ textAlign: 'center' })} title="Centre">
              <AlignCenter size={14} />
            </Btn>
            <Btn onClick={() => editor.chain().focus().setTextAlign('right').run()} active={editor.isActive({ textAlign: 'right' })} title="Align right">
              <AlignRight size={14} />
            </Btn>
            <Btn onClick={() => editor.chain().focus().setTextAlign('justify').run()} active={editor.isActive({ textAlign: 'justify' })} title="Justify">
              <AlignJustify size={14} />
            </Btn>

            <Menu title="Line spacing" icon={<LineChart size={15} />} width={140}>
              {(close) => (
                <>
                  {LINE_HEIGHTS.map((h) => (
                    <MenuItem key={h} onClick={() => { editor.chain().focus().setLineHeight(h).run(); close(); }}>
                      {h}
                    </MenuItem>
                  ))}
                  <MenuItem onClick={() => { editor.chain().focus().setLineHeight(null).run(); close(); }}>
                    Default
                  </MenuItem>
                </>
              )}
            </Menu>

            <Menu title="Shading" icon={<PaintBucket size={15} />} width={190} onOpen={rememberSelection}>
              {(close) => (
                <Swatches
                  colors={SHADES}
                  cols={6}
                  onPick={(c) => withSelection((ch) => ch.setShading(c))}
                  onClear={() => { withSelection((ch) => ch.setShading(null)); close(); }}
                  clearLabel="No shading"
                />
              )}
            </Menu>

            <Menu title="Borders" icon={<Square size={15} />} width={160}>
              {(close) => (
                <>
                  <MenuItem onClick={() => { editor.chain().focus().setBlockBorder('all').run(); close(); }}>
                    Box border
                  </MenuItem>
                  <MenuItem onClick={() => { editor.chain().focus().setBlockBorder('left').run(); close(); }}>
                    Left bar only
                  </MenuItem>
                  <MenuItem onClick={() => { editor.chain().focus().setBlockBorder(null).run(); close(); }}>
                    No border
                  </MenuItem>
                </>
              )}
            </Menu>

            <Sep />

            <Btn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} title="Quote">
              <Quote size={14} />
            </Btn>
            <Btn onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive('codeBlock')} title="Code block">
              <Code size={14} />
            </Btn>
            <Btn onClick={addLink} active={editor.isActive('link')} title="Insert link">
              <LinkIcon size={14} />
            </Btn>
            <Btn onClick={() => editor.chain().focus().unsetLink().run()} disabled={!editor.isActive('link')} title="Remove link">
              <Unlink size={14} />
            </Btn>
            <Btn onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()} title="Insert 3×3 table">
              <TableIcon size={14} />
            </Btn>
            <Btn onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Horizontal line">
              <Minus size={14} />
            </Btn>

            <Sep />

            <Btn onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title="Undo (Ctrl+Z)">
              <Undo size={14} />
            </Btn>
            <Btn onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title="Redo (Ctrl+Y)">
              <Redo size={14} />
            </Btn>
          </div>
        </div>

        <EditorContent
          editor={editor}
          className={`px-4 py-3 text-sm ${showMarks ? 'show-formatting-marks' : ''}`}
        />
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
