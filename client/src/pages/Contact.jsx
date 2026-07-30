import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import {
  Mail, Phone, MapPin, Send, CheckCircle,
  Twitter, Linkedin, Facebook, Instagram, Youtube, Globe, MessageSquare,
} from 'lucide-react';
import PageHero from '../components/ui/PageHero';
import Button from '../components/ui/Button';
import { contactAPI } from '../api/contact';
import { usecongress } from '../context/congressContext';
import { getErrorMessage } from '../utils/helpers';

const INPUT_CLS =
  'w-full h-11 px-4 border border-slate-200 rounded-xl text-sm focus:outline-none bg-slate-50 focus:bg-white transition-colors';
const TEXTAREA_CLS =
  'w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none bg-slate-50 focus:bg-white transition-colors resize-none';
const LABEL_CLS = 'block text-sm font-semibold text-slate-700 mb-1.5';
const ERROR_CLS = 'text-xs text-red-500 mt-1';

const SOCIAL_ICONS = {
  twitter: Twitter,
  linkedin: Linkedin,
  facebook: Facebook,
  instagram: Instagram,
  youtube: Youtube,
};

function focusStyle(e) {
  e.target.style.borderColor = 'var(--brand)';
  e.target.style.boxShadow = '0 0 0 3px color-mix(in srgb, var(--brand) 15%, transparent)';
}
function blurStyle(e) {
  e.target.style.borderColor = '';
  e.target.style.boxShadow = '';
}

