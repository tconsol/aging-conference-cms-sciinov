import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Eye, Trash2, MailOpen, Mail } from 'lucide-react';
import { contactAPI } from '../../api/inbox';
import { formatDateTime, truncate, getErrorMessage } from '../../utils/helpers';
import Badge from '../../components/ui/Badge';
import Pagination from '../../components/ui/Pagination';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import Button from '../../components/ui/Button';

const LIMIT = 20;

const FILTER_OPTIONS = [
  { value: '', label: 'All Messages' },
  { value: 'false', label: 'Unread' },
  { value: 'true', label: 'Read' },
];

export default function Contact() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [total, setTotal] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [filterRead, setFilterRead] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [togglingId, setTogglingId] = useState(null);

  const fetchMessages = useCallback(async () => {
    try {
      setLoading(true);
      const params = { page, limit: LIMIT };
      if (filterRead !== '') params.isRead = filterRead;
      const res = await contactAPI.getAll(params);
      const d = res.data;
      setMessages(d.data || d.messages || []);
      setTotal(d.total || d.count || 0);
      if (d.unreadCount !== undefined) setUnreadCount(d.unreadCount);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [page, filterRead]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const handleFilterChange = (val) => {
    setFilterRead(val);
    setPage(1);
  };

  const handleToggleRead = async (item) => {
    try {
      setTogglingId(item._id);
      await contactAPI.toggleRead(item._id);
      toast.success(item.isRead ? 'Marked as unread.' : 'Marked as read.');
      fetchMessages();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await contactAPI.delete(deleteTarget._id);
      toast.success('Message deleted.');
      setDeleteTarget(null);
      fetchMessages();
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
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-slate-800">Contact Messages</h1>
            {unreadCount > 0 && (
              <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-bold bg-red-500 text-white min-w-[22px]">
                {unreadCount}
              </span>
            )}
          </div>
          <p className="text-sm text-slate-500 mt-0.5">Inbox for contact form submissions</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            {FILTER_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => handleFilterChange(opt.value)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  filterRead === opt.value
                    ? 'bg-teal-700 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <p className="text-sm text-slate-500 flex-shrink-0">{total} message{total !== 1 ? 's' : ''}</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Spinner size="lg" />
          </div>
        ) : messages.length === 0 ? (
          <EmptyState
            message="No messages found"
            description="No contact messages match the selected filter."
            icon={Mail}
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
                  {messages.map((item) => (
                    <tr
                      key={item._id}
                      className={`transition-colors hover:bg-blue-50 ${!item.isRead ? 'bg-blue-50' : ''}`}
                    >
                      <td className="px-6 py-3">
                        <span className={`${!item.isRead ? 'font-semibold text-slate-800' : 'font-medium text-slate-700'}`}>
                          {item.name}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-slate-600">{item.email}</td>
                      <td className="px-6 py-3 text-slate-600 max-w-[200px]">
                        {truncate(item.subject, 50)}
                      </td>
                      <td className="px-6 py-3">
                        {item.isRead ? (
                          <Badge variant="default">Read</Badge>
                        ) : (
                          <Badge variant="warning">Unread</Badge>
                        )}
                      </td>
                      <td className="px-6 py-3 text-slate-500 whitespace-nowrap">
                        {formatDateTime(item.submittedAt || item.createdAt)}
                      </td>
                      <td className="px-6 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => navigate(`/contact/${item._id}`)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-teal-700 hover:bg-blue-100 transition-colors"
                            title="View message"
                          >
                            <Eye size={15} />
                          </button>
                          <button
                            onClick={() => handleToggleRead(item)}
                            disabled={togglingId === item._id}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-green-600 hover:bg-green-50 transition-colors disabled:opacity-40"
                            title={item.isRead ? 'Mark as unread' : 'Mark as read'}
                          >
                            {item.isRead ? <Mail size={15} /> : <MailOpen size={15} />}
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

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete Message"
        message={`Are you sure you want to delete the message from "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
      />
    </div>
  );
}
