import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FileText, Download, CheckCircle, Clock, XCircle, ExternalLink, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { useSubmitterAuth } from '../../context/submitterAuthContext';
import PortalLayout from '../../components/layout/PortalLayout';

const STATUSES = [
  { key: 'pending', label: 'Pending' },
  { key: 'received_accepted', label: 'Received & Accepted for Review' },
  { key: 'under_review', label: 'Under Peer Review Process' },
  { key: 'decision_pending', label: 'Reviewed — Decision Pending' },
  { key: 'accepted', label: 'Accepted' },
  { key: 'rejected', label: 'Rejected' },
];

const STATUS_COLORS = {
  pending: { bg: '#fffbeb', border: '#fcd34d', text: '#92400e', dot: '#f59e0b' },
  received_accepted: { bg: '#eff6ff', border: '#93c5fd', text: '#1e40af', dot: '#3b82f6' },
  under_review: { bg: '#f5f3ff', border: '#c4b5fd', text: '#5b21b6', dot: '#7c3aed' },
  decision_pending: { bg: '#fff7ed', border: '#fdba74', text: '#9a3412', dot: '#f97316' },
  accepted: { bg: '#f0fdf4', border: '#86efac', text: '#14532d', dot: '#22c55e' },
  rejected: { bg: '#fef2f2', border: '#fca5a5', text: '#7f1d1d', dot: '#ef4444' },
};

const PRESENTATION_LABELS = {
  oral_inperson: 'Oral Presentation (In-Person)',
  oral_virtual: 'Oral Presentation (Virtual)',
  poster_inperson: 'Poster Presentation (In-Person)',
  poster_virtual: 'Poster Presentation (Virtual)',
};

