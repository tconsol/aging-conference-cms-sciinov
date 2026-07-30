import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { ArrowLeft, Download, Edit2, Key, Copy, Check } from 'lucide-react';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';
import Input from '../../components/ui/Input';
import Textarea from '../../components/ui/Textarea';
import Modal from '../../components/ui/Modal';
import Badge, { statusBadge } from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import { abstractsAPI } from '../../api/submissions';
import { formatDateTime, getErrorMessage } from '../../utils/helpers';

const statusOptions = [
  { value: 'pending', label: 'Pending' },
  { value: 'received_accepted', label: 'Received and accepted for review' },
  { value: 'under_review', label: 'Under Peer Review Process' },
  { value: 'decision_pending', label: 'Reviewed and decision pending' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'rejected', label: 'Rejected' },
];

const PRESENTATION_TYPE_OPTIONS = [
  { value: 'oral_inperson', label: 'Oral Presentation (In-Person)' },
  { value: 'oral_virtual', label: 'Oral Presentation (Virtual)' },
  { value: 'poster_inperson', label: 'Poster (In-Person)' },
  { value: 'poster_virtual', label: 'Poster (Virtual)' },
];

const PRESENTATION_TYPE_LABELS = {
  oral_inperson: 'Oral Presentation (In-Person)',
  oral_virtual: 'Oral Presentation (Virtual)',
  poster_inperson: 'Poster (In-Person)',
  poster_virtual: 'Poster (Virtual)',
};

function DetailRow({ label, value }) {
  return (
    <div className="grid grid-cols-3 gap-4 py-3 border-b border-slate-50 last:border-0">
      <dt className="text-sm font-medium text-slate-500">{label}</dt>
      <dd className="col-span-2 text-sm text-slate-800 break-words">{value || '—'}</dd>
    </div>
  );
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={copy}
      className="ml-2 p-0.5 rounded text-slate-400 hover:text-teal-600 transition-colors"
      title="Copy"
    >
      {copied ? <Check size={13} className="text-green-500" /> : <Copy size={13} />}
    </button>
  );
}

