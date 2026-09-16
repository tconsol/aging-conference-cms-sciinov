import { useState, useEffect, useMemo, useRef, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Search, Check } from 'lucide-react';
import { fontsAPI } from '../../api/settings';
import { loadGoogleFont, WEB_SAFE_FONTS, fontStack } from '../../utils/editorFonts';

/**
 * Font picker for the editor toolbar: the web-safe families first, then the
 * whole Google Fonts catalogue from /api/fonts.
 *
 * Portalled for the same reason the colour menus are — the editor shell clips
 * overflow. Google faces load lazily as rows scroll into view, because
 * requesting a stylesheet for ~1,900 families on open would be absurd.
 */
export default function EditorFontSelect({ value, onChange }) {
  const [googleFonts, setGoogleFonts] = useState([]);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [pos, setPos] = useState({ top: 0, left: 0 });

  const triggerRef = useRef(null);
  const panelRef = useRef(null);
  const listRef = useRef(null);

  const WIDTH = 260;

  useEffect(() => {
    fontsAPI.getAll()
      .then((res) => setGoogleFonts((res.data?.data || []).map((f) => f.family)))
      .catch(() => setGoogleFonts([]));
  }, []);

  const options = useMemo(() => {
    const webSafe = WEB_SAFE_FONTS.map((f) => ({ ...f, group: 'Web safe' }));
    const google = googleFonts.map((family) => ({
      label: family,
      value: fontStack(family),
      family,
      group: 'Google Fonts',
    }));
    return [...webSafe, ...google];
  }, [googleFonts]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [options, query]);

  const place = () => {
    const el = triggerRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const h = 320;
    const below = window.innerHeight - r.bottom - 12;
    const flipUp = h > below && r.top > below;
    setPos({
      top: flipUp ? Math.max(8, r.top - 4 - h) : r.bottom + 4,
      left: Math.min(Math.max(8, r.left), window.innerWidth - WIDTH - 8),
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
    // Scrolling the page leaves a fixed panel stranded beside nothing, so close
    // on that — but not on the font list scrolling inside itself, which is how
    // the list is meant to be used.
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

  // Load each Google face only once its row is actually on screen.
  useEffect(() => {
    if (!open || !listRef.current) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const family = entry.target.dataset.google;
        if (family) loadGoogleFont(family);
        io.unobserve(entry.target);
      });
    }, { root: listRef.current, rootMargin: '150px' });
    listRef.current.querySelectorAll('[data-google]').forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [open, filtered]);

  const current = options.find((o) => o.value === value);
  const label = current?.label || (value ? 'Custom' : 'Default (site font)');

  // Keep the selected face loaded so the closed control previews it.
  useEffect(() => {
    if (current?.group === 'Google Fonts') loadGoogleFont(current.family);
  }, [current]);

  const pick = (opt) => {
    if (opt.group === 'Google Fonts') loadGoogleFont(opt.family);
    onChange(opt.value);
    setOpen(false);
  };

  let lastGroup = null;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        title="Font"
        onMouseDown={(e) => { e.preventDefault(); setOpen((o) => !o); }}
        className="h-7 ml-1 px-2 rounded border border-slate-200 bg-white text-xs text-slate-700 hover:border-slate-300 inline-flex items-center gap-1 transition-colors"
        style={{ width: 150 }}
      >
        <span className="truncate flex-1 text-left" style={{ fontFamily: value || 'inherit' }}>
          {label}
        </span>
        <ChevronDown size={11} className="shrink-0 text-slate-400" />
      </button>

      {open && createPortal(
        <div
          ref={panelRef}
          className="fixed z-[100] rounded-lg border border-slate-200 bg-white shadow-xl overflow-hidden"
          style={{ top: pos.top, left: pos.left, width: WIDTH }}
        >
          <div className="p-2 border-b border-slate-100">
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search fonts…"
                className="w-full h-8 pl-8 pr-2 rounded border border-slate-200 text-xs focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>

          <div ref={listRef} className="max-h-72 overflow-y-auto">
            <button
              type="button"
              onMouseDown={(e) => { e.preventDefault(); onChange(''); setOpen(false); }}
              className="w-full text-left px-3 py-2 text-xs text-slate-500 hover:bg-slate-50 flex items-center justify-between"
            >
              Default (site font)
              {!value && <Check size={12} className="text-teal-600" />}
            </button>

            {filtered.length === 0 ? (
              <p className="px-3 py-6 text-xs text-slate-400 text-center">No fonts match “{query}”.</p>
            ) : (
              filtered.map((opt) => {
                const header = opt.group !== lastGroup ? opt.group : null;
                lastGroup = opt.group;
                return (
                  <div key={`${opt.group}-${opt.label}`}>
                    {header && (
                      <p className="px-3 pt-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50">
                        {header}
                      </p>
                    )}
                    <button
                      type="button"
                      data-google={opt.group === 'Google Fonts' ? opt.family : undefined}
                      onMouseDown={(e) => { e.preventDefault(); pick(opt); }}
                      className="w-full text-left px-3 py-1.5 text-sm text-slate-800 hover:bg-slate-50 flex items-center justify-between gap-2"
                      style={{ fontFamily: opt.value }}
                    >
                      <span className="truncate">{opt.label}</span>
                      {value === opt.value && <Check size={12} className="text-teal-600 shrink-0" />}
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