function StatusPipeline({ current }) {
  const isRejected = current === 'rejected';
  const mainStatuses = STATUSES.filter((s) => s.key !== 'rejected');
  const currentIndex = mainStatuses.findIndex((s) => s.key === current);
  const acceptedIndex = mainStatuses.findIndex((s) => s.key === 'accepted');

  return (
    <div style={{ padding: '24px 0 8px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 0, overflowX: 'auto', paddingBottom: 8 }}>
        {mainStatuses.map((s, i) => {
          const isDone = !isRejected && i < currentIndex;
          const isCurrent = !isRejected && i === currentIndex;
          const isRejectedFinal = isRejected && i === acceptedIndex;
          const colors = isCurrent ? STATUS_COLORS[s.key] : isRejectedFinal ? STATUS_COLORS.rejected : {};

          return (
            <div key={s.key} style={{ display: 'flex', alignItems: 'flex-start', flex: 1, minWidth: 100 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                {/* Circle */}
                <div style={{
                  width: 32, height: 32, borderRadius: '50%',
                  border: `2px solid ${isDone ? '#22c55e' : isCurrent ? (colors.dot || '#3b82f6') : isRejectedFinal ? '#ef4444' : '#e2e8f0'}`,
                  background: isDone ? '#22c55e' : isCurrent ? (colors.dot || '#3b82f6') : isRejectedFinal ? '#ef4444' : '#f8fafc',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, position: 'relative', zIndex: 1,
                  transition: 'all 0.2s',
                }}>
                  {isDone ? (
                    <CheckCircle size={16} color="#fff" />
                  ) : isRejectedFinal ? (
                    <XCircle size={16} color="#fff" />
                  ) : isCurrent ? (
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#fff' }} />
                  ) : (
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#cbd5e1' }} />
                  )}
                </div>
                {/* Label */}
                <div style={{
                  textAlign: 'center', marginTop: 8, fontSize: 10, fontWeight: isCurrent || isRejectedFinal ? 700 : 500,
                  color: isDone ? '#15803d' : isCurrent ? (colors.text || '#1e40af') : isRejectedFinal ? '#7f1d1d' : '#94a3b8',
                  lineHeight: 1.3, maxWidth: 90, padding: '0 4px',
                }}>
                  {isRejectedFinal ? 'Rejected' : s.label}
                </div>
              </div>
              {/* Connector line */}
              {i < mainStatuses.length - 1 && (
                <div style={{
                  height: 2, flex: 0,
                  width: '100%', maxWidth: 40,
                  marginTop: 15,
                  background: isDone ? '#22c55e' : '#e2e8f0',
                  transition: 'background 0.2s',
                }} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function InfoRow({ label, value }) {
  if (!value) return null;
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: 12, padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>
      <dt style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>{label}</dt>
      <dd style={{ fontSize: 13, color: '#1e293b', margin: 0 }}>{value}</dd>
    </div>
  );
}

export default function PortalDashboard() {
  const { submitter, loading, refresh } = useSubmitterAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !submitter) navigate('/portal/login', { replace: true });
  }, [submitter, loading, navigate]);

  const handleRefresh = async () => {
    try {
      await refresh();
      toast.success('Status refreshed.');
    } catch {
      toast.error('Failed to refresh.');
    }
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
  const statusColors = STATUS_COLORS[s.status] || STATUS_COLORS.pending;
  const isAccepted = s.status === 'accepted';
  const isRejected = s.status === 'rejected';

  return (
    <PortalLayout>
      {/* Welcome */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#0f172a' }}>
              Welcome, {s.firstName} {s.lastName}
            </h1>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: '#64748b' }}>
              Login ID: <span style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--brand-dark)' }}>{s.loginId}</span>
            </p>
          </div>
          <button
            onClick={handleRefresh}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              fontSize: 12, fontWeight: 600, color: '#64748b',
              background: '#fff', border: '1px solid #e2e8f0',
              borderRadius: 8, padding: '7px 14px', cursor: 'pointer',
            }}
          >
            <RefreshCw size={13} /> Refresh Status
          </button>
        </div>
      </div>

      {/* Status Banner */}
      <div style={{
        background: statusColors.bg,
        border: `1.5px solid ${statusColors.border}`,
        borderRadius: 14,
        padding: '20px 24px',
        marginBottom: 24,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: statusColors.dot, flexShrink: 0 }} />
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: statusColors.text }}>
            Current Status
          </span>
        </div>
        <div style={{ fontSize: 20, fontWeight: 800, color: statusColors.text, marginBottom: 4 }}>
          {STATUSES.find((s2) => s2.key === s.status)?.label || s.status}
        </div>
        {s.adminNotes && (
          <div style={{ marginTop: 10, padding: '10px 14px', background: 'rgba(255,255,255,0.6)', borderRadius: 8, fontSize: 13, color: '#475569' }}>
            <span style={{ fontWeight: 600 }}>Note: </span>{s.adminNotes}
          </div>
        )}

        {/* Progress pipeline */}
        <StatusPipeline current={s.status} />
      </div>

      {/* Action Buttons (only when accepted) */}
      {isAccepted && (
        <div style={{
          background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
          border: '1.5px solid #86efac',
          borderRadius: 14,
          padding: '24px',
          marginBottom: 24,
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <CheckCircle size={20} color="#16a34a" />
            <div>
              <div style={{ fontSize: 15, fontWeight: 800, color: '#14532d' }}>Congratulations! Your abstract has been accepted.</div>
              <div style={{ fontSize: 12, color: '#166534', marginTop: 2 }}>Please complete your registration to confirm your participation.</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Link
              to="/portal/acceptance-letter"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '12px 22px',
                fontSize: 13, fontWeight: 700,
                background: '#ffffff',
                color: '#15803d',
                border: '1.5px solid #4ade80',
                borderRadius: 8, textDecoration: 'none',
                boxShadow: '0 2px 8px rgba(22,163,74,0.12)',
                transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#f0fdf4'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = '#ffffff'; }}
            >
              <Download size={15} />
              Acceptance Letter
            </Link>
            <Link
              to="/registration"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '12px 22px',
                fontSize: 13, fontWeight: 700,
                background: 'linear-gradient(135deg, var(--brand-dark), var(--brand))',
                color: '#ffffff',
                border: 'none',
                borderRadius: 8, textDecoration: 'none',
                boxShadow: '0 2px 8px color-mix(in srgb, var(--brand) 30%, transparent)',
                transition: 'opacity 0.15s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.9'; }}
              onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
            >
              <ExternalLink size={15} />
              Register Now
            </Link>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
        {/* Abstract Details */}
        <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', padding: '24px', gridColumn: isAccepted ? '1 / -1' : undefined }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <FileText size={15} color="var(--brand)" />
            <h2 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#0f172a' }}>Abstract Submission</h2>
          </div>

          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Title</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#1e293b', lineHeight: 1.4 }}>{s.abstractTitle}</div>
          </div>

          <dl style={{ margin: 0 }}>
            <InfoRow label="Author" value={`${s.firstName} ${s.lastName}`} />
            <InfoRow label="Email" value={s.email} />
            <InfoRow label="Country" value={s.country} />
            <InfoRow label="Organization" value={s.organization} />
            <InfoRow label="Presentation Type" value={PRESENTATION_LABELS[s.presentationType] || s.presentationType} />
            <InfoRow label="Edition" value={s.edition?.title ? `${s.edition.title} (${s.edition.year})` : null} />
            <InfoRow label="Topic" value={s.topic?.title || s.topicText} />
            <InfoRow label="Keywords" value={s.keywords} />
            <InfoRow label="Co-Authors" value={s.coAuthors} />
          </dl>

          {s.abstractText && (
            <div style={{ marginTop: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Abstract Text</div>
              <div style={{
                background: '#f8fafc', borderRadius: 8, padding: '14px 16px',
                fontSize: 13, color: '#475569', lineHeight: 1.7, whiteSpace: 'pre-wrap',
                maxHeight: 200, overflowY: 'auto',
              }}>
                {s.abstractText}
              </div>
            </div>
          )}

          {s.fileUrl && (
            <div style={{ marginTop: 16 }}>
              <a
                href={s.fileUrl}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  fontSize: 13, fontWeight: 600, color: 'var(--brand-dark)',
                  textDecoration: 'none',
                }}
              >
                <Download size={14} /> Download Submitted File
              </a>
            </div>
          )}
        </div>

        {/* Submission Info */}
        <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', padding: '24px' }}>
          <h2 style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 700, color: '#0f172a' }}>Submission Info</h2>
          <dl style={{ margin: 0 }}>
            <InfoRow label="Reference ID" value={s._id} />
            <InfoRow label="Login ID" value={s.loginId} />
            <InfoRow
              label="Submitted"
              value={s.createdAt ? new Date(s.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : null}
            />
            <InfoRow
              label="Last Updated"
              value={s.updatedAt ? new Date(s.updatedAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : null}
            />
          </dl>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </PortalLayout>
  );
}
