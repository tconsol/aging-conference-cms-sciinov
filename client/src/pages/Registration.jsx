import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import toast from 'react-hot-toast';
import { CheckCircle, Send } from 'lucide-react';
import PageHero from '../components/ui/PageHero';
import SectionHeader from '../components/ui/SectionHeader';
import Button from '../components/ui/Button';
import Select from '../components/ui/Select';
import Spinner from '../components/ui/Spinner';
import { submissionsAPI } from '../api/submissions';
import { congressAPI } from '../api/congress';
import { usecongress } from '../context/congressContext';
import { getErrorMessage, CATEGORY_LABELS } from '../utils/helpers';

const ATTENDANCE_MODES = [
  { value: 'in_person', label: 'In-Person' },
  { value: 'virtual', label: 'Virtual' },
];

export default function Registration() {
  const { activeEdition } = usecongress();
  const [editions, setEditions] = useState([]);
  const [editionsLoading, setEditionsLoading] = useState(true);
  const [pricing, setPricing] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pricingLoading, setPricingLoading] = useState(false);

  const { register, handleSubmit, control, formState: { errors }, watch, setValue, reset } = useForm();
  const selectedCategory = watch('category');
  const selectedEdition = watch('edition');

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
      .catch(() => setEditions([]))
      .finally(() => setEditionsLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeEdition]);

  useEffect(() => {
    if (!selectedEdition) {
      setPricing([]);
      return;
    }
    setPricingLoading(true);
    submissionsAPI.getPricing({ edition: selectedEdition })
      .then((res) => {
        const data = res.data?.data ?? res.data ?? [];
        setPricing(Array.isArray(data) ? data : []);
      })
      .catch(() => setPricing([]))
      .finally(() => setPricingLoading(false));
  }, [selectedEdition]);

  const selectedPricing = pricing.find((p) => p.category === selectedCategory);

  const onSubmit = async (data) => {
    if (!data.edition) {
      toast.error('Please select a congress edition.');
      return;
    }
    setLoading(true);
    try {
      await submissionsAPI.submitRegistration(data);
      setSubmitted(true);
      reset();
      toast.success('Registration submitted! We will send a confirmation email shortly.');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageHero
        title="Registration"
        subtitle="Register for the Aging congress and secure your spot."
        breadcrumb={[{ label: 'Home', href: '/' }, { label: 'Registration' }]}
      />

      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Sidebar */}
            <div>
              {pricingLoading ? (
                <div className="flex justify-center py-8"><Spinner /></div>
              ) : pricing.length > 0 ? (
                <div className="bg-slate-50 rounded-lg border border-slate-100 p-6">
                  <h3 className="font-bold text-slate-900 mb-4">Registration Fees</h3>
                  <div className="flex flex-col gap-3">
                    {pricing.map((p) => (
                      <div key={p._id || p.category} className={`p-3 rounded-xl border ${selectedCategory === p.category ? 'border-teal-500 bg-teal-50' : 'border-slate-200 bg-white'}`}>
                        <p className="font-semibold text-sm text-slate-800">{CATEGORY_LABELS[p.category] ?? p.category}</p>
                        <p className="text-teal-700 font-bold">{p.currency ?? 'USD'} {p.amount?.toLocaleString()}</p>
                        {p.description && <p className="text-xs text-slate-500 mt-0.5">{p.description}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              <div className="mt-5 bg-teal-50 rounded-lg border border-teal-100 p-5">
                <h4 className="font-bold text-slate-900 mb-2">What's Included</h4>
                <ul className="text-sm text-slate-600 flex flex-col gap-1.5">
                  {['Full congress access', 'congress materials', 'Certificate of participation', 'Networking events', 'Lunch & refreshments (in-person)'].map((item) => (
                    <li key={item} className="flex items-center gap-2">
                      <CheckCircle size={13} className="text-green-500 shrink-0" /> {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Form */}
            <div className="lg:col-span-2">
              {submitted ? (
                <div className="text-center py-16 bg-green-50 rounded-lg border border-green-100">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle size={28} className="text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Registration Received!</h3>
                  <p className="text-slate-600 mb-2">Thank you for registering. A confirmation email has been sent to you.</p>
                  <p className="text-sm text-slate-500 mb-6">Payment instructions will be emailed to you shortly.</p>
                  <Button onClick={() => setSubmitted(false)} variant="outline">Register Another</Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
                  <SectionHeader title="Registration Form" centered={false} />

                  <div>
                    <Controller
                      name="edition"
                      control={control}
                      rules={{ required: 'Please select a congress edition' }}
                      render={({ field }) => (
                        <Select
                          label="Congress Edition"
                          required
                          placeholder={editionsLoading ? 'Loading editions...' : 'Select edition...'}
                          disabled={editionsLoading || editions.length === 0}
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
                      <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                      <input type="tel" {...register('phone')}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Institution / Organization *</label>
                      <input {...register('organization', { required: 'Required' })}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
                      {errors.organization && <p className="text-red-500 text-xs mt-1">{errors.organization.message}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Country *</label>
                      <input {...register('country', { required: 'Required' })}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
                      {errors.country && <p className="text-red-500 text-xs mt-1">{errors.country.message}</p>}
                    </div>
                  </div>

                  <div>
                    <Controller
                      name="category"
                      control={control}
                      rules={{ required: 'Required' }}
                      render={({ field }) => (
                        <Select
                          label="Registration Category"
                          required
                          placeholder="Select category..."
                          value={field.value}
                          onChange={field.onChange}
                          error={errors.category?.message}
                          options={
                            pricing.length > 0
                              ? pricing.map((p) => ({
                                value: p.category,
                                label: `${CATEGORY_LABELS[p.category] ?? p.category} — ${p.currency ?? 'USD'} ${p.amount}`,
                              }))
                              : Object.entries(CATEGORY_LABELS).map(([val, lbl]) => ({ value: val, label: lbl }))
                          }
                        />
                      )}
                    />
                  </div>

                  <div>
                    <Controller
                      name="attendanceMode"
                      control={control}
                      rules={{ required: 'Required' }}
                      render={({ field }) => (
                        <Select
                          label="Attendance Mode"
                          required
                          placeholder="Select attendance mode..."
                          options={ATTENDANCE_MODES}
                          value={field.value}
                          onChange={field.onChange}
                          error={errors.attendanceMode?.message}
                        />
                      )}
                    />
                  </div>

                  {selectedPricing && (
                    <div className="bg-teal-50 border border-teal-100 rounded-xl p-4">
                      <p className="text-sm text-slate-700">
                        Fee: <span className="font-bold text-teal-700">{selectedPricing.currency ?? 'USD'} {selectedPricing.amount?.toLocaleString()}</span>
                      </p>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Special Requirements or Dietary Needs</label>
                    <textarea {...register('specialRequirements')} rows={3}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none" />
                  </div>

                  <Button type="submit" size="lg" loading={loading} disabled={loading}>
                    <Send size={16} /> Submit Registration
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
