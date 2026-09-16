import { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Check } from 'lucide-react';

/**
 * Toolbar dropdown in the panel's own styling, replacing the native <select>
 * whose rendering the browser controls entirely.
 *
 * Portalled into <body>: the editor shell clips overflow for its rounded
 * corners, which would cut the list off at the toolbar edge.
 *
 * `onOpen` fires before the list appears so the caller can stash the editor
 * selection — clicking anything in here blurs the editor, and a command run
 * afterwards would otherwise apply to a collapsed cursor instead of the text.
 */
export default function EditorDropdown({
  options,
  value,
  onChange,
  title,
  width = 150,
  panelWidth,
  renderOptionStyle,
  custom,          // { label, placeholder, parse } — enables the free-entry row
  onOpen,
  displayLabel,
}) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const [draft, setDraft] = useState('');

  const triggerRef = useRef(null);
  const panelRef = useRef(null);

  const listWidth = panelWidth || Math.max(width, 170);

  const place = () => {
    const el = triggerRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const h = panelRef.current?.offsetHeight ?? 280;
    const below = window.innerHeight - r.bottom - 12;
    const flipUp = h > below && r.top > below;
    setPos({
      top: flipUp ? Math.max(8, r.top - 4 - h) : r.bottom + 4,
      left: Math.min(Math.max(8, r.left), window.innerWidth - listWidth - 8),
    });
  };

  useLayoutEffect(() => { if (open) place(); }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      if (triggerRef.current?.contains(e.target) || panelRef.current?.contains(e.target)) return;
      setOpen(false);
    };
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
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

  const current = options.find((o) => String(o.value) === String(value));
  const label = displayLabel ?? current?.label ?? (value || options[0]?.label || '');

  const commitCustom = () => {
    const parsed = custom?.parse?.(draft);
    if (!parsed) return;
    onChange(parsed);
    setDraft('');
    setOpen(false);
  };

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        title={title}
        onMouseDown={(e) => {
          e.preventDefault();
          if (!open) onOpen?.();
          setOpen((o) => !o);
        }}
        className={`h-7 ml-1 px-2 rounded border text-xs inline-flex items-center gap-1 transition-colors ${
          open ? 'border-teal-500 bg-white text-slate-800' : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
        }`}
        style={{ width }}
      >
        <span className="truncate flex-1 text-left">{label}</span>
        <ChevronDown size={11} className="shrink-0 text-slate-400" />
      </button>

      {open && createPortal(
        <div
          ref={panelRef}
          className="fixed z-[100] rounded-lg border border-slate-200 bg-white shadow-xl overflow-hidden"
          style={{ top: pos.top, left: pos.left, width: listWidth }}
        >
          <div className="max-h-64 overflow-y-auto py-1">
            {options.map((o) => (
              <button
                key={String(o.value)}
                type="button"
                onMouseDown={(e) => { e.preventDefault(); onChange(o.value); setOpen(false); }}
                className="w-full text-left px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 flex items-center justify-between gap-2"
                style={renderOptionStyle?.(o)}
              >
                <span className="truncate">{o.label}</span>
                {String(value) === String(o.value) && <Check size={12} className="text-teal-600 shrink-0" />}
              </button>
            ))}
          </div>

          {custom && (
            <div className="border-t border-slate-100 p-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                {custom.label}
              </p>
              <div className="flex items-center gap-1.5">
                <input
                  autoFocus
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); commitCustom(); } }}
                  placeholder={custom.placeholder}
                  className="flex-1 min-w-0 h-7 px-2 rounded border border-slate-200 text-xs focus:outline-none focus:border-teal-500"
                />
                <button
                  type="button"
                  onMouseDown={(e) => { e.preventDefault(); commitCustom(); }}
                  disabled={!custom.parse?.(draft)}
                  className="h-7 px-2 rounded bg-teal-700 text-white text-[11px] font-bold disabled:opacity-40"
                >
                  Set
                </button>
              </div>
            </div>
          )}
        </div>,
        document.body
      )}
    </>
  );
}
