import { useEffect, useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  FileText, Download, CheckCircle, XCircle, ExternalLink,
  RefreshCw, Eye, EyeOff, Lock, ChevronRight, User, Shield, AlertCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useSubmitterAuth } from '../../context/submitterAuthContext';
import PortalLayout from '../../components/layout/PortalLayout';
import portalApi from '../../api/portalApi';

const STEPS = [
  { key: 'pending',           label: 'Submitted' },
  { key: 'received_accepted', label: 'Accepted for Review' },
  { key: 'under_review',      label: 'Under Review' },
  { key: 'decision_pending',  label: 'Decision Pending' },
  { key: 'accepted',          label: 'Accepted' },
];

const STATUS_CFG = {
  pending:           { color: '#d97706', bg: '#fffbeb', border: '#fcd34d', label: 'Pending' },
  received_accepted: { color: '#2563eb', bg: '#eff6ff', border: '#93c5fd', label: 'Received & Accepted' },
  under_review:      { color: '#7c3aed', bg: '#f5f3ff', border: '#c4b5fd', label: 'Under Peer Review' },
  decision_pending:  { color: '#ea580c', bg: '#fff7ed', border: '#fdba74', label: 'Decision Pending' },
  accepted:          { color: '#16a34a', bg: '#f0fdf4', border: '#86efac', label: 'Accepted' },
  rejected:          { color: '#dc2626', bg: '#fef2f2', border: '#fca5a5', label: 'Not Accepted' },
};

const PRESENTATION_LABELS = {
  oral_inperson:   'Oral Presentation · In-Person',
  oral_virtual:    'Oral Presentation · Virtual',
  poster_inperson: 'Poster Presentation · In-Person',
  poster_virtual:  'Poster Presentation · Virtual',
};

const TABS = [
  { key: 'overview', label: 'Overview', icon: User },
  { key: 'abstract', label: 'My Abstract', icon: FileText },
  { key: 'security', label: 'Change Password', icon: Shield },
];

