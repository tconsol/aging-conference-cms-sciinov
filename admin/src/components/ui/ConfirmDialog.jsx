import { useEffect } from 'react';
import { Trash2, Pencil, X, Loader2, AlertTriangle } from 'lucide-react';

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to continue?',
  confirmLabel = 'Confirm',
  confirmVariant = 'danger',
  loading = false,
}) {
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape' && !loading) onClose(); };
    if (open) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, loading, onClose]);

  if (!open) return null;

  const isDanger = confirmVariant === 'danger';

  const accentColor   = isDanger ? '#dc2626' : 'var(--brand-dark)';
  const accentLight   = isDanger ? '#fef2f2' : 'var(--brand-light)';
  const iconColor     = isDanger ? '#dc2626' : 'var(--brand-dark)';
  const btnBg         = isDanger ? '#dc2626' : 'var(--brand-dark)';
  const btnHover      = isDanger ? '#b91c1c' : 'color-mix(in srgb, var(--brand-dark) 82%, black)';
  // alpha versions for template literals (hex+alpha trick doesn't work with CSS vars)
  const accentAlpha60 = isDanger ? '#dc262699' : 'color-mix(in srgb, var(--brand-dark) 60%, transparent)';
  const accentAlpha18 = isDanger ? '#dc262630' : 'color-mix(in srgb, var(--brand-dark) 18%, transparent)';

  const IconComp = isDanger ? Trash2 : Pencil;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={() => !loading && onClose()}
      />

      {/* Dialog */}
      <div
        className="relative w-full max-w-sm bg-white"
        style={{
          clipPath: 'polygon(0 0, calc(100% - 18px) 0, 100% 18px, 100% 100%, 0 100%)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top stripe */}
        <div style={{
          height: 2,
          background: `linear-gradient(90deg, ${accentAlpha60}, ${accentColor}, ${accentAlpha60})`,
        }} />

        {/* Cut corner fill */}
        <div style={{
          position: 'absolute', top: 2, right: 0,
          width: 18, height: 18,
          background: accentLight,
          clipPath: 'polygon(0 0, 100% 0, 100% 100%)',
        }} />

        <div className="p-6">
          {/* Header row */}
          <div className="flex items-start justify-between mb-4">
            <div
              className="w-10 h-10 flex items-center justify-center flex-shrink-0"
              style={{
                background: accentLight,
                border: `1px solid ${accentAlpha18}`,
                clipPath: 'polygon(0 0, calc(100% - 5px) 0, 100% 5px, 100% 100%, 0 100%)',
              }}
            >
              <IconComp size={17} style={{ color: iconColor }} />
            </div>
            <button
              onClick={() => !loading && onClose()}
              disabled={loading}
              className="p-1 text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-40"
            >
              <X size={15} />
            </button>
          </div>

          {/* Title */}
          <h3 className="text-base font-bold text-slate-900 mb-2 leading-tight">
            {title}
          </h3>

          {/* Message */}
          <p className="text-sm text-slate-500 leading-relaxed mb-6">
            {message}
          </p>

          {/* Divider with dots */}
          <div className="flex items-center gap-2 mb-5">
            <div className="flex-1 h-px bg-slate-100" />
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                style={{
                  width: 3, height: 3, borderRadius: '50%',
                  background: i === 1 ? accentColor : '#cbd5e1',
                }}
              />
            ))}
            <div className="flex-1 h-px bg-slate-100" />
          </div>

          {/* Actions */}
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={() => !loading && onClose()}
              disabled={loading}
              className="h-9 px-4 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors disabled:opacity-40"
              style={{
                clipPath: 'polygon(0 0, calc(100% - 4px) 0, 100% 4px, 100% 100%, 0 100%)',
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={loading}
              className="h-9 px-4 text-sm font-semibold text-white flex items-center gap-2 transition-opacity disabled:opacity-60"
              style={{
                background: btnBg,
                clipPath: 'polygon(0 0, calc(100% - 4px) 0, 100% 4px, 100% 100%, 0 100%)',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = btnHover; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = btnBg; }}
            >
              {loading && <Loader2 size={13} className="animate-spin" />}
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
