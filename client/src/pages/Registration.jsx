import { useEffect, useRef, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import toast from 'react-hot-toast';
import {
  CheckCircle, ArrowLeft, CreditCard, ShieldCheck,
  Mic, Video, Image, Monitor, Users, Globe, GraduationCap,
  Tag, Minus, Plus,
} from 'lucide-react';
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

const PAYPAL_CLIENT_ID = import.meta.env.VITE_PAYPAL_CLIENT_ID;
const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY;
const TAX_RATE = 0.048;
const ACCOMPANYING_RATE = 300;

const TIER_LABELS = { early_bird: 'Early Bird', mid_term: 'Mid Term', on_spot: 'On Spot' };

const CAT_ICONS = {
  oral_inperson: Mic,
  oral_virtual: Video,
  poster_inperson: Image,
  poster_virtual: Monitor,
  listener_inperson: Users,
  listener_virtual: Globe,
  student: GraduationCap,
};

const getAttendanceMode = (cat) => (cat?.includes('virtual') ? 'virtual' : 'in_person');

/* ── Canvas particle animation ───────────────────────────────────────────── */
function FloatingDots() {
  const cvs = useRef(null);
  useEffect(() => {
    const canvas = cvs.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize();
    window.addEventListener('resize', resize);

    const dots = Array.from({ length: 55 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.45,
      vy: (Math.random() - 0.5) * 0.45,
      r: Math.random() * 1.6 + 0.6,
    }));

    let raf;
    const draw = () => {
      const w = canvas.width, h = canvas.height;
      ctx.clearRect(0, 0, w, h);
      dots.forEach((d) => {
        d.x += d.vx; d.y += d.vy;
        if (d.x < 0) d.x = w; if (d.x > w) d.x = 0;
        if (d.y < 0) d.y = h; if (d.y > h) d.y = 0;
        ctx.beginPath(); ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(45,212,191,0.5)'; ctx.fill();
      });
      for (let i = 0; i < dots.length; i++) for (let j = i + 1; j < dots.length; j++) {
        const dist = Math.hypot(dots[i].x - dots[j].x, dots[i].y - dots[j].y);
        if (dist < 130) {
          ctx.beginPath(); ctx.moveTo(dots[i].x, dots[i].y); ctx.lineTo(dots[j].x, dots[j].y);
          ctx.strokeStyle = `rgba(45,212,191,${0.13 * (1 - dist / 130)})`; ctx.lineWidth = 0.6; ctx.stroke();
        }
      }
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, []);
  return <canvas ref={cvs} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }} />;
}

