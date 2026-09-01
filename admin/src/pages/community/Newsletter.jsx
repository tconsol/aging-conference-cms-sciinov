import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { Trash2, Download, Mail } from 'lucide-react';
import { newsletterAPI } from '../../api/community';
import { formatDateTime, downloadBlob, getErrorMessage } from '../../utils/helpers';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import SearchBar from '../../components/ui/SearchBar';
import Pagination from '../../components/ui/Pagination';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import { useRegistrationBadge } from '../../context/RegistrationBadgeContext';

const LIMIT = 50;

export default function Newsletter() {
  const { lastEvents } = useRegistrationBadge();
  const [subscribers, setSubscribers] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [exporting, setExporting] = useState(false);

  const fetchSubscribers = useCallback(async () => {
    try {
      setLoading(true);
      const params = { page, limit: LIMIT };
      if (search.trim()) params.email = search.trim();
      const res = await newsletterAPI.getAll(params);
      const d = res.data;
      setSubscribers(d.data || d.subscribers || []);
      setTotal(d.total || d.count || 0);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchSubscribers();
  }, [fetchSubscribers]);

  // Live push: someone subscribed while this page is open
  useEffect(() => {
    if (!lastEvents['/newsletter']) return;
    fetchSubscribers();
  }, [lastEvents['/newsletter']]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearchChange = (val) => {
    setSearch(val);
    setPage(1);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await newsletterAPI.delete(deleteTarget._id);
      toast.success('Subscriber removed.');
      setDeleteTarget(null);
      fetchSubscribers();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      const res = await newsletterAPI.exportCSV();
      downloadBlob(res.data, 'newsletter-subscribers.csv');
      toast.success('CSV exported successfully.');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Newsletter Subscribers"
        subtitle="Manage email newsletter subscriptions"
        actionLabel="Export CSV"
        actionIcon={Download}
        action={handleExport}
      />

      {/* Stats card */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
          <Mail size={22} className="text-teal-700" />
        </div>
        <div>
          <p className="text-sm text-slate-500">Total Subscribers</p>
          <p className="text-3xl font-bold text-slate-800">{total.toLocaleString()}</p>
        </div>
        <div className="ml-auto">
          <Button
            variant="secondary"
            onClick={handleExport}
            loading={exporting}
          >
            <Download size={15} />
            Export CSV
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-slate-100">
          <SearchBar
            value={search}
            onChange={handleSearchChange}
            placeholder="Search by email..."
            className="w-72"
          />
          <p className="text-sm text-slate-500 flex-shrink-0">
            {total} subscriber{total !== 1 ? 's' : ''}
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Spinner size="lg" />
          </div>
        ) : subscribers.length === 0 ? (
          <EmptyState
            message="No subscribers found"
            description={search ? 'Try a different email address.' : 'No one has subscribed yet.'}
            icon={Mail}
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">#</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Subscribed At</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {subscribers.map((item, idx) => (
                    <tr key={item._id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-3 text-slate-400 text-xs">
                        {(page - 1) * LIMIT + idx + 1}
                      </td>
                      <td className="px-6 py-3 font-medium text-slate-800">{item.email}</td>
                      <td className="px-6 py-3 text-slate-500">
                        {formatDateTime(item.subscribedAt || item.createdAt)}
                      </td>
                      <td className="px-6 py-3 text-right">
                        <button
                          onClick={() => setDeleteTarget(item)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-6">
              <Pagination
                page={page}
                total={total}
                limit={LIMIT}
                onChange={setPage}
              />
            </div>
          </>
        )}
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Remove Subscriber"
        message={`Are you sure you want to remove "${deleteTarget?.email}" from the newsletter list?`}
        confirmLabel="Remove"
      />
    </div>
  );
}
