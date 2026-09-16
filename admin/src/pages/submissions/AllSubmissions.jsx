import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Inbox, Eye, Download, RotateCcw, FileText, ClipboardList,
  Mic2, Handshake, MessageCircle, LifeBuoy, Mail,
} from 'lucide-react';
import { allSubmissionsAPI } from '../../api/submissions';
import { editionsAPI } from '../../api/congress';
import { formatDate, getErrorMessage, downloadBlob } from '../../utils/helpers';
import PageHeader from '../../components/ui/PageHeader';
import SearchBar from '../../components/ui/SearchBar';
import Select from '../../components/ui/Select';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import Pagination from '../../components/ui/Pagination';
import Badge from '../../components/ui/Badge';

const TYPE_ICONS = {
  abstract: FileText,
  registration: ClipboardList,
  speakerApplication: Mic2,
  sponsorship: Handshake,
  contact: MessageCircle,
  supportTicket: LifeBuoy,
  newsletter: Mail,
};

const TYPE_COLORS = {
  abstract: 'info',
  registration: 'teal',
  speakerApplication: 'purple',
  sponsorship: 'default',
  contact: 'info',
  supportTicket: 'purple',
  newsletter: 'default',
};

// Every source uses its own status words; this maps all of them onto one set of
// visual tones so a glance down the column is readable.
const STATUS_TONE = {
  pending: '#92400e', unread: '#92400e', open: '#92400e', new: '#92400e',
  confirmed: '#14532d', accepted: '#14532d', subscribed: '#14532d', resolved: '#14532d', closed: '#14532d',
  rejected: '#7f1d1d', cancelled: '#7f1d1d', refunded: '#7f1d1d',
  under_review: '#5b21b6', decision_pending: '#9a3412', received_accepted: '#1e40af',
  read: '#475569', contacted: '#1e40af',
};

