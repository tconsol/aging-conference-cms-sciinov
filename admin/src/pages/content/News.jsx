import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Pencil, Trash2, Newspaper, Plus } from 'lucide-react';
import Button from '../../components/ui/Button';
import Badge, { statusBadge } from '../../components/ui/Badge';
import StatusToggle from '../../components/ui/StatusToggle';
import Spinner from '../../components/ui/Spinner';
import Pagination from '../../components/ui/Pagination';
import SearchBar from '../../components/ui/SearchBar';
import PageHeader from '../../components/ui/PageHeader';
import EmptyState from '../../components/ui/EmptyState';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import Dropdown from '../../components/ui/Dropdown';
import { newsAPI } from '../../api/content';
import { formatDate, truncate, getErrorMessage } from '../../utils/helpers';

const statusOptions = [
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published' },
];

export default function News() {
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null, hasFile: false });
  const [deleting, setDeleting] = useState(false);
  const [togglingId, setTogglingId] = useState(null);

  const toggleStatus = async (item) => {
    const next = item.status === 'published' ? 'draft' : 'published';
    try {
      setTogglingId(item._id);
      await newsAPI.update(item._id, { status: next });
      setItems((prev) => prev.map((n) => n._id === item._id ? { ...n, status: next } : n));
      toast.success('Status updated.');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setTogglingId(null);
    }
  };

  const LIMIT = 12;

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: LIMIT };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      const res = await newsAPI.getAll(params);
      const data = res.data;
      setItems(data.data || []);
      setTotal(data.total || 0);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => { fetchItems(); }, [fetchItems]);
  useEffect(() => { setPage(1); }, [search, statusFilter]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await newsAPI.delete(deleteDialog.id);
      toast.success('Article deleted.');
      setDeleteDialog({ open: false, id: null, hasFile: false });
      fetchItems();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="News & Blog"
        subtitle="Manage articles and blog posts"
        action={() => navigate('/news/new')}
        actionLabel="New Article"
      />

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search articles..."
          className="flex-1 min-w-[220px] max-w-sm"
        />
        <Dropdown
          value={statusFilter}
          onChange={setStatusFilter}
          options={[{ value: '', label: 'All Statuses' }, ...statusOptions]}
          className="w-44"
        />
      </div>

      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <Spinner size="lg" />
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            message="No articles found"
            description="Create your first news article."
            action={() => navigate('/news/new')}
            actionLabel="New Article"
            icon={Newspaper}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Image</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Title</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Author</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Published</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {items.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      {item.featuredImage ? (
                        <img
                          src={item.featuredImage}
                          alt={item.title}
                          className="w-12 h-10 object-cover rounded-lg border border-slate-100"
                        />
                      ) : (
                        <div className="w-12 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                          <Newspaper size={14} className="text-slate-400" />
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-800 max-w-xs">
                      <span title={item.title}>{truncate(item.title, 60)}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{item.author}</td>
                    <td className="px-4 py-3">
                      <StatusToggle
                        isActive={item.status === 'published'}
                        loading={togglingId === item._id}
                        onToggle={() => toggleStatus(item)}
                      />
                    </td>
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{formatDate(item.publishedAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => navigate(`/news/${item._id}/edit`)}
                          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-teal-700 transition-colors"
                          title="Edit"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => setDeleteDialog({ open: true, id: item._id, hasFile: !!item.featuredImage })}
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
        onClose={() => setDeleteDialog({ open: false, id: null, hasFile: false })}
        onConfirm={handleDelete}
        title="Delete Article"
        message="Are you sure you want to delete this article? This action cannot be undone."
        loading={deleting}
        storageWarning={deleteDialog.hasFile}
      />
    </div>
  );
}
