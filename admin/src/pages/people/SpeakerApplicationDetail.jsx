import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { ArrowLeft } from 'lucide-react';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';
import { statusBadge } from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import { speakerApplicationsAPI } from '../../api/people';
import { formatDateTime, getErrorMessage } from '../../utils/helpers';

const statusOptions = [
  { value: 'pending', label: 'Pending' },
  { value: 'shortlisted', label: 'Shortlisted' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
];

function DetailRow({ label, value }) {
  return (
    <div className="grid grid-cols-3 gap-4 py-3 border-b border-slate-50 last:border-0">
      <dt className="text-sm font-medium text-slate-500">{label}</dt>
      <dd className="col-span-2 text-sm text-slate-800 break-words whitespace-pre-wrap">{value || '—'}</dd>
    </div>
  );
}

export default function SpeakerApplicationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const fetchApplication = async () => {
    setLoading(true);
    try {
      const res = await speakerApplicationsAPI.getOne(id);
      const data = res.data.data || res.data;
      setApplication(data);
      reset({ status: data.status || 'pending' });
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchApplication(); }, [id]);

  const onSubmit = async (formData) => {
    setSaving(true);
    try {
      await speakerApplicationsAPI.updateStatus(id, formData.status);
      toast.success('Status updated successfully.');
      fetchApplication();
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

  if (!application) {
    return (
      <div className="text-center py-16">
        <p className="text-slate-500">Speaker application not found.</p>
        <Button variant="secondary" className="mt-4" onClick={() => navigate('/speaker-applications')}>
          <ArrowLeft size={15} /> Back
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back */}
      <button
        onClick={() => navigate('/speaker-applications')}
        className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-5 transition-colors"
      >
        <ArrowLeft size={16} /> Back to Speaker Applications
      </button>

      <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-slate-800">{application.name}</h1>
          <p className="text-sm text-slate-500 mt-1">{application.email}</p>
        </div>
        <div>{statusBadge(application.status)}</div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
            <h2 className="text-base font-semibold text-slate-700 mb-4">Contact Information</h2>
            <dl>
              <DetailRow label="Name" value={application.name} />
              <DetailRow label="Email" value={application.email} />
              <DetailRow label="Phone" value={application.phone} />
              <DetailRow label="Country" value={application.country} />
              <DetailRow label="Organization" value={application.organization} />
              <DetailRow label="Designation" value={application.designation} />
            </dl>
          </div>

          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
            <h2 className="text-base font-semibold text-slate-700 mb-4">Application Details</h2>
            <dl>
              <DetailRow
                label="Congress Edition"
                value={application.edition?.title ? `${application.edition.title} (${application.edition.year})` : '—'}
              />
              <DetailRow label="Area of Expertise" value={application.expertise} />
              <DetailRow label="Submitted At" value={formatDateTime(application.createdAt)} />
            </dl>
            {application.bio && (
              <div className="mt-4">
                <p className="text-sm font-medium text-slate-500 mb-2">Bio</p>
                <div className="bg-slate-50 rounded-lg p-4 text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {application.bio}
                </div>
              </div>
            )}
            {application.message && (
              <div className="mt-4">
                <p className="text-sm font-medium text-slate-500 mb-2">Message</p>
                <div className="bg-slate-50 rounded-lg p-4 text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {application.message}
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
                defaultValue={application?.status || 'pending'}
              />
              <Button type="submit" loading={saving} className="w-full">
                Save Status
              </Button>
            </form>

            <div className="mt-6 pt-4 border-t border-slate-100">
              <dl className="space-y-3">
                <div>
                  <dt className="text-xs font-medium text-slate-500 uppercase tracking-wide">Application ID</dt>
                  <dd className="text-sm text-slate-700 mt-0.5 font-mono truncate">{application._id}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-slate-500 uppercase tracking-wide">Submitted</dt>
                  <dd className="text-sm text-slate-700 mt-0.5">{formatDateTime(application.createdAt)}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-slate-500 uppercase tracking-wide">Last Updated</dt>
                  <dd className="text-sm text-slate-700 mt-0.5">{formatDateTime(application.updatedAt)}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
