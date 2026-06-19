import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { ArrowLeft, Download, FileText } from 'lucide-react';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';
import Textarea from '../../components/ui/Textarea';
import Badge, { statusBadge } from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import { abstractsAPI } from '../../api/submissions';
import { formatDateTime, getErrorMessage } from '../../utils/helpers';

const statusOptions = [
  { value: 'pending', label: 'Pending' },
  { value: 'under_review', label: 'Under Review' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
];

function DetailRow({ label, value }) {
  return (
    <div className="grid grid-cols-3 gap-4 py-3 border-b border-slate-50 last:border-0">
      <dt className="text-sm font-medium text-slate-500">{label}</dt>
      <dd className="col-span-2 text-sm text-slate-800 break-words">{value || '—'}</dd>
    </div>
  );
}

export default function AbstractDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [abstract, setAbstract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const fetchAbstract = async () => {
    setLoading(true);
    try {
      const res = await abstractsAPI.getOne(id);
      const data = res.data.data || res.data;
      setAbstract(data);
      reset({
        status: data.status || 'pending',
        adminNotes: data.adminNotes || '',
      });
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAbstract(); }, [id]);

  const onSubmit = async (formData) => {
    setSaving(true);
    try {
      await abstractsAPI.updateStatus(id, {
        status: formData.status,
        adminNotes: formData.adminNotes,
      });
      toast.success('Status updated successfully.');
      fetchAbstract();
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

  if (!abstract) {
    return (
      <div className="text-center py-16">
        <p className="text-slate-500">Abstract not found.</p>
        <Button variant="secondary" className="mt-4" onClick={() => navigate('/abstracts')}>
          <ArrowLeft size={15} /> Back
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back */}
      <button
        onClick={() => navigate('/abstracts')}
        className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-5 transition-colors"
      >
        <ArrowLeft size={16} /> Back to Abstracts
      </button>

      <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-slate-800">{abstract.title}</h1>
          <p className="text-sm text-slate-500 mt-1">Submitted {formatDateTime(abstract.createdAt)}</p>
        </div>
        <div>{statusBadge(abstract.status)}</div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Author Info */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
            <h2 className="text-base font-semibold text-slate-700 mb-4">Author Information</h2>
            <dl>
              <DetailRow label="Author Name" value={abstract.authorName || `${abstract.firstName || ''} ${abstract.lastName || ''}`.trim()} />
              <DetailRow label="Email" value={abstract.email} />
              <DetailRow label="Country" value={abstract.country} />
              <DetailRow label="Institution / Affiliation" value={abstract.affiliation || abstract.institution} />
              <DetailRow label="Phone" value={abstract.phone} />
            </dl>
          </div>

          {/* Abstract Content */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
            <h2 className="text-base font-semibold text-slate-700 mb-4">Abstract Details</h2>
            <dl>
              <DetailRow label="Presentation Type" value={abstract.presentationType || abstract.category} />
              <DetailRow label="Edition" value={abstract.edition?.title || abstract.editionId} />
              <DetailRow label="Keywords" value={Array.isArray(abstract.keywords) ? abstract.keywords.join(', ') : abstract.keywords} />
            </dl>
            <div className="mt-4">
              <p className="text-sm font-medium text-slate-500 mb-2">Abstract Text</p>
              <div className="bg-slate-50 rounded-lg p-4 text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                {abstract.abstract || abstract.content || '—'}
              </div>
            </div>
          </div>

          {/* File */}
          {abstract.fileUrl && (
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
              <h2 className="text-base font-semibold text-slate-700 mb-3">Uploaded File</h2>
              <a
                href={abstract.fileUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-sm text-teal-700 hover:text-blue-700 hover:underline"
              >
                <Download size={15} />
                Download Abstract File
              </a>
            </div>
          )}
        </div>

        {/* Status Update Sidebar */}
        <div className="space-y-6">
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
              <Textarea
                label="Admin Notes"
                name="adminNotes"
                register={register}
                placeholder="Internal notes about this abstract..."
                rows={4}
              />
              <Button type="submit" loading={saving} className="w-full">
                Save Changes
              </Button>
            </form>
          </div>

          {/* Quick Info */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
            <h2 className="text-base font-semibold text-slate-700 mb-4">Quick Info</h2>
            <dl className="space-y-3">
              <div>
                <dt className="text-xs font-medium text-slate-500 uppercase tracking-wide">Submission ID</dt>
                <dd className="text-sm text-slate-700 mt-0.5 font-mono">{abstract._id}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-slate-500 uppercase tracking-wide">Submitted At</dt>
                <dd className="text-sm text-slate-700 mt-0.5">{formatDateTime(abstract.createdAt)}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-slate-500 uppercase tracking-wide">Last Updated</dt>
                <dd className="text-sm text-slate-700 mt-0.5">{formatDateTime(abstract.updatedAt)}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
