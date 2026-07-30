import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Check } from 'lucide-react';

const FLIP_MS = 140;

export default function Select({
  label,
  name,
  register,
  error,
  options = [],
  placeholder = 'Select...',
  required,
  className = '',
  // controlled mode (no register)
  value: controlledValue,
  onChange: controlledOnChange,
  defaultValue,
  disabled = false,
}) {
  const regProps   = register ? register(name, { required }) : null;
  const hiddenRef  = useRef(null);
  const triggerRef = useRef(null);
  const listRef    = useRef(null);

  const [open, setOpen] = useState(false);
  const [pos, setPos]   = useState({ top: 0, left: 0, width: 0 });
  const [val, setVal]   = useState(controlledValue ?? defaultValue ?? '');

  const isControlled = controlledValue !== undefined;
  const displayVal   = isControlled ? controlledValue : val;
  const selected     = options.find((o) => String(o.value) === String(displayVal));

  // React state is source of truth. When parent changes defaultValue (e.g. after
  // reset() + setState), sync val. Never read from DOM — that caused the stale-display bug.
  useEffect(() => {
    if (isControlled) return;
    setVal(defaultValue ?? '');
  }, [defaultValue]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Position portal ────────────────────────────────────────────────────
  const calcPos = useCallback(() => {
    if (!triggerRef.current) return;
    const r = triggerRef.current.getBoundingClientRect();
    setPos({ top: r.bottom + 4, left: r.left, width: r.width });
  }, []);

  useEffect(() => { if (open) calcPos(); }, [open, calcPos]);

  useEffect(() => {
    if (!open) return;
    const fn = () => calcPos();
    window.addEventListener('scroll', fn, true);
    window.addEventListener('resize', fn);
    return () => { window.removeEventListener('scroll', fn, true); window.removeEventListener('resize', fn); };
  }, [open, calcPos]);

  // ── Outside click close ───────────────────────────────────────────────
  useEffect(() => {
    const fn = (e) => {
      if (
        triggerRef.current && !triggerRef.current.contains(e.target) &&
        listRef.current    && !listRef.current.contains(e.target)
      ) setOpen(false);
    };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  useEffect(() => {
    const fn = (e) => { if (e.key === 'Escape') setOpen(false); };
    if (open) document.addEventListener('keydown', fn);
    return () => document.removeEventListener('keydown', fn);
  }, [open]);

  // ── Select an option ─────────────────────────────────────────────────
  const pick = (optVal) => {
    if (isControlled) {
      controlledOnChange?.(optVal);
    } else {
      setVal(optVal);
      regProps?.onChange?.({ target: { value: optVal, name } });
    }
    setOpen(false);
  };

  // Stable ref merger — empty deps [] keeps same function identity every render,
  // preventing React from calling old ref(null) + new ref(node) which causes RHF
  // to re-register and reset the input value, fighting our React state.
  const rhfRefHolder = useRef(null);
  rhfRefHolder.current = regProps?.ref;
  const mergeRef = useCallback((node) => {
    hiddenRef.current = node;
    const rref = rhfRefHolder.current;
    if (typeof rref === 'function') rref(node);
    else if (rref) rref.current = node;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label className="text-sm font-medium text-slate-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Controlled hidden input — value always mirrors React state, never DOM */}
      {regProps && (
        <input
          type="hidden"
          name={name}
          ref={mergeRef}
          value={val}
          onChange={() => {}}
        />
      )}

      {/* Trigger button */}
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
            transition: `transform ${FLIP_MS}ms ease`,
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            flexShrink: 0,
          }}
        />
      </button>

      {/* Custom dropdown list via portal */}
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
              const isSel = String(opt.value) === String(displayVal);
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => pick(opt.value)}
                  className="w-full px-3 py-2.5 text-sm text-left flex items-center justify-between transition-colors duration-100"
                  style={{
                    background: isSel ? 'var(--brand-light)' : 'transparent',
                    color: isSel ? 'var(--brand-dark)' : '#334155',
                    fontWeight: isSel ? 600 : 400,
                    borderBottom: i < options.length - 1 ? '1px solid #f8fafc' : 'none',
                  }}
                  onMouseEnter={(e) => { if (!isSel) e.currentTarget.style.background = '#f8fafc'; }}
                  onMouseLeave={(e) => { if (!isSel) e.currentTarget.style.background = 'transparent'; }}
                >
                  <span>{opt.label}</span>
                  {isSel && <Check size={13} strokeWidth={2.5} style={{ color: 'var(--brand-dark)', flexShrink: 0 }} />}
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
