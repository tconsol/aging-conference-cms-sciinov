import { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Eye, Trash2, FileText, Clock, CheckCircle, XCircle, ChevronDown, Loader2 } from 'lucide-react';
import Spinner from '../../components/ui/Spinner';
import Pagination from '../../components/ui/Pagination';
import SearchBar from '../../components/ui/SearchBar';
import PageHeader from '../../components/ui/PageHeader';
import EmptyState from '../../components/ui/EmptyState';
import StatsCard from '../../components/ui/StatsCard';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import Dropdown from '../../components/ui/Dropdown';
import { abstractsAPI } from '../../api/submissions';
import { editionsAPI } from '../../api/congress';
import { formatDate, truncate, getErrorMessage } from '../../utils/helpers';

const STATUS_CONFIG = {
  pending:           { label: 'Pending',          bg: '#fffbeb', color: '#92400e', dot: '#f59e0b', border: '#fcd34d' },
  received_accepted: { label: 'Received',         bg: '#eff6ff', color: '#1e40af', dot: '#3b82f6', border: '#93c5fd' },
  under_review:      { label: 'Under Review',     bg: '#f5f3ff', color: '#5b21b6', dot: '#7c3aed', border: '#c4b5fd' },
  decision_pending:  { label: 'Decision Pending', bg: '#fff7ed', color: '#9a3412', dot: '#f97316', border: '#fdba74' },
  accepted:          { label: 'Accepted',         bg: '#f0fdf4', color: '#14532d', dot: '#22c55e', border: '#86efac' },
  rejected:          { label: 'Rejected',         bg: '#fef2f2', color: '#7f1d1d', dot: '#ef4444', border: '#fca5a5' },
};

const STATUS_OPTIONS = [
  { value: 'pending',           label: 'Pending' },
  { value: 'received_accepted', label: 'Received & Accepted for Review' },
  { value: 'under_review',      label: 'Under Peer Review Process' },
  { value: 'decision_pending',  label: 'Reviewed — Decision Pending' },
  { value: 'accepted',          label: 'Accepted' },
  { value: 'rejected',          label: 'Rejected' },
];

const TYPE_SHORT = {
  oral_inperson:   'Oral · In-Person',
  oral_virtual:    'Oral · Virtual',
  poster_inperson: 'Poster · In-Person',
  poster_virtual:  'Poster · Virtual',
};

