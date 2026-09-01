import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import {
  ArrowLeft, Download, Edit2, Key, Copy, Check, Eye,
  User, FileText, Building, ChevronDown, ChevronUp,
  Layers, CalendarDays, Clock, Loader2, Upload,
} from 'lucide-react';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';
import Input from '../../components/ui/Input';
import Textarea from '../../components/ui/Textarea';
import Modal from '../../components/ui/Modal';
import { statusBadge } from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import { abstractsAPI } from '../../api/submissions';
import { formatDateTime, getErrorMessage, downloadBlob } from '../../utils/helpers';

const statusOptions = [
  { value: 'pending',           label: 'Pending' },
  { value: 'received_accepted', label: 'Received and accepted for review' },
  { value: 'under_review',      label: 'Under Peer Review Process' },
  { value: 'decision_pending',  label: 'Reviewed and decision pending' },
  { value: 'accepted',          label: 'Accepted' },
  { value: 'rejected',          label: 'Rejected' },
];

const PRESENTATION_TYPE_OPTIONS = [
  { value: 'oral_inperson',   label: 'Oral Presentation (In-Person)' },
  { value: 'oral_virtual',    label: 'Oral Presentation (Virtual)' },
  { value: 'poster_inperson', label: 'Poster (In-Person)' },
  { value: 'poster_virtual',  label: 'Poster (Virtual)' },
];

const PRESENTATION_TYPE_LABELS = {
  oral_inperson:   'Oral Presentation (In-Person)',
  oral_virtual:    'Oral Presentation (Virtual)',
  poster_inperson: 'Poster (In-Person)',
  poster_virtual:  'Poster (Virtual)',
};

const STATUS_CFG = {
  pending:           { color: '#d97706', bg: '#fffbeb', border: '#fcd34d', dot: '#f59e0b' },
  received_accepted: { color: '#2563eb', bg: '#eff6ff', border: '#93c5fd', dot: '#3b82f6' },
  under_review:      { color: '#7c3aed', bg: '#f5f3ff', border: '#c4b5fd', dot: '#8b5cf6' },
  decision_pending:  { color: '#ea580c', bg: '#fff7ed', border: '#fdba74', dot: '#f97316' },
  accepted:          { color: '#16a34a', bg: '#f0fdf4', border: '#86efac', dot: '#22c55e' },
  rejected:          { color: '#dc2626', bg: '#fef2f2', border: '#fca5a5', dot: '#ef4444' },
};

// ── helpers ──────────────────────────────────────────────────────────────────

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
      className="ml-1 p-1 rounded-md text-slate-400 hover:text-teal-600 hover:bg-teal-50 transition-colors"
      title="Copy"
    >
      {copied ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
    </button>
  );
}

