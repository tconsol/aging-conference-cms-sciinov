import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { ArrowLeft } from 'lucide-react';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';
import Badge, { statusBadge } from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import { sponsorshipAPI } from '../../api/finance';
import { formatDateTime, getErrorMessage } from '../../utils/helpers';

const statusOptions = [
  { value: 'new', label: 'New' },
  { value: 'read', label: 'Read' },
  { value: 'follow_up', label: 'Follow Up' },
  { value: 'closed', label: 'Closed' },
];

function DetailRow({ label, value }) {
  return (
    <div className="grid grid-cols-3 gap-4 py-3 border-b border-slate-50 last:border-0">
      <dt className="text-sm font-medium text-slate-500">{label}</dt>
      <dd className="col-span-2 text-sm text-slate-800 break-words whitespace-pre-wrap">{value || '—'}</dd>
    </div>
  );
}

export default function SponsorshipDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [inquiry, setInquiry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const fetchInquiry = async () => {
    setLoading(true);
    try {
      const res = await sponsorshipAPI.getOne(id);
      const data = res.data.data || res.data;
      setInquiry(data);
      reset({ status: data.status || 'new' });
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchInquiry(); }, [id]);

  const onSubmit = async (formData) => {
    setSaving(true);
    try {
      await sponsorshipAPI.updateStatus(id, formData.status);
      toast.success('Status updated successfully.');
      fetchInquiry();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!inquiry) {
    return (
      <div className="text-center py-16">
        <p className="text-slate-500">Sponsorship inquiry not found.</p>
        <Button variant="secondary" className="mt-4" onClick={() => navigate('/sponsorship')}>
          <ArrowLeft size={15} /> Back
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back */}
      <button
        onClick={() => navigate('/sponsorship')}
        className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-5 transition-colors"
      >
        <ArrowLeft size={16} /> Back to Sponsorship Inquiries
      </button>

      <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-slate-800">{inquiry.organization}</h1>
          <p className="text-sm text-slate-500 mt-1">
            {inquiry.contactPerson || inquiry.name} &middot; {inquiry.email}
          </p>
        </div>
        <div>{statusBadge(inquiry.status)}</div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
            <h2 className="text-base font-semibold text-slate-700 mb-4">Contact Information</h2>
            <dl>
              <DetailRow label="Organization" value={inquiry.organization} />
              <DetailRow label="Contact Person" value={inquiry.contactPerson || inquiry.name} />
              <DetailRow label="Email" value={inquiry.email} />
              <DetailRow label="Phone" value={inquiry.phone} />
              <DetailRow label="Country" value={inquiry.country} />
              <DetailRow label="Website" value={inquiry.website} />
            </dl>
          </div>

          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
            <h2 className="text-base font-semibold text-slate-700 mb-4">Inquiry Details</h2>
            <dl>
              <DetailRow label="Sponsorship Type" value={inquiry.sponsorshipType || inquiry.type} />
              <DetailRow label="Budget Range" value={inquiry.budget || inquiry.budgetRange} />
              <DetailRow label="Submitted At" value={formatDateTime(inquiry.createdAt)} />
            </dl>
            {inquiry.message && (
              <div className="mt-4">
                <p className="text-sm font-medium text-slate-500 mb-2">Message</p>
                <div className="bg-slate-50 rounded-lg p-4 text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {inquiry.message}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Status Update Sidebar */}
        <div>
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
            <h2 className="text-base font-semibold text-slate-700 mb-4">Update Status</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Select
                label="Status"
                name="status"
                register={register}
                error={errors.status?.message}
                options={statusOptions}
                required
              />
              <Button type="submit" loading={saving} className="w-full">
                Save Status
              </Button>
            </form>

            <div className="mt-6 pt-4 border-t border-slate-100">
              <dl className="space-y-3">
                <div>
                  <dt className="text-xs font-medium text-slate-500 uppercase tracking-wide">Inquiry ID</dt>
                  <dd className="text-sm text-slate-700 mt-0.5 font-mono truncate">{inquiry._id}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-slate-500 uppercase tracking-wide">Submitted</dt>
                  <dd className="text-sm text-slate-700 mt-0.5">{formatDateTime(inquiry.createdAt)}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-slate-500 uppercase tracking-wide">Last Updated</dt>
                  <dd className="text-sm text-slate-700 mt-0.5">{formatDateTime(inquiry.updatedAt)}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
