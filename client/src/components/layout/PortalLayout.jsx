import { Link } from 'react-router-dom';
import { LogOut, FileText } from 'lucide-react';
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
        <div style={{
          maxWidth: 1000,
          margin: '0 auto',
          padding: '0 24px',
          height: 58,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            {siteSettings?.logo ? (
              <img src={siteSettings.logo} alt={siteName} style={{ width: 32, height: 32, objectFit: 'contain' }} />
            ) : (
              <div style={{
                width: 32, height: 32,
                background: 'linear-gradient(135deg, var(--brand-dark), var(--brand))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))',
              }}>
                <span style={{ fontSize: 11, fontWeight: 900, color: '#fff' }}>AC</span>
              </div>
            )}
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#0f172a', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                {siteName}
              </div>
              <div style={{ fontSize: 9, color: 'var(--brand)', letterSpacing: '0.15em', fontWeight: 600, textTransform: 'uppercase', marginTop: 1 }}>
                Submission Portal
              </div>
            </div>
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {submitter && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <FileText size={13} color="var(--brand)" />
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>
                    {submitter.firstName} {submitter.lastName}
                  </span>
                  <span style={{ fontSize: 11, color: '#94a3b8', fontFamily: 'monospace' }}>
                    · {submitter.loginId}
                  </span>
                </div>
                <button
                  onClick={logout}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 5,
                    fontSize: 11, fontWeight: 600, color: '#64748b',
                    background: 'none', border: '1px solid #e2e8f0',
                    borderRadius: 6, padding: '5px 10px', cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = '#dc2626'; e.currentTarget.style.borderColor = '#fca5a5'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = '#64748b'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
                >
                  <LogOut size={12} /> Log Out
                </button>
              </>
            )}
          </div>
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
