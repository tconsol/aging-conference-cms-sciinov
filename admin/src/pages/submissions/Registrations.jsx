import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Eye, Trash2, Download, Users, Mail, UserPlus } from 'lucide-react';
import Spinner from '../../components/ui/Spinner';
import Pagination from '../../components/ui/Pagination';
import SearchBar from '../../components/ui/SearchBar';
import PageHeader from '../../components/ui/PageHeader';
import EmptyState from '../../components/ui/EmptyState';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import Dropdown from '../../components/ui/Dropdown';
import { statusBadge } from '../../components/ui/Badge';
import { registrationsAPI } from '../../api/submissions';
import { editionsAPI } from '../../api/congress';
import { formatDateTime, formatCurrency, CATEGORY_LABELS, categoryLabel, getErrorMessage, downloadBlob } from '../../utils/helpers';
import { useRegistrationBadge } from '../../context/RegistrationBadgeContext';
import ManualRegistrationModal from './ManualRegistrationModal';

const TABS = [
  { key: 'all',       label: 'All',       color: '#64748b' },
  { key: 'tried',     label: 'Tried',     color: '#d97706' },
  { key: 'pending',   label: 'Pending',   color: '#2563eb' },
  { key: 'confirmed', label: 'Confirmed', color: '#16a34a' },
  { key: 'cancelled', label: 'Cancelled', color: '#dc2626' },
];

const TH = 'px-3 py-2.5 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wide';

