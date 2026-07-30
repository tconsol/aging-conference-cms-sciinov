import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import toast from 'react-hot-toast';
import {
  Users, Eye, Network, FlaskConical, Mic2, LayoutGrid,
  CheckCircle, Send, ArrowRight, Star,
} from 'lucide-react';
import PageHero from '../components/ui/PageHero';
import Button from '../components/ui/Button';
import Select from '../components/ui/Select';
import { contactAPI } from '../api/contact';
import { getErrorMessage } from '../utils/helpers';

const SPONSORSHIP_TYPES = [
  { value: 'platinum', label: 'Platinum — $25,000' },
  { value: 'gold',     label: 'Gold — $15,000' },
  { value: 'silver',   label: 'Silver — $8,000' },
  { value: 'bronze',   label: 'Bronze — $3,500' },
  { value: 'custom',   label: 'Custom Package' },
];

const INPUT_CLS = 'w-full h-11 px-4 border border-slate-200 rounded-xl text-sm focus:outline-none bg-slate-50 focus:bg-white transition-colors';
const FOCUS = (e) => { e.target.style.borderColor = 'var(--brand)'; e.target.style.boxShadow = '0 0 0 3px color-mix(in srgb, var(--brand) 15%, transparent)'; };
const BLUR  = (e) => { e.target.style.borderColor = ''; e.target.style.boxShadow = ''; };

const BENEFITS = [
  { icon: Users,        title: 'Reach 1,200+ Attendees',    desc: 'Direct exposure to researchers, clinicians, and policymakers from over 45 countries.' },
  { icon: Eye,          title: 'Brand Visibility',           desc: 'Premium logo placement across congress materials, website, signage, and digital channels.' },
  { icon: Network,      title: 'Networking Access',          desc: 'Exclusive access to networking events and priority introductions to key delegates.' },
  { icon: FlaskConical, title: 'Research Exposure',          desc: 'Align your brand with cutting-edge aging science and breakthrough clinical research.' },
  { icon: Mic2,         title: 'Thought Leadership',         desc: 'Speaking opportunities and panel invitations to position your organisation as an innovator.' },
  { icon: LayoutGrid,   title: 'Exhibition Space',           desc: 'Dedicated booth space in the exhibition hall for product showcases and demos.' },
];

const TIERS = [
  {
    name: 'Platinum', price: '$25,000', highlight: true,
    perks: [
      'Premier logo on all congress materials',
      'Keynote session naming rights',
      'Exhibition booth prime location (20×20 ft)',
      '8 complimentary full registrations',
      'Full-page ad in congress proceedings',
      'Exclusive VIP dinner invitation (4 guests)',
      'Dedicated social media campaign',
      'Post-congress attendee summary report',
    ],
  },
  {
    name: 'Gold', price: '$15,000', highlight: false,
    accent: '#b45309',
    perks: [
      'Logo on all congress materials',
      'Exhibition booth standard location (10×10 ft)',
      '5 complimentary full registrations',
      'Speaking opportunity (10 min)',
      'Full-page ad in congress proceedings',
      'Social media recognition package',
    ],
  },
  {
    name: 'Silver', price: '$8,000', highlight: false,
    accent: '#475569',
    perks: [
      'Logo on website and event signage',
      'Exhibition table (6 ft)',
      '3 complimentary registrations',
      'Half-page ad in proceedings',
      'Social media mention',
    ],
  },
  {
    name: 'Bronze', price: '$3,500', highlight: false,
    accent: '#9a5121',
    perks: [
      'Logo on congress website',
      '2 complimentary registrations',
      'Quarter-page ad in proceedings',
      'Social media mention',
    ],
  },
];

