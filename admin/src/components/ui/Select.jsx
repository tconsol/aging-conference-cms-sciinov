import { useState, useRef, useEffect, useLayoutEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Check } from 'lucide-react';

const FLIP_MS = 140;

// Dropdown placement constants
const GAP = 4;        // space between trigger and list
const EDGE = 8;       // min breathing room against the viewport edge
const MAX_LIST_H = 280;

export default function Select({
  label,
  name,
  register,
  error,
  options = [],
  placeholder = 'Select...',
  required,
  hint,
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
  const [pos, setPos]   = useState({ top: 0, left: 0, width: 0, maxHeight: MAX_LIST_H, up: false });
  const [val, setVal]   = useState(controlledValue ?? defaultValue ?? '');

  const isControlled = controlledValue !== undefined;
  const displayVal   = isControlled ? controlledValue : val;
  const selected     = options.find((o) => String(o.value) === String(displayVal));

  // React state is source of truth. When parent changes defaultValue (e.g. after
  // reset() + setState), sync val. Never read from DOM that caused the stale-display bug.
  useEffect(() => {
    if (isControlled) return;
    setVal(defaultValue ?? '');
  }, [defaultValue]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Position portal ────────────────────────────────────────────────────
  // Opens downward by default, but flips above the trigger when there isn't
  // room below and there is more room above. Height is capped to whichever
  // side it lands on so the list never runs off-screen.
  const calcPos = useCallback(() => {
    if (!triggerRef.current) return;
    const r = triggerRef.current.getBoundingClientRect();

    const contentH   = listRef.current?.scrollHeight ?? MAX_LIST_H;
    const spaceBelow = window.innerHeight - r.bottom - GAP - EDGE;
    const spaceAbove = r.top - GAP - EDGE;
    const desired    = Math.min(contentH, MAX_LIST_H);

    const up = desired > spaceBelow && spaceAbove > spaceBelow;
    const maxHeight = Math.max(120, Math.min(desired, up ? spaceAbove : spaceBelow));

    setPos((prev) => {
      const next = {
        top: up ? Math.max(EDGE, r.top - GAP - maxHeight) : r.bottom + GAP,
        left: r.left,
        width: r.width,
        maxHeight,
        up,
      };
      const same =
        prev.top === next.top && prev.left === next.left && prev.width === next.width &&
        prev.maxHeight === next.maxHeight && prev.up === next.up;
      return same ? prev : next; // guard against a re-render loop
    });
  }, []);

  // Layout effect so the measured flip is applied before paint (no visible jump)
  useLayoutEffect(() => { if (open) calcPos(); }, [open, calcPos]);

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

  // Stable ref merger empty deps [] keeps same function identity every render,
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

      {/* Controlled hidden input value always mirrors React state, never DOM */}
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
        title={selected ? selected.label : undefined}
        className="w-full h-9 px-3 gap-2 text-sm text-left flex items-center justify-between transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed bg-white"
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
        {/* min-w-0 lets the label shrink so a long option ellipsises instead of
            overflowing the fixed-height trigger */}
        <span
          className="truncate min-w-0 flex-1"
          style={{ color: selected ? '#0f172a' : '#94a3b8' }}
        >
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
            // accent edge sits on whichever side faces the trigger
            [pos.up ? 'borderBottom' : 'borderTop']: '2px solid var(--brand-dark)',
            boxShadow: pos.up
              ? '0 -8px 24px color-mix(in srgb, var(--brand-dark) 18%, transparent), 0 -2px 8px rgba(0,0,0,0.06)'
              : '0 8px 24px color-mix(in srgb, var(--brand-dark) 18%, transparent), 0 2px 8px rgba(0,0,0,0.06)',
            overflowY: 'auto',
            maxHeight: pos.maxHeight,
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
                  className="w-full px-3 py-2.5 gap-2 text-sm text-left flex items-start justify-between transition-colors duration-100"
                  style={{
                    background: isSel ? 'var(--brand-light)' : 'transparent',
                    color: isSel ? 'var(--brand-dark)' : '#334155',
                    fontWeight: isSel ? 600 : 400,
                    borderBottom: i < options.length - 1 ? '1px solid #f8fafc' : 'none',
                  }}
                  onMouseEnter={(e) => { if (!isSel) e.currentTarget.style.background = '#f8fafc'; }}
                  onMouseLeave={(e) => { if (!isSel) e.currentTarget.style.background = 'transparent'; }}
                >
                  <span className="min-w-0 flex-1 leading-snug">{opt.label}</span>
                  {isSel && <Check size={13} strokeWidth={2.5} style={{ color: 'var(--brand-dark)', flexShrink: 0, marginTop: 2 }} />}
                </button>
              );
            })
          )}
        </div>,
        document.body
      )}

      {hint && !error && <p className="text-xs text-slate-500">{hint}</p>}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