export default function Registrations() {
  const navigate = useNavigate();
  const { lastEventTime, resetCount } = useRegistrationBadge();

  // Registrations state
  const [items, setItems]       = useState([]);
  const [editions, setEditions] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [total, setTotal]       = useState(0);
  const [page, setPage]         = useState(1);
  const [search, setSearch]     = useState('');
  const [editionFilter, setEditionFilter] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  // Intents (Tried) state
  const [intents, setIntents]             = useState([]);
  const [intentsLoading, setIntentsLoading] = useState(false);
  const [sendingIntentId, setSendingIntentId] = useState(null);

  // Counts for badges
  const [counts, setCounts] = useState({ all: 0, pending: 0, confirmed: 0, cancelled: 0 });

  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null });
  const [deleting, setDeleting]         = useState(false);
  const [exporting, setExporting]       = useState(false);
  const [createOpen, setCreateOpen]     = useState(false);
  const [sendingReminderId, setSendingReminderId] = useState(null);

  const LIMIT = 20;

  // Reset badge when this page is open
  useEffect(() => {
    resetCount();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchEditions = async () => {
    try {
      const res = await editionsAPI.getAll();
      setEditions(res.data.data || []);
    } catch { /* non-critical */ }
  };

  const fetchCounts = useCallback(async () => {
    try {
      const [all, pending, confirmed, cancelled] = await Promise.all([
        registrationsAPI.getAll({ page: 1, limit: 1, edition: editionFilter }),
        registrationsAPI.getAll({ page: 1, limit: 1, paymentStatus: 'pending',   edition: editionFilter }),
        registrationsAPI.getAll({ page: 1, limit: 1, paymentStatus: 'confirmed', edition: editionFilter }),
        registrationsAPI.getAll({ page: 1, limit: 1, paymentStatus: 'cancelled', edition: editionFilter }),
      ]);
      setCounts({
        all:       all.data.total || 0,
        pending:   pending.data.total || 0,
        confirmed: confirmed.data.total || 0,
        cancelled: cancelled.data.total || 0,
      });
    } catch { /* non-critical */ }
  }, [editionFilter]);

  const fetchItems = useCallback(async () => {
    if (activeTab === 'tried') return;
    setLoading(true);
    try {
      const params = { page, limit: LIMIT };
      if (search) params.search = search;
      if (editionFilter) params.edition = editionFilter;
      if (activeTab !== 'all') params.paymentStatus = activeTab;
      const res = await registrationsAPI.getAll(params);
      setItems(res.data.data || []);
      setTotal(res.data.total || 0);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [page, search, editionFilter, activeTab]);

  const fetchIntents = useCallback(async () => {
    setIntentsLoading(true);
    try {
      const res = await registrationsAPI.getIntents({ limit: 100, search });
      setIntents(res.data.data || []);
    } catch { /* non-critical */ }
    finally { setIntentsLoading(false); }
  }, [search]);

  useEffect(() => { fetchEditions(); }, []);
  useEffect(() => { fetchCounts(); }, [fetchCounts]);
  useEffect(() => { fetchItems(); }, [fetchItems]);
  useEffect(() => { if (activeTab === 'tried' || activeTab === 'all') fetchIntents(); }, [activeTab, fetchIntents]);
  useEffect(() => { setPage(1); }, [search, editionFilter, activeTab]);

  // Auto-refresh on SSE events
  useEffect(() => {
    if (!lastEventTime) return;
    fetchCounts();
    fetchItems();
    fetchIntents();
  }, [lastEventTime]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSendReminder = async (id) => {
    setSendingReminderId(id);
    try {
      await registrationsAPI.sendReminder(id);
      toast.success('Reminder sent.');
    } catch (err) { toast.error(getErrorMessage(err)); }
    finally { setSendingReminderId(null); }
  };

  const handleSendIntentReminder = async (id) => {
    setSendingIntentId(id);
    try {
      await registrationsAPI.sendIntentReminder(id);
      toast.success('Reminder sent.');
      fetchIntents();
    } catch (err) { toast.error(getErrorMessage(err)); }
    finally { setSendingIntentId(null); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await registrationsAPI.delete(deleteDialog.id);
      toast.success('Registration deleted.');
      setDeleteDialog({ open: false, id: null });
      fetchItems();
      fetchCounts();
    } catch (err) { toast.error(getErrorMessage(err)); }
    finally { setDeleting(false); }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const params = {};
      if (editionFilter) params.edition = editionFilter;
      if (activeTab !== 'all' && activeTab !== 'tried') params.paymentStatus = activeTab;
      const res = await registrationsAPI.exportCSV(params);
      downloadBlob(res.data, 'registrations.csv');
      toast.success('CSV exported.');
    } catch (err) { toast.error(getErrorMessage(err)); }
    finally { setExporting(false); }
  };

  const editionOptions = editions.map((e) => ({
    value: e._id,
    label: String(e.title).includes(String(e.year)) ? e.title : `${e.title} (${e.year})`,
  }));

  const badgeCount = (key) => {
    if (key === 'tried') return intents.length;
    return counts[key] ?? 0;
  };

  // ── Intent row shared between All tab and Tried tab ─────────────────────
  const IntentRow = ({ intent }) => (
    <tr
      key={intent._id}
      className="hover:bg-amber-50/50 transition-colors cursor-pointer"
      onClick={() => navigate(`/registrations/intents/${intent._id}`)}
    >
      <td className="px-3 py-2.5 font-medium text-slate-800">
        <div className="flex items-center gap-1.5">
          <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 text-[10px] font-bold uppercase tracking-wide flex-shrink-0">
            Tried
          </span>
          {intent.title ? `${intent.title} ` : ''}{intent.firstName} {intent.lastName}
        </div>
      </td>
      <td className="px-3 py-2.5 text-slate-600 max-w-[160px]">
        <span className="block truncate" title={intent.email}>{intent.email}</span>
      </td>
      <td className="px-3 py-2.5 text-slate-600">{intent.country || ''}</td>
      <td className="px-3 py-2.5 text-slate-600">
        {categoryLabel(intent.category)}
      </td>
      <td className="px-3 py-2.5 text-slate-700 font-medium whitespace-nowrap">
        {intent.amount > 0 ? `USD ${Number(intent.amount).toFixed(2)}` : ''}
      </td>
      <td className="px-3 py-2.5">
        <span style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'3px 9px', borderRadius:100, background:'#fffbeb', fontSize:11, fontWeight:600, color:'#92400e' }}>
          <span style={{ width:6, height:6, borderRadius:'50%', background:'#f59e0b', flexShrink:0 }} />
          Tried ({intent.attemptCount})
        </span>
      </td>
      <td className="px-3 py-2.5 text-slate-500 whitespace-nowrap">{formatDateTime(intent.lastAttemptAt)}</td>
      <td className="px-3 py-2.5" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-end">
          <button
            onClick={() => handleSendIntentReminder(intent._id)}
            disabled={sendingIntentId === intent._id}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-semibold transition-colors disabled:opacity-40"
          >
            <Mail size={12} />
            {sendingIntentId === intent._id ? 'Sending…' : 'Remind'}
          </button>
        </div>
      </td>
    </tr>
  );

  return (
    <div>
      <PageHeader
        title="Registrations"
        subtitle="Manage congress registrations"
        action={() => setCreateOpen(true)}
        actionLabel="Add Registration"
        actionIcon={UserPlus}
        secondaryAction={handleExport}
        secondaryLabel={exporting ? 'Exporting...' : 'Export CSV'}
        secondaryIcon={Download}
      />

      <ManualRegistrationModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        editions={editions}
        onCreated={() => { fetchCounts(); fetchItems(); }}
      />

      {/* Top filters row */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search by name or email…"
          className="flex-1 min-w-[200px] max-w-xs"
        />
        <Dropdown
          value={editionFilter}
          onChange={setEditionFilter}
          options={[{ value: '', label: 'All Editions' }, ...editionOptions]}
          className="w-44"
        />
      </div>

      {/* Pill filter tabs */}
      <div className="flex flex-wrap gap-2 mb-4">
        {TABS.map((tab) => {
          const active = activeTab === tab.key;
          const count  = badgeCount(tab.key);
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 14px',
                borderRadius: 999,
                fontSize: 12,
                fontWeight: 600,
                border: `1.5px solid ${active ? tab.color : '#e2e8f0'}`,
                background: active ? tab.color : '#ffffff',
                color: active ? '#ffffff' : tab.color,
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              {tab.label}
              {count > 0 && (
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: 18,
                  height: 18,
                  borderRadius: 999,
                  fontSize: 10,
                  fontWeight: 700,
                  background: active ? 'rgba(255,255,255,0.25)' : tab.color + '18',
                  color: active ? '#fff' : tab.color,
                  padding: '0 4px',
                }}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        {activeTab === 'tried' ? (
          /* ── Tried-only tab ── */
          intentsLoading ? (
            <div className="flex items-center justify-center h-48"><Spinner size="lg" /></div>
          ) : intents.length === 0 ? (
            <EmptyState
              message="No incomplete registrants"
              description="No one has reached the payment step without completing it yet."
              icon={Users}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-amber-50 border-b border-amber-100">
                    <th className={TH} style={{ color: '#92400e' }}>Name</th>
                    <th className={TH} style={{ color: '#92400e' }}>Email</th>
                    <th className={TH} style={{ color: '#92400e' }}>Country</th>
                    <th className={TH} style={{ color: '#92400e' }}>Category</th>
                    <th className={TH} style={{ color: '#92400e' }}>Amount</th>
                    <th className={TH} style={{ color: '#92400e' }}>Status</th>
                    <th className={TH} style={{ color: '#92400e' }}>Last Seen</th>
                    <th className="px-3 py-2.5 text-right text-[11px] font-semibold uppercase tracking-wide" style={{ color: '#92400e' }}>Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-amber-50">
                  {intents.map((intent) => <IntentRow key={intent._id} intent={intent} />)}
                </tbody>
              </table>
            </div>
          )
        ) : (
          /* ── All / Pending / Confirmed / Cancelled tabs ── */
          loading ? (
            <div className="flex items-center justify-center h-48"><Spinner size="lg" /></div>
          ) : (items.length === 0 && (activeTab !== 'all' || intents.length === 0)) ? (
            <EmptyState
              message="No registrations found"
              description="No registrations match the current filters."
              icon={Users}
            />
          ) : (
            <div>
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-slate-50">
                    <th className={TH}>Name</th>
                    <th className={TH}>Email</th>
                    <th className={TH}>Country</th>
                    <th className={TH}>Category</th>
                    <th className={TH}>Amount</th>
                    <th className={TH}>Payment</th>
                    <th className={TH}>Date</th>
                    <th className="px-3 py-2.5 text-right text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {/* Show tried rows at top when on All tab */}
                  {activeTab === 'all' && intents.map((intent) => <IntentRow key={`intent-${intent._id}`} intent={intent} />)}

                  {items.map((item) => (
                    <tr key={item._id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-3 py-2.5 font-medium text-slate-800">
                        {item.title ? `${item.title} ` : ''}{item.firstName} {item.lastName}
                      </td>
                      <td className="px-3 py-2.5 text-slate-600 max-w-[160px]">
                        <span className="block truncate" title={item.email}>{item.email}</span>
                      </td>
                      <td className="px-3 py-2.5 text-slate-600">{item.country}</td>
                      <td className="px-3 py-2.5 text-slate-600">
                        {categoryLabel(item.category)}
                      </td>
                      <td className="px-3 py-2.5 text-slate-700 font-medium whitespace-nowrap">
                        {formatCurrency(item.amount)}
                      </td>
                      <td className="px-3 py-2.5">{statusBadge(item.paymentStatus)}</td>
                      <td className="px-3 py-2.5 text-slate-500 whitespace-nowrap">{formatDateTime(item.createdAt)}</td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => navigate(`/registrations/${item._id}`)}
                            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-teal-700 transition-colors"
                            title="View"
                          >
                            <Eye size={15} />
                          </button>
                          {(item.paymentStatus === 'pending' || item.paymentStatus === 'cancelled') && (
                            <button
                              onClick={() => handleSendReminder(item._id)}
                              disabled={sendingReminderId === item._id}
                              className="p-1.5 rounded-lg hover:bg-amber-50 text-slate-500 hover:text-amber-600 transition-colors disabled:opacity-40"
                              title="Send Reminder"
                            >
                              <Mail size={15} />
                            </button>
                          )}
                          <button
                            onClick={() => setDeleteDialog({ open: true, id: item._id })}
                            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-red-600 transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="px-4">
                <Pagination page={page} total={total} limit={LIMIT} onChange={setPage} />
              </div>
            </div>
          )
        )}
      </div>

      <ConfirmDialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, id: null })}
        onConfirm={handleDelete}
        title="Delete Registration"
        message="Are you sure you want to delete this registration? This action cannot be undone."
        loading={deleting}
      />
    </div>
  );
}