/* ── Step progress bar ───────────────────────────────────────────────────── */
function StepBar({ current }) {
  const steps = [
    { key: 'form', label: 'Your Details' },
    { key: 'pricing', label: 'Registration Type' },
    { key: 'payment', label: 'Payment' },
  ];
  const idx = steps.findIndex((s) => s.key === current);
  return (
    <div className="flex items-center mb-8">
      {steps.map((s, i) => (
        <div key={s.key} className="flex items-center" style={{ flex: i < steps.length - 1 ? '1' : 'none' }}>
          <div className="flex items-center gap-2 shrink-0">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all
              ${i < idx ? 'bg-green-500 border-green-500 text-white' : i === idx ? 'bg-teal-600 border-teal-600 text-white' : 'bg-white border-slate-200 text-slate-400'}`}>
              {i < idx ? <CheckCircle size={14} /> : i + 1}
            </div>
            <span className={`text-xs font-semibold hidden sm:block ${i === idx ? 'text-teal-700' : i < idx ? 'text-green-600' : 'text-slate-400'}`}>{s.label}</span>
          </div>
          {i < steps.length - 1 && <div className="flex-1 mx-3 h-px bg-slate-200 mx-2" />}
        </div>
      ))}
    </div>
  );
}

/* ── Counter input ───────────────────────────────────────────────────────── */
function Counter({ value, onChange, min = 0, max = 20 }) {
  return (
    <div className="flex items-center gap-1.5">
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        className="w-9 h-9 rounded-lg bg-white border border-slate-200 shadow-sm flex items-center justify-center hover:bg-slate-50 active:bg-slate-100 transition-colors disabled:opacity-35 disabled:cursor-not-allowed"
      >
        <Minus size={14} className="text-slate-700" />
      </button>
      <div className="w-12 h-9 rounded-lg border-2 border-slate-300 bg-white flex items-center justify-center font-bold text-slate-900 text-lg select-none">
        {value}
      </div>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        className="w-9 h-9 rounded-lg bg-white border border-slate-200 shadow-sm flex items-center justify-center hover:bg-slate-50 active:bg-slate-100 transition-colors disabled:opacity-35 disabled:cursor-not-allowed"
      >
        <Plus size={14} className="text-slate-700" />
      </button>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════ */
export default function Registration() {
  const { activeEdition } = usecongress();
  const [editions, setEditions] = useState([]);
  const [editionsLoading, setEditionsLoading] = useState(true);
  const [pricing, setPricing] = useState([]);
  const [pricingLoading, setPricingLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // step: 'form' | 'pricing' | 'payment'
  const [step, setStep] = useState('form');
  const [formData, setFormData] = useState(null);   // step 1 data
  const [pendingData, setPendingData] = useState(null); // final payload
  const [registrationId, setRegistrationId] = useState(null);
  const [paypalCapturing, setPaypalCapturing] = useState(false);
  const [captchaToken, setCaptchaToken] = useState(null);
  const recaptchaRef = useRef(null);
  const registrationIdRef = useRef(null);
  const contentRef = useRef(null);

  // Pricing step state
  const [selectedCategory, setSelectedCategory] = useState('');
  const [participants, setParticipants] = useState(1);
  const [accompanying, setAccompanying] = useState(0);
  const [promoInput, setPromoInput] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [promoApplied, setPromoApplied] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const { register, handleSubmit, control, formState: { errors }, watch, setValue } = useForm();
  const selectedEdition = watch('edition');
  const selectedCountry = watch('country');

  useEffect(() => {
    congressAPI.getAll()
      .then((res) => {
        const data = res.data?.data ?? res.data ?? [];
        const list = Array.isArray(data) ? data.filter((e) => e.status !== 'past') : [];
        setEditions(list);
        const defaultId = (activeEdition?._id && list.some((e) => e._id === activeEdition._id))
          ? activeEdition._id : list[0]?._id;
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
        setPricing(Array.isArray(data) ? data.sort((a, b) => a.displayOrder - b.displayOrder) : []);
      })
      .catch(() => setPricing([]))
      .finally(() => setPricingLoading(false));
  }, [selectedEdition]);

  const activeTier = pricing.find((p) => p.isActive);
  const activePrices = activeTier?.prices || {};

  /* Pricing calculations */
  const basePrice = activePrices[selectedCategory] || 0;
  const participantsFee = basePrice * participants;
  const accompanyingFee = accompanying * ACCOMPANYING_RATE;
  const subtotal = participantsFee + accompanyingFee;
  const taxAmount = (subtotal - appliedDiscount) * TAX_RATE;
  const finalAmount = subtotal - appliedDiscount + taxAmount;

  /* Step 1 → pricing */
  const proceedToPricing = handleSubmit((data) => {
    if (!data.edition) { toast.error('Please select a congress edition.'); return; }
    setFormData(data);
    setSelectedCategory('');
    setParticipants(1);
    setAccompanying(0);
    setPromoInput('');
    setAppliedDiscount(0);
    setPromoApplied(false);
    setTermsAccepted(false);
    setStep('pricing');
    contentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  /* Step 2 → payment */
  const proceedToPayment = () => {
    if (!selectedCategory) { toast.error('Please select a registration category.'); return; }
    if (!activeTier) { toast.error('No active pricing tier available.'); return; }
    if (finalAmount <= 0) { toast.error('Invalid amount. Please check your selection.'); return; }
    const payload = {
      ...formData,
      category: selectedCategory,
      attendanceMode: getAttendanceMode(selectedCategory),
      amount: Math.round(finalAmount * 100) / 100,
      participants,
      accompanyingPersons: accompanying,
      accompanyingFee,
      taxAmount: Math.round(taxAmount * 100) / 100,
      discount: appliedDiscount,
      promoCode: promoApplied ? promoInput : '',
      pricingTier: activeTier._id,
      currency: 'USD',
    };
    setPendingData(payload);
    setCaptchaToken(null);
    recaptchaRef.current?.reset();
    setStep('payment');
    contentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handlePromoApply = () => {
    if (!promoInput.trim()) { toast.error('Enter a promo code.'); return; }
    // Placeholder: real implementation should call server to validate promo
    toast.error('Invalid or expired promo code.');
  };

  /* PayPal handlers */
  const createPaypalOrder = async () => {
    if (RECAPTCHA_SITE_KEY && !captchaToken) {
      toast.error('Please complete the CAPTCHA verification first.');
      throw new Error('captcha required');
    }
    try {
      const res = await submissionsAPI.createPaypalOrder({ ...pendingData, notes: pendingData.specialRequirements, captchaToken });
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
      await submissionsAPI.capturePaypalOrder({ orderId: data.orderID, registrationId: registrationIdRef.current });
      setSubmitted(true);
      setStep('form');
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

  const editionLabel = editions.find((e) => e._id === (pendingData?.edition || formData?.edition));
  const inputCls = 'w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500';

  /* ── Render ── */
  return (
    <PayPalScriptProvider options={{ 'client-id': PAYPAL_CLIENT_ID, currency: 'USD', intent: 'capture' }}>
    <div>
      <PageHero
        title="Registration"
        subtitle="Register for the Aging congress and secure your spot."
        breadcrumb={[{ label: 'Home', href: '/' }, { label: 'Registration' }]}
      />

      {submitted ? (
        <section className="section-padding bg-white">
          <div className="container-custom">
            <div className="max-w-lg mx-auto text-center py-12 sm:py-16 px-6 bg-green-50 rounded-2xl border border-green-100">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={28} className="text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Registration Confirmed!</h3>
              <p className="text-slate-600 mb-2">Your payment was successful. A confirmation email with your invoice has been sent.</p>
              <Button onClick={() => setSubmitted(false)} variant="outline" className="mt-6">Register Another</Button>
            </div>
          </div>
        </section>

      ) : step === 'payment' ? (
        /* ══ STEP 3 — Payment ══════════════════════════════════════════════ */
        <section className="section-padding bg-white">
          <div className="container-custom">
            <div className="max-w-lg mx-auto" ref={contentRef}>
              <StepBar current="payment" />
              <button onClick={() => setStep('pricing')}
                className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-5 transition-colors">
                <ArrowLeft size={15} /> Back to Registration Type
              </button>

              <SectionHeader title="Complete Payment" centered={false} />

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
                    { label: 'Participants', value: pendingData?.participants },
                    pendingData?.accompanyingPersons > 0 && { label: 'Accompanying', value: `${pendingData.accompanyingPersons} × $${ACCOMPANYING_RATE}` },
                  ].filter(Boolean).map(({ label, value }) => (
                    <div key={label} className="flex items-start justify-between px-5 py-2.5 gap-4">
                      <span className="text-xs text-slate-400 font-medium shrink-0 w-24">{label}</span>
                      <span className="text-sm font-medium text-slate-800 text-right">{value}</span>
                    </div>
                  ))}
                  {pendingData?.discount > 0 && (
                    <div className="flex items-center justify-between px-5 py-2.5 gap-4">
                      <span className="text-xs text-green-600 font-medium">Discount</span>
                      <span className="text-sm font-medium text-green-600">− USD {pendingData.discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between px-5 py-2.5 gap-4">
                    <span className="text-xs text-slate-400 font-medium">Tax (4.8%)</span>
                    <span className="text-sm font-medium text-slate-700">USD {pendingData?.taxAmount?.toFixed(2)}</span>
                  </div>
                </div>
                <div className="bg-teal-600 px-5 py-3 flex items-center justify-between">
                  <span className="text-sm font-semibold text-teal-100">Total Due</span>
                  <span className="text-xl font-bold text-white">USD {pendingData?.amount?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
              </div>

              {RECAPTCHA_SITE_KEY && (
                <div className="flex flex-col items-center gap-2 my-5">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                    <ShieldCheck size={13} /> Verify you&apos;re human before proceeding
                  </div>
                  <ReCAPTCHA ref={recaptchaRef} sitekey={RECAPTCHA_SITE_KEY}
                    onChange={(t) => setCaptchaToken(t)} onExpired={() => setCaptchaToken(null)} />
                </div>
              )}

              {paypalCapturing ? (
                <div className="flex flex-col items-center gap-3 py-8">
                  <Spinner size="lg" />
                  <p className="text-sm text-slate-500">Confirming your payment…</p>
                </div>
              ) : (captchaToken || !RECAPTCHA_SITE_KEY) ? (
                <PayPalButtons
                  style={{ layout: 'vertical', color: 'blue', shape: 'rect', label: 'pay' }}
                  createOrder={createPaypalOrder}
                  onApprove={onPaypalApprove}
                  onError={onPaypalError}
                  onCancel={() => toast('Payment cancelled.')}
                />
              ) : (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center text-sm text-slate-500">
                  Complete the CAPTCHA above to enable payment.
                </div>
              )}

              <p className="text-xs text-slate-400 text-center mt-4 flex items-center justify-center gap-1.5">
                <CreditCard size={12} /> Secured by PayPal. Your payment details are never stored on our servers.
              </p>
            </div>
          </div>
        </section>

      ) : step === 'pricing' ? (
        /* ══ STEP 2 — Pricing Selection (Light Theme) ══════════════════════ */
        <section className="section-padding bg-slate-50">
          <div className="container-custom" ref={contentRef}>
            <StepBar current="pricing" />

            <button onClick={() => setStep('form')}
              className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-6 transition-colors">
              <ArrowLeft size={15} /> Back to Details
            </button>

            {/* Heading */}
            <div className="mb-8">
              <p className="text-xs font-extrabold tracking-widest uppercase text-teal-600 mb-2">Step 2 of 3</p>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2">Choose Your Registration Type</h2>
              <p className="text-slate-500 text-sm">Select the pricing tier and category that matches your participation.</p>
            </div>

            {pricingLoading ? (
              <div className="flex justify-center py-16"><Spinner size="lg" /></div>
            ) : pricing.length === 0 ? (
              <div className="text-center text-slate-500 py-16">No pricing tiers available for this edition.</div>
            ) : (
              <div className="space-y-8">

                {/* ── Tier cards ── */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {pricing.map((tier) => {
                    const tierPrices = tier.prices || {};
                    const isActive = tier.isActive;
                    const cats = Object.entries(tierPrices);
                    return (
                      <div key={tier._id} className="relative rounded-2xl overflow-hidden shadow-sm"
                        style={{ border: isActive ? '2px solid #0d9488' : '1.5px solid #e2e8f0', opacity: isActive ? 1 : 0.72 }}>

                        {/* Header */}
                        <div className="px-5 py-4" style={{ background: isActive ? 'linear-gradient(135deg,#0f766e,#0d9488)' : '#f1f5f9' }}>
                          <p className="text-xs font-extrabold tracking-widest uppercase mb-0.5"
                            style={{ color: isActive ? '#99f6e4' : '#94a3b8' }}>
                            {TIER_LABELS[tier.name] || tier.name}
                          </p>
                          {tier.label && (
                            <p className="font-bold text-base" style={{ color: isActive ? '#fff' : '#475569', margin: 0 }}>{tier.label}</p>
                          )}
                          {tier.deadline && (
                            <p className="text-xs mt-1" style={{ color: isActive ? '#ccfbf1' : '#94a3b8' }}>
                              Ends {new Date(tier.deadline).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                            </p>
                          )}
                        </div>

                        {/* Registration Inactive ribbon */}
                        {!isActive && (
                          <div style={{
                            position: 'absolute', top: 20, right: -26, width: 120, textAlign: 'center',
                            background: '#dc2626', color: '#fff', fontSize: 9, fontWeight: 800,
                            letterSpacing: '0.04em', textTransform: 'uppercase', padding: '5px 0',
                            transform: 'rotate(35deg)', zIndex: 3, lineHeight: 1.4,
                          }}>Registration<br />Inactive</div>
                        )}

                        {/* Category rows */}
                        <div className="bg-white p-4 flex flex-col gap-2">
                          {cats.map(([cat, amt]) => {
                            const Icon = CAT_ICONS[cat] || Tag;
                            const isSelected = isActive && selectedCategory === cat;
                            return (
                              <button
                                key={cat}
                                type="button"
                                onClick={() => isActive && setSelectedCategory(cat)}
                                disabled={!isActive}
                                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-left w-full transition-all duration-150"
                                style={{
                                  border: isSelected ? '2px solid #0d9488' : '1.5px solid #e2e8f0',
                                  background: isSelected ? '#f0fdfa' : '#fafafa',
                                  cursor: isActive ? 'pointer' : 'default',
                                }}>
                                {/* Radio */}
                                <div className="shrink-0 rounded-full flex items-center justify-center"
                                  style={{
                                    width: 16, height: 16,
                                    border: isSelected ? '4px solid #0d9488' : '1.5px solid #cbd5e1',
                                    background: '#fff',
                                  }} />
                                <Icon size={14} className="shrink-0" style={{ color: isSelected ? '#0d9488' : '#94a3b8' }} />
                                <span className="flex-1 text-xs font-medium" style={{ color: isSelected ? '#0f766e' : (isActive ? '#374151' : '#9ca3af') }}>
                                  {CATEGORY_LABELS[cat] ?? cat}
                                </span>
                                <span className="text-xs font-bold whitespace-nowrap" style={{ color: isSelected ? '#0d9488' : (isActive ? '#374151' : '#9ca3af') }}>
                                  {amt > 0 ? `$${amt.toLocaleString()}` : '—'}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* ── Participants + Summary ── */}
                <div className="grid md:grid-cols-2 gap-6 items-start">

                  {/* Participants / Accompanying */}
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Participants & Companions</h3>

                    <div className="flex flex-col gap-5">
                      <div>
                        <p className="text-sm font-semibold text-slate-700 mb-3">Number of Participants</p>
                        <Counter value={participants} onChange={setParticipants} min={1} max={20} />
                      </div>
                      <div className="border-t border-slate-100 pt-5">
                        <p className="text-sm font-semibold text-slate-700 mb-1">Accompanying Persons</p>
                        <p className="text-xs text-slate-400 mb-3">${ACCOMPANYING_RATE} per person</p>
                        <Counter value={accompanying} onChange={setAccompanying} min={0} max={10} />
                      </div>
                    </div>
                  </div>

                  {/* Summary panel */}
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                    <div className="px-6 py-4 bg-teal-700">
                      <p className="text-xs font-extrabold tracking-widest uppercase text-teal-100">Registration Summary</p>
                    </div>

                    <div className="p-6 flex flex-col gap-3 flex-1">
                      {[
                        { label: 'Registration Price', value: basePrice > 0 ? `$${basePrice.toLocaleString()}` : '—' },
                        { label: 'No. of Participants', value: participants },
                        { label: `Accompanying (${accompanying} × $${ACCOMPANYING_RATE})`, value: `$${accompanyingFee.toLocaleString()}` },
                      ].map(({ label, value }) => (
                        <div key={label} className="flex items-center justify-between">
                          <span className="text-sm text-slate-500">{label}</span>
                          <span className="text-sm font-semibold text-slate-800">{value}</span>
                        </div>
                      ))}

                      {/* Promo */}
                      <div className="border-t border-slate-100 pt-4">
                        <p className="text-sm font-semibold text-slate-700 mb-2">Promo Code</p>
                        <div className="flex gap-2">
                          <input
                            value={promoInput}
                            onChange={(e) => { setPromoInput(e.target.value); setAppliedDiscount(0); setPromoApplied(false); }}
                            placeholder="Enter promo code"
                            className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-slate-50"
                          />
                          <button type="button" onClick={handlePromoApply}
                            className="px-4 py-2 rounded-lg bg-slate-800 text-white text-xs font-extrabold tracking-wide uppercase hover:bg-slate-700 transition-colors">
                            Apply
                          </button>
                        </div>
                      </div>

                      {/* Totals */}
                      <div className="border-t border-slate-100 pt-4 space-y-2.5">
                        <div className="flex justify-between">
                          <span className="text-sm text-slate-500">Total Price</span>
                          <span className="text-sm font-semibold text-slate-800">${subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-slate-500">Discount Applied</span>
                          <span className={`text-sm font-semibold ${appliedDiscount > 0 ? 'text-green-600' : 'text-slate-400'}`}>
                            {appliedDiscount > 0 ? `− $${appliedDiscount.toFixed(2)}` : '$0.00'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-slate-500">Tax (4.8%)</span>
                          <span className="text-sm font-semibold text-slate-800">${taxAmount.toFixed(2)}</span>
                        </div>
                      </div>

                      {/* Final */}
                      <div className="flex items-center justify-between bg-teal-600 rounded-xl px-4 py-3 mt-1">
                        <span className="text-sm font-bold text-teal-100">Final Price</span>
                        <span className="text-xl font-black text-white">
                          ${finalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 text-center">* All prices are in USD only</p>
                    </div>

                    {/* T&C + CTA */}
                    <div className="px-6 pb-6 space-y-3">
                      {/* Terms checkbox */}
                      <label className="flex items-start gap-3 cursor-pointer group p-3 rounded-xl border border-slate-200 hover:border-teal-300 hover:bg-teal-50/40 transition-all">
                        <div className="relative shrink-0 mt-0.5">
                          <input
                            type="checkbox"
                            checked={termsAccepted}
                            onChange={(e) => setTermsAccepted(e.target.checked)}
                            className="sr-only"
                          />
                          <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all
                            ${termsAccepted ? 'bg-teal-600 border-teal-600' : 'bg-white border-slate-300 group-hover:border-teal-400'}`}>
                            {termsAccepted && (
                              <svg width="11" height="8" viewBox="0 0 11 8" fill="none">
                                <path d="M1 4L4 7L10 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            )}
                          </div>
                        </div>
                        <span className="text-sm text-slate-600 leading-snug">
                          I confirm that I have read and agree to the{' '}
                          <a
                            href="/terms"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-teal-600 font-semibold underline underline-offset-2 hover:text-teal-700"
                            onClick={(e) => e.stopPropagation()}
                          >
                            Terms and Conditions
                          </a>
                          {' '}<span className="text-red-500">*</span>
                        </span>
                      </label>

                      <button
                        type="button"
                        onClick={proceedToPayment}
                        disabled={!selectedCategory || !termsAccepted}
                        className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl font-extrabold text-sm uppercase tracking-wide transition-all duration-200"
                        style={{
                          background: (selectedCategory && termsAccepted) ? '#0f766e' : '#e2e8f0',
                          color: (selectedCategory && termsAccepted) ? '#fff' : '#94a3b8',
                          cursor: (selectedCategory && termsAccepted) ? 'pointer' : 'not-allowed',
                        }}>
                        <CreditCard size={16} /> Proceed to Pay
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

      ) : (
        /* ══ STEP 1 — Personal Details ═════════════════════════════════════ */
        <section className="section-padding bg-white">
          <div className="container-custom">
            <StepBar current="form" />

            <div className="max-w-2xl mx-auto w-full">

              {/* Form */}
              <div>
                <form onSubmit={proceedToPricing} className="flex flex-col gap-5">
                  <SectionHeader title="Personal Information" centered={false} />

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

                  {/* Title + Name */}
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
                    Continue to Registration Type →
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
    </PayPalScriptProvider>
  );
}
