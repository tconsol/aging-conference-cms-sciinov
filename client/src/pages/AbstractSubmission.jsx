import { useEffect, useState, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Send, FileText, AlertCircle, CheckCircle, Key, ExternalLink, UploadCloud, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import PageHero from '../components/ui/PageHero';
import SectionHeader from '../components/ui/SectionHeader';
import Button from '../components/ui/Button';
import Select from '../components/ui/Select';
import Spinner from '../components/ui/Spinner';
import { submissionsAPI } from '../api/submissions';
import { congressAPI } from '../api/congress';
import { usecongress } from '../context/congressContext';
import { getErrorMessage } from '../utils/helpers';
import { COUNTRY_OPTIONS } from '../utils/countries';

const PRESENTATION_TYPES = [
  { value: 'oral_inperson', label: 'Oral Presentation (In-Person)' },
  { value: 'oral_virtual',  label: 'Oral Presentation (Virtual)' },
  { value: 'poster_inperson', label: 'Poster (In-Person)' },
  { value: 'poster_virtual',  label: 'Poster (Virtual)' },
];

const GUIDELINES = [
  'Abstract must be 250–400 words',
  'Written in English',
  'Include background, methods, results, and conclusion',
  'No tables or figures in the abstract text',
  'Each author may submit up to 2 abstracts',
];

const INPUT_CLS = 'w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none bg-slate-50 focus:bg-white transition-colors';
const FOCUS = (e) => { e.target.style.borderColor = 'var(--brand)'; e.target.style.boxShadow = '0 0 0 3px color-mix(in srgb, var(--brand) 15%, transparent)'; };
const BLUR  = (e) => { e.target.style.borderColor = ''; e.target.style.boxShadow = ''; };

export default function AbstractSubmission() {
  const { activeEdition } = usecongress();
  const [submitted, setSubmitted]       = useState(false);
  const [submittedData, setSubmittedData] = useState(null);
  const [loading, setLoading]           = useState(false);
  const [dates, setDates]         = useState([]);
  const [topics, setTopics]       = useState([]);

  const { register, handleSubmit, control, formState: { errors }, reset, watch } = useForm();
  const fileInputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const fileReg = register('file');

  useEffect(() => {
    const params = activeEdition?._id ? { edition: activeEdition._id } : {};
    congressAPI.getImportantDates(params)
      .then((res) => {
        const data = res.data?.data ?? res.data ?? [];
        setDates(Array.isArray(data) ? data.filter((d) => d.category === 'abstracts') : []);
      })
      .catch(() => {});
    congressAPI.getSessions(params)
      .then((res) => {
        const data = res.data?.data ?? res.data ?? [];
        setTopics(Array.isArray(data) ? data : []);
      })
      .catch(() => setTopics([]));
  }, [activeEdition]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const { file, ...rest } = data;
      const fd = new FormData();
      Object.entries(rest).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') fd.append(key, value);
      });
      fd.append('edition', activeEdition?._id || '');
      if (file instanceof FileList && file.length > 0) fd.append('file', file[0]);
      const res = await submissionsAPI.submitAbstract(fd);
      setSubmittedData(res.data?.data || null);
      setSubmitted(true);
      reset();
      toast.success('Abstract submitted successfully!');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageHero
        title="Submit Abstract"
        subtitle="Submit your research abstract for consideration at the Aging Congress."
        breadcrumb={[{ label: 'Home', href: '/' }, { label: 'Submit Abstract' }]}
      />

      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="grid lg:grid-cols-3 gap-10">

            {/* Sidebar */}
            <div className="flex flex-col gap-4">
              {/* Guidelines */}
              <div
                className="rounded-2xl p-6 border"
                style={{ background: 'var(--brand-light)', borderColor: 'color-mix(in srgb, var(--brand) 20%, transparent)' }}
              >
                <h3 className="font-black text-slate-900 mb-4 flex items-center gap-2">
                  <FileText size={17} style={{ color: 'var(--brand-dark)' }} />
                  Submission Guidelines
                </h3>
                <ul className="flex flex-col gap-2.5">
                  {GUIDELINES.map((g) => (
                    <li key={g} className="flex items-start gap-3">
                      <CheckCircle size={13} className="shrink-0 mt-0.5" style={{ color: 'var(--brand-dark)' }} />
                      <span className="text-sm text-slate-600 leading-snug">{g}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Deadlines */}
              {dates.length > 0 && (
                <div className="rounded-2xl p-6 border border-amber-200 bg-amber-50">
                  <h3 className="font-black text-slate-900 mb-4 flex items-center gap-2">
                    <AlertCircle size={17} className="text-amber-600" />
                    Key Deadlines
                  </h3>
                  <div className="flex flex-col gap-3">
                    {dates.map((d) => (
                      <div key={d._id} className="flex flex-col">
                        <p className="text-sm font-semibold text-slate-700">{d.label}</p>
                        <p className="text-sm font-bold text-amber-700">
                          {new Date(d.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Form */}
            <div className="lg:col-span-2">
              {submitted ? (
                <div className="flex flex-col gap-5">
                  {/* Success header */}
                  <div
                    className="rounded-2xl p-6 flex items-start gap-4 border"
                    style={{ background: 'var(--brand-light)', borderColor: 'color-mix(in srgb, var(--brand) 25%, transparent)' }}
                  >
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'var(--brand-dark)' }}>
                      <CheckCircle size={22} className="text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-slate-900 mb-1">Abstract Submitted Successfully!</h3>
                      <p className="text-slate-600 text-sm leading-relaxed">
                        Your abstract has been received. Login credentials have been sent to your email. Use them below to track your submission status.
                      </p>
                    </div>
                  </div>

                  {/* Credentials box */}
                  {submittedData?.loginId && (
                    <div className="rounded-2xl border border-slate-200 overflow-hidden">
                      <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-slate-100" style={{ background: '#f8fafc' }}>
                        <Key size={14} style={{ color: 'var(--brand-dark)' }} />
                        <span className="text-sm font-bold text-slate-700">Your Login Credentials</span>
                        <span className="text-xs text-slate-400 ml-1">also sent to your email</span>
                      </div>
                      <div className="p-5 bg-white">
                        <div className="grid sm:grid-cols-2 gap-4 mb-5">
                          <div>
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Login ID</p>
                            <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-slate-50 border border-slate-200">
                              <span className="font-mono font-bold text-sm text-slate-800 flex-1 select-all">{submittedData.loginId}</span>
                            </div>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Password</p>
                            <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-slate-50 border border-slate-200">
                              <span className="font-mono font-bold text-sm text-slate-800 flex-1 select-all">{submittedData.loginPassword}</span>
                            </div>
                          </div>
                        </div>
                        <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-4">
                          Save these credentials. You will need them to log in and track your abstract status.
                        </p>
                        <Link
                          to="/portal/login"
                          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-opacity hover:opacity-90"
                          style={{ background: 'linear-gradient(135deg, var(--brand-dark), var(--brand))' }}
                        >
                          <ExternalLink size={15} />
                          Track My Submission →
                        </Link>
                      </div>
                    </div>
                  )}

                  <Button onClick={() => { setSubmitted(false); setSubmittedData(null); }} variant="outline" className="self-start">
                    Submit Another Abstract
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
                  <SectionHeader title="Abstract Submission Form" subtitle="Fill in all required fields marked with *" centered={false} />

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">First Name <span className="text-red-500">*</span></label>
                      <input {...register('firstName', { required: 'Required' })} className={INPUT_CLS} onFocus={FOCUS} onBlur={BLUR} />
                      {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName.message}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Last Name <span className="text-red-500">*</span></label>
                      <input {...register('lastName', { required: 'Required' })} className={INPUT_CLS} onFocus={FOCUS} onBlur={BLUR} />
                      {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName.message}</p>}
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email <span className="text-red-500">*</span></label>
                      <input type="email" {...register('email', { required: 'Required' })} className={INPUT_CLS} onFocus={FOCUS} onBlur={BLUR} />
                      {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Institution / Affiliation</label>
                      <input {...register('organization')} className={INPUT_CLS} onFocus={FOCUS} onBlur={BLUR} />
                    </div>
                  </div>

                  <Controller
                    name="country"
                    control={control}
                    rules={{ required: 'Required' }}
                    render={({ field }) => (
                      <Select
                        label="Country"
                        required
                        placeholder="Select country..."
                        searchable
                        searchPlaceholder="Search countries..."
                        options={COUNTRY_OPTIONS}
                        value={field.value}
                        onChange={field.onChange}
                        error={errors.country?.message}
                      />
                    )}
                  />

                  <div>
                    <Controller
                      name="presentationType"
                      control={control}
                      rules={{ required: 'Required' }}
                      render={({ field }) => (
                        <Select
                          label="Presentation Type"
                          required
                          placeholder="Select presentation type..."
                          options={PRESENTATION_TYPES}
                          value={field.value}
                          onChange={field.onChange}
                          error={errors.presentationType?.message}
                        />
                      )}
                    />
                  </div>

                  {topics.length > 0 && (
                    <div>
                      <Controller
                        name="topic"
                        control={control}
                        render={({ field }) => (
                          <Select
                            label="Topic / Track"
                            placeholder="Select a topic..."
                            options={topics.map((t) => ({ value: t._id, label: t.title }))}
                            value={field.value}
                            onChange={field.onChange}
                          />
                        )}
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Abstract Title <span className="text-red-500">*</span></label>
                    <input
                      {...register('abstractTitle', { required: 'Required', maxLength: { value: 200, message: 'Max 200 characters' } })}
                      className={INPUT_CLS}
                      onFocus={FOCUS} onBlur={BLUR}
                    />
                    {errors.abstractTitle && <p className="text-red-500 text-xs mt-1">{errors.abstractTitle.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Abstract Text <span className="text-red-500">*</span> (250–400 words)</label>
                    <textarea
                      {...register('abstractText', {
                        required: 'Required',
                        minLength: { value: 100, message: 'Too short' },
                        maxLength: { value: 3000, message: 'Max 3000 characters' },
                      })}
                      rows={8}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none bg-slate-50 focus:bg-white transition-colors resize-y"
                      onFocus={FOCUS} onBlur={BLUR}
                    />
                    {errors.abstractText && <p className="text-red-500 text-xs mt-1">{errors.abstractText.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Keywords (comma-separated)</label>
                    <input
                      {...register('keywords')}
                      placeholder="e.g., senescence, longevity, inflammation"
                      className={INPUT_CLS}
                      onFocus={FOCUS} onBlur={BLUR}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Co-Authors (if any)</label>
                    <input
                      {...register('coAuthors')}
                      placeholder="e.g., Jane Smith (Harvard), John Doe (MIT)"
                      className={INPUT_CLS}
                      onFocus={FOCUS} onBlur={BLUR}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Abstract Document (PDF, DOC, DOCX)</label>
                    {/* Hidden native input react-hook-form registers it */}
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                      name={fileReg.name}
                      onChange={fileReg.onChange}
                      onBlur={fileReg.onBlur}
                      ref={(el) => { fileReg.ref(el); fileInputRef.current = el; }}
                      style={{ display: 'none' }}
                      id="abstract-file-upload"
                    />
                    {/* Styled drop zone */}
                    {(() => {
                      const selectedFile = watch('file');
                      const hasFile = selectedFile instanceof FileList && selectedFile.length > 0;
                      const fileName = hasFile ? selectedFile[0].name : null;
                      const fileSize = hasFile ? (selectedFile[0].size / 1024).toFixed(0) + ' KB' : null;
                      return (
                        <div
                          onClick={() => fileInputRef.current?.click()}
                          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                          onDragLeave={() => setDragOver(false)}
                          onDrop={(e) => {
                            e.preventDefault();
                            setDragOver(false);
                            const file = e.dataTransfer.files[0];
                            if (file && fileInputRef.current) {
                              const dt = new DataTransfer();
                              dt.items.add(file);
                              fileInputRef.current.files = dt.files;
                              fileReg.onChange({ target: fileInputRef.current });
                            }
                          }}
                          style={{
                            border: `2px dashed ${dragOver ? 'var(--brand)' : hasFile ? '#22c55e' : '#cbd5e1'}`,
                            borderRadius: 14,
                            padding: '20px 16px',
                            background: dragOver ? 'color-mix(in srgb, var(--brand) 5%, transparent)' : hasFile ? '#f0fdf4' : '#f8fafc',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 14,
                            userSelect: 'none',
                          }}
                        >
                          <div style={{
                            width: 44, height: 44, borderRadius: 10, flexShrink: 0,
                            background: hasFile ? '#dcfce7' : '#e2e8f0',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            transition: 'background 0.2s',
                          }}>
                            {hasFile
                              ? <FileText size={20} style={{ color: '#16a34a' }} />
                              : <UploadCloud size={20} style={{ color: '#94a3b8' }} />
                            }
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            {hasFile ? (
                              <>
                                <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#166534', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  {fileName}
                                </p>
                                <p style={{ margin: '2px 0 0', fontSize: 11, color: '#4ade80' }}>{fileSize} · Click to change</p>
                              </>
                            ) : (
                              <>
                                <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#475569' }}>
                                  {dragOver ? 'Drop your file here' : 'Click to upload or drag & drop'}
                                </p>
                                <p style={{ margin: '2px 0 0', fontSize: 11, color: '#94a3b8' }}>PDF, DOC, DOCX · Max 10 MB</p>
                              </>
                            )}
                          </div>
                          {hasFile && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (fileInputRef.current) {
                                  fileInputRef.current.value = '';
                                  fileReg.onChange({ target: fileInputRef.current });
                                }
                              }}
                              style={{ padding: 6, borderRadius: 8, background: '#fee2e2', border: 'none', color: '#dc2626', cursor: 'pointer', flexShrink: 0 }}
                            >
                              <X size={14} />
                            </button>
                          )}
                        </div>
                      );
                    })()}
                  </div>

                  <Button type="submit" size="lg" loading={loading} disabled={loading}>
                    <Send size={16} /> Submit Abstract
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
