import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Eye, Trash2, FileText, Clock, CheckCircle, XCircle } from 'lucide-react';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';
import Dropdown from '../../components/ui/Dropdown';
import Badge, { statusBadge } from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import Pagination from '../../components/ui/Pagination';
import SearchBar from '../../components/ui/SearchBar';
import PageHeader from '../../components/ui/PageHeader';
import EmptyState from '../../components/ui/EmptyState';
import StatsCard from '../../components/ui/StatsCard';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { abstractsAPI } from '../../api/submissions';
import { editionsAPI } from '../../api/congress';
import { formatDateTime, truncate, getErrorMessage } from '../../utils/helpers';

const statusOptions = [
  { value: 'pending', label: 'Pending' },
  { value: 'under_review', label: 'Under Review' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
];

export default function Abstracts() {
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [editions, setEditions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [editionFilter, setEditionFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null });
  const [deleting, setDeleting] = useState(false);

  const LIMIT = 20;

  const fetchEditions = async () => {
    try {
      const res = await editionsAPI.getAll();
      setEditions(res.data.data || []);
    } catch {
      // non-critical
    }
  };

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: LIMIT };
      if (search) params.search = search;
      if (editionFilter) params.edition = editionFilter;
      if (statusFilter) params.status = statusFilter;
      const res = await abstractsAPI.getAll(params);
      const data = res.data;
      setItems(data.data || []);
      setTotal(data.total || 0);
      if (data.stats) {
        setStats(data.stats);
      } else {
        // compute from full list if stats not provided
        setStats((prev) => ({ ...prev, total: data.total || 0 }));
      }
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [page, search, editionFilter, statusFilter]);

  useEffect(() => { fetchEditions(); }, []);
  useEffect(() => { fetchItems(); }, [fetchItems]);

  // Reset page on filter change
  useEffect(() => { setPage(1); }, [search, editionFilter, statusFilter]);

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

  const editionOptions = editions.map((e) => ({ value: e._id, label: `${e.title} (${e.year})` }));

  return (
    <div>
      <PageHeader
        title="Abstract Submissions"
        subtitle="Manage all submitted abstracts"
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard label="Total Submitted" value={stats.total} icon={FileText} color="blue" />
        <StatsCard label="Pending Review" value={stats.pending} icon={Clock} color="amber" />
        <StatsCard label="Approved" value={stats.approved} icon={CheckCircle} color="green" />
        <StatsCard label="Rejected" value={stats.rejected} icon={XCircle} color="red" />
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
          options={[{ value: '', label: 'All Statuses' }, ...statusOptions]}
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
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Author</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Country</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Title</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Submitted</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {items.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-800 whitespace-nowrap">
                      {item.authorName || item.firstName + ' ' + item.lastName}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{item.email}</td>
                    <td className="px-4 py-3 text-slate-600">{item.country}</td>
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{item.presentationType || item.category}</td>
                    <td className="px-4 py-3 text-slate-700 max-w-xs">
                      <span title={item.title}>{truncate(item.title, 55)}</span>
                    </td>
                    <td className="px-4 py-3">{statusBadge(item.status)}</td>
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap text-xs">{formatDateTime(item.createdAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => navigate(`/abstracts/${item._id}`)}
                          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-teal-700 transition-colors"
                          title="View"
                        >
                          <Eye size={15} />
                        </button>
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
    </div>
  );
}