function SectionHeader({ icon: Icon, title, color = '#0d9488' }) {
  return (
    <div className="flex items-center gap-2.5 mb-5">
      <div style={{
        width: 32, height: 32, borderRadius: 8,
        background: `color-mix(in srgb, ${color} 12%, transparent)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        <Icon size={15} style={{ color }} />
      </div>
      <h2 className="text-sm font-bold text-slate-700 tracking-wide uppercase" style={{ letterSpacing: '0.06em' }}>
        {title}
      </h2>
    </div>
  );
}

function InfoRow({ label, value, mono, full }) {
  if (!value && value !== 0) return null;
  return (
    <div className={`flex gap-4 py-2.5 border-b border-slate-50 last:border-0 ${full ? 'flex-col' : ''}`}>
      <dt className="text-xs font-semibold text-slate-400 uppercase tracking-wider" style={{ minWidth: full ? undefined : 140, paddingTop: 1 }}>
        {label}
      </dt>
      <dd className={`text-sm text-slate-800 break-words ${mono ? 'font-mono' : ''}`}>{value}</dd>
    </div>
  );
}

function ExpandableText({ text, maxLines = 4 }) {
  const [expanded, setExpanded] = useState(false);
  if (!text) return <span className="text-slate-400 italic text-sm"></span>;

  const lines = text.split('\n');
  const shouldCollapse = lines.length > maxLines || text.length > 400;

  return (
    <div>
      <div
        className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap transition-all"
        style={!expanded && shouldCollapse ? {
          display: '-webkit-box',
          WebkitLineClamp: maxLines,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        } : {}}
      >
        {text}
      </div>
      {shouldCollapse && (
        <button
          onClick={() => setExpanded((v) => !v)}
          className="mt-2 flex items-center gap-1 text-xs font-semibold text-teal-600 hover:text-teal-700 transition-colors"
        >
          {expanded ? <><ChevronUp size={13} /> Show Less</> : <><ChevronDown size={13} /> Show More</>}
        </button>
      )}
    </div>
  );
}

// ── Uploaded file card ───────────────────────────────────────────────────────
function UploadedFileCard({ abstract }) {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      // Proxied through the API so the browser saves the file instead of
      // navigating to it <a download> is ignored cross-origin.
      const res = await abstractsAPI.downloadFile(abstract._id);
      downloadBlob(res.data, abstract.fileName || 'abstract');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
      <SectionHeader icon={FileText} title="Uploaded File" color="#0369a1" />
      <div className="flex items-center justify-between gap-4 p-4 rounded-xl bg-blue-50 border border-blue-100 flex-wrap">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-lg bg-white border border-blue-200 flex items-center justify-center flex-shrink-0">
            <FileText size={17} className="text-blue-600" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-800 truncate">
              {abstract.fileName || 'Abstract Document'}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">Submitted with this abstract</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <a
            href={abstract.fileUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-4 py-2 bg-white text-blue-700 text-xs font-bold rounded-lg border border-blue-200 hover:bg-blue-50 transition-colors"
          >
            <Eye size={13} /> View
          </a>
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {downloading
              ? <><Loader2 size={13} className="animate-spin" /> Downloading…</>
              : <><Download size={13} /> Download</>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── main ─────────────────────────────────────────────────────────────────────

export default function AbstractDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [abstract, setAbstract] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editSaving, setEditSaving] = useState(false);

  const [letterFile, setLetterFile] = useState(null);

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm();
  const editForm = useForm();
  const watchedStatus = watch('status');

  const fetchAbstract = async () => {
    setLoading(true);
    try {
      const res  = await abstractsAPI.getOne(id);
      const data = res.data.data || res.data;
      setAbstract(data);
      reset({ status: data.status || 'pending', adminNotes: data.adminNotes || '' });
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
      // Sent as multipart so the Letter of Acceptance rides along with the change
      const fd = new FormData();
      fd.append('status', formData.status);
      fd.append('adminNotes', formData.adminNotes || '');
      if (formData.status === 'accepted' && letterFile) {
        fd.append('acceptanceLetter', letterFile);
      }

      await abstractsAPI.updateStatus(id, fd);
      toast.success(
        formData.status === 'accepted' && letterFile
          ? 'Status updated. Acceptance letter emailed to the submitter.'
          : 'Status updated. Email sent to submitter.'
      );
      setLetterFile(null);
      fetchAbstract();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleLetterDownload = async () => {
    try {
      const res = await abstractsAPI.downloadAcceptanceLetter(id);
      downloadBlob(res.data, abstract.acceptanceLetterName || 'Letter-of-Acceptance.pdf');
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const openEdit = () => {
    editForm.reset({
      firstName:        abstract.firstName || '',
      lastName:         abstract.lastName  || '',
      email:            abstract.email     || '',
      phone:            abstract.phone     || '',
      whatsapp:         abstract.whatsapp  || '',
      country:          abstract.country   || '',
      organization:     abstract.organization || '',
      presentationType: abstract.presentationType || '',
      topicText:        abstract.topicText || abstract.topic?.title || '',
      abstractTitle:    abstract.abstractTitle || '',
      abstractText:     abstract.abstractText  || '',
      keywords:         abstract.keywords  || '',
      coAuthors:        abstract.coAuthors || '',
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

  const cfg = STATUS_CFG[abstract.status] || STATUS_CFG.pending;

  return (
    <div className="max-w-5xl mx-auto">
      {/* ── Back ── */}
      <button
        onClick={() => navigate('/abstracts')}
        className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-700 mb-6 transition-colors group"
      >
        <ArrowLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" />
        Back to Abstracts
      </button>

      {/* ── Hero header ── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden mb-6">
        <div className="h-1" style={{ background: `linear-gradient(90deg, ${cfg.color}, ${cfg.dot})` }} />
        <div className="p-6 flex items-start justify-between gap-4 flex-wrap">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              {statusBadge(abstract.status)}
              <span className="text-xs text-slate-400 font-mono">#{abstract._id?.slice(-8).toUpperCase()}</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 leading-snug mb-1">{abstract.abstractTitle}</h1>
            <div className="flex items-center gap-4 text-xs text-slate-400 flex-wrap mt-2">
              <span className="flex items-center gap-1">
                <User size={11} />
                {abstract.firstName} {abstract.lastName}
              </span>
              {abstract.organization && (
                <span className="flex items-center gap-1">
                  <Building size={11} /> {abstract.organization}
                </span>
              )}
              <span className="flex items-center gap-1">
                <CalendarDays size={11} /> {formatDateTime(abstract.createdAt)}
              </span>
            </div>
          </div>
          <button
            onClick={openEdit}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:border-teal-300 hover:text-teal-700 transition-all whitespace-nowrap"
          >
            <Edit2 size={12} /> Edit Details
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Left column ── */}
        <div className="lg:col-span-2 space-y-5">

          {/* Uploaded file first, it's the thing reviewers reach for */}
          {abstract.fileUrl && <UploadedFileCard abstract={abstract} />}

          {/* Author card */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <SectionHeader icon={User} title="Author Information" color="#0d9488" />
            <dl>
              <InfoRow label="Full Name"    value={`${abstract.firstName || ''} ${abstract.lastName || ''}`.trim()} />
              <InfoRow label="Email"        value={abstract.email} />
              <InfoRow label="Country"      value={abstract.country} />
              <InfoRow label="Institution"  value={abstract.organization} />
              <InfoRow label="Phone"        value={abstract.phone} />
              <InfoRow label="WhatsApp"     value={abstract.whatsapp} />
            </dl>
          </div>

          {/* Submission details card */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <SectionHeader icon={Layers} title="Submission Details" color="#7c3aed" />
            <dl>
              <InfoRow label="Presentation"  value={PRESENTATION_TYPE_LABELS[abstract.presentationType] || abstract.presentationType} />
              <InfoRow label="Edition"       value={abstract.edition?.title ? `${abstract.edition.title}${abstract.edition.year ? ' (' + abstract.edition.year + ')' : ''}` : null} />
              <InfoRow label="Topic"         value={abstract.topic?.title || abstract.topicText} />
              <InfoRow label="Keywords"      value={abstract.keywords} />
              <InfoRow label="Co-Authors"    value={abstract.coAuthors} />
            </dl>
          </div>

          {/* Abstract text card */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <SectionHeader icon={FileText} title="Abstract Text" color="#2563eb" />
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
              <ExpandableText text={abstract.abstractText} maxLines={4} />
            </div>
          </div>

        </div>

        {/* ── Sidebar ── */}
        <div className="space-y-5">

          {/* Status card */}
          <div
            className="rounded-2xl border shadow-sm p-5"
            style={{ background: cfg.bg, borderColor: cfg.border }}
          >
            <div className="flex items-center gap-2 mb-4">
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: cfg.dot, flexShrink: 0, display: 'inline-block' }} />
              <h2 className="text-xs font-bold uppercase tracking-wider" style={{ color: cfg.color, letterSpacing: '0.1em' }}>
                Update Status
              </h2>
            </div>
            <form onSubmit={handleSubmit(onStatusSubmit)} className="space-y-3">
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
                placeholder="Notes sent to submitter on update…"
                rows={3}
              />

              {/* Letter of Acceptance — only relevant once accepted */}
              {watchedStatus === 'accepted' && (
                <div className="rounded-xl border border-green-200 bg-green-50/60 p-3">
                  <p className="text-xs font-bold text-green-800 uppercase tracking-wider mb-2">
                    Letter of Acceptance
                  </p>

                  {abstract.acceptanceLetterUrl && !letterFile && (
                    <div className="flex items-center justify-between gap-2 bg-white border border-green-200 rounded-lg px-3 py-2 mb-2">
                      <span className="text-xs text-slate-700 truncate min-w-0">
                        {abstract.acceptanceLetterName || 'Uploaded'}
                      </span>
                      <button
                        type="button"
                        onClick={handleLetterDownload}
                        className="text-xs font-bold text-green-700 hover:underline shrink-0"
                      >
                        Download
                      </button>
                    </div>
                  )}

                  <label className="flex items-center gap-2 px-3 py-2 rounded-lg border-2 border-dashed border-green-300 bg-white hover:border-green-500 cursor-pointer transition-colors">
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      className="hidden"
                      onChange={(e) => setLetterFile(e.target.files?.[0] || null)}
                    />
                    <Upload size={13} className="text-green-600 shrink-0" />
                    <span className="text-xs text-slate-600 truncate min-w-0">
                      {letterFile
                        ? letterFile.name
                        : abstract.acceptanceLetterUrl
                          ? 'Replace letter (PDF / DOC)'
                          : 'Upload letter (PDF / DOC)'}
                    </span>
                  </label>

                  <p className="text-[11px] text-green-700 mt-2 leading-relaxed">
                    {letterFile
                      ? 'Attached to the notification email and downloadable from the author’s portal.'
                      : abstract.acceptanceLetterUrl
                        ? 'Already available to the author. Upload a new file to replace it.'
                        : 'Optional — attach it to the acceptance email and publish it to the author’s portal.'}
                  </p>
                </div>
              )}

              <Button type="submit" loading={saving} className="w-full">
                Save & Notify
              </Button>
            </form>
          </div>

          {/* Credentials card */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center">
                <Key size={13} className="text-amber-600" />
              </div>
              <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider" style={{ letterSpacing: '0.08em' }}>
                Login Credentials
              </h2>
            </div>
            {abstract.loginId ? (
              <div className="space-y-3">
                {[
                  { label: 'Login ID',  value: abstract.loginId },
                  { label: 'Password',  value: abstract.loginPassword },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">{label}</p>
                    <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
                      <span className="text-sm font-mono text-slate-800 flex-1 select-all break-all">{value}</span>
                      <CopyButton text={value} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">No credentials (legacy submission).</p>
            )}
          </div>

          {/* Meta card */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center">
                <Clock size={13} className="text-slate-500" />
              </div>
              <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider" style={{ letterSpacing: '0.08em' }}>
                Metadata
              </h2>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Submission ID</p>
                <p className="text-xs font-mono text-slate-600 break-all bg-slate-50 rounded-lg px-2.5 py-1.5">{abstract._id}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Submitted At</p>
                <p className="text-sm text-slate-700">{formatDateTime(abstract.createdAt)}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Last Updated</p>
                <p className="text-sm text-slate-700">{formatDateTime(abstract.updatedAt)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Edit Modal ── */}
      <Modal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title="Edit Abstract Details"
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditOpen(false)} disabled={editSaving}>Cancel</Button>
            <Button type="submit" form="abstract-edit-form" loading={editSaving}>Save Changes</Button>
          </>
        }
      >
        <form id="abstract-edit-form" onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="First Name" name="firstName" register={editForm.register} required="Required" error={editForm.formState.errors.firstName?.message} />
            <Input label="Last Name"  name="lastName"  register={editForm.register} required="Required" error={editForm.formState.errors.lastName?.message} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Email"   name="email"   type="email" register={editForm.register} required="Required" error={editForm.formState.errors.email?.message} />
            <Input label="Country" name="country" register={editForm.register} required="Required" error={editForm.formState.errors.country?.message} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Phone"    name="phone"    register={editForm.register} />
            <Input label="WhatsApp" name="whatsapp" register={editForm.register} />
          </div>
          <Input label="Institution / Organization" name="organization" register={editForm.register} />
          <Select
            label="Presentation Type"
            name="presentationType"
            register={editForm.register}
            required="Required"
            error={editForm.formState.errors.presentationType?.message}
            options={PRESENTATION_TYPE_OPTIONS}
            defaultValue={abstract?.presentationType || ''}
          />
          <Input label="Topic" name="topicText" register={editForm.register} placeholder="Scientific topic / session" />
          <Input label="Abstract Title" name="abstractTitle" register={editForm.register} required="Required" error={editForm.formState.errors.abstractTitle?.message} />
          <Textarea label="Abstract Text" name="abstractText" register={editForm.register} required="Required" error={editForm.formState.errors.abstractText?.message} rows={6} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Keywords"  name="keywords"  register={editForm.register} placeholder="comma separated" />
            <Input label="Co-Authors" name="coAuthors" register={editForm.register} />
          </div>
        </form>
      </Modal>
    </div>
  );
}
