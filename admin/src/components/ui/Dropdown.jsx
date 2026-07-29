import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
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
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0 });
  const triggerRef = useRef(null);
  const listRef = useRef(null);

  const selected = options.find((o) => String(o.value) === String(value));

  // Calculate portal position from trigger's bounding rect
  const calcPos = useCallback(() => {
    if (!triggerRef.current) return;
    const r = triggerRef.current.getBoundingClientRect();
    setPos({ top: r.bottom + 4, left: r.left, width: r.width });
  }, []);

  useEffect(() => {
    if (open) calcPos();
  }, [open, calcPos]);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (
        triggerRef.current && !triggerRef.current.contains(e.target) &&
        listRef.current  && !listRef.current.contains(e.target)
      ) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') setOpen(false); };
    if (open) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open]);

  // Reposition on scroll or resize
  useEffect(() => {
    if (!open) return;
    const handler = () => calcPos();
    window.addEventListener('scroll', handler, true);
    window.addEventListener('resize', handler);
    return () => {
      window.removeEventListener('scroll', handler, true);
      window.removeEventListener('resize', handler);
    };
  }, [open, calcPos]);

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label className="text-sm font-medium text-slate-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Trigger */}
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        className="w-full h-9 px-3 text-sm text-left flex items-center justify-between transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed bg-white"
        style={{
          border: error
            ? '1px solid #f87171'
            : open
            ? '1px solid var(--brand-dark)'
            : '1px solid #e2e8f0',
          boxShadow: open ? '0 0 0 3px color-mix(in srgb, var(--brand-dark) 18%, transparent)' : 'none',
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
            color: open ? 'var(--brand-dark)' : '#94a3b8',
            transition: 'transform 0.15s ease, color 0.15s ease',
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            flexShrink: 0,
          }}
        />
      </button>

      {/* Dropdown list — rendered in portal to escape overflow:hidden parents */}
      {open && createPortal(
        <div
          ref={listRef}
          style={{
            position: 'fixed',
            top: pos.top,
            left: pos.left,
            width: pos.width,
            zIndex: 9999,
            background: '#fff',
            border: '1px solid #e2e8f0',
            borderTop: '2px solid var(--brand-dark)',
            boxShadow: '0 8px 24px color-mix(in srgb, var(--brand-dark) 18%, transparent), 0 2px 8px rgba(0,0,0,0.06)',
            overflow: 'hidden',
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
                    background: isSelected ? 'var(--brand-light)' : 'transparent',
                    color: isSelected ? 'var(--brand-dark)' : '#334155',
                    fontWeight: isSelected ? 600 : 400,
                    borderBottom: i < options.length - 1 ? '1px solid #f8fafc' : 'none',
                  }}
                  onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = '#f8fafc'; }}
                  onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
                >
                  <span>{opt.label}</span>
                  {isSelected && (
                    <Check size={13} strokeWidth={2.5} style={{ color: 'var(--brand-dark)', flexShrink: 0 }} />
                  )}
                </button>
              );
            })
          )}
        </div>,
        document.body
      )}

      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
