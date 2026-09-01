import { Link } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useSubmitterAuth } from '../../context/submitterAuthContext';
import { usecongress } from '../../context/congressContext';

export default function PortalLayout({ children }) {
  const { submitter, logout } = useSubmitterAuth();
  const { siteSettings } = usecongress();
  const siteName = siteSettings?.siteName || 'Aging Congress';

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      {/* Header */}
      <header style={{
        background: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        position: 'sticky',
        top: 0,
        zIndex: 30,
      }}>
        <div style={{ height: 2, background: 'linear-gradient(90deg, var(--brand-dark), var(--brand))' }} />
        <div
          className="mx-auto flex items-center justify-between gap-3 px-4 sm:px-6"
          style={{ maxWidth: 1000, height: 60 }}
        >
          {/* Brand — the site name can be long, so it truncates to one line
              instead of wrapping and blowing out the header height */}
          <Link to="/" className="flex items-center gap-2.5 min-w-0 flex-1 no-underline">
            {siteSettings?.logo ? (
              <img
                src={siteSettings.logo}
                alt={siteName}
                className="shrink-0"
                style={{ width: 32, height: 32, objectFit: 'contain' }}
              />
            ) : (
              <div
                className="shrink-0 flex items-center justify-center"
                style={{
                  width: 32, height: 32,
                  background: 'linear-gradient(135deg, var(--brand-dark), var(--brand))',
                  clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))',
                }}
              >
                <span style={{ fontSize: 11, fontWeight: 900, color: '#fff' }}>AC</span>
              </div>
            )}
            <div className="min-w-0">
              <div
                className="truncate font-bold uppercase text-slate-900"
                style={{ fontSize: 12, letterSpacing: '0.04em', lineHeight: 1.25 }}
                title={siteName}
              >
                {siteName}
              </div>
              <div
                className="truncate font-semibold uppercase"
                style={{ fontSize: 9, color: 'var(--brand)', letterSpacing: '0.15em', marginTop: 1 }}
              >
                Submission Portal
              </div>
            </div>
          </Link>

          {submitter && (
            <div className="flex items-center gap-2 shrink-0">
              {/* Full identity on wider screens */}
              <div className="hidden md:flex flex-col items-end leading-tight mr-1">
                <span className="text-xs font-semibold text-slate-600 whitespace-nowrap">
                  {submitter.firstName} {submitter.lastName}
                </span>
                <span className="text-[10px] text-slate-400 font-mono whitespace-nowrap">
                  {submitter.loginId}
                </span>
              </div>

              {/* Compact stand-in for it on narrow screens */}
              <div
                className="md:hidden flex items-center justify-center rounded-full shrink-0"
                title={`${submitter.firstName} ${submitter.lastName} · ${submitter.loginId}`}
                style={{
                  width: 30, height: 30,
                  background: 'var(--brand-light)',
                  border: '1px solid color-mix(in srgb, var(--brand) 30%, transparent)',
                  color: 'var(--brand-dark)',
                  fontSize: 11, fontWeight: 800,
                }}
              >
                {(submitter.firstName?.[0] || '') + (submitter.lastName?.[0] || '')}
              </div>

              <button
                onClick={logout}
                aria-label="Log out"
                className="flex items-center gap-1.5 rounded-md shrink-0 transition-colors"
                style={{
                  fontSize: 11, fontWeight: 600, color: '#64748b',
                  background: 'none', border: '1px solid #e2e8f0',
                  padding: '6px 10px', cursor: 'pointer',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = '#dc2626'; e.currentTarget.style.borderColor = '#fca5a5'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = '#64748b'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
              >
                <LogOut size={13} />
                <span className="hidden sm:inline">Log Out</span>
              </button>
            </div>
          )}
        </div>
      </header>

      <main style={{ maxWidth: 1000, margin: '0 auto', padding: '32px 24px' }}>
        {children}
      </main>

      <footer style={{ textAlign: 'center', padding: '24px', fontSize: 12, color: '#94a3b8', borderTop: '1px solid #f1f5f9', marginTop: 40 }}>
        © {new Date().getFullYear()} {siteName} · Submission Portal
      </footer>
    </div>
  );
}
