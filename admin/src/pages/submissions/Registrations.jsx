import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Eye, Trash2, Download, Users } from 'lucide-react';
import Button from '../../components/ui/Button';
import Badge, { statusBadge } from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import Pagination from '../../components/ui/Pagination';
import SearchBar from '../../components/ui/SearchBar';
import PageHeader from '../../components/ui/PageHeader';
import EmptyState from '../../components/ui/EmptyState';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import Dropdown from '../../components/ui/Dropdown';
import { registrationsAPI } from '../../api/submissions';
import { editionsAPI } from '../../api/congress';
import { formatDateTime, formatCurrency, CATEGORY_LABELS, getErrorMessage, downloadBlob } from '../../utils/helpers';

const paymentStatusOptions = [
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'cancelled', label: 'Cancelled' },
];

export default function Registrations() {
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [editions, setEditions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [editionFilter, setEditionFilter] = useState('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('');

  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null });
  const [deleting, setDeleting] = useState(false);
  const [exporting, setExporting] = useState(false);

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
      if (paymentStatusFilter) params.paymentStatus = paymentStatusFilter;
      const res = await registrationsAPI.getAll(params);
      const data = res.data;
      setItems(data.data || []);
      setTotal(data.total || 0);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [page, search, editionFilter, paymentStatusFilter]);

  useEffect(() => { fetchEditions(); }, []);
  useEffect(() => { fetchItems(); }, [fetchItems]);
  useEffect(() => { setPage(1); }, [search, editionFilter, paymentStatusFilter]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await registrationsAPI.delete(deleteDialog.id);
      toast.success('Registration deleted.');
      setDeleteDialog({ open: false, id: null });
      fetchItems();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const params = {};
      if (editionFilter) params.edition = editionFilter;
      if (paymentStatusFilter) params.paymentStatus = paymentStatusFilter;
      if (search) params.search = search;
      const res = await registrationsAPI.exportCSV(params);
      downloadBlob(res.data, 'registrations.csv');
      toast.success('CSV exported successfully.');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setExporting(false);
    }
  };

  const editionOptions = editions.map((e) => ({ value: e._id, label: String(e.title).includes(String(e.year)) ? e.title : `${e.title} (${e.year})` }));

  return (
    <div>
      <PageHeader
        title="Registrations"
        subtitle="Manage congress registrations"
        secondaryAction={handleExport}
        secondaryLabel={exporting ? 'Exporting...' : 'Export CSV'}
        secondaryIcon={Download}
      />

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search by name or email..."
          className="flex-1 min-w-[220px] max-w-sm"
        />
        <Dropdown
          value={editionFilter}
          onChange={setEditionFilter}
          options={[{ value: '', label: 'All Editions' }, ...editionOptions]}
          className="w-48"
        />
        <Dropdown
          value={paymentStatusFilter}
          onChange={setPaymentStatusFilter}
          options={[{ value: '', label: 'All Payment Statuses' }, ...paymentStatusOptions]}
          className="w-52"
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
            message="No registrations found"
            description="No registrations match the current filters."
            icon={Users}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Country</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Mode</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Payment</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Registered</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {items.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-800 whitespace-nowrap">
                      {item.firstName} {item.lastName}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{item.email}</td>
                    <td className="px-4 py-3 text-slate-600">{item.country}</td>
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                      {CATEGORY_LABELS[item.category] || item.category}
                    </td>
                    <td className="px-4 py-3 text-slate-600 capitalize">{item.attendanceMode}</td>
                    <td className="px-4 py-3 text-slate-700 font-medium">{formatCurrency(item.amount)}</td>
                    <td className="px-4 py-3">{statusBadge(item.paymentStatus)}</td>
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap text-xs">{formatDateTime(item.createdAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => navigate(`/registrations/${item._id}`)}
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
        title="Delete Registration"
        message="Are you sure you want to delete this registration? This action cannot be undone."
        loading={deleting}
      />
    </div>
  );
}
