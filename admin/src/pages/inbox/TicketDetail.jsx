import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft, Save } from 'lucide-react';
import { helpAPI } from '../../api/inbox';
import { formatDateTime, getErrorMessage } from '../../utils/helpers';
import { statusBadge } from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';
import Spinner from '../../components/ui/Spinner';

const STATUS_OPTIONS = [
  { value: 'open', label: 'Open' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'resolved', label: 'Resolved' },
];

export default function TicketDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        setLoading(true);
        const res = await helpAPI.getTicket(id);
        const data = res.data.data || res.data.ticket || res.data;
        setTicket(data);
        setStatus(data.status || 'open');
      } catch (err) {
        toast.error(getErrorMessage(err));
        navigate('/help/tickets');
      } finally {
        setLoading(false);
      }
    };
    fetchTicket();
  }, [id, navigate]);

  const handleUpdateStatus = async () => {
    try {
      setUpdatingStatus(true);
      await helpAPI.updateTicketStatus(id, status);
      toast.success('Status updated successfully.');
      setTicket((prev) => ({ ...prev, status }));
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!ticket) return null;

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={() => navigate('/help/tickets')}
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Tickets
        </button>
      </div>

      {/* Ticket detail card */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm">
        {/* Subject */}
        <div className="px-6 py-5 border-b border-slate-100">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-lg font-bold text-slate-800">{ticket.subject || '(No Subject)'}</h1>
              <p className="text-sm text-slate-500 mt-0.5">
                Submitted {formatDateTime(ticket.submittedAt || ticket.createdAt)}
              </p>
            </div>
            {statusBadge(ticket.status)}
          </div>
        </div>

        {/* Submitter info */}
        <div className="px-6 py-5 border-b border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Name</p>
            <p className="text-sm font-medium text-slate-800">{ticket.name}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Email</p>
            <a
              href={`mailto:${ticket.email}`}
              className="text-sm text-teal-700 hover:underline"
            >
              {ticket.email}
            </a>
          </div>
        </div>

        {/* Message */}
        <div className="px-6 py-5 border-b border-slate-100">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Message</p>
          <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{ticket.message}</p>
        </div>

        {/* Status update */}
        <div className="px-6 py-5">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Update Status</p>
          <div className="flex items-end gap-3">
            <Select
              name="status"
              options={STATUS_OPTIONS}
              value={status}
              onChange={(val) => setStatus(val)}
              placeholder="Select status..."
              className="w-48"
            />
            <Button
              onClick={handleUpdateStatus}
              loading={updatingStatus}
              disabled={status === ticket.status}
            >
              <Save size={15} />
              Save Status
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
