import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft, Trash2, MailOpen } from 'lucide-react';
import { contactAPI } from '../../api/inbox';
import { formatDateTime, getErrorMessage } from '../../utils/helpers';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import Spinner from '../../components/ui/Spinner';

export default function ContactDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [togglingRead, setTogglingRead] = useState(false);

  useEffect(() => {
    const fetchMessage = async () => {
      try {
        setLoading(true);
        const res = await contactAPI.getOne(id);
        setMessage(res.data.data || res.data.message || res.data);
      } catch (err) {
        toast.error(getErrorMessage(err));
        navigate('/contact');
      } finally {
        setLoading(false);
      }
    };
    fetchMessage();
  }, [id, navigate]);

  const handleMarkUnread = async () => {
    try {
      setTogglingRead(true);
      await contactAPI.toggleRead(id);
      toast.success('Marked as unread.');
      navigate('/contact');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setTogglingRead(false);
    }
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await contactAPI.delete(id);
      toast.success('Message deleted.');
      navigate('/contact');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!message) return null;

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={() => navigate('/contact')}
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Messages
        </button>
        <div className="flex items-center gap-2">
          {message.isRead && (
            <Button variant="secondary" onClick={handleMarkUnread} loading={togglingRead}>
              <MailOpen size={15} />
              Mark as Unread
            </Button>
          )}
          <Button variant="danger" onClick={() => setDeleteOpen(true)}>
            <Trash2 size={15} />
            Delete
          </Button>
        </div>
      </div>

      {/* Message card */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm">
        {/* Subject line */}
        <div className="px-6 py-5 border-b border-slate-100">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-lg font-bold text-slate-800">{message.subject || '(No Subject)'}</h1>
              <p className="text-sm text-slate-500 mt-0.5">
                Submitted {formatDateTime(message.submittedAt || message.createdAt)}
              </p>
            </div>
            <Badge variant={message.isRead ? 'default' : 'warning'}>
              {message.isRead ? 'Read' : 'Unread'}
            </Badge>
          </div>
        </div>

        {/* Sender info */}
        <div className="px-6 py-5 border-b border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Name</p>
            <p className="text-sm font-medium text-slate-800">{message.name}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Email</p>
            <a
              href={`mailto:${message.email}`}
              className="text-sm text-teal-700 hover:underline"
            >
              {message.email}
            </a>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Phone</p>
            <p className="text-sm text-slate-700">{message.phone || '—'}</p>
          </div>
        </div>

        {/* Message body */}
        <div className="px-6 py-5">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Message</p>
          <div className="prose prose-sm max-w-none">
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{message.message}</p>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete Message"
        message={`Are you sure you want to delete this message from "${message.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
      />
    </div>
  );
}