export default function Contact() {
  const { siteSettings } = usecongress();
  const [submitted, setSubmitted]   = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, formState: { errors }, reset } = useForm();

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      await contactAPI.send({ name: data.name, email: data.email, phone: data.phone, subject: data.subject, message: data.message });
      setSubmitted(true);
      reset();
      toast.success('Message sent! We will get back to you soon.');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const email          = siteSettings?.contactEmail || 'contact@agingcongress.com';
  const phone          = siteSettings?.contactPhone || null;
  const address        = siteSettings?.address || null;
  const socialLinks    = siteSettings?.socialLinks || {};
  const activeSocials  = Object.entries(socialLinks).filter(([, val]) => Boolean(val));

  return (
    <div>
      <PageHero
        title="Contact Us"
        subtitle="Have questions about the congress? Our team is ready to help."
        breadcrumb={[{ label: 'Home', href: '/' }, { label: 'Contact' }]}
      />

      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="grid lg:grid-cols-3 gap-10">

            {/* ── FORM (left 2/3) ─────────────────────────────────── */}
            <div className="lg:col-span-2">
              <div className="mb-8">
                <p className="text-xs font-black uppercase tracking-[0.25em] mb-2" style={{ color: 'var(--brand)' }}>
                  Get in Touch
                </p>
                <h2 className="text-3xl font-black text-slate-900">Send Us a Message</h2>
                <p className="text-slate-500 mt-2 text-sm">We respond within 1–2 business days.</p>
              </div>

              {submitted ? (
                <div
                  className="rounded-3xl p-10 flex flex-col items-start gap-5 border"
                  style={{ background: 'var(--brand-light)', borderColor: 'color-mix(in srgb, var(--brand) 25%, transparent)' }}
                >
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center"
                    style={{ background: 'var(--brand-dark)' }}
                  >
                    <CheckCircle size={26} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900 mb-1">Message Received!</h3>
                    <p className="text-slate-600 text-sm leading-relaxed max-w-md">
                      Thank you for reaching out. We'll get back to you as soon as possible, usually within 1–2 business days.
                    </p>
                  </div>
                  <Button variant="outline" onClick={() => setSubmitted(false)}>
                    Send Another Message
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className={LABEL_CLS}>Full Name *</label>
                      <input
                        {...register('name', { required: 'Name is required' })}
                        placeholder="Your full name"
                        className={INPUT_CLS}
                        onFocus={focusStyle} onBlur={blurStyle}
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
                        onFocus={focusStyle} onBlur={blurStyle}
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
                        onFocus={focusStyle} onBlur={blurStyle}
                      />
                    </div>
                    <div>
                      <label className={LABEL_CLS}>Subject *</label>
                      <input
                        {...register('subject', { required: 'Subject is required' })}
                        placeholder="What is your inquiry about?"
                        className={INPUT_CLS}
                        onFocus={focusStyle} onBlur={blurStyle}
                      />
                      {errors.subject && <p className={ERROR_CLS}>{errors.subject.message}</p>}
                    </div>
                  </div>

                  <div>
                    <label className={LABEL_CLS}>Message *</label>
                    <textarea
                      {...register('message', {
                        required: 'Message is required',
                        minLength: { value: 10, message: 'Message must be at least 10 characters' },
                      })}
                      rows={5}
                      placeholder="Write your message here…"
                      className={TEXTAREA_CLS}
                      onFocus={focusStyle} onBlur={blurStyle}
                    />
                    {errors.message && <p className={ERROR_CLS}>{errors.message.message}</p>}
                  </div>

                  <div>
                    <Button type="submit" size="lg" loading={submitting}>
                      <Send size={15} /> Send Message
                    </Button>
                  </div>
                </form>
              )}
            </div>

            {/* ── SIDEBAR ─────────────────────────────────────────── */}
            <div className="flex flex-col gap-4">
              {/* Email */}
              <div className="rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'var(--brand-light)' }}>
                    <Mail size={15} style={{ color: 'var(--brand-dark)' }} />
                  </div>
                  <h3 className="font-black text-slate-900 text-sm">Email Us</h3>
                </div>
                <a
                  href={`mailto:${email}`}
                  className="text-sm font-semibold transition-colors break-all hover:opacity-70"
                  style={{ color: 'var(--brand-dark)' }}
                >
                  {email}
                </a>
                <p className="text-xs text-slate-400 mt-1">Response within 1–2 business days</p>
              </div>

              {/* Phone / Address */}
              {(phone || address) && (
                <div className="rounded-2xl border border-slate-100 p-5 shadow-sm space-y-4">
                  {phone && (
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5" style={{ background: 'var(--brand-light)' }}>
                        <Phone size={15} style={{ color: 'var(--brand-dark)' }} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Phone</p>
                        <a href={`tel:${phone}`} className="text-sm font-semibold text-slate-900 hover:opacity-70 transition-opacity">{phone}</a>
                      </div>
                    </div>
                  )}
                  {address && (
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5" style={{ background: 'var(--brand-light)' }}>
                        <MapPin size={15} style={{ color: 'var(--brand-dark)' }} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Address</p>
                        <p className="text-sm text-slate-700 leading-relaxed">{address}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Help Centre */}
              <div className="rounded-2xl border border-slate-100 p-5 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'var(--brand-light)' }}>
                    <MessageSquare size={15} style={{ color: 'var(--brand-dark)' }} />
                  </div>
                  <h3 className="font-black text-slate-900 text-sm">Need More Help?</h3>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed mb-4">
                  Browse our FAQs or submit a support ticket for detailed assistance.
                </p>
                <Button to="/help" variant="secondary" size="sm">Visit Help Centre</Button>
              </div>

              {/* Social */}
              {activeSocials.length > 0 && (
                <div className="rounded-2xl border border-slate-100 p-5 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'var(--brand-light)' }}>
                      <Globe size={15} style={{ color: 'var(--brand-dark)' }} />
                    </div>
                    <h3 className="font-black text-slate-900 text-sm">Follow Us</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {activeSocials.map(([platform, url]) => {
                      const Icon = SOCIAL_ICONS[platform.toLowerCase()] || Globe;
                      return (
                        <a
                          key={platform}
                          href={url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-white hover:shadow-sm transition-all capitalize"
                        >
                          <Icon size={12} style={{ color: 'var(--brand-dark)' }} />
                          {platform}
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
