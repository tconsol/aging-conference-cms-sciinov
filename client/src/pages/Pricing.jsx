import { useEffect, useState } from 'react';
import { CheckCircle } from 'lucide-react';
import PageHero from '../components/ui/PageHero';
import SectionHeader from '../components/ui/SectionHeader';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import { submissionsAPI } from '../api/submissions';
import { CATEGORY_LABELS } from '../utils/helpers';

const INCLUDED_FEATURES = [
  'Full congress access',
  'congress materials & proceedings',
  'Certificate of participation',
  'Networking sessions',
  'Access to recorded talks',
];

const INPERSON_EXTRAS = [
  'Lunch & refreshments (3 days)',
  'congress dinner ticket (1)',
  'Venue tours',
];

export default function Pricing() {
  const [pricing, setPricing] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    submissionsAPI.getActivePricing()
      .then((res) => {
        const data = res.data?.data ?? res.data ?? [];
        setPricing(Array.isArray(data) ? data : []);
      })
      .catch(() => setPricing([]))
      .finally(() => setLoading(false));
  }, []);

  const inPerson = pricing.filter((p) => p.category?.includes('inperson'));
  const virtual = pricing.filter((p) => p.category?.includes('virtual'));
  const other = pricing.filter((p) => !p.category?.includes('inperson') && !p.category?.includes('virtual'));

  const renderPricingCards = (items, isInPerson = false) => (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map((p) => (
        <div key={p._id || p.category} className="bg-white rounded-lg border border-slate-100 shadow-sm p-6 flex flex-col">
          <div className="mb-4">
            <h3 className="font-bold text-slate-900 text-lg">{CATEGORY_LABELS[p.category] ?? p.category}</h3>
            {p.description && <p className="text-sm text-slate-500 mt-1">{p.description}</p>}
          </div>
          <div className="mb-6">
            <span className="text-4xl font-bold text-teal-700">{p.currency ?? 'USD'} {p.amount?.toLocaleString()}</span>
            {p.earlyBirdAmount && (
              <p className="text-sm text-green-600 font-medium mt-1">
                Early bird: {p.currency ?? 'USD'} {p.earlyBirdAmount?.toLocaleString()}
              </p>
            )}
          </div>
          <ul className="flex flex-col gap-2 mb-6 flex-1">
            {INCLUDED_FEATURES.map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm text-slate-600">
                <CheckCircle size={14} className="text-green-500 shrink-0" /> {f}
              </li>
            ))}
            {isInPerson && INPERSON_EXTRAS.map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm text-slate-600">
                <CheckCircle size={14} className="text-teal-500 shrink-0" /> {f}
              </li>
            ))}
          </ul>
          <Button to="/registration" size="lg" className="w-full justify-center">
            Register
          </Button>
        </div>
      ))}
    </div>
  );

  return (
    <div>
      <PageHero
        title="Pricing"
        subtitle="Transparent pricing for all registration categories. Choose what works best for you."
        breadcrumb={[{ label: 'Home', href: '/' }, { label: 'Pricing' }]}
      />

      <section className="section-padding bg-white">
        <div className="container-custom">
          {loading ? (
            <div className="flex justify-center py-20"><Spinner size="lg" /></div>
          ) : pricing.length === 0 ? (
            <div className="text-center py-20">
              <SectionHeader title="Pricing Coming Soon" subtitle="Registration fees for this edition will be published shortly." />
              <Button to="/contact" size="lg" variant="outline">Contact Us for Information</Button>
            </div>
          ) : (
            <div className="flex flex-col gap-14">
              {inPerson.length > 0 && (
                <div>
                  <SectionHeader label="In-Person" title="Attend at the Venue" subtitle="Join us in person for the full congress experience." />
                  {renderPricingCards(inPerson, true)}
                </div>
              )}
              {virtual.length > 0 && (
                <div>
                  <SectionHeader label="Virtual" title="Attend Online" subtitle="Participate remotely from anywhere in the world." />
                  {renderPricingCards(virtual, false)}
                </div>
              )}
              {other.length > 0 && (
                <div>
                  <SectionHeader title="Other Categories" />
                  {renderPricingCards(other)}
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
