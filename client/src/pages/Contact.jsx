import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Mail, Phone, MapPin, Send, CheckCircle, Twitter, Linkedin, Facebook, Instagram, Youtube, Globe, MessageSquare } from 'lucide-react';
import PageHero from '../components/ui/PageHero';
import SectionHeader from '../components/ui/SectionHeader';
import Button from '../components/ui/Button';
import { contactAPI } from '../api/contact';
import { usecongress } from '../context/congressContext';
import { getErrorMessage } from '../utils/helpers';

const INPUT_CLS =
  'w-full h-11 px-4 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white';
const TEXTAREA_CLS =
  'w-full px-4 py-3 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white';
const LABEL_CLS = 'block text-sm font-semibold text-slate-700 mb-1.5';
const ERROR_CLS = 'text-xs text-red-500 mt-1';

const SOCIAL_ICONS = {
  twitter: Twitter,
  linkedin: Linkedin,
  facebook: Facebook,
  instagram: Instagram,
  youtube: Youtube,
};

export default function Contact() {
  const { siteSettings } = usecongress();
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      await contactAPI.send({
        name: data.name,
        email: data.email,
        phone: data.phone,
        subject: data.subject,
        message: data.message,
      });
      setSubmitted(true);
      reset();
      toast.success('Message sent! We will get back to you soon.');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const email = siteSettings?.contactEmail || 'contact@agingcongress.com';
  const phone = siteSettings?.contactPhone || null;
  const address = siteSettings?.address || null;
  const socialLinks = siteSettings?.socialLinks || {};

  const activeSocialLinks = Object.entries(socialLinks).filter(([, val]) => Boolean(val));

  return (
    <div>
      <PageHero
        title="Contact Us"
        subtitle="Have questions about the congress? Our team is ready to help."
        breadcrumb={[{ label: 'Home', href: '/' }, { label: 'Contact' }]}
      />

      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Left: Form */}
            <div className="lg:col-span-2">
              <SectionHeader
                label="Get in Touch"
                title="Contact Us"
                subtitle="Send us a message and we'll respond within 1–2 business days."
              />

              {submitted ? (
                <div className="flex flex-col items-start gap-4 bg-teal-50 border border-teal-200 rounded-lg p-8">
                  <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
                    <CheckCircle size={24} className="text-teal-700" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900 mb-1">Message Sent!</h3>
                    <p className="text-slate-600 text-sm">
                      Thank you for reaching out. We'll get back to you as soon as possible.
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
                      <label className={LABEL_CLS}>Subject *</label>
                      <input
                        {...register('subject', { required: 'Subject is required' })}
                        placeholder="What is your inquiry about?"
                        className={INPUT_CLS}
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
                      placeholder="Write your message here..."
                      className={TEXTAREA_CLS}
                    />
                    {errors.message && <p className={ERROR_CLS}>{errors.message.message}</p>}
                  </div>

                  <div>
                    <Button type="submit" variant="primary" size="lg" loading={submitting}>
                      <Send size={16} />
                      Send Message
                    </Button>
                  </div>
                </form>
              )}
            </div>

            {/* Right: Sidebar */}
            <div className="space-y-6">
              {/* Email card */}
              <div className="bg-stone-50 border border-stone-200 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 bg-teal-100 rounded-lg flex items-center justify-center shrink-0">
                    <Mail size={16} className="text-teal-700" />
                  </div>
                  <h3 className="font-black text-slate-900 text-sm">Email Us</h3>
                </div>
                <a
                  href={`mailto:${email}`}
                  className="text-teal-700 hover:text-teal-800 text-sm font-semibold transition-colors break-all"
                >
                  {email}
                </a>
                <p className="text-xs text-slate-500 mt-1">We respond within 1–2 business days</p>
              </div>

              {/* Address / phone card */}
              {(phone || address) && (
                <div className="bg-stone-50 border border-stone-200 rounded-lg p-6 space-y-4">
                  {phone && (
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 bg-teal-100 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                        <Phone size={16} className="text-teal-700" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-0.5">Phone</p>
                        <a
                          href={`tel:${phone}`}
                          className="text-sm font-semibold text-slate-900 hover:text-teal-700 transition-colors"
                        >
                          {phone}
                        </a>
                      </div>
                    </div>
                  )}
                  {address && (
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 bg-teal-100 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                        <MapPin size={16} className="text-teal-700" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-0.5">Office Address</p>
                        <p className="text-sm text-slate-700 leading-relaxed">{address}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Support tickets */}
              <div className="bg-stone-50 border border-stone-200 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 bg-teal-100 rounded-lg flex items-center justify-center shrink-0">
                    <MessageSquare size={16} className="text-teal-700" />
                  </div>
                  <h3 className="font-black text-slate-900 text-sm">Need More Help?</h3>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  Browse our FAQs or submit a support ticket for detailed assistance.
                </p>
                <Button to="/help" variant="secondary" size="sm">
                  Visit Help Centre
                </Button>
              </div>

              {/* Social links */}
              {activeSocialLinks.length > 0 && (
                <div className="bg-stone-50 border border-stone-200 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-9 h-9 bg-teal-100 rounded-lg flex items-center justify-center shrink-0">
                      <Globe size={16} className="text-teal-700" />
                    </div>
                    <h3 className="font-black text-slate-900 text-sm">Follow Us</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {activeSocialLinks.map(([platform, url]) => {
                      const Icon = SOCIAL_ICONS[platform.toLowerCase()] || Globe;
                      return (
                        <a
                          key={platform}
                          href={url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-stone-200 rounded-lg text-xs font-semibold text-slate-700 hover:border-teal-500 hover:text-teal-700 transition-colors capitalize"
                        >
                          <Icon size={13} />
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
