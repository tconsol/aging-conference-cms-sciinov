import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import {
  Users,
  Eye,
  Network,
  FlaskConical,
  Mic2,
  LayoutGrid,
  CheckCircle,
  Send,
  Star,
} from 'lucide-react';
import PageHero from '../components/ui/PageHero';
import SectionHeader from '../components/ui/SectionHeader';
import Button from '../components/ui/Button';
import { contactAPI } from '../api/contact';
import { getErrorMessage } from '../utils/helpers';

const INPUT_CLS =
  'w-full h-11 px-4 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white';
const TEXTAREA_CLS =
  'w-full px-4 py-3 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white';
const LABEL_CLS = 'block text-sm font-semibold text-slate-700 mb-1.5';
const ERROR_CLS = 'text-xs text-red-500 mt-1';

const BENEFITS = [
  {
    icon: Users,
    title: 'Reach 1,200+ Attendees',
    desc: 'Direct exposure to researchers, clinicians, and policymakers from over 45 countries.',
  },
  {
    icon: Eye,
    title: 'Brand Visibility',
    desc: 'Premium logo placement across congress materials, website, signage, and digital channels.',
  },
  {
    icon: Network,
    title: 'Networking Access',
    desc: 'Exclusive access to networking events and priority introductions to key delegates.',
  },
  {
    icon: FlaskConical,
    title: 'Research Exposure',
    desc: 'Align your brand with cutting-edge aging science and breakthrough clinical research.',
  },
  {
    icon: Mic2,
    title: 'Thought Leadership',
    desc: 'Speaking opportunities and panel invitations to position your organisation as an innovator.',
  },
  {
    icon: LayoutGrid,
    title: 'Exhibition Space',
    desc: 'Dedicated booth space in the exhibition hall for product showcases and demos.',
  },
];

const TIERS = [
  {
    name: 'Platinum',
    price: '$25,000',
    priceNote: 'per edition',
    border: 'border-2 border-amber-400',
    badge: true,
    badgeLabel: 'Premium',
    badgeCls: 'bg-amber-400 text-slate-900',
    highlight: true,
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
    name: 'Gold',
    price: '$15,000',
    priceNote: 'per edition',
    border: 'border-2 border-yellow-300',
    badge: false,
    highlight: false,
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
    name: 'Silver',
    price: '$8,000',
    priceNote: 'per edition',
    border: 'border-2 border-slate-300',
    badge: false,
    highlight: false,
    perks: [
      'Logo on website and event signage',
      'Exhibition table (6 ft)',
      '3 complimentary registrations',
      'Half-page ad in proceedings',
      'Social media mention',
    ],
  },
  {
    name: 'Bronze',
    price: '$3,500',
    priceNote: 'per edition',
    border: 'border-2 border-orange-300',
    badge: false,
    highlight: false,
    perks: [
      'Logo on congress website',
      '2 complimentary registrations',
      'Quarter-page ad in proceedings',
      'Social media mention',
    ],
  },
];

