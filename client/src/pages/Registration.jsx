import { useEffect, useRef, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import toast from 'react-hot-toast';
import { CheckCircle, ArrowLeft, CreditCard, ShieldCheck } from 'lucide-react';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import ReCAPTCHA from 'react-google-recaptcha';
import PageHero from '../components/ui/PageHero';
import SectionHeader from '../components/ui/SectionHeader';
import Button from '../components/ui/Button';
import Select from '../components/ui/Select';
import PhoneInput from '../components/ui/PhoneInput';
import Spinner from '../components/ui/Spinner';
import { submissionsAPI } from '../api/submissions';
import { congressAPI } from '../api/congress';
import { usecongress } from '../context/congressContext';
import { getErrorMessage, CATEGORY_LABELS } from '../utils/helpers';
import { COUNTRY_OPTIONS } from '../utils/countries';

const ATTENDANCE_MODES = [
  { value: 'in_person', label: 'In-Person' },
  { value: 'virtual', label: 'Virtual' },
];

const PAYPAL_CLIENT_ID = import.meta.env.VITE_PAYPAL_CLIENT_ID;
const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY;

export default function Registration() {
  const { activeEdition } = usecongress();
  const [editions, setEditions] = useState([]);
  const [editionsLoading, setEditionsLoading] = useState(true);
  const [pricing, setPricing] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [pricingLoading, setPricingLoading] = useState(false);

  // step: 'form' | 'payment'
  const [step, setStep] = useState('form');
  const [pendingData, setPendingData] = useState(null);
  const [registrationId, setRegistrationId] = useState(null);
  const [paypalCapturing, setPaypalCapturing] = useState(false);
  const [captchaToken, setCaptchaToken] = useState(null);
  const recaptchaRef = useRef(null);
  const registrationIdRef = useRef(null);

  const { register, handleSubmit, control, formState: { errors }, watch, setValue, reset } = useForm();
  const selectedCategory = watch('category');
  const selectedEdition = watch('edition');
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
      .catch(() => setEditions([]))
      .finally(() => setEditionsLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeEdition]);

  useEffect(() => {
    if (!selectedEdition) { setPricing([]); return; }
    setPricingLoading(true);
    submissionsAPI.getPricing({ edition: selectedEdition })
      .then((res) => {
        const data = res.data?.data ?? res.data ?? [];
        setPricing(Array.isArray(data) ? data : []);
      })
      .catch(() => setPricing([]))
      .finally(() => setPricingLoading(false));
  }, [selectedEdition]);

  const activeTier = pricing.find((p) => p.isActive);
  const activePrices = activeTier?.prices || {};
  const selectedAmount = selectedCategory ? activePrices[selectedCategory] : undefined;

  // Step 1: validate → go to payment step
  const proceedToPayment = handleSubmit((data) => {
    if (!data.edition) { toast.error('Please select a congress edition.'); return; }
    const amount = activePrices[data.category];
    if (!amount || amount <= 0) { toast.error('No pricing found for selected category. Please select a different category or try again.'); return; }
    setPendingData({ ...data, amount, pricingTier: activeTier?._id, currency: 'USD' });
    setCaptchaToken(null);
    recaptchaRef.current?.reset();
    setStep('payment');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  const createPaypalOrder = async () => {
    if (!captchaToken) {
      toast.error('Please complete the CAPTCHA verification first.');
      throw new Error('captcha required');
    }
    const payload = {
      ...pendingData,
      notes: pendingData.specialRequirements,
      captchaToken,
    };
    try {
      const res = await submissionsAPI.createPaypalOrder(payload);
      const regId = res.data.registrationId;
      setRegistrationId(regId);
      registrationIdRef.current = regId;
      return res.data.orderId;
    } catch (err) {
      toast.error(getErrorMessage(err));
      throw err;
    }
  };

  const onPaypalApprove = async (data) => {
    setPaypalCapturing(true);
    try {
      const regId = registrationIdRef.current;
      await submissionsAPI.capturePaypalOrder({ orderId: data.orderID, registrationId: regId });
      setSubmitted(true);
      setStep('form');
      reset();
      setPendingData(null);
      setRegistrationId(null);
      registrationIdRef.current = null;
      setCaptchaToken(null);
      recaptchaRef.current?.reset();
    } catch {
      toast.error('Payment processed but confirmation failed. Please contact support.');
    } finally {
      setPaypalCapturing(false);
    }
  };

  const onPaypalError = () => toast.error('Payment failed or was cancelled. Please try again.');

  const editionLabel = editions.find((e) => e._id === pendingData?.edition);

  const inputCls = 'w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500';

  /* Mobile step progress */
  const StepBar = () => (
    <div className="flex items-center gap-0 mb-6 lg:hidden">
      <div className="flex items-center gap-2">
        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${step === 'form' ? 'bg-teal-600 text-white' : 'bg-green-500 text-white'}`}>
          {step === 'form' ? '1' : <CheckCircle size={14} />}
        </div>
        <span className={`text-xs font-semibold ${step === 'form' ? 'text-teal-700' : 'text-green-600'}`}>Your Details</span>
      </div>
      <div className="flex-1 mx-3 h-px bg-slate-200" />
      <div className="flex items-center gap-2">
        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${step === 'payment' ? 'bg-teal-600 text-white' : 'bg-slate-200 text-slate-400'}`}>2</div>
        <span className={`text-xs font-semibold ${step === 'payment' ? 'text-teal-700' : 'text-slate-400'}`}>Payment</span>
      </div>
    </div>
  );

  return (
    <div>
      <PageHero
        title="Registration"
        subtitle="Register for the Aging congress and secure your spot."
        breadcrumb={[{ label: 'Home', href: '/' }, { label: 'Registration' }]}
      />

      <section className="section-padding bg-white">
        <div className="container-custom">
          {submitted ? (
            <div className="max-w-lg mx-auto text-center py-12 sm:py-16 px-6 bg-green-50 rounded-2xl border border-green-100">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={28} className="text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Registration Confirmed!</h3>
              <p className="text-slate-600 mb-2">Your payment was successful. A confirmation email has been sent.</p>
              <Button onClick={() => setSubmitted(false)} variant="outline" className="mt-6">Register Another</Button>
            </div>
          ) : step === 'payment' ? (
            /* ── Payment Step ── */
            <div className="max-w-lg mx-auto">
              <StepBar />

              <button
                onClick={() => setStep('form')}
                className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-5 transition-colors"
              >
                <ArrowLeft size={15} /> Edit Registration
              </button>

              <SectionHeader title="Complete Payment" centered={false} />

              {/* Summary card — mobile-friendly stacked layout */}
              <div className="rounded-2xl border border-slate-100 overflow-hidden mb-6 shadow-sm">
                <div className="bg-slate-800 px-5 py-3">
                  <p className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Registration Summary</p>
                </div>
                <div className="bg-white divide-y divide-slate-50">
                  {[
                    { label: 'Name', value: `${pendingData?.title ? pendingData.title + ' ' : ''}${pendingData?.firstName} ${pendingData?.lastName}` },
                    { label: 'Email', value: pendingData?.email },
                    { label: 'Edition', value: editionLabel ? `${editionLabel.title} (${editionLabel.year})` : '—' },
                    { label: 'Category', value: CATEGORY_LABELS[pendingData?.category] ?? pendingData?.category },
                    { label: 'Attendance', value: pendingData?.attendanceMode === 'in_person' ? 'In-Person' : 'Virtual' },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-start justify-between px-5 py-2.5 gap-4">
                      <span className="text-xs text-slate-400 font-medium shrink-0 w-20">{label}</span>
                      <span className="text-sm font-medium text-slate-800 text-right">{value}</span>
                    </div>
                  ))}
                </div>
                <div className="bg-teal-600 px-5 py-3 flex items-center justify-between">
                  <span className="text-sm font-semibold text-teal-100">Total Due</span>
                  <span className="text-xl font-bold text-white">USD {pendingData?.amount?.toLocaleString()}</span>
                </div>
              </div>

              {RECAPTCHA_SITE_KEY && (
                <div className="flex flex-col items-center gap-2 my-5">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                    <ShieldCheck size={13} /> Verify you&apos;re human before proceeding
                  </div>
                  <ReCAPTCHA
                    ref={recaptchaRef}
                    sitekey={RECAPTCHA_SITE_KEY}
                    onChange={(token) => setCaptchaToken(token)}
                    onExpired={() => setCaptchaToken(null)}
                  />
                </div>
              )}

              {paypalCapturing ? (
                <div className="flex flex-col items-center gap-3 py-8">
                  <Spinner size="lg" />
                  <p className="text-sm text-slate-500">Confirming your payment…</p>
                </div>
              ) : (captchaToken || !RECAPTCHA_SITE_KEY) ? (
                <PayPalScriptProvider options={{ 'client-id': PAYPAL_CLIENT_ID, currency: 'USD', intent: 'capture' }}>
                  <PayPalButtons
                    style={{ layout: 'vertical', color: 'blue', shape: 'rect', label: 'pay' }}
                    createOrder={createPaypalOrder}
                    onApprove={onPaypalApprove}
                    onError={onPaypalError}
                    onCancel={() => toast('Payment cancelled.')}
                  />
                </PayPalScriptProvider>
              ) : (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center text-sm text-slate-500">
                  Complete the CAPTCHA above to enable payment.
                </div>
              )}

              <p className="text-xs text-slate-400 text-center mt-4 flex items-center justify-center gap-1.5">
                <CreditCard size={12} /> Secured by PayPal. Your payment details are never stored on our servers.
              </p>
            </div>
          ) : (
            /* ── Form Step ── */
            <div>
              <StepBar />

              {/* On mobile: form first, sidebar below. On desktop: sidebar left, form right */}
              <div className="flex flex-col-reverse lg:grid lg:grid-cols-3 lg:gap-12 gap-8">

                {/* Sidebar — appears below form on mobile */}
                <div className="space-y-5">
                  {pricingLoading ? (
                    <div className="flex justify-center py-8"><Spinner /></div>
                  ) : Object.keys(activePrices).length > 0 ? (
                    <div className="bg-slate-50 rounded-xl border border-slate-100 p-5">
                      <h3 className="font-bold text-slate-900 mb-3 text-sm">Registration Fees</h3>
                      {/* Mobile: horizontal scroll; Desktop: stacked */}
                      <div className="flex gap-3 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible">
                        {Object.entries(activePrices).filter(([, amount]) => amount > 0).map(([category, amount]) => (
                          <div key={category} className={`p-3 rounded-xl border shrink-0 lg:shrink min-w-[140px] lg:min-w-0 ${selectedCategory === category ? 'border-teal-500 bg-teal-50' : 'border-slate-200 bg-white'}`}>
                            <p className="font-semibold text-xs text-slate-700">{CATEGORY_LABELS[category] ?? category}</p>
                            <p className="text-teal-700 font-bold text-sm mt-0.5">USD {amount.toLocaleString()}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  <div className="bg-teal-50 rounded-xl border border-teal-100 p-5">
                    <h4 className="font-bold text-slate-900 mb-2.5 text-sm">What&apos;s Included</h4>
                    <ul className="text-sm text-slate-600 flex flex-col gap-2">
                      {['Full congress access', 'Congress materials', 'Certificate of participation', 'Networking events', 'Lunch & refreshments (in-person)'].map((item) => (
                        <li key={item} className="flex items-center gap-2">
                          <CheckCircle size={13} className="text-green-500 shrink-0" /> {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Form — appears first on mobile (flex-col-reverse makes last child first) */}
                <div className="lg:col-span-2">
                  <form onSubmit={proceedToPayment} className="flex flex-col gap-5">
                    <SectionHeader title="Registration Form" centered={false} />

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

                    {/* Title + Name: mobile = [Title|FirstName] / [LastName], desktop = 3-col */}
                    <div className="grid grid-cols-[90px_1fr] sm:grid-cols-[120px_1fr_1fr] gap-3 sm:gap-4">
                      <Controller
                        name="title"
                        control={control}
                        defaultValue="Dr."
                        render={({ field }) => (
                          <Select
                            label="Title"
                            required
                            options={[
                              { value: 'Dr.', label: 'Dr.' },
                              { value: 'Prof.', label: 'Prof.' },
                              { value: 'Mr.', label: 'Mr.' },
                              { value: 'Mrs.', label: 'Mrs.' },
                              { value: 'Ms.', label: 'Ms.' },
                              { value: 'Mx.', label: 'Mx.' },
                            ]}
                            value={field.value}
                            onChange={field.onChange}
                          />
                        )}
                      />
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">First Name <span className="text-red-500">*</span></label>
                        <input {...register('firstName', { required: 'Required' })} className={inputCls} />
                        {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName.message}</p>}
                      </div>
                      <div className="col-span-2 sm:col-span-1">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Last Name <span className="text-red-500">*</span></label>
                        <input {...register('lastName', { required: 'Required' })} className={inputCls} />
                        {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName.message}</p>}
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Email <span className="text-red-500">*</span></label>
                        <input type="email" {...register('email', { required: 'Required' })} className={inputCls} />
                        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Institution / Organization</label>
                        <input {...register('organization')} className={inputCls} />
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
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
                      <PhoneInput register={register} name="phone" countryValue={selectedCountry} label="Phone" placeholder="Phone number" />
                    </div>

                    <Controller
                      name="category"
                      control={control}
                      rules={{ required: 'Required' }}
                      render={({ field }) => (
                        <Select
                          label="Registration Category"
                          required
                          placeholder={pricingLoading ? 'Loading categories...' : Object.keys(activePrices).length === 0 ? 'No categories available' : 'Select category...'}
                          disabled={pricingLoading || Object.keys(activePrices).length === 0}
                          value={field.value}
                          onChange={field.onChange}
                          error={errors.category?.message}
                          options={
                            Object.entries(activePrices)
                              .filter(([, amount]) => amount > 0)
                              .map(([category, amount]) => ({
                                value: category,
                                label: `${CATEGORY_LABELS[category] ?? category} — USD ${amount}`,
                              }))
                          }
                        />
                      )}
                    />

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

                    {selectedAmount > 0 && (
                      <div className="bg-teal-50 border border-teal-100 rounded-xl px-4 py-3 flex items-center justify-between gap-3">
                        <span className="text-sm text-slate-600">Registration Fee</span>
                        <span className="font-bold text-teal-700 text-base">USD {selectedAmount.toLocaleString()}</span>
                      </div>
                    )}

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Alternate Email</label>
                        <input type="email" {...register('alternateEmail')} placeholder="Optional" className={inputCls} />
                      </div>
                      <PhoneInput register={register} name="whatsapp" countryValue={selectedCountry} label="WhatsApp Number" placeholder="Optional" />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Special Requirements or Dietary Needs</label>
                      <textarea {...register('specialRequirements')} rows={3}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none" />
                    </div>

                    <Button type="submit" size="lg" className="w-full">
                      <CreditCard size={16} /> Proceed to Payment
                    </Button>
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