const prettyStatus = (s) =>
  String(s || '—').replace(/[_-]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

export default function AllSubmissions() {
  const navigate = useNavigate();

  const [rows, setRows] = useState([]);
  const [counts, setCounts] = useState({});
  const [meta, setMeta] = useState([]);
  const [editions, setEditions] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1, limit: 25 });
  const [loading, setLoading] = useState(true);

  const [type, setType] = useState('all');
  const [status, setStatus] = useState('all');
  const [edition, setEdition] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    allSubmissionsAPI.getMeta()
      .then((res) => setMeta(res.data?.data || []))
      .catch(() => setMeta([]));
    editionsAPI.getAll()
      .then((res) => setEditions(res.data?.data || res.data || []))
      .catch(() => setEditions([]));
  }, []);

  const fetchRows = useCallback(async () => {
    setLoading(true);
    try {
      const res = await allSubmissionsAPI.getAll({
        type, status, edition: edition || undefined,
        from: from || undefined, to: to || undefined,
        q: q || undefined, page, limit: 25,
      });
      setRows(res.data?.data || []);
      setCounts(res.data?.counts || {});
      setPagination(res.data?.pagination || { total: 0, page: 1, pages: 1, limit: 25 });
    } catch (err) {
      toast.error(getErrorMessage(err));
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [type, status, edition, from, to, q, page]);

  useEffect(() => { fetchRows(); }, [fetchRows]);

  // Any filter change invalidates the current page number.
  useEffect(() => { setPage(1); }, [type, status, edition, from, to, q]);

  const typeOptions = useMemo(() => ([
    { value: 'all', label: 'All types' },
    ...meta.map((m) => ({ value: m.key, label: m.label })),
  ]), [meta]);

  // Only the selected type's own statuses are offered — mixing every
  // vocabulary into one list produces options that match nothing.
  const statusOptions = useMemo(() => {
    const src = meta.find((m) => m.key === type);
    const list = src?.statuses || [];
    return [{ value: 'all', label: 'All statuses' }, ...list.map((s) => ({ value: s, label: prettyStatus(s) }))];
  }, [meta, type]);

  const editionOptions = useMemo(() => ([
    { value: '', label: 'All editions' },
    ...editions.map((e) => ({ value: e._id, label: `${e.title || 'Edition'} ${e.year || ''}`.trim() })),
  ]), [editions]);

  const resetFilters = () => {
    setType('all'); setStatus('all'); setEdition('');
    setFrom(''); setTo(''); setQ(''); setPage(1);
  };

  const activeFilters = type !== 'all' || status !== 'all' || edition || from || to || q;

  const exportCsv = () => {
    if (!rows.length) return toast.error('Nothing to export on this page.');
    const head = ['Type', 'Name', 'Email', 'Subject', 'Status', 'Date', 'Details'];
    const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const csv = [
      head.join(','),
      ...rows.map((r) => [r.typeLabel, r.name, r.email, r.title, prettyStatus(r.status),
        r.date ? new Date(r.date).toISOString() : '', r.extra].map(esc).join(',')),
    ].join('\n');
    // Only the current page: the table is what the admin is looking at, and
    // exporting a filtered set they cannot see would be a surprise.
    downloadBlob(new Blob([csv], { type: 'text/csv;charset=utf-8' }), `submissions-page-${page}.csv`);
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="All Submissions"
        subtitle="Everything submitted through the public website, in one feed."
      />

      {/* Type chips with live counts for the current filter */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setType('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            type === 'all' ? 'bg-teal-700 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'
          }`}
        >
          All · {pagination.total}
        </button>
        {meta.map((m) => {
          const Icon = TYPE_ICONS[m.key] || Inbox;
          const active = type === m.key;
          return (
            <button
              key={m.key}
              type="button"
              onClick={() => setType(m.key)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                active ? 'bg-teal-700 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              <Icon size={12} />
              {m.label} · {counts[m.key] ?? 0}
            </button>
          );
        })}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          <Select
            label="Status" options={statusOptions} value={status} onChange={setStatus}
            placeholder="All statuses"
            disabled={type === 'all'}
            hint={type === 'all' ? 'Pick a type first' : undefined}
          />
          <Select
            label="Edition" options={editionOptions} value={edition} onChange={setEdition}
            placeholder="All editions"
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700">From</label>
            <input
              type="date" value={from} onChange={(e) => setFrom(e.target.value)}
              className="w-full h-11 px-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-teal-500"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700">To</label>
            <input
              type="date" value={to} onChange={(e) => setTo(e.target.value)}
              className="w-full h-11 px-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-teal-500"
            />
          </div>
        </div>

        <div className="flex items-end gap-3 mt-3 flex-wrap">
          <div className="flex-1 min-w-[240px]">
            <SearchBar value={q} onChange={setQ} placeholder="Search name, email, subject…" />
          </div>
          <button
            type="button"
            onClick={exportCsv}
            className="inline-flex items-center gap-2 px-4 h-11 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:border-slate-300 transition-colors"
          >
            <Download size={14} /> Export page
          </button>
          {activeFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex items-center gap-2 px-4 h-11 rounded-xl text-sm font-semibold text-slate-500 hover:text-slate-700 transition-colors"
            >
              <RotateCcw size={14} /> Reset
            </button>
          )}
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : rows.length === 0 ? (
        <EmptyState
          icon={Inbox}
          message="No submissions match these filters"
          description={activeFilters ? 'Try widening the date range or clearing the search.' : 'Nothing has been submitted yet.'}
          action={activeFilters ? resetFilters : undefined}
          actionLabel="Reset filters"
        />
      ) : (
        <>
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[820px]">
                <thead className="bg-slate-50 text-left">
                  <tr className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">From</th>
                    <th className="px-4 py-3">Subject</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3 text-right">Open</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rows.map((r) => {
                    const Icon = TYPE_ICONS[r.type] || Inbox;
                    return (
                      <tr key={`${r.type}-${r.id}`} className="hover:bg-slate-50/60">
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-2">
                            <Icon size={14} className="text-slate-400 shrink-0" />
                            <Badge variant={TYPE_COLORS[r.type] || 'default'}>{r.typeLabel}</Badge>
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-semibold text-slate-800">{r.name || '—'}</div>
                          <div className="text-xs text-slate-500">{r.email}</div>
                        </td>
                        <td className="px-4 py-3 max-w-[280px]">
                          <div className="text-slate-700 truncate">{r.title || '—'}</div>
                          {r.extra && <div className="text-xs text-slate-400 truncate">{r.extra}</div>}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className="text-xs font-bold"
                            style={{ color: STATUS_TONE[r.status] || '#475569' }}
                          >
                            {prettyStatus(r.status)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                          {r.date ? formatDate(r.date) : '—'}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => navigate(r.detail)}
                            className="p-2 rounded-lg text-slate-400 hover:text-teal-700 hover:bg-teal-50 transition-colors"
                            aria-label={`Open ${r.typeLabel}`}
                          >
                            <Eye size={15} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <Pagination
            page={pagination.page}
            total={pagination.total}
            limit={pagination.limit}
            onChange={setPage}
          />
        </>
      )}
    </div>
  );
}