// ── Status stepper ───────────────────────────────────────────────────────────
function StatusStepper({ status, celebrate = false }) {
  const isRejected = status === 'rejected';
  // Accepted is the end of the journey, so its step reads as completed rather
  // than as the one still in progress
  const isComplete = status === 'accepted';
  const currentIdx = isRejected ? STEPS.length - 1 : STEPS.findIndex((s) => s.key === status);

  return (
    <div style={{ position: 'relative', padding: '8px 0 4px' }}>
      {/* Connector line */}
      <div style={{
        position: 'absolute',
        top: 24,
        left: 20,
        right: 20,
        height: 2,
        background: '#e2e8f0',
        zIndex: 0,
      }} />
      {/* Active segment */}
      <div style={{
        position: 'absolute',
        top: 24,
        left: 20,
        height: 2,
        width: currentIdx === 0 ? 0 : `calc(${(currentIdx / (STEPS.length - 1)) * 100}% - 40px)`,
        background: isRejected ? '#ef4444' : isComplete ? '#22c55e' : 'var(--brand)',
        zIndex: 0,
        transition: 'width 0.4s ease',
      }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
        {STEPS.map((step, i) => {
          const done      = !isRejected && (i < currentIdx || (isComplete && i === currentIdx));
          const active    = !isRejected && i === currentIdx && !isComplete;
          const isFinalRj = isRejected && i === STEPS.length - 1;
          const color     = isFinalRj ? '#ef4444' : active ? 'var(--brand)' : done ? '#22c55e' : '#cbd5e1';

          // Only the step the submission is currently on animates — earlier ones
          // are settled history, later ones haven't happened yet.
          // Accepted swaps the looping ripple for a one-shot celebration.
          const isCurrent = i === currentIdx;
          const celebrates = isCurrent && isComplete && celebrate;
          // Accepted settles once its celebration has played; the looping ripple
          // stays only for statuses that are still in progress
          const ripples = isCurrent && !isComplete;
          const rippleColor = isFinalRj
            ? 'rgba(239, 68, 68, 0.5)'
            : active
              ? 'color-mix(in srgb, var(--brand) 45%, transparent)'
              : 'rgba(34, 197, 94, 0.5)';

          return (
            <div key={step.key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
              <div
                className={celebrates ? 'step-celebrate' : ripples ? 'step-ripple' : 'step-marker'}
                style={{
                  width: 36, height: 36, borderRadius: '50%',
                  border: `2.5px solid ${color}`,
                  background: (done || active || isFinalRj) ? color : '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'background 0.25s, border-color 0.25s',
                  ['--ripple']: rippleColor,
                  // Celebration keeps its own two-stage timing; the others pop
                  // in left to right with the ripple starting immediately.
                  animationDelay: celebrates ? '0.15s, 0.4s' : `${i * 0.09}s, 0s`,
                }}
              >
                {done ? (
                  <CheckCircle size={15} color="#fff" strokeWidth={2.5} />
                ) : isFinalRj ? (
                  <XCircle size={15} color="#fff" strokeWidth={2.5} />
                ) : active ? (
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#fff' }} />
                ) : (
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#e2e8f0' }} />
                )}
              </div>
              <div style={{
                marginTop: 8,
                fontSize: 10,
                fontWeight: (active || isFinalRj) ? 700 : done ? 600 : 400,
                color: done ? '#15803d' : (active || isFinalRj) ? color : '#94a3b8',
                textAlign: 'center',
                lineHeight: 1.3,
                maxWidth: 72,
              }}>
                {isFinalRj ? 'Not Accepted' : step.label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Info table row ────────────────────────────────────────────────────────────
function InfoRow({ label, value, mono }) {
  if (!value && value !== 0) return null;
  return (
    <div style={{ display: 'flex', gap: 16, padding: '11px 0', borderBottom: '1px solid #f1f5f9' }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8', minWidth: 140, paddingTop: 1 }}>{label}</div>
      <div style={{ fontSize: 13, color: '#1e293b', fontFamily: mono ? 'monospace' : undefined, flex: 1 }}>{value}</div>
    </div>
  );
}

/**
 * Declared at module scope on purpose. Defining it inside ChangePasswordForm
 * created a new component type on every render, so React remounted the input
 * and focus was lost after each keystroke.
 */
function PasswordField({ label, value, visible, onChange, onToggle }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 6 }}>{label}</label>
      <div style={{ position: 'relative' }}>
        <input
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="••••••••"
          autoComplete={label.toLowerCase().includes('current') ? 'current-password' : 'new-password'}
          style={{
            width: '100%', boxSizing: 'border-box',
            padding: '10px 42px 10px 14px',
            fontSize: 13, border: '1.5px solid #e2e8f0',
            borderRadius: 10, outline: 'none',
            background: '#f8fafc', color: '#0f172a',
            transition: 'border-color 0.15s, background 0.15s',
          }}
          onFocus={(e) => { e.target.style.borderColor = 'var(--brand)'; e.target.style.background = '#fff'; }}
          onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.background = '#f8fafc'; }}
        />
        <button
          type="button"
          onClick={onToggle}
          aria-label={visible ? 'Hide password' : 'Show password'}
          style={{
            position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
            background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 2,
          }}
        >
          {visible ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
      </div>
    </div>
  );
}

// ── Password change form ──────────────────────────────────────────────────────
function ChangePasswordForm() {
  const [form, setForm]     = useState({ current: '', next: '', confirm: '' });
  const [show, setShow]     = useState({ current: false, next: false, confirm: false });
  const [saving, setSaving] = useState(false);

  const toggle = (field) => setShow((s) => ({ ...s, [field]: !s[field] }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.current || !form.next || !form.confirm) {
      toast.error('All fields are required.'); return;
    }
    if (form.next.length < 6) {
      toast.error('New password must be at least 6 characters.'); return;
    }
    if (form.next !== form.confirm) {
      toast.error('New passwords do not match.'); return;
    }
    setSaving(true);
    try {
      await portalApi.patch('/abstracts/portal/change-password', {
        currentPassword: form.current,
        newPassword: form.next,
      });
      toast.success('Password updated. Please log in again.');
      setForm({ current: '', next: '', confirm: '' });
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update password.');
    } finally {
      setSaving(false);
    }
  };

  const field = (label, name) => (
    <PasswordField
      label={label}
      value={form[name]}
      visible={show[name]}
      onChange={(v) => setForm((f) => ({ ...f, [name]: v }))}
      onToggle={() => toggle(name)}
    />
  );

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 420 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10, background: '#f1f5f9',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Lock size={16} color="var(--brand-dark)" />
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>Change Password</div>
          <div style={{ fontSize: 12, color: '#64748b' }}>Update your portal login password</div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {field('Current Password', 'current')}
        {field('New Password (min. 6 chars)', 'next')}
        {field('Confirm New Password', 'confirm')}

        <button
          type="submit"
          disabled={saving}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            padding: '11px 20px', marginTop: 4,
            fontSize: 13, fontWeight: 700,
            background: saving ? '#94a3b8' : 'linear-gradient(135deg, var(--brand-dark), var(--brand))',
            color: '#fff', border: 'none', borderRadius: 10,
            cursor: saving ? 'not-allowed' : 'pointer',
            transition: 'opacity 0.15s',
            boxShadow: '0 2px 8px color-mix(in srgb, var(--brand) 25%, transparent)',
          }}
          onMouseEnter={(e) => { if (!saving) e.currentTarget.style.opacity = '0.88'; }}
          onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
        >
          {saving ? (
            <>
              <span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.35)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
              Updating…
            </>
          ) : (
            <><Lock size={14} /> Update Password</>
          )}
        </button>
      </div>
    </form>
  );
}

// ── Main dashboard ────────────────────────────────────────────────────────────
export default function PortalDashboard() {
  const { submitter, loading, refresh } = useSubmitterAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('overview');
  const [refreshing, setRefreshing] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [letterDownloading, setLetterDownloading] = useState(false);

  // The celebration is a welcome moment, not a loop: play it on the first
  // render of an accepted dashboard, then leave the marker settled. This ref
  // lives here rather than in the stepper because the Overview tab unmounts
  // when the user switches tabs, which would otherwise replay it.
  const celebratedRef = useRef(false);
  const celebrate = !celebratedRef.current;
  useEffect(() => { celebratedRef.current = true; }, []);

  // Letter of Acceptance, proxied through the API so the browser saves it
  const handleLetterDownload = async () => {
    setLetterDownloading(true);
    try {
      const res = await portalApi.get('/abstracts/portal/acceptance-letter', { responseType: 'blob' });
      const url = URL.createObjectURL(res.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = submitter?.acceptanceLetterName || 'Letter-of-Acceptance.pdf';
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error('Could not download the letter. Please try again.');
    } finally {
      setLetterDownloading(false);
    }
  };

  // Proxied through the API so the browser saves the file rather than
  // navigating to it <a download> is ignored cross-origin.
  const handleDownload = async () => {
    setDownloading(true);
    try {
      const res = await portalApi.get('/abstracts/portal/file', { responseType: 'blob' });
      const url = URL.createObjectURL(res.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = submitter?.fileName || 'abstract';
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error('Could not download the file. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  useEffect(() => {
    if (!loading && !submitter) navigate('/portal/login', { replace: true });
  }, [submitter, loading, navigate]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try { await refresh(); toast.success('Status refreshed.'); }
    catch { toast.error('Failed to refresh.'); }
    finally { setRefreshing(false); }
  };

  if (loading || !submitter) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 40, height: 40, border: '3px solid #e2e8f0', borderTopColor: 'var(--brand)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const s = submitter;
  const cfg = STATUS_CFG[s.status] || STATUS_CFG.pending;
  const isAccepted = s.status === 'accepted';
  const isRejected = s.status === 'rejected';

  return (
    <PortalLayout>
      {/* ── Header row ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 28 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>
            Submission Portal
          </div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: '#0f172a', lineHeight: 1.2 }}>
            {s.firstName} {s.lastName}
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 6, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 12, color: '#64748b' }}>
              Login ID: <span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--brand-dark)' }}>{s.loginId}</span>
            </span>
            <span style={{ width: 3, height: 3, borderRadius: '50%', background: '#cbd5e1' }} />
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              padding: '3px 10px', borderRadius: 100,
              background: cfg.bg, border: `1px solid ${cfg.border}`,
              fontSize: 11, fontWeight: 700, color: cfg.color,
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: cfg.color }} />
              {cfg.label}
            </span>
          </div>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '8px 16px', borderRadius: 10,
            fontSize: 12, fontWeight: 600, color: '#475569',
            background: '#fff', border: '1.5px solid #e2e8f0',
            cursor: refreshing ? 'not-allowed' : 'pointer',
            transition: 'all 0.15s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--brand)'; e.currentTarget.style.color = 'var(--brand-dark)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#475569'; }}
        >
          <RefreshCw size={13} style={{ animation: refreshing ? 'spin 0.7s linear infinite' : 'none' }} />
          {refreshing ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      {/* ── Tab navigation ── */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24, borderBottom: '1.5px solid #e2e8f0', paddingBottom: 0 }}>
        {TABS.map(({ key, label, icon: Icon }) => {
          const active = tab === key;
          return (
            <button
              key={key}
              onClick={() => setTab(key)}
              style={{
                display: 'flex', alignItems: 'center', gap: 7,
                padding: '10px 16px',
                fontSize: 13, fontWeight: active ? 700 : 500,
                color: active ? 'var(--brand-dark)' : '#64748b',
                background: 'none', border: 'none',
                borderBottom: `2px solid ${active ? 'var(--brand)' : 'transparent'}`,
                cursor: 'pointer',
                transition: 'all 0.15s',
                marginBottom: -1.5,
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={(e) => { if (!active) e.currentTarget.style.color = '#334155'; }}
              onMouseLeave={(e) => { if (!active) e.currentTarget.style.color = '#64748b'; }}
            >
              <Icon size={14} />
              {label}
            </button>
          );
        })}
      </div>

      {/* ── Overview tab ── */}
      {tab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Status card */}
          <div style={{
            background: '#fff',
            borderRadius: 16,
            border: `1.5px solid ${cfg.border}`,
            overflow: 'hidden',
            boxShadow: '0 1px 8px rgba(0,0,0,0.04)',
          }}>
            <div style={{ padding: '20px 24px', background: cfg.bg, borderBottom: `1px solid ${cfg.border}` }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: cfg.color, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 6 }}>
                Current Status
              </div>
              <div style={{ fontSize: 22, fontWeight: 800, color: cfg.color }}>
                {cfg.label}
              </div>
              {s.adminNotes && (
                <div style={{
                  marginTop: 12, padding: '10px 14px',
                  background: 'rgba(255,255,255,0.65)', borderRadius: 8,
                  fontSize: 13, color: '#475569', display: 'flex', gap: 8, alignItems: 'flex-start',
                }}>
                  <AlertCircle size={14} color="#d97706" style={{ flexShrink: 0, marginTop: 1 }} />
                  <span><strong>Committee note: </strong>{s.adminNotes}</span>
                </div>
              )}
            </div>
            <div style={{ padding: '24px 24px 20px' }}>
              <StatusStepper status={s.status} celebrate={celebrate} />
            </div>
          </div>

          {/* Accepted action */}
          {isAccepted && (
            <div style={{
              background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
              border: '1.5px solid #86efac',
              borderRadius: 16, padding: 24,
              boxShadow: '0 1px 8px rgba(22,163,74,0.06)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <CheckCircle size={20} color="#16a34a" />
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: '#14532d' }}>Congratulations!</div>
                  <div style={{ fontSize: 12, color: '#166534', marginTop: 2 }}>Your abstract has been accepted. Complete your registration to confirm participation.</div>
                </div>
              </div>
              {/* Official uploaded letter takes precedence over the generated one */}
              {s.acceptanceLetterUrl && (
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  gap: 12, flexWrap: 'wrap',
                  background: '#fff', border: '1px solid #86efac',
                  borderRadius: 10, padding: '12px 14px', marginBottom: 14,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                    <FileText size={16} color="#16a34a" style={{ flexShrink: 0 }} />
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#14532d' }}>
                        {s.acceptanceLetterName || 'Letter of Acceptance'}
                      </div>
                      <div style={{ fontSize: 11, color: '#166534', marginTop: 1 }}>
                        Official letter issued by the committee
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={handleLetterDownload}
                    disabled={letterDownloading}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                      padding: '8px 14px', fontSize: 12, fontWeight: 700,
                      background: '#16a34a', color: '#fff',
                      border: 'none', borderRadius: 8,
                      cursor: letterDownloading ? 'not-allowed' : 'pointer',
                      opacity: letterDownloading ? 0.65 : 1,
                      flexShrink: 0,
                    }}
                  >
                    <Download size={13} /> {letterDownloading ? 'Preparing…' : 'Download'}
                  </button>
                </div>
              )}

              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <Link to="/portal/acceptance-letter" style={{
                  display: 'inline-flex', alignItems: 'center', gap: 7,
                  padding: '10px 18px', fontSize: 12, fontWeight: 700,
                  background: '#fff', color: '#15803d',
                  border: '1.5px solid #4ade80', borderRadius: 9,
                  textDecoration: 'none', boxShadow: '0 1px 6px rgba(22,163,74,0.1)',
                  transition: 'background 0.15s',
                }}>
                  <Download size={14} /> {s.acceptanceLetterUrl ? 'View Online Letter' : 'Acceptance Letter'}
                </Link>
                <Link to="/registration" style={{
                  display: 'inline-flex', alignItems: 'center', gap: 7,
                  padding: '10px 18px', fontSize: 12, fontWeight: 700,
                  background: 'linear-gradient(135deg, var(--brand-dark), var(--brand))',
                  color: '#fff', border: 'none', borderRadius: 9,
                  textDecoration: 'none',
                  boxShadow: '0 2px 8px color-mix(in srgb, var(--brand) 30%, transparent)',
                }}>
                  <ExternalLink size={14} /> Register Now
                </Link>
              </div>
            </div>
          )}

          {/* Quick info strip */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
            {[
              { label: 'Reference ID', value: s._id?.slice(-12), mono: true },
              { label: 'Login ID', value: s.loginId, mono: true },
              { label: 'Submitted', value: s.createdAt ? new Date(s.createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' }) : null },
              { label: 'Presentation', value: PRESENTATION_LABELS[s.presentationType] || s.presentationType },
            ].filter((r) => r.value).map(({ label, value, mono }) => (
              <div key={label} style={{ background: '#fff', borderRadius: 12, border: '1px solid #f1f5f9', padding: '14px 16px', boxShadow: '0 1px 4px rgba(0,0,0,0.03)' }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>{label}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', fontFamily: mono ? 'monospace' : undefined }}>{value}</div>
              </div>
            ))}
          </div>

          {/* View abstract shortcut */}
          <button
            onClick={() => setTab('abstract')}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '16px 20px', borderRadius: 12,
              background: '#fff', border: '1.5px solid #e2e8f0',
              cursor: 'pointer', width: '100%', textAlign: 'left',
              transition: 'border-color 0.15s, box-shadow 0.15s',
              boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--brand)'; e.currentTarget.style.boxShadow = '0 2px 10px color-mix(in srgb, var(--brand) 12%, transparent)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.03)'; }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 38, height: 38, borderRadius: 9, background: 'color-mix(in srgb, var(--brand) 10%, transparent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <FileText size={16} color="var(--brand-dark)" />
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{s.abstractTitle || 'My Abstract'}</div>
                <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>
                  {s.fileUrl ? 'File uploaded · Click to view details & download' : 'Click to view full abstract details'}
                </div>
              </div>
            </div>
            <ChevronRight size={16} color="#94a3b8" />
          </button>
        </div>
      )}

      {/* ── My Abstract tab ── */}
      {tab === 'abstract' && (
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
          {/* Title section */}
          <div style={{ padding: '24px 28px', borderBottom: '1px solid #f1f5f9', background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Abstract Title</div>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#0f172a', lineHeight: 1.35 }}>{s.abstractTitle}</h2>
          </div>

          <div style={{ padding: '0 28px' }}>
            {/* Author details */}
            <div style={{ paddingTop: 8, paddingBottom: 4 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', padding: '16px 0 6px' }}>Author Information</div>
              <InfoRow label="Full Name" value={`${s.firstName} ${s.lastName}`} />
              <InfoRow label="Email" value={s.email} />
              <InfoRow label="Country" value={s.country} />
              <InfoRow label="Organization" value={s.organization} />
            </div>

            {/* Submission details */}
            <div style={{ paddingBottom: 4 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', padding: '16px 0 6px' }}>Submission Details</div>
              <InfoRow label="Presentation Type" value={PRESENTATION_LABELS[s.presentationType] || s.presentationType} />
              <InfoRow label="Edition" value={s.edition?.title ? `${s.edition.title}${s.edition.year ? ' (' + s.edition.year + ')' : ''}` : null} />
              <InfoRow label="Topic" value={s.topic?.title || s.topicText} />
              <InfoRow label="Keywords" value={s.keywords} />
              <InfoRow label="Co-Authors" value={s.coAuthors} />
              <InfoRow label="Login ID" value={s.loginId} mono />
              <InfoRow label="Reference ID" value={s._id} mono />
              <InfoRow
                label="Submitted"
                value={s.createdAt ? new Date(s.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : null}
              />
              <InfoRow
                label="Last Updated"
                value={s.updatedAt ? new Date(s.updatedAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : null}
              />
            </div>
          </div>

          {/* Abstract text */}
          {s.abstractText && (
            <div style={{ margin: '0 28px', borderRadius: 12, background: '#f8fafc', border: '1px solid #f1f5f9', padding: '16px 20px', marginBottom: 20 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>Abstract Text</div>
              <div style={{ fontSize: 13, color: '#475569', lineHeight: 1.75, whiteSpace: 'pre-wrap', maxHeight: 220, overflowY: 'auto' }}>
                {s.abstractText}
              </div>
            </div>
          )}

          {/* File download */}
          {s.fileUrl && (
            <div style={{ margin: '0 28px 28px', padding: '16px 20px', borderRadius: 12, background: 'color-mix(in srgb, var(--brand) 6%, transparent)', border: '1.5px solid color-mix(in srgb, var(--brand) 20%, transparent)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 9, background: '#fff', border: '1px solid color-mix(in srgb, var(--brand) 25%, transparent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <FileText size={16} color="var(--brand-dark)" />
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{s.fileName || 'Abstract Document'}</div>
                    <div style={{ fontSize: 11, color: '#64748b', marginTop: 1 }}>The file you submitted with this abstract</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                  <a
                    href={s.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                      padding: '9px 14px', fontSize: 12, fontWeight: 700,
                      background: '#fff', color: 'var(--brand-dark)',
                      border: '1.5px solid color-mix(in srgb, var(--brand) 30%, transparent)',
                      borderRadius: 9, textDecoration: 'none',
                    }}
                  >
                    <Eye size={14} /> View
                  </a>
                  <button
                    onClick={handleDownload}
                    disabled={downloading}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                      padding: '9px 16px', fontSize: 12, fontWeight: 700,
                      background: 'var(--brand-dark)', color: '#fff',
                      border: 'none', borderRadius: 9,
                      cursor: downloading ? 'not-allowed' : 'pointer',
                      opacity: downloading ? 0.65 : 1,
                      boxShadow: '0 2px 6px color-mix(in srgb, var(--brand) 25%, transparent)',
                    }}
                  >
                    {downloading ? (
                      <>
                        <span style={{ width: 12, height: 12, border: '2px solid rgba(255,255,255,0.35)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
                        Downloading…
                      </>
                    ) : (
                      <><Download size={14} /> Download</>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {!s.fileUrl && <div style={{ height: 28 }} />}
        </div>
      )}

      {/* ── Security tab ── */}
      {tab === 'security' && (
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', padding: 28, boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
          <ChangePasswordForm />
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </PortalLayout>
  );
}
