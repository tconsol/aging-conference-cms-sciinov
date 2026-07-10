import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Eye, Trash2, Mic2 } from 'lucide-react';
import Badge, { statusBadge } from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import Pagination from '../../components/ui/Pagination';
import PageHeader from '../../components/ui/PageHeader';
import EmptyState from '../../components/ui/EmptyState';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import Dropdown from '../../components/ui/Dropdown';
import { speakerApplicationsAPI } from '../../api/people';
import { formatDateTime, getErrorMessage } from '../../utils/helpers';

const statusOptions = [
  { value: 'pending', label: 'Pending' },
  { value: 'shortlisted', label: 'Shortlisted' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
];

export default function SpeakerApplications() {
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null });
  const [deleting, setDeleting] = useState(false);

  const LIMIT = 20;

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: LIMIT };
      if (statusFilter) params.status = statusFilter;
      const res = await speakerApplicationsAPI.getAll(params);
      const data = res.data;
      setItems(data.data || []);
      setTotal(data.total || 0);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => { fetchItems(); }, [fetchItems]);
  useEffect(() => { setPage(1); }, [statusFilter]);

  const handleStatusChange = async (id, newStatus) => {
    setUpdatingStatus(id);
    try {
      await speakerApplicationsAPI.updateStatus(id, newStatus);
      toast.success('Status updated.');
      fetchItems();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await speakerApplicationsAPI.delete(deleteDialog.id);
      toast.success('Application deleted.');
      setDeleteDialog({ open: false, id: null });
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
        title="Speaker Applications"
        subtitle="Review incoming 'Become a Speaker' nominations"
      />

      {/* Filter */}
      <div className="mb-4">
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
            message="No speaker applications"
            description="No applications match the current filter."
            icon={Mic2}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Edition</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Expertise</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Submitted</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {items.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-800 whitespace-nowrap">{item.name}</td>
                    <td className="px-4 py-3 text-slate-600">{item.email}</td>
                    <td className="px-4 py-3 text-slate-600">
                      {item.edition?.title ? `${item.edition.title} (${item.edition.year})` : '—'}
                    </td>
                    <td className="px-4 py-3 text-slate-600 max-w-[180px] truncate">{item.expertise}</td>
                    <td className="px-4 py-3">{statusBadge(item.status)}</td>
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap text-xs">{formatDateTime(item.createdAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <div className="relative">
                          {updatingStatus === item._id ? (
                            <Spinner size="sm" />
                          ) : (
                            <Dropdown
                              value={item.status}
                              onChange={(val) => handleStatusChange(item._id, val)}
                              options={statusOptions}
                              className="w-36"
                            />
                          )}
                        </div>
                        <button
                          onClick={() => navigate(`/speaker-applications/${item._id}`)}
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
        title="Delete Application"
        message="Are you sure you want to delete this speaker application? This action cannot be undone."
        loading={deleting}
      />
    </div>
  );
}
