import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Search } from 'lucide-react';

export default function Select({
  value,
  onChange,
  options = [],
  placeholder = 'Select...',
  label,
  required,
  error,
  disabled = false,
  className = '',
  searchable = false,
  searchPlaceholder = 'Search...',
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const ref = useRef(null);
  const searchRef = useRef(null);

  const selected = options.find((o) => String(o.value) === String(value));
  const filteredOptions = searchable && query.trim()
    ? options.filter((o) => o.label.toLowerCase().includes(query.trim().toLowerCase()))
    : options;

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') setOpen(false); };
    if (open) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open]);

  useEffect(() => {
    if (open && searchable) {
      setQuery('');
      const t = setTimeout(() => searchRef.current?.focus(), 10);
      return () => clearTimeout(t);
    }
  }, [open, searchable]);

  return (
    <div className={`flex flex-col gap-1 ${className}`} ref={ref}>
      {label && (
        <label className="block text-sm font-medium text-slate-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        <button
          type="button"
          disabled={disabled}
          onClick={() => setOpen((o) => !o)}
          className="w-full px-4 py-2.5 text-sm text-left flex items-center justify-between rounded-xl border transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed bg-white"
          style={{
            borderColor: error ? '#f87171' : open ? '#0d9488' : '#e2e8f0',
            boxShadow: open ? '0 0 0 2px rgba(13,148,136,0.25)' : 'none',
          }}
        >
          <span className={selected ? 'text-slate-800' : 'text-slate-400'}>
            {selected ? selected.label : placeholder}
          </span>
          <ChevronDown
            size={15}
            strokeWidth={2.5}
            className="shrink-0 transition-transform duration-150"
            style={{
              color: open ? '#0d9488' : '#94a3b8',
              transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            }}
          />
        </button>

        {open && (
          <div
            className="absolute left-0 right-0 z-50 bg-white rounded-xl overflow-hidden"
            style={{
              top: 'calc(100% + 4px)',
              border: '1px solid #e2e8f0',
              borderTop: '2px solid #0d9488',
              boxShadow: '0 8px 24px rgba(13,148,136,0.12), 0 2px 8px rgba(0,0,0,0.06)',
            }}
          >
            {searchable && (
              <div className="relative border-b border-slate-100 p-2">
                <Search size={14} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  ref={searchRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  placeholder={searchPlaceholder}
                  className="w-full pl-7 pr-2 py-1.5 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
                />
              </div>
            )}
            <div className="max-h-60 overflow-y-auto">
              {filteredOptions.length === 0 ? (
                <div className="px-4 py-3 text-sm text-slate-400 text-center">No options</div>
              ) : (
                filteredOptions.map((opt, i) => {
                  const isSelected = String(opt.value) === String(value);
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => { onChange(opt.value); setOpen(false); }}
                      className="w-full px-4 py-2.5 text-sm text-left flex items-center justify-between transition-colors duration-100 hover:bg-teal-50"
                      style={{
                        background: isSelected ? '#f0fdfa' : 'transparent',
                        color: isSelected ? '#0d9488' : '#334155',
                        fontWeight: isSelected ? 600 : 400,
                        borderBottom: i < filteredOptions.length - 1 ? '1px solid #f8fafc' : 'none',
                      }}
                    >
                      <span>{opt.label}</span>
                      {isSelected && <Check size={14} strokeWidth={2.5} className="shrink-0 text-teal-600" />}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}
