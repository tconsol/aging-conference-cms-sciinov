import { useState, useEffect, useMemo, useRef } from 'react';
import { ChevronDown, Search, Check, X } from 'lucide-react';
import { fontsAPI } from '../../api/settings';

/**
 * Google Font picker. Each option is rendered in its own face, so the list is a
 * preview rather than a wall of identical names.
 *
 * Fonts are loaded lazily as they scroll into view: eagerly requesting a
 * stylesheet for ~1,500 families would fire that many network requests on open.
 */
export default function FontPicker({ label, value, onChange, hint }) {
  const [fonts, setFonts] = useState([]);
  const [source, setSource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const wrapRef = useRef(null);
  const listRef = useRef(null);

  useEffect(() => {
    fontsAPI.getAll()
      .then((res) => {
        setFonts(res.data?.data || []);
        setSource(res.data?.source || null);
      })
      .catch(() => setFonts([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const onDown = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return fonts;
    return fonts.filter((f) => f.family.toLowerCase().includes(q));
  }, [fonts, query]);

  // Loads a family's stylesheet once, when its row first becomes visible.
  const ensureFontLoaded = (family) => {
    const id = `gf-admin-${family.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
    if (document.getElementById(id)) return;
    const link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family).replace(/%20/g, '+')}:wght@400;700&display=swap`;
    document.head.appendChild(link);
  };

  useEffect(() => {
    if (!open || !listRef.current) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          ensureFontLoaded(entry.target.dataset.family);
          io.unobserve(entry.target);
        }
      });
    }, { root: listRef.current, rootMargin: '120px' });

    listRef.current.querySelectorAll('[data-family]').forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [open, filtered]);

  // The chosen family is loaded regardless, so the closed control previews it.
  useEffect(() => { if (value) ensureFontLoaded(value); }, [value]);

  return (
    <div className="flex flex-col gap-1.5" ref={wrapRef}>
      {label && <label className="text-sm font-medium text-slate-700">{label}</label>}

      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-white text-left text-sm flex items-center justify-between gap-2 hover:border-slate-300 transition-colors"
        >
          <span
            className="truncate"
            style={{
              fontFamily: value ? `'${value}', system-ui, sans-serif` : undefined,
              color: value ? '#0f172a' : '#94a3b8',
            }}
          >
            {value || (loading ? 'Loading fonts…' : 'Default (theme font)')}
          </span>
          <span className="flex items-center gap-1 shrink-0">
            {value && (
              <span
                role="button"
                tabIndex={0}
                aria-label="Clear font"
                onClick={(e) => { e.stopPropagation(); onChange(''); }}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.stopPropagation(); onChange(''); } }}
                className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X size={13} />
              </span>
            )}
            <ChevronDown size={15} className="text-slate-400" />
          </span>
        </button>

        {open && (
          <div className="absolute z-30 mt-1 w-full rounded-xl border border-slate-200 bg-white shadow-lg overflow-hidden">
            <div className="p-2 border-b border-slate-100">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search fonts…"
                  className="w-full h-9 pl-9 pr-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-teal-500"
                />
              </div>
            </div>

            <div ref={listRef} className="max-h-72 overflow-y-auto">
              <button
                type="button"
                onClick={() => { onChange(''); setOpen(false); }}
                className="w-full text-left px-4 py-2.5 text-sm text-slate-500 hover:bg-slate-50 flex items-center justify-between"
              >
                Default (theme font)
                {!value && <Check size={14} className="text-teal-600" />}
              </button>

              {loading ? (
                <p className="px-4 py-6 text-sm text-slate-400 text-center">Loading…</p>
              ) : filtered.length === 0 ? (
                <p className="px-4 py-6 text-sm text-slate-400 text-center">No fonts match “{query}”.</p>
              ) : (
                filtered.map((f) => (
                  <button
                    key={f.family}
                    type="button"
                    data-family={f.family}
                    onClick={() => { onChange(f.family); setOpen(false); }}
                    className="w-full text-left px-4 py-2.5 hover:bg-slate-50 flex items-center justify-between gap-3"
                  >
                    <span className="min-w-0">
                      <span
                        className="block text-[15px] text-slate-800 truncate"
                        style={{ fontFamily: `'${f.family}', system-ui, sans-serif` }}
                      >
                        {f.family}
                      </span>
                      {f.category && (
                        <span className="block text-[11px] text-slate-400">{f.category}</span>
                      )}
                    </span>
                    {value === f.family && <Check size={14} className="text-teal-600 shrink-0" />}
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {hint && <p className="text-xs text-slate-500">{hint}</p>}
      {source === 'fallback' && !loading && (
        <p className="text-xs text-amber-600">
          Showing a built-in shortlist. Set GOOGLE_FONTS_API_KEY on the server for the full catalogue.
        </p>
      )}
    </div>
  );
}
