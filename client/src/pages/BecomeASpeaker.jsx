import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import toast from 'react-hot-toast';
import { CheckCircle, Send, Mic2 } from 'lucide-react';
import PageHero from '../components/ui/PageHero';
import Button from '../components/ui/Button';
import Select from '../components/ui/Select';
import { peopleAPI } from '../api/people';
import { congressAPI } from '../api/congress';
import { usecongress } from '../context/congressContext';
import { getErrorMessage } from '../utils/helpers';
import { COUNTRY_OPTIONS } from '../utils/countries';
import PhoneInput from '../components/ui/PhoneInput';

const INPUT_CLS = 'w-full h-11 px-4 border border-slate-200 rounded-xl text-sm focus:outline-none bg-slate-50 focus:bg-white transition-colors';
const TEXTAREA_CLS = 'w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none bg-slate-50 focus:bg-white transition-colors resize-none';
const LABEL_CLS = 'block text-sm font-semibold text-slate-700 mb-1.5';
const ERROR_CLS = 'text-xs text-red-500 mt-1';
const FOCUS = (e) => { e.target.style.borderColor = 'var(--brand)'; e.target.style.boxShadow = '0 0 0 3px color-mix(in srgb, var(--brand) 15%, transparent)'; };
const BLUR  = (e) => { e.target.style.borderColor = ''; e.target.style.boxShadow = ''; };

export default function BecomeASpeaker() {
  const { activeEdition } = usecongress();
  const [editions, setEditions]     = useState([]);
  const [submitted, setSubmitted]   = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, control, formState: { errors }, reset, setValue, watch } = useForm();
  const selectedCountry = watch('country');

  useEffect(() => {
    congressAPI.getAll()
      .then((res) => {
        const data = res.data?.data ?? res.data ?? [];
        const list = Array.isArray(data) ? data.filter((e) => e.status !== 'past') : [];
        setEditions(list);
        const defaultId = (activeEdition?._id && list.some((e) => e._id === activeEdition._id))
          ? activeEdition._id
          : list[0]?._id;
        if (defaultId) setValue('edition', defaultId);
      })
      .catch(() => setEditions([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeEdition]);

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      await peopleAPI.applyToSpeak(data);
      setSubmitted(true);
      reset();
      toast.success('Application submitted! We will be in touch shortly.');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <PageHero
        title="Become a Speaker"
        subtitle="Share your research with the world's leading aging and gerontology community."
        breadcrumb={[{ label: 'Home', href: '/' }, { label: 'Become a Speaker' }]}
      />

      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="max-w-2xl mx-auto">
            <div className="mb-10 text-center">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ background: 'var(--brand-light)' }}
              >
                <Mic2 size={24} style={{ color: 'var(--brand-dark)' }} />
              </div>
              <p className="text-xs font-black uppercase tracking-[0.25em] mb-2" style={{ color: 'var(--brand)' }}>
                Speaker Nomination
              </p>
              <h2 className="text-3xl font-black text-slate-900 mb-2">Apply to Speak</h2>
              <p className="text-slate-500 text-sm leading-relaxed max-w-md mx-auto">
                Tell us about yourself and your area of expertise. Our scientific committee reviews every application.
              </p>
            </div>

            {submitted ? (
              <div
                className="rounded-3xl p-10 flex flex-col items-start gap-5 border"
                style={{ background: 'var(--brand-light)', borderColor: 'color-mix(in srgb, var(--brand) 25%, transparent)' }}
              >
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'var(--brand-dark)' }}>
                  <CheckCircle size={26} className="text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 mb-1">Application Received!</h3>
                  <p className="text-slate-600 text-sm leading-relaxed max-w-md">
                    Thank you for your interest in speaking at the Aging Congress. Our team will review your application and respond soon.
                  </p>
                </div>
                <Button variant="outline" onClick={() => setSubmitted(false)}>Submit Another Application</Button>
              </div>
            ) : (
              <div className="rounded-3xl border border-slate-100 p-8 shadow-sm">
                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
                  <div>
                    <Controller
                      name="edition"
                      control={control}
                      rules={{ required: 'Please select a congress edition' }}
                      render={({ field }) => (
                        <Select
                          label="Congress Edition"
                          required
                          placeholder="Select edition..."
                          options={editions.map((e) => ({ value: e._id, label: `${e.title} (${e.year})` }))}
                          value={field.value}
                          onChange={field.onChange}
                          error={errors.edition?.message}
                        />
                      )}
                    />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className={LABEL_CLS}>Full Name <span className="text-red-500">*</span></label>
                      <input {...register('name', { required: 'Name is required' })} placeholder="Your full name" className={INPUT_CLS} onFocus={FOCUS} onBlur={BLUR} />
                      {errors.name && <p className={ERROR_CLS}>{errors.name.message}</p>}
                    </div>
                    <div>
                      <label className={LABEL_CLS}>Email Address <span className="text-red-500">*</span></label>
                      <input type="email" {...register('email', { required: 'Email is required', pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email' } })} placeholder="you@example.com" className={INPUT_CLS} onFocus={FOCUS} onBlur={BLUR} />
                      {errors.email && <p className={ERROR_CLS}>{errors.email.message}</p>}
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <Controller
                      name="country"
                      control={control}
                      render={({ field }) => (
                        <Select
                          label="Country"
                          placeholder="Select country..."
                          searchable
                          searchPlaceholder="Search countries..."
                          options={COUNTRY_OPTIONS}
                          value={field.value}
                          onChange={field.onChange}
                        />
                      )}
                    />
                    <PhoneInput
                      register={register}
                      name="phone"
                      countryValue={selectedCountry}
                      label="Phone Number"
                      placeholder="Phone number"
                    />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className={LABEL_CLS}>Organization / Institution</label>
                      <input {...register('organization')} placeholder="Your organization" className={INPUT_CLS} onFocus={FOCUS} onBlur={BLUR} />
                    </div>
                    <div>
                      <label className={LABEL_CLS}>Designation</label>
                      <input {...register('designation')} placeholder="e.g. Professor" className={INPUT_CLS} onFocus={FOCUS} onBlur={BLUR} />
                    </div>
                  </div>

                  <div>
                    <label className={LABEL_CLS}>Area of Expertise / Proposed Topic <span className="text-red-500">*</span></label>
                    <input {...register('expertise', { required: 'This field is required' })} placeholder="e.g. Cellular senescence, geroscience" className={INPUT_CLS} onFocus={FOCUS} onBlur={BLUR} />
                    {errors.expertise && <p className={ERROR_CLS}>{errors.expertise.message}</p>}
                  </div>

                  <div>
                    <label className={LABEL_CLS}>Short Bio</label>
                    <textarea {...register('bio')} rows={4} placeholder="A brief professional biography..." className={TEXTAREA_CLS} onFocus={FOCUS} onBlur={BLUR} />
                  </div>

                  <div>
                    <label className={LABEL_CLS}>Additional Message</label>
                    <textarea {...register('message')} rows={3} placeholder="Anything else you'd like the committee to know..." className={TEXTAREA_CLS} onFocus={FOCUS} onBlur={BLUR} />
                  </div>

                  <Button type="submit" size="lg" loading={submitting}>
                    <Send size={16} /> Submit Application
                  </Button>
                </form>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