export default function Sponsorship() {
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

      {/* Section 1: Why Sponsor */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <SectionHeader
            label="Why Sponsor"
            title="Reach the World's Aging Research Community"
            subtitle="Sponsoring the Aging congress puts your organisation at the forefront of geroscience the fastest-growing field in biomedical research."
            centered
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {BENEFITS.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white border border-stone-200 rounded-lg p-6 hover:border-teal-300 transition-colors">
                <div className="w-11 h-11 bg-teal-50 rounded-lg flex items-center justify-center mb-4">
                  <Icon size={20} className="text-teal-700" />
                </div>
                <h3 className="font-black text-slate-900 mb-2 text-sm">{title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 2: Tiers */}
      <section className="section-padding bg-stone-50">
        <div className="container-custom">
          <SectionHeader
            label="Sponsorship Tiers"
            title="Choose Your Partnership Level"
            subtitle="Each tier is designed to maximise your visibility and engagement with congress attendees."
            centered
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {TIERS.map((tier) => (
              <div
                key={tier.name}
                className={`bg-white rounded-lg p-6 flex flex-col relative ${tier.border} ${
                  tier.highlight ? 'shadow-lg' : ''
                }`}
              >
                {tier.badge && (
                  <div className={`absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider ${tier.badgeCls}`}>
                    <Star size={10} className="inline mr-1 -mt-0.5" />
                    {tier.badgeLabel}
                  </div>
                )}

                <div className="mb-4 mt-2">
                  <h3 className="text-lg font-black text-slate-900 mb-1">{tier.name}</h3>
                  <p className="text-2xl font-black text-teal-700">{tier.price}</p>
                  <p className="text-xs text-slate-500">{tier.priceNote}</p>
                </div>

                <ul className="flex flex-col gap-2.5 flex-1 mb-6">
                  {tier.perks.map((perk) => (
                    <li key={perk} className="flex items-start gap-2 text-xs text-slate-600 leading-snug">
                      <CheckCircle size={13} className="text-teal-600 shrink-0 mt-0.5" />
                      {perk}
                    </li>
                  ))}
                </ul>

                <a
                  href="#inquire"
                  className="flex items-center justify-center w-full bg-teal-700 hover:bg-teal-800 text-white font-semibold py-2.5 rounded-lg transition-colors text-sm"
                >
                  Inquire Now
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 3: Inquiry Form */}
      <section id="inquire" className="section-padding bg-white">
        <div className="container-custom">
          <div className="max-w-2xl mx-auto">
            <SectionHeader
              label="Get Started"
              title="Sponsorship Inquiry"
              subtitle="Fill out the form and our partnerships team will contact you within 2 business days."
            />

            {submitted ? (
              <div className="flex flex-col items-start gap-4 bg-teal-50 border border-teal-200 rounded-lg p-8">
                <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
                  <CheckCircle size={24} className="text-teal-700" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 mb-1">Inquiry Received!</h3>
                  <p className="text-slate-600 text-sm">
                    Thank you for your interest. Our partnerships team will be in touch shortly to discuss the details.
                  </p>
                </div>
                <Button variant="outline" onClick={() => setSubmitted(false)}>
                  Submit Another Inquiry
                </Button>
              </div>
            ) : (
              <div className="bg-white border border-stone-200 rounded-lg p-6 lg:p-8">
                <p className="text-lg font-black text-slate-900 border-b border-stone-200 pb-2 mb-6">
                  Organisation Details
                </p>
                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className={LABEL_CLS}>Organisation Name *</label>
                      <input
                        {...register('organizationName', { required: 'Organisation name is required' })}
                        placeholder="Your organisation"
                        className={INPUT_CLS}
                      />
                      {errors.organizationName && (
                        <p className={ERROR_CLS}>{errors.organizationName.message}</p>
                      )}
                    </div>
                    <div>
                      <label className={LABEL_CLS}>Contact Person *</label>
                      <input
                        {...register('contactPerson', { required: 'Contact person is required' })}
                        placeholder="Full name"
                        className={INPUT_CLS}
                      />
                      {errors.contactPerson && (
                        <p className={ERROR_CLS}>{errors.contactPerson.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className={LABEL_CLS}>Email Address *</label>
                      <input
                        type="email"
                        {...register('email', {
                          required: 'Email is required',
                          pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email' },
                        })}
                        placeholder="you@organisation.com"
                        className={INPUT_CLS}
                      />
                      {errors.email && <p className={ERROR_CLS}>{errors.email.message}</p>}
                    </div>
                    <div>
                      <label className={LABEL_CLS}>Phone Number</label>
                      <input
                        type="tel"
                        {...register('phone')}
                        placeholder="+1 (555) 000-0000"
                        className={INPUT_CLS}
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className={LABEL_CLS}>Country</label>
                      <input
                        {...register('country')}
                        placeholder="Country of operation"
                        className={INPUT_CLS}
                      />
                    </div>
                    <div>
                      <label className={LABEL_CLS}>Sponsorship Type *</label>
                      <select
                        {...register('sponsorshipType', { required: 'Please select a sponsorship type' })}
                        className="w-full h-11 px-4 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white"
                      >
                        <option value="">Select a tier...</option>
                        <option value="platinum">Platinum $25,000</option>
                        <option value="gold">Gold $15,000</option>
                        <option value="silver">Silver $8,000</option>
                        <option value="bronze">Bronze $3,500</option>
                        <option value="custom">Custom Package</option>
                      </select>
                      {errors.sponsorshipType && (
                        <p className={ERROR_CLS}>{errors.sponsorshipType.message}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className={LABEL_CLS}>Additional Message</label>
                    <textarea
                      {...register('message')}
                      rows={5}
                      placeholder="Tell us about your sponsorship goals, any specific requirements, or questions..."
                      className={TEXTAREA_CLS}
                    />
                  </div>

                  <div>
                    <Button type="submit" variant="primary" size="lg" loading={submitting}>
                      <Send size={16} />
                      Submit Inquiry
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
