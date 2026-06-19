import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export default function Dropdown({
  value,
  onChange,
  options = [],
  placeholder = 'Select...',
  label,
  required,
  error,
  disabled = false,
  className = '',
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const selected = options.find((o) => String(o.value) === String(value));

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

  return (
    <div className={`flex flex-col gap-1.5 ${className}`} ref={ref}>
      {label && (
        <label className="text-sm font-medium text-slate-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        {/* Trigger */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => setOpen((o) => !o)}
          className="w-full h-9 px-3 text-sm text-left flex items-center justify-between transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed bg-white"
          style={{
            border: error
              ? '1px solid #f87171'
              : open
              ? '1px solid #0f766e'
              : '1px solid #e2e8f0',
            boxShadow: open ? '0 0 0 3px rgba(15,118,110,0.12)' : 'none',
            clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 0 100%)',
          }}
        >
          <span style={{ color: selected ? '#0f172a' : '#94a3b8' }}>
            {selected ? selected.label : placeholder}
          </span>
          <ChevronDown
            size={13}
            strokeWidth={2.5}
            style={{
              color: open ? '#0f766e' : '#94a3b8',
              transition: 'transform 0.15s ease, color 0.15s ease',
              transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
              flexShrink: 0,
            }}
          />
        </button>

        {/* Dropdown list */}
        {open && (
          <div
            className="absolute left-0 right-0 z-50 bg-white overflow-hidden"
            style={{
              top: 'calc(100% + 4px)',
              border: '1px solid #e2e8f0',
              borderTop: '2px solid #0f766e',
              boxShadow: '0 8px 24px rgba(15,118,110,0.12), 0 2px 8px rgba(0,0,0,0.06)',
            }}
          >
            {options.length === 0 ? (
              <div className="px-3 py-3 text-sm text-slate-400 text-center">No options</div>
            ) : (
              options.map((opt, i) => {
                const isSelected = String(opt.value) === String(value);
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => { onChange(opt.value); setOpen(false); }}
                    className="w-full px-3 py-2.5 text-sm text-left flex items-center justify-between transition-colors duration-100"
                    style={{
                      background: isSelected ? '#f0fdf9' : 'transparent',
                      color: isSelected ? '#0f766e' : '#334155',
                      fontWeight: isSelected ? 600 : 400,
                      borderBottom: i < options.length - 1 ? '1px solid #f8fafc' : 'none',
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) e.currentTarget.style.background = '#f8fafc';
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <span>{opt.label}</span>
                    {isSelected && (
                      <Check size={13} strokeWidth={2.5} style={{ color: '#0f766e', flexShrink: 0 }} />
                    )}
                  </button>
                );
              })
            )}
          </div>
        )}
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
