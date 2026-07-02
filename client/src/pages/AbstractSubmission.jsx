import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Send, FileText, AlertCircle } from 'lucide-react';
import PageHero from '../components/ui/PageHero';
import SectionHeader from '../components/ui/SectionHeader';
import Button from '../components/ui/Button';
import Select from '../components/ui/Select';
import Spinner from '../components/ui/Spinner';
import { submissionsAPI } from '../api/submissions';
import { congressAPI } from '../api/congress';
import { usecongress } from '../context/congressContext';
import { getErrorMessage } from '../utils/helpers';

const PRESENTATION_TYPES = [
  { value: 'oral_inperson', label: 'Oral Presentation (In-Person)' },
  { value: 'oral_virtual', label: 'Oral Presentation (Virtual)' },
  { value: 'poster_inperson', label: 'Poster (In-Person)' },
  { value: 'poster_virtual', label: 'Poster (Virtual)' },
];

export default function AbstractSubmission() {
  const { activeEdition } = usecongress();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dates, setDates] = useState([]);

  const { register, handleSubmit, control, formState: { errors }, reset } = useForm();

  useEffect(() => {
    const params = activeEdition?._id ? { edition: activeEdition._id } : {};
    congressAPI.getImportantDates(params)
      .then((res) => {
        const data = res.data?.data ?? res.data ?? [];
        setDates(Array.isArray(data) ? data.filter((d) => d.title?.toLowerCase().includes('abstract')) : []);
      })
      .catch(() => {});
  }, [activeEdition]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const payload = {
        ...data,
        edition: activeEdition?._id,
      };
      await submissionsAPI.submitAbstract(payload);
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
        subtitle="Submit your research abstract for consideration at the Aging congress."
        breadcrumb={[{ label: 'Home', href: '/' }, { label: 'Submit Abstract' }]}
      />

      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Sidebar info */}
            <div className="flex flex-col gap-5">
              <div className="bg-teal-50 rounded-lg border border-teal-100 p-6">
                <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <FileText size={18} className="text-teal-700" /> Submission Guidelines
                </h3>
                <ul className="text-sm text-slate-600 flex flex-col gap-2">
                  <li className="flex items-start gap-2"><span className="text-teal-500 font-bold mt-0.5">•</span> Abstract must be 250â€“400 words</li>
                  <li className="flex items-start gap-2"><span className="text-teal-500 font-bold mt-0.5">•</span> Written in English</li>
                  <li className="flex items-start gap-2"><span className="text-teal-500 font-bold mt-0.5">•</span> Include background, methods, results, and conclusion</li>
                  <li className="flex items-start gap-2"><span className="text-teal-500 font-bold mt-0.5">•</span> No tables or figures in the abstract text</li>
                  <li className="flex items-start gap-2"><span className="text-teal-500 font-bold mt-0.5">•</span> Each author may submit up to 2 abstracts</li>
                </ul>
              </div>

              {dates.length > 0 && (
                <div className="bg-amber-50 rounded-lg border border-amber-100 p-6">
                  <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                    <AlertCircle size={18} className="text-amber-600" /> Key Deadlines
                  </h3>
                  <div className="flex flex-col gap-2">
                    {dates.map((d) => (
                      <div key={d._id} className="text-sm">
                        <p className="font-semibold text-slate-700">{d.title}</p>
                        <p className="text-amber-700">{new Date(d.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Form */}
            <div className="lg:col-span-2">
              {submitted ? (
                <div className="text-center py-16 bg-green-50 rounded-lg border border-green-100">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Send size={28} className="text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Abstract Submitted!</h3>
                  <p className="text-slate-600 mb-6">Your abstract has been received. We'll review it and get back to you soon.</p>
                  <Button onClick={() => setSubmitted(false)} variant="outline">Submit Another</Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
                  <SectionHeader title="Abstract Submission Form" subtitle="Fill in all required fields marked with *" centered={false} />

                  {/* Author info */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">First Name *</label>
                      <input {...register('firstName', { required: 'Required' })}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
                      {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName.message}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Last Name *</label>
                      <input {...register('lastName', { required: 'Required' })}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
                      {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName.message}</p>}
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Email *</label>
                      <input type="email" {...register('email', { required: 'Required' })}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
                      {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Institution / Affiliation *</label>
                      <input {...register('organization', { required: 'Required' })}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
                      {errors.organization && <p className="text-red-500 text-xs mt-1">{errors.organization.message}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Country *</label>
                    <input {...register('country', { required: 'Required' })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
                    {errors.country && <p className="text-red-500 text-xs mt-1">{errors.country.message}</p>}
                  </div>

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

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Abstract Title *</label>
                    <input {...register('abstractTitle', { required: 'Required', maxLength: { value: 200, message: 'Max 200 characters' } })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
                    {errors.abstractTitle && <p className="text-red-500 text-xs mt-1">{errors.abstractTitle.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Abstract Text * (250â€“400 words)</label>
                    <textarea
                      {...register('abstractText', {
                        required: 'Required',
                        minLength: { value: 100, message: 'Too short' },
                        maxLength: { value: 3000, message: 'Max 3000 characters' },
                      })}
                      rows={8}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-y"
                    />
                    {errors.abstractText && <p className="text-red-500 text-xs mt-1">{errors.abstractText.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Keywords (comma-separated)</label>
                    <input {...register('keywords')}
                      placeholder="e.g., senescence, longevity, inflammation"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Co-Authors (if any)</label>
                    <input {...register('coAuthors')}
                      placeholder="e.g., Jane Smith (Harvard), John Doe (MIT)"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
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