export default function Sponsorship() {
  const [submitted, setSubmitted]   = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, control, formState: { errors }, reset } = useForm();

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      await contactAPI.submitSponsorship({
        organizationName: data.organizationName,
        contactPerson: data.contactPerson,
        email: data.email,
        phone: data.phone,
        country: data.country,
        sponsorshipInterest: data.sponsorshipType,
        message: data.message,
      });
      setSubmitted(true);
      reset();
      toast.success('Sponsorship inquiry submitted! We will be in touch shortly.');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <PageHero
        title="Sponsorship Opportunities"
        subtitle="Partner with the world's leading aging science congress and connect with a global community of researchers."
        breadcrumb={[{ label: 'Home', href: '/' }, { label: 'Sponsorship' }]}
      />

      {/* ── WHY SPONSOR ─────────────────────────────────────────────── */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="mb-12">
            <p className="text-xs font-black uppercase tracking-[0.25em] mb-2" style={{ color: 'var(--brand)' }}>Why Sponsor</p>
            <h2 className="text-3xl font-black text-slate-900 mb-3">Reach the World's Aging Research Community</h2>
            <p className="text-slate-500 max-w-2xl leading-relaxed">
              Sponsoring the Aging Congress puts your organisation at the forefront of geroscience — the fastest-growing field in biomedical research.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px" style={{ background: '#e2e8f0', borderRadius: 20, overflow: 'hidden' }}>
            {BENEFITS.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="group bg-white hover:bg-slate-900 transition-colors duration-300 p-7 flex flex-col gap-4"
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center"
                  style={{ background: 'var(--brand-light)' }}
                >
                  <Icon size={20} style={{ color: 'var(--brand-dark)' }} className="group-hover:brightness-200 transition" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 group-hover:text-white transition-colors mb-1.5">{title}</h3>
                  <p className="text-sm text-slate-500 group-hover:text-slate-300 transition-colors leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TIERS ────────────────────────────────────────────────────── */}
      <section className="section-padding" style={{ background: '#f8fafc' }}>
        <div className="container-custom">
          <div className="mb-12 text-center">
            <p className="text-xs font-black uppercase tracking-[0.25em] mb-2" style={{ color: 'var(--brand)' }}>Packages</p>
            <h2 className="text-3xl font-black text-slate-900 mb-3">Choose Your Partnership Level</h2>
            <p className="text-slate-500 max-w-lg mx-auto">
              Each tier is designed to maximise your visibility and engagement with congress attendees.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {TIERS.map((tier) => (
              <div
                key={tier.name}
                className="relative rounded-3xl overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-1"
                style={{
                  background: tier.highlight
                    ? 'linear-gradient(150deg, var(--brand-dark) 0%, color-mix(in srgb, var(--brand-dark) 70%, black) 100%)'
                    : 'white',
                  border: tier.highlight ? 'none' : '1.5px solid #e2e8f0',
                  boxShadow: tier.highlight ? '0 20px 60px rgba(0,0,0,0.18)' : '0 2px 12px rgba(0,0,0,0.05)',
                }}
              >
                {tier.highlight && (
                  <div className="absolute top-4 right-4">
                    <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full" style={{ background: 'rgba(255,255,255,0.15)', color: 'white' }}>
                      <Star size={9} /> Premium
                    </span>
                  </div>
                )}

                <div className="p-6">
                  <h3
                    className="font-black text-xl mb-1"
                    style={{ color: tier.highlight ? 'white' : (tier.accent || '#0f172a') }}
                  >
                    {tier.name}
                  </h3>
                  <div className="flex items-end gap-1 mb-5">
                    <span className="text-4xl font-black tabular-nums" style={{ color: tier.highlight ? 'white' : '#0f172a' }}>
                      {tier.price}
                    </span>
                    <span className="text-xs mb-1.5" style={{ color: tier.highlight ? 'rgba(255,255,255,0.4)' : '#94a3b8' }}>/ edition</span>
                  </div>

                  <div className="w-full h-px mb-5" style={{ background: tier.highlight ? 'rgba(255,255,255,0.1)' : '#f1f5f9' }} />

                  <ul className="flex flex-col gap-2.5 mb-6">
                    {tier.perks.map((perk) => (
                      <li key={perk} className="flex items-start gap-2.5">
                        <CheckCircle
                          size={13}
                          className="shrink-0 mt-0.5"
                          style={{ color: tier.highlight ? 'rgba(255,255,255,0.7)' : 'var(--brand-dark)' }}
                        />
                        <span
                          className="text-xs leading-snug"
                          style={{ color: tier.highlight ? 'rgba(255,255,255,0.75)' : '#475569' }}
                        >
                          {perk}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="px-6 pb-6 mt-auto">
                  <a
                    href="#inquire"
                    className="flex items-center justify-center gap-2 w-full font-bold py-3 rounded-2xl text-sm transition-all"
                    style={
                      tier.highlight
                        ? { background: 'white', color: 'var(--brand-dark)' }
                        : { background: 'var(--brand-light)', color: 'var(--brand-dark)', border: '1.5px solid color-mix(in srgb, var(--brand) 30%, transparent)' }
                    }
                  >
                    Inquire Now <ArrowRight size={13} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── INQUIRY FORM ─────────────────────────────────────────────── */}
      <section id="inquire" className="section-padding bg-white">
        <div className="container-custom">
          <div className="max-w-2xl mx-auto">
            <div className="mb-10 text-center">
              <p className="text-xs font-black uppercase tracking-[0.25em] mb-2" style={{ color: 'var(--brand)' }}>Get Started</p>
              <h2 className="text-3xl font-black text-slate-900 mb-2">Sponsorship Inquiry</h2>
              <p className="text-slate-500 text-sm">Fill out the form and our partnerships team will contact you within 2 business days.</p>
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
                  <h3 className="text-xl font-black text-slate-900 mb-1">Inquiry Received!</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    Thank you for your interest. Our partnerships team will be in touch shortly to discuss the details.
                  </p>
                </div>
                <Button variant="outline" onClick={() => setSubmitted(false)}>Submit Another Inquiry</Button>
              </div>
            ) : (
              <div className="rounded-3xl border border-slate-100 p-8 shadow-sm">
                <p className="text-sm font-black text-slate-800 uppercase tracking-widest pb-4 mb-6 border-b border-slate-100">
                  Organisation Details
                </p>
                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Organisation Name *</label>
                      <input {...register('organizationName', { required: 'Required' })} placeholder="Your organisation" className={INPUT_CLS} onFocus={FOCUS} onBlur={BLUR} />
                      {errors.organizationName && <p className="text-red-500 text-xs mt-1">{errors.organizationName.message}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Contact Person *</label>
                      <input {...register('contactPerson', { required: 'Required' })} placeholder="Full name" className={INPUT_CLS} onFocus={FOCUS} onBlur={BLUR} />
                      {errors.contactPerson && <p className="text-red-500 text-xs mt-1">{errors.contactPerson.message}</p>}
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email Address *</label>
                      <input type="email" {...register('email', { required: 'Required', pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email' } })} placeholder="you@organisation.com" className={INPUT_CLS} onFocus={FOCUS} onBlur={BLUR} />
                      {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Phone Number</label>
                      <input type="tel" {...register('phone')} placeholder="+1 (555) 000-0000" className={INPUT_CLS} onFocus={FOCUS} onBlur={BLUR} />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Country</label>
                      <input {...register('country')} placeholder="Country of operation" className={INPUT_CLS} onFocus={FOCUS} onBlur={BLUR} />
                    </div>
                    <div>
                      <Controller
                        name="sponsorshipType"
                        control={control}
                        rules={{ required: 'Please select a sponsorship type' }}
                        render={({ field }) => (
                          <Select
                            label="Sponsorship Type"
                            required
                            placeholder="Select a tier..."
                            options={SPONSORSHIP_TYPES}
                            value={field.value}
                            onChange={field.onChange}
                            error={errors.sponsorshipType?.message}
                          />
                        )}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Additional Message</label>
                    <textarea
                      {...register('message')}
                      rows={4}
                      placeholder="Tell us about your sponsorship goals, any specific requirements, or questions..."
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none bg-slate-50 focus:bg-white transition-colors resize-none"
                      onFocus={FOCUS} onBlur={BLUR}
                    />
                  </div>

                  <Button type="submit" size="lg" loading={submitting}>
                    <Send size={15} /> Submit Inquiry
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
