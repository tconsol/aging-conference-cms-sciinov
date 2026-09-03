import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft, Mail, Clock, RefreshCw } from 'lucide-react';
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';
import { registrationsAPI } from '../../api/submissions';
import { formatDateTime, CATEGORY_LABELS, categoryLabel, getErrorMessage } from '../../utils/helpers';

function DetailRow({ label, value }) {
  return (
    <div className="grid grid-cols-3 gap-4 py-3 border-b border-slate-50 last:border-0">
      <dt className="text-sm font-medium text-slate-500">{label}</dt>
      <dd className="col-span-2 text-sm text-slate-800 break-words">{value || ''}</dd>
    </div>
  );
}

export default function IntentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [intent, setIntent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const fetchIntent = async () => {
    setLoading(true);
    try {
      const res = await registrationsAPI.getOneIntent(id);
      setIntent(res.data.data || res.data);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchIntent(); }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSendReminder = async () => {
    setSending(true);
    try {
      await registrationsAPI.sendIntentReminder(id);
      toast.success('Reminder email sent.');
      fetchIntent();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!intent) {
    return (
      <div className="text-center py-16">
        <p className="text-slate-500">Intent record not found.</p>
        <Button variant="secondary" className="mt-4" onClick={() => navigate('/registrations')}>
          <ArrowLeft size={15} /> Back
        </Button>
      </div>
    );
  }

  const fullName = `${intent.title ? intent.title + ' ' : ''}${intent.firstName || ''} ${intent.lastName || ''}`.trim();

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back */}
      <button
        onClick={() => navigate('/registrations')}
        className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-5 transition-colors"
      >
        <ArrowLeft size={16} /> Back to Registrations
      </button>

      <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              padding: '3px 10px', borderRadius: 100,
              background: '#fffbeb', fontSize: 11, fontWeight: 700, color: '#92400e',
              border: '1px solid #fcd34d',
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#f59e0b' }} />
              Tried Incomplete Registration
            </span>
          </div>
          <h1 className="text-xl font-bold text-slate-800">{fullName || intent.email}</h1>
          <p className="text-sm text-slate-500 mt-0.5">{intent.email}</p>
        </div>
        <Button
          onClick={handleSendReminder}
          loading={sending}
          style={{ background: '#d97706', color: '#fff', border: 'none' }}
        >
          <Mail size={15} /> Send Reminder
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Info */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
            <h2 className="text-base font-semibold text-slate-700 mb-4">Personal Information</h2>
            <dl>
              <DetailRow label="Title" value={intent.title} />
              <DetailRow label="Full Name" value={fullName} />
              <DetailRow label="Email" value={intent.email} />
              <DetailRow label="Country" value={intent.country} />
            </dl>
          </div>

          {/* What they selected */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
            <h2 className="text-base font-semibold text-slate-700 mb-4">Registration Selection</h2>
            <dl>
              <DetailRow
                label="Edition"
                value={intent.edition ? `${intent.edition.title}${intent.edition.year ? ' (' + intent.edition.year + ')' : ''}` : null}
              />
              <DetailRow label="Category" value={categoryLabel(intent.category)} />
              <DetailRow label="Pricing Tier" value={intent.pricingTierLabel} />
              <DetailRow label="Participants" value={intent.participants} />
              <DetailRow label="Accompanying Persons" value={intent.accompanying} />
              <DetailRow
                label="Estimated Amount"
                value={intent.amount > 0 ? `USD ${Number(intent.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}` : null}
              />
            </dl>
          </div>
        </div>

        {/* Summary sidebar */}
        <div className="space-y-6">
          {/* Attempt stats */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
            <h2 className="text-base font-semibold text-slate-700 mb-4">Attempt Summary</h2>
            <dl className="space-y-4">
              <div>
                <dt className="text-xs font-medium text-slate-500 uppercase tracking-wide">Total Attempts</dt>
                <dd className="text-2xl font-bold text-amber-600 mt-1">{intent.attemptCount}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-slate-500 uppercase tracking-wide">Reminders Sent</dt>
                <dd className="text-lg font-semibold text-slate-700 mt-1">{intent.reminderCount}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
                  <Clock size={11} /> Last Seen
                </dt>
                <dd className="text-sm text-slate-700 mt-1">{formatDateTime(intent.lastAttemptAt)}</dd>
              </div>
              {intent.lastReminderAt && (
                <div>
                  <dt className="text-xs font-medium text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
                    <Mail size={11} /> Last Reminder
                  </dt>
                  <dd className="text-sm text-slate-700 mt-1">{formatDateTime(intent.lastReminderAt)}</dd>
                </div>
              )}
              <div>
                <dt className="text-xs font-medium text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
                  <RefreshCw size={11} /> First Seen
                </dt>
                <dd className="text-sm text-slate-700 mt-1">{formatDateTime(intent.createdAt)}</dd>
              </div>
            </dl>
          </div>

          {/* Amount highlight */}
          {intent.amount > 0 && (
            <div className="bg-amber-50 rounded-xl border border-amber-100 p-6">
              <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-1">Estimated Value</p>
              <p className="text-2xl font-bold text-amber-800">
                USD {Number(intent.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-amber-600 mt-1">Abandoned at payment step</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
