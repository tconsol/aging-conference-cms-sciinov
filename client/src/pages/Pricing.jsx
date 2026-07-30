import { useEffect, useState } from 'react';
import { CheckCircle, ArrowRight, Monitor, MapPin, Wifi } from 'lucide-react';
import PageHero from '../components/ui/PageHero';
import SectionHeader from '../components/ui/SectionHeader';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import { submissionsAPI } from '../api/submissions';
import { usecongress } from '../context/congressContext';
import { CATEGORY_LABELS } from '../utils/helpers';

const BASE_FEATURES = [
  'Full congress access (all sessions)',
  'Congress materials & proceedings',
  'Certificate of participation',
  'Access to recorded talks',
  'Networking events',
];

const INPERSON_EXTRAS = [
  'Lunch & refreshments (3 days)',
  'Congress dinner invitation',
  'Exclusive venue tours',
];

function PricingCard({ item, isInPerson, highlight }) {
  const label = CATEGORY_LABELS[item.category] ?? item.category;
  const features = isInPerson ? [...BASE_FEATURES, ...INPERSON_EXTRAS] : BASE_FEATURES;

  return (
    <div
      className="relative rounded-3xl overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-1"
      style={{
        background: highlight
          ? 'linear-gradient(150deg, var(--brand-dark) 0%, color-mix(in srgb, var(--brand-dark) 75%, black) 100%)'
          : 'white',
        border: highlight ? 'none' : '1.5px solid #e2e8f0',
        boxShadow: highlight ? '0 20px 60px rgba(0,0,0,0.18)' : '0 2px 12px rgba(0,0,0,0.06)',
      }}
    >
      {highlight && (
        <div className="absolute top-5 right-5">
          <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full" style={{ background: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.9)' }}>
            Popular
          </span>
        </div>
      )}

      <div className="p-7 pb-5">
        <div className="flex items-center gap-2.5 mb-5">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{
              background: highlight ? 'rgba(255,255,255,0.12)' : 'var(--brand-light)',
            }}
          >
            {isInPerson
              ? <MapPin size={16} style={{ color: highlight ? 'rgba(255,255,255,0.9)' : 'var(--brand-dark)' }} />
              : <Wifi size={16} style={{ color: highlight ? 'rgba(255,255,255,0.9)' : 'var(--brand-dark)' }} />
            }
          </div>
          <h3
            className="font-black text-base"
            style={{ color: highlight ? 'rgba(255,255,255,0.9)' : '#1e293b' }}
          >
            {label}
          </h3>
        </div>

        <div className="mb-6">
          <div className="flex items-end gap-1.5">
            <span className="text-sm font-semibold" style={{ color: highlight ? 'rgba(255,255,255,0.5)' : '#94a3b8' }}>USD</span>
            <span
              className="text-5xl font-black tabular-nums leading-none"
              style={{ color: highlight ? 'white' : '#0f172a' }}
            >
              {item.amount.toLocaleString()}
            </span>
          </div>
          <p className="text-xs mt-2 font-medium" style={{ color: highlight ? 'rgba(255,255,255,0.4)' : '#94a3b8' }}>
            per registrant
          </p>
        </div>

        <div
          className="w-full h-px mb-6"
          style={{ background: highlight ? 'rgba(255,255,255,0.1)' : '#f1f5f9' }}
        />

        <ul className="flex flex-col gap-3 mb-7">
          {features.map((f, i) => (
            <li key={f} className="flex items-center gap-3">
              <span
                className="w-4.5 h-4.5 rounded-full flex items-center justify-center shrink-0"
                style={{ background: highlight ? 'rgba(255,255,255,0.15)' : 'var(--brand-light)' }}
              >
                <CheckCircle
                  size={11}
                  style={{ color: highlight ? 'rgba(255,255,255,0.9)' : 'var(--brand-dark)' }}
                />
              </span>
              <span
                className="text-sm leading-snug"
                style={{ color: highlight ? (i < BASE_FEATURES.length ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.6)') : '#475569' }}
              >
                {f}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="p-7 pt-0 mt-auto">
        <Button
          to="/registration"
          className="w-full justify-center"
          style={
            highlight
              ? { background: 'white', color: 'var(--brand-dark)', border: 'none', fontWeight: 800 }
              : {}
          }
          size="lg"
        >
          Register Now <ArrowRight size={15} />
        </Button>
      </div>
    </div>
  );
}

export default function Pricing() {
  const { activeEdition } = usecongress();
  const [tier, setTier] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!activeEdition?._id) {
      setTier(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    submissionsAPI.getActivePricing({ edition: activeEdition._id })
      .then((res) => setTier(res.data?.data ?? res.data ?? null))
      .catch(() => setTier(null))
      .finally(() => setLoading(false));
  }, [activeEdition]);

  const categories = Object.entries(tier?.prices || {})
    .filter(([, amount]) => amount > 0)
    .map(([category, amount]) => ({ category, amount }));

  const inPerson = categories.filter((p) => p.category.includes('inperson'));
  const virtual  = categories.filter((p) => p.category.includes('virtual'));
  const other    = categories.filter((p) => !p.category.includes('inperson') && !p.category.includes('virtual'));

  return (
    <div>
      <PageHero
        title="Registration Pricing"
        subtitle="Transparent pricing for all attendee categories. Choose the format that works best for you."
        breadcrumb={[{ label: 'Home', href: '/' }, { label: 'Pricing' }]}
      />

      <section className="section-padding bg-white">
        <div className="container-custom">
          {loading ? (
            <div className="flex justify-center py-20"><Spinner size="lg" /></div>
          ) : categories.length === 0 ? (
            <div className="text-center py-20">
              <SectionHeader title="Pricing Coming Soon" subtitle="Registration fees for this edition will be published shortly." />
              <Button to="/contact" size="lg" variant="outline" className="mt-6">Contact Us for Information</Button>
            </div>
          ) : (
            <div className="flex flex-col gap-20">

              {/* In-Person */}
              {inPerson.length > 0 && (
                <div>
                  <div className="mb-10">
                    <div className="flex items-center gap-3 mb-2">
                      <MapPin size={18} style={{ color: 'var(--brand-dark)' }} />
                      <span className="text-xs font-black uppercase tracking-[0.2em]" style={{ color: 'var(--brand)' }}>
                        In-Person Attendance
                      </span>
                    </div>
                    <h2 className="text-3xl font-black text-slate-900">Attend at the Venue</h2>
                    <p className="text-slate-500 mt-2 max-w-md">Join us in person for the full congress experience — networking, workshops, and venue events.</p>
                  </div>
                  <div className={`grid gap-6 ${inPerson.length === 1 ? 'max-w-md' : inPerson.length === 2 ? 'sm:grid-cols-2 max-w-2xl' : 'sm:grid-cols-2 lg:grid-cols-3'}`}>
                    {inPerson.map((p, i) => (
                      <PricingCard key={p.category} item={p} isInPerson={true} highlight={i === 0} />
                    ))}
                  </div>
                </div>
              )}

              {/* Virtual */}
              {virtual.length > 0 && (
                <div>
                  <div className="mb-10">
                    <div className="flex items-center gap-3 mb-2">
                      <Wifi size={18} style={{ color: 'var(--brand-dark)' }} />
                      <span className="text-xs font-black uppercase tracking-[0.2em]" style={{ color: 'var(--brand)' }}>
                        Virtual Attendance
                      </span>
                    </div>
                    <h2 className="text-3xl font-black text-slate-900">Join from Anywhere</h2>
                    <p className="text-slate-500 mt-2 max-w-md">Participate remotely and access live streams, Q&A sessions, and recorded content from anywhere in the world.</p>
                  </div>
                  <div className={`grid gap-6 ${virtual.length === 1 ? 'max-w-md' : virtual.length === 2 ? 'sm:grid-cols-2 max-w-2xl' : 'sm:grid-cols-2 lg:grid-cols-3'}`}>
                    {virtual.map((p, i) => (
                      <PricingCard key={p.category} item={p} isInPerson={false} highlight={false} />
                    ))}
                  </div>
                </div>
              )}

              {/* Other */}
              {other.length > 0 && (
                <div>
                  <h2 className="text-2xl font-black text-slate-900 mb-8">Other Categories</h2>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {other.map((p) => (
                      <PricingCard key={p.category} item={p} isInPerson={false} highlight={false} />
                    ))}
                  </div>
                </div>
              )}

              {/* Comparison note */}
              <div
                className="rounded-3xl p-8 lg:p-10 border"
                style={{ background: 'var(--brand-light)', borderColor: 'color-mix(in srgb, var(--brand) 20%, transparent)' }}
              >
                <div className="grid lg:grid-cols-2 gap-8 items-center">
                  <div>
                    <div className="flex items-center gap-2.5 mb-3">
                      <Monitor size={18} style={{ color: 'var(--brand-dark)' }} />
                      <p className="text-xs font-black uppercase tracking-[0.2em]" style={{ color: 'var(--brand)' }}>
                        Need Help Choosing?
                      </p>
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 mb-2">Not sure which to pick?</h3>
                    <p className="text-slate-600 text-sm leading-relaxed">
                      Contact us and we'll help you pick the right registration category based on your role and institution. Group discounts may also be available.
                    </p>
                  </div>
                  <div className="flex gap-3 lg:justify-end flex-wrap">
                    <Button to="/contact" size="lg">Ask a Question <ArrowRight size={15} /></Button>
                    <Button to="/registration" variant="outline" size="lg">Register Now</Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
