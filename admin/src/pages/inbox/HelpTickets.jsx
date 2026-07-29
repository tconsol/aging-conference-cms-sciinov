import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Eye, Trash2, RefreshCw, LifeBuoy } from 'lucide-react';
import { helpAPI } from '../../api/inbox';
import { formatDateTime, truncate, getErrorMessage } from '../../utils/helpers';
import { statusBadge } from '../../components/ui/Badge';
import Pagination from '../../components/ui/Pagination';
import Modal from '../../components/ui/Modal';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';

const LIMIT = 20;

const STATUS_OPTIONS = [
  { value: 'open', label: 'Open' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'resolved', label: 'Resolved' },
];

const FILTER_OPTIONS = [
  { value: '', label: 'All Tickets' },
  { value: 'open', label: 'Open' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'resolved', label: 'Resolved' },
];

export default function HelpTickets() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState('');
  const [statusModal, setStatusModal] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchTickets = useCallback(async () => {
    try {
      setLoading(true);
      const params = { page, limit: LIMIT };
      if (filterStatus) params.status = filterStatus;
      const res = await helpAPI.getAllTickets(params);
      const d = res.data;
      setTickets(d.data || d.tickets || []);
      setTotal(d.total || d.count || 0);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [page, filterStatus]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const handleFilterChange = (val) => {
    setFilterStatus(val);
    setPage(1);
  };

  const openStatusModal = (ticket) => {
    setStatusModal(ticket);
    setNewStatus(ticket.status);
  };

  const handleUpdateStatus = async () => {
    if (!statusModal) return;
    try {
      setUpdatingStatus(true);
      await helpAPI.updateTicketStatus(statusModal._id, newStatus);
      toast.success('Status updated.');
      setStatusModal(null);
      fetchTickets();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await helpAPI.deleteTicket(deleteTarget._id);
      toast.success('Ticket deleted.');
      setDeleteTarget(null);
      fetchTickets();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Support Tickets</h1>
          <p className="text-sm text-slate-500 mt-0.5">Help requests from attendees and visitors</p>
        </div>
        <Button variant="secondary" onClick={() => navigate('/help/faqs')}>
          <LifeBuoy size={15} />
          Manage FAQs
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            {FILTER_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => handleFilterChange(opt.value)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  filterStatus === opt.value
                    ? 'bg-teal-700 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <p className="text-sm text-slate-500 flex-shrink-0">{total} ticket{total !== 1 ? 's' : ''}</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Spinner size="lg" />
          </div>
        ) : tickets.length === 0 ? (
          <EmptyState
            message="No tickets found"
            description="No support tickets match the selected filter."
            icon={LifeBuoy}
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Subject</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Submitted At</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {tickets.map((item) => (
                    <tr key={item._id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-3 font-medium text-slate-800 whitespace-nowrap">{item.name}</td>
                      <td className="px-6 py-3 text-slate-600">{item.email}</td>
                      <td className="px-6 py-3 text-slate-600 max-w-[200px]">
                        {truncate(item.subject, 50)}
                      </td>
                      <td className="px-6 py-3">{statusBadge(item.status)}</td>
                      <td className="px-6 py-3 text-slate-500 whitespace-nowrap">
                        {formatDateTime(item.submittedAt || item.createdAt)}
                      </td>
                      <td className="px-6 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => navigate(`/help/tickets/${item._id}`)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-teal-700 hover:bg-blue-50 transition-colors"
                            title="View ticket"
                          >
                            <Eye size={15} />
                          </button>
                          <button
                            onClick={() => openStatusModal(item)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-green-600 hover:bg-green-50 transition-colors"
                            title="Update status"
                          >
                            <RefreshCw size={15} />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(item)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
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
            </div>
            <div className="px-6">
              <Pagination page={page} total={total} limit={LIMIT} onChange={setPage} />
            </div>
          </>
        )}
      </div>

      {/* Update Status Modal */}
      <Modal
        open={!!statusModal}
        onClose={() => setStatusModal(null)}
        title="Update Ticket Status"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setStatusModal(null)} disabled={updatingStatus}>
              Cancel
            </Button>
            <Button onClick={handleUpdateStatus} loading={updatingStatus}>
              Update Status
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Update the status for ticket from <span className="font-semibold">{statusModal?.name}</span>.
          </p>
          <Select
            label="Status"
            name="status"
            options={STATUS_OPTIONS}
            value={newStatus}
            onChange={(val) => setNewStatus(val)}
            placeholder="Select status..."
          />
        </div>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete Ticket"
        message={`Are you sure you want to delete the ticket from "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
      />
    </div>
  );
}