// ── Inline status dropdown (portal-based to escape overflow clipping) ────────
function InlineStatusDropdown({ item, onUpdate, updating }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const triggerRef = useRef(null);
  const listRef = useRef(null);
  const c = STATUS_CONFIG[item.status] || { label: item.status, bg: '#f8fafc', color: '#64748b', dot: '#94a3b8', border: '#e2e8f0' };

  const calcPos = useCallback(() => {
    if (!triggerRef.current) return;
    const r = triggerRef.current.getBoundingClientRect();
    setPos({ top: r.bottom + 6, left: r.left });
  }, []);

  useEffect(() => { if (open) calcPos(); }, [open, calcPos]);

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

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (
        triggerRef.current && !triggerRef.current.contains(e.target) &&
        listRef.current && !listRef.current.contains(e.target)
      ) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') setOpen(false); };
    if (open) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open]);

  const select = (value) => {
    setOpen(false);
    if (value !== item.status) onUpdate(item._id, value);
  };

  return (
    <div style={{ display: 'inline-block' }}>
      <button
        ref={triggerRef}
        onClick={() => !updating && setOpen((o) => !o)}
        title="Click to change status"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 5,
          padding: '4px 8px 4px 9px',
          borderRadius: 100,
          background: c.bg,
          border: `1.5px solid ${open ? c.dot : 'transparent'}`,
          whiteSpace: 'nowrap',
          fontSize: 11,
          fontWeight: 600,
          color: c.color,
          cursor: updating ? 'not-allowed' : 'pointer',
          transition: 'border-color 0.15s, box-shadow 0.15s',
          boxShadow: open ? `0 0 0 3px ${c.bg}` : 'none',
          outline: 'none',
        }}
        onMouseEnter={(e) => { if (!updating) e.currentTarget.style.borderColor = c.border; }}
        onMouseLeave={(e) => { if (!open) e.currentTarget.style.borderColor = 'transparent'; }}
      >
        {updating ? (
          <Loader2 size={10} style={{ animation: 'spin 0.7s linear infinite', flexShrink: 0 }} />
        ) : (
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: c.dot, flexShrink: 0 }} />
        )}
        {c.label}
        {!updating && (
          <ChevronDown
            size={10}
            strokeWidth={2.5}
            style={{ transition: 'transform 0.15s', transform: open ? 'rotate(180deg)' : 'rotate(0deg)', flexShrink: 0 }}
          />
        )}
      </button>

      {/* Portal dropdown — escapes overflow:hidden and overflow-x:auto containers */}
      {open && createPortal(
        <div
          ref={listRef}
          style={{
            position: 'fixed',
            top: pos.top,
            left: pos.left,
            zIndex: 9999,
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: 10,
            boxShadow: '0 8px 24px rgba(0,0,0,0.12), 0 2px 6px rgba(0,0,0,0.06)',
            minWidth: 220,
            overflow: 'hidden',
            animation: 'dropIn 0.12s ease',
          }}
        >
          <div style={{ padding: '6px 10px', borderBottom: '1px solid #f1f5f9' }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Change Status
            </span>
          </div>
          {STATUS_OPTIONS.map((opt) => {
            const cfg = STATUS_CONFIG[opt.value];
            const isCurrent = opt.value === item.status;
            return (
              <button
                key={opt.value}
                onClick={() => select(opt.value)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 9,
                  width: '100%',
                  padding: '8px 12px',
                  border: 'none',
                  background: isCurrent ? cfg.bg : 'transparent',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'background 0.1s',
                }}
                onMouseEnter={(e) => { if (!isCurrent) e.currentTarget.style.background = '#f8fafc'; }}
                onMouseLeave={(e) => { if (!isCurrent) e.currentTarget.style.background = 'transparent'; }}
              >
                <span style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: cfg?.dot || '#94a3b8',
                  flexShrink: 0,
                }} />
                <span style={{ fontSize: 12, fontWeight: isCurrent ? 700 : 500, color: isCurrent ? cfg?.color : '#374151' }}>
                  {opt.label}
                </span>
                {isCurrent && (
                  <span style={{ marginLeft: 'auto', fontSize: 10, color: cfg?.color, fontWeight: 700 }}>✓</span>
                )}
              </button>
            );
          })}
        </div>,
        document.body
      )}
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────
export default function Abstracts() {
  const navigate = useNavigate();

  const [items, setItems]     = useState([]);
  const [editions, setEditions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal]     = useState(0);
  const [stats, setStats]     = useState({ total: 0, pending: 0, accepted: 0, rejected: 0 });
  const [updatingId, setUpdatingId] = useState(null);

  const [page, setPage]               = useState(1);
  const [search, setSearch]           = useState('');
  const [editionFilter, setEditionFilter] = useState('');
  const [statusFilter, setStatusFilter]   = useState('');

  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null });
  const [deleting, setDeleting]         = useState(false);

  const LIMIT = 20;

  const fetchEditions = async () => {
    try {
      const res = await editionsAPI.getAll();
      setEditions(res.data.data || []);
    } catch { /* non-critical */ }
  };

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: LIMIT };
      if (search)       params.search  = search;
      if (editionFilter) params.edition = editionFilter;
      if (statusFilter)  params.status  = statusFilter;
      const res  = await abstractsAPI.getAll(params);
      const data = res.data;
      setItems(data.data || []);
      setTotal(data.total || 0);
      if (data.stats) setStats(data.stats);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [page, search, editionFilter, statusFilter]);

  useEffect(() => { fetchEditions(); }, []);
  useEffect(() => { fetchItems(); }, [fetchItems]);
  useEffect(() => { setPage(1); }, [search, editionFilter, statusFilter]);

  // ── Inline status update ─────────────────────────────────────────────────
  const handleStatusUpdate = async (id, newStatus) => {
    setUpdatingId(id);
    try {
      await abstractsAPI.updateStatus(id, { status: newStatus });
      setItems((prev) =>
        prev.map((item) => item._id === id ? { ...item, status: newStatus } : item)
      );
      const label = STATUS_CONFIG[newStatus]?.label || newStatus;
      toast.success(`Status → ${label}`);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await abstractsAPI.delete(deleteDialog.id);
      toast.success('Abstract deleted.');
      setDeleteDialog({ open: false, id: null });
      fetchItems();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  const editionOptions = editions.map((e) => ({
    value: e._id,
    label: String(e.title).includes(String(e.year)) ? e.title : `${e.title} (${e.year})`,
  }));

  const filterStatusOptions = [
    { value: 'pending',           label: 'Pending' },
    { value: 'received_accepted', label: 'Received & Accepted' },
    { value: 'under_review',      label: 'Under Peer Review' },
    { value: 'decision_pending',  label: 'Decision Pending' },
    { value: 'accepted',          label: 'Accepted' },
    { value: 'rejected',          label: 'Rejected' },
  ];

  return (
    <div>
      <PageHeader title="Abstract Submissions" subtitle="Manage all submitted abstracts" />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard label="Total Submitted" value={stats.total}    icon={FileText}    color="blue"  />
        <StatsCard label="Pending Review"  value={stats.pending}  icon={Clock}       color="amber" />
        <StatsCard label="Accepted"        value={stats.accepted} icon={CheckCircle} color="green" />
        <StatsCard label="Rejected"        value={stats.rejected} icon={XCircle}     color="red"   />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search by author, email or title..."
          className="flex-1 min-w-[220px] max-w-sm"
        />
        <Dropdown
          value={editionFilter}
          onChange={setEditionFilter}
          options={[{ value: '', label: 'All Editions' }, ...editionOptions]}
          className="w-48"
        />
        <Dropdown
          value={statusFilter}
          onChange={setStatusFilter}
          options={[{ value: '', label: 'All Statuses' }, ...filterStatusOptions]}
          className="w-44"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <Spinner size="lg" />
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            message="No abstracts found"
            description="No abstract submissions match the current filters."
            icon={FileText}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full" style={{ fontSize: 13, borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e8edf2' }}>
                  <th style={thStyle}>Author</th>
                  <th style={thStyle}>Country</th>
                  <th style={thStyle}>Type</th>
                  <th style={{ ...thStyle, minWidth: 240 }}>Abstract Title</th>
                  <th style={{ ...thStyle, minWidth: 160, whiteSpace: 'nowrap' }}>Status</th>
                  <th style={{ ...thStyle, whiteSpace: 'nowrap' }}>Submitted</th>
                  <th style={{ ...thStyle, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => (
                  <tr
                    key={item._id}
                    style={{
                      borderBottom: '1px solid #f1f5f9',
                      background: idx % 2 === 0 ? '#ffffff' : '#fafbfc',
                      transition: 'background 0.12s',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = '#f0fdfa'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = idx % 2 === 0 ? '#ffffff' : '#fafbfc'; }}
                  >
                    {/* Author */}
                    <td style={{ ...tdStyle, minWidth: 160 }}>
                      <div style={{ fontWeight: 600, color: '#0f172a', whiteSpace: 'nowrap' }}>
                        {item.firstName} {item.lastName}
                      </div>
                      <div style={{ fontSize: 11, color: '#64748b', marginTop: 1 }}>{item.email}</div>
                      {item.loginId && (
                        <div style={{ fontSize: 10, color: '#94a3b8', fontFamily: 'monospace', marginTop: 1 }}>{item.loginId}</div>
                      )}
                    </td>

                    {/* Country */}
                    <td style={{ ...tdStyle, whiteSpace: 'nowrap', color: '#475569' }}>
                      {item.country || '—'}
                    </td>

                    {/* Type */}
                    <td style={{ ...tdStyle, whiteSpace: 'nowrap' }}>
                      <span style={{
                        fontSize: 11, fontWeight: 500, color: '#475569',
                        background: '#f1f5f9', borderRadius: 4,
                        padding: '2px 7px', whiteSpace: 'nowrap',
                      }}>
                        {TYPE_SHORT[item.presentationType] || item.presentationType}
                      </span>
                    </td>

                    {/* Title */}
                    <td style={{ ...tdStyle, color: '#334155', lineHeight: 1.4 }}>
                      <span title={item.abstractTitle}>
                        {truncate(item.abstractTitle, 55)}
                      </span>
                    </td>

                    {/* Status — inline dropdown */}
                    <td style={{ ...tdStyle, whiteSpace: 'nowrap' }}>
                      <InlineStatusDropdown
                        item={item}
                        onUpdate={handleStatusUpdate}
                        updating={updatingId === item._id}
                      />
                    </td>

                    {/* Submitted */}
                    <td style={{ ...tdStyle, whiteSpace: 'nowrap', color: '#64748b', fontSize: 12 }}>
                      {formatDate(item.createdAt)}
                    </td>

                    {/* Actions */}
                    <td style={{ ...tdStyle, textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 4 }}>
                        <button
                          onClick={() => navigate(`/abstracts/${item._id}`)}
                          title="View details"
                          style={actionBtn}
                          onMouseEnter={(e) => { e.currentTarget.style.background = '#f0fdfa'; e.currentTarget.style.color = '#0d9488'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94a3b8'; }}
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={() => setDeleteDialog({ open: true, id: item._id })}
                          title="Delete"
                          style={actionBtn}
                          onMouseEnter={(e) => { e.currentTarget.style.background = '#fef2f2'; e.currentTarget.style.color = '#dc2626'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94a3b8'; }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="px-4 py-2 border-t border-slate-50">
              <Pagination page={page} total={total} limit={LIMIT} onChange={setPage} />
            </div>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, id: null })}
        onConfirm={handleDelete}
        title="Delete Abstract"
        message="Are you sure you want to delete this abstract submission? This action cannot be undone."
        loading={deleting}
      />

      <style>{`
        @keyframes spin    { to { transform: rotate(360deg); } }
        @keyframes dropIn  { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}

const thStyle = {
  padding: '10px 14px',
  textAlign: 'left',
  fontSize: 11,
  fontWeight: 700,
  color: '#64748b',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
};

const tdStyle = {
  padding: '10px 14px',
  verticalAlign: 'middle',
};

const actionBtn = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 28,
  height: 28,
  borderRadius: 6,
  border: 'none',
  background: 'transparent',
  color: '#94a3b8',
  cursor: 'pointer',
  transition: 'all 0.12s',
  flexShrink: 0,
};