export default function AbstractDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [abstract, setAbstract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editSaving, setEditSaving] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const editForm = useForm();

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

  const onStatusSubmit = async (formData) => {
    setSaving(true);
    try {
      await abstractsAPI.updateStatus(id, {
        status: formData.status,
        adminNotes: formData.adminNotes,
      });
      toast.success('Status updated. Email sent to submitter.');
      fetchAbstract();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const openEdit = () => {
    editForm.reset({
      firstName: abstract.firstName || '',
      lastName: abstract.lastName || '',
      email: abstract.email || '',
      phone: abstract.phone || '',
      whatsapp: abstract.whatsapp || '',
      country: abstract.country || '',
      organization: abstract.organization || '',
      presentationType: abstract.presentationType || '',
      topicText: abstract.topicText || abstract.topic?.title || '',
      abstractTitle: abstract.abstractTitle || '',
      abstractText: abstract.abstractText || '',
      keywords: abstract.keywords || '',
      coAuthors: abstract.coAuthors || '',
    });
    setEditOpen(true);
  };

  const onEditSubmit = async (formData) => {
    setEditSaving(true);
    try {
      const res = await abstractsAPI.updateAbstract(id, formData);
      setAbstract(res.data.data || res.data);
      toast.success('Abstract details updated.');
      setEditOpen(false);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setEditSaving(false);
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
      <button
        onClick={() => navigate('/abstracts')}
        className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-5 transition-colors"
      >
        <ArrowLeft size={16} /> Back to Abstracts
      </button>

      <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-slate-800">{abstract.abstractTitle}</h1>
          <p className="text-sm text-slate-500 mt-1">Submitted {formatDateTime(abstract.createdAt)}</p>
        </div>
        <div className="flex items-center gap-2">
          {statusBadge(abstract.status)}
          <button
            onClick={openEdit}
            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-teal-700 transition-colors"
          >
            <Edit2 size={13} />
            Edit Details
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Author Info */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
            <h2 className="text-base font-semibold text-slate-700 mb-4">Author Information</h2>
            <dl>
              <DetailRow label="Full Name" value={`${abstract.firstName || ''} ${abstract.lastName || ''}`.trim()} />
              <DetailRow label="Email" value={abstract.email} />
              <DetailRow label="Country" value={abstract.country} />
              <DetailRow label="Institution / Affiliation" value={abstract.organization} />
              <DetailRow label="Phone" value={abstract.phone} />
              <DetailRow label="WhatsApp" value={abstract.whatsapp} />
            </dl>
          </div>

          {/* Abstract Content */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
            <h2 className="text-base font-semibold text-slate-700 mb-4">Abstract Details</h2>
            <dl>
              <DetailRow label="Presentation Type" value={PRESENTATION_TYPE_LABELS[abstract.presentationType] || abstract.presentationType} />
              <DetailRow label="Edition" value={abstract.edition?.title ? `${abstract.edition.title} (${abstract.edition.year})` : abstract.edition} />
              <DetailRow label="Topic" value={abstract.topic?.title || abstract.topicText} />
              <DetailRow label="Keywords" value={abstract.keywords} />
              <DetailRow label="Co-Authors" value={abstract.coAuthors} />
            </dl>
            <div className="mt-4">
              <p className="text-sm font-medium text-slate-500 mb-2">Abstract Text</p>
              <div className="bg-slate-50 rounded-lg p-4 text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                {abstract.abstractText || '—'}
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
                {abstract.fileName || 'Download Abstract File'}
              </a>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Update Status */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
            <h2 className="text-base font-semibold text-slate-700 mb-4">Update Status</h2>
            <form onSubmit={handleSubmit(onStatusSubmit)} className="space-y-4">
              <Select
                label="Status"
                name="status"
                register={register}
                error={errors.status?.message}
                options={statusOptions}
                required
                defaultValue={abstract?.status || 'pending'}
              />
              <Textarea
                label="Admin Notes"
                name="adminNotes"
                register={register}
                placeholder="Internal notes (sent to submitter on update)..."
                rows={4}
              />
              <Button type="submit" loading={saving} className="w-full">
                Save & Notify Submitter
              </Button>
            </form>
          </div>

          {/* Login Credentials */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
            <h2 className="text-base font-semibold text-slate-700 mb-4 flex items-center gap-2">
              <Key size={15} className="text-teal-600" />
              Login Credentials
            </h2>
            {abstract.loginId ? (
              <dl className="space-y-3">
                <div>
                  <dt className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Login ID</dt>
                  <dd className="flex items-center gap-1">
                    <span className="text-sm text-slate-800 font-mono bg-slate-50 border border-slate-200 rounded px-2 py-1 flex-1 select-all">
                      {abstract.loginId}
                    </span>
                    <CopyButton text={abstract.loginId} />
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Password</dt>
                  <dd className="flex items-center gap-1">
                    <span className="text-sm text-slate-800 font-mono bg-slate-50 border border-slate-200 rounded px-2 py-1 flex-1 select-all">
                      {abstract.loginPassword}
                    </span>
                    <CopyButton text={abstract.loginPassword} />
                  </dd>
                </div>
              </dl>
            ) : (
              <p className="text-sm text-slate-400 italic">No credentials generated (legacy submission).</p>
            )}
          </div>

          {/* Quick Info */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
            <h2 className="text-base font-semibold text-slate-700 mb-4">Quick Info</h2>
            <dl className="space-y-3">
              <div>
                <dt className="text-xs font-medium text-slate-500 uppercase tracking-wide">Submission ID</dt>
                <dd className="text-xs text-slate-600 mt-0.5 font-mono break-all">{abstract._id}</dd>
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

      {/* Edit Details Modal */}
      <Modal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title="Edit Abstract Details"
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditOpen(false)} disabled={editSaving}>
              Cancel
            </Button>
            <Button type="submit" form="abstract-edit-form" loading={editSaving}>
              Save Changes
            </Button>
          </>
        }
      >
        <form id="abstract-edit-form" onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="First Name"
              name="firstName"
              register={editForm.register}
              required="Required"
              error={editForm.formState.errors.firstName?.message}
            />
            <Input
              label="Last Name"
              name="lastName"
              register={editForm.register}
              required="Required"
              error={editForm.formState.errors.lastName?.message}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Email"
              name="email"
              type="email"
              register={editForm.register}
              required="Required"
              error={editForm.formState.errors.email?.message}
            />
            <Input
              label="Country"
              name="country"
              register={editForm.register}
              required="Required"
              error={editForm.formState.errors.country?.message}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Phone"
              name="phone"
              register={editForm.register}
            />
            <Input
              label="WhatsApp"
              name="whatsapp"
              register={editForm.register}
            />
          </div>
          <Input
            label="Institution / Organization"
            name="organization"
            register={editForm.register}
          />
          <Select
            label="Presentation Type"
            name="presentationType"
            register={editForm.register}
            required="Required"
            error={editForm.formState.errors.presentationType?.message}
            options={PRESENTATION_TYPE_OPTIONS}
            defaultValue={abstract?.presentationType || ''}
          />
          <Input
            label="Topic"
            name="topicText"
            register={editForm.register}
            placeholder="Scientific topic / session"
          />
          <Input
            label="Abstract Title"
            name="abstractTitle"
            register={editForm.register}
            required="Required"
            error={editForm.formState.errors.abstractTitle?.message}
          />
          <Textarea
            label="Abstract Text"
            name="abstractText"
            register={editForm.register}
            required="Required"
            error={editForm.formState.errors.abstractText?.message}
            rows={6}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Keywords"
              name="keywords"
              register={editForm.register}
              placeholder="comma separated"
            />
            <Input
              label="Co-Authors"
              name="coAuthors"
              register={editForm.register}
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}
