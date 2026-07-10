import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import toast from 'react-hot-toast';
import { CheckCircle, Send } from 'lucide-react';
import PageHero from '../components/ui/PageHero';
import SectionHeader from '../components/ui/SectionHeader';
import Button from '../components/ui/Button';
import Select from '../components/ui/Select';
import { peopleAPI } from '../api/people';
import { congressAPI } from '../api/congress';
import { usecongress } from '../context/congressContext';
import { getErrorMessage } from '../utils/helpers';
import { COUNTRY_OPTIONS } from '../utils/countries';

const INPUT_CLS =
  'w-full h-11 px-4 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white';
const TEXTAREA_CLS =
  'w-full px-4 py-3 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white';
const LABEL_CLS = 'block text-sm font-semibold text-slate-700 mb-1.5';
const ERROR_CLS = 'text-xs text-red-500 mt-1';

export default function BecomeASpeaker() {
  const { activeEdition } = usecongress();
  const [editions, setEditions] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
    setValue,
  } = useForm();

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
            <SectionHeader
              label="Speaker Nomination"
              title="Apply to Speak"
              subtitle="Tell us about yourself and your area of expertise. Our scientific committee reviews every application."
            />

            {submitted ? (
              <div className="flex flex-col items-start gap-4 bg-teal-50 border border-teal-200 rounded-lg p-8">
                <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
                  <CheckCircle size={24} className="text-teal-700" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 mb-1">Application Received!</h3>
                  <p className="text-slate-600 text-sm">
                    Thank you for your interest in speaking at the Aging congress. Our team will review your application and respond soon.
                  </p>
                </div>
                <Button variant="outline" onClick={() => setSubmitted(false)}>
                  Submit Another Application
                </Button>
              </div>
            ) : (
              <div className="bg-white border border-stone-200 rounded-lg p-6 lg:p-8">
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
                      <label className={LABEL_CLS}>Full Name *</label>
                      <input
                        {...register('name', { required: 'Name is required' })}
                        placeholder="Your full name"
                        className={INPUT_CLS}
                      />
                      {errors.name && <p className={ERROR_CLS}>{errors.name.message}</p>}
                    </div>
                    <div>
                      <label className={LABEL_CLS}>Email Address *</label>
                      <input
                        type="email"
                        {...register('email', {
                          required: 'Email is required',
                          pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email' },
                        })}
                        placeholder="you@example.com"
                        className={INPUT_CLS}
                      />
                      {errors.email && <p className={ERROR_CLS}>{errors.email.message}</p>}
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className={LABEL_CLS}>Phone Number</label>
                      <input
                        type="tel"
                        {...register('phone')}
                        placeholder="+1 (555) 000-0000"
                        className={INPUT_CLS}
                      />
                    </div>
                    <div>
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
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className={LABEL_CLS}>Organization / Institution</label>
                      <input {...register('organization')} placeholder="Your organization" className={INPUT_CLS} />
                    </div>
                    <div>
                      <label className={LABEL_CLS}>Designation</label>
                      <input {...register('designation')} placeholder="e.g. Professor" className={INPUT_CLS} />
                    </div>
                  </div>

                  <div>
                    <label className={LABEL_CLS}>Area of Expertise / Proposed Topic *</label>
                    <input
                      {...register('expertise', { required: 'This field is required' })}
                      placeholder="e.g. Cellular senescence, geroscience"
                      className={INPUT_CLS}
                    />
                    {errors.expertise && <p className={ERROR_CLS}>{errors.expertise.message}</p>}
                  </div>

                  <div>
                    <label className={LABEL_CLS}>Short Bio</label>
                    <textarea
                      {...register('bio')}
                      rows={4}
                      placeholder="A brief professional biography..."
                      className={TEXTAREA_CLS}
                    />
                  </div>

                  <div>
                    <label className={LABEL_CLS}>Additional Message</label>
                    <textarea
                      {...register('message')}
                      rows={4}
                      placeholder="Anything else you'd like the committee to know..."
                      className={TEXTAREA_CLS}
                    />
                  </div>

                  <div>
                    <Button type="submit" variant="primary" size="lg" loading={submitting}>
                      <Send size={16} />
                      Submit Application
                    </Button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
