import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, LogIn, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import { useSubmitterAuth } from '../../context/submitterAuthContext';
import { usecongress } from '../../context/congressContext';

export default function PortalLogin() {
  const { login, submitter, loading } = useSubmitterAuth();
  const { siteSettings } = usecongress();
  const navigate = useNavigate();

  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const siteName = siteSettings?.siteName || 'Aging Congress';

  useEffect(() => {
    if (!loading && submitter) navigate('/portal/dashboard', { replace: true });
  }, [submitter, loading, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!loginId.trim() || !password.trim()) {
      toast.error('Enter your Login ID and password.');
      return;
    }
    setSubmitting(true);
    try {
      await login(loginId.trim(), password.trim());
      navigate('/portal/dashboard', { replace: true });
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Invalid Login ID or password.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return null;

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f0f9ff 0%, #f8fafc 50%, #f0fdf4 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
    }}>
      {/* Brand */}
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', marginBottom: 32 }}>
        {siteSettings?.logo ? (
          <img src={siteSettings.logo} alt={siteName} style={{ width: 40, height: 40, objectFit: 'contain' }} />
        ) : (
          <div style={{
            width: 40, height: 40,
            background: 'linear-gradient(135deg, var(--brand-dark), var(--brand))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            clipPath: 'polygon(0 0, calc(100% - 7px) 0, 100% 7px, 100% 100%, 7px 100%, 0 calc(100% - 7px))',
          }}>
            <span style={{ fontSize: 13, fontWeight: 900, color: '#fff' }}>AC</span>
          </div>
        )}
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            {siteName}
          </div>
          <div style={{ fontSize: 9.5, color: 'var(--brand)', letterSpacing: '0.16em', fontWeight: 600, textTransform: 'uppercase', marginTop: 2 }}>
            Abstract Submission Portal
          </div>
        </div>
      </Link>

      {/* Card */}
      <div style={{
        width: '100%',
        maxWidth: 420,
        background: '#ffffff',
        borderRadius: 16,
        boxShadow: '0 4px 24px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04)',
        overflow: 'hidden',
      }}>
        {/* Card header accent */}
        <div style={{ height: 3, background: 'linear-gradient(90deg, var(--brand-dark), var(--brand))' }} />

        <div style={{ padding: '32px 32px 28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'linear-gradient(135deg, var(--brand-dark), var(--brand))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <FileText size={17} color="#fff" />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#0f172a' }}>Track Your Submission</h1>
              <p style={{ margin: 0, fontSize: 12, color: '#64748b', marginTop: 2 }}>Use credentials sent to your email</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                Login ID
              </label>
              <input
                type="text"
                value={loginId}
                onChange={(e) => setLoginId(e.target.value)}
                placeholder="e.g. ABS-2025-0001"
                autoComplete="username"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  fontSize: 14,
                  fontFamily: 'monospace',
                  border: '1.5px solid #e2e8f0',
                  borderRadius: 8,
                  outline: 'none',
                  color: '#0f172a',
                  background: '#f8fafc',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.15s',
                }}
                onFocus={(e) => { e.target.style.borderColor = 'var(--brand)'; e.target.style.background = '#fff'; }}
                onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.background = '#f8fafc'; }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  style={{
                    width: '100%',
                    padding: '10px 42px 10px 14px',
                    fontSize: 14,
                    border: '1.5px solid #e2e8f0',
                    borderRadius: 8,
                    outline: 'none',
                    color: '#0f172a',
                    background: '#f8fafc',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.15s',
                  }}
                  onFocus={(e) => { e.target.style.borderColor = 'var(--brand)'; e.target.style.background = '#fff'; }}
                  onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.background = '#f8fafc'; }}
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  style={{
                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 2,
                  }}
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                padding: '12px 20px',
                fontSize: 13, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
                background: submitting
                  ? '#94a3b8'
                  : 'linear-gradient(135deg, var(--brand-dark), var(--brand))',
                color: '#ffffff',
                border: 'none', borderRadius: 8, cursor: submitting ? 'not-allowed' : 'pointer',
                marginTop: 4,
                transition: 'opacity 0.15s, transform 0.15s',
                boxShadow: '0 2px 8px color-mix(in srgb, var(--brand) 30%, transparent)',
              }}
              onMouseEnter={(e) => { if (!submitting) e.currentTarget.style.opacity = '0.9'; }}
              onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
            >
              {submitting ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{
                    width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)',
                    borderTopColor: '#fff', borderRadius: '50%',
                    display: 'inline-block', animation: 'spin 0.7s linear infinite',
                  }} />
                  Logging in...
                </span>
              ) : (
                <><LogIn size={15} /> Login</>
              )}
            </button>
          </form>
        </div>

        <div style={{
          padding: '16px 32px',
          background: '#f8fafc',
          borderTop: '1px solid #f1f5f9',
          fontSize: 12,
          color: '#64748b',
          textAlign: 'center',
        }}>
          Login credentials were emailed when you submitted your abstract.
          <br />
          Haven't submitted yet?{' '}
          <Link to="/abstract-submission" style={{ color: 'var(--brand-dark)', fontWeight: 600, textDecoration: 'none' }}>
            Submit Abstract →
          </Link>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
