import { useEffect, useState } from 'react';
import { ExternalLink } from 'lucide-react';
import PageHero from '../components/ui/PageHero';
import SectionHeader from '../components/ui/SectionHeader';
import Spinner from '../components/ui/Spinner';
import Button from '../components/ui/Button';
import { communityAPI } from '../api/community';

export default function Partners() {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    communityAPI.getPartners()
      .then((res) => {
        const data = res.data?.data ?? res.data ?? [];
        setPartners(Array.isArray(data) ? data : []);
      })
      .catch(() => setPartners([]))
      .finally(() => setLoading(false));
  }, []);

  // Group by tier/category
  const groups = partners.reduce((acc, p) => {
    const tier = p.tier || p.category || 'Partners';
    if (!acc[tier]) acc[tier] = [];
    acc[tier].push(p);
    return acc;
  }, {});

  return (
    <div>
      <PageHero
        title="Our Partners"
        subtitle="We are proud to be supported by leading organizations in aging research and healthcare."
        breadcrumb={[{ label: 'Home', href: '/' }, { label: 'Partners' }]}
      />

      <section className="section-padding bg-white">
        <div className="container-custom">
          {loading ? (
            <div className="flex justify-center py-20"><Spinner size="lg" /></div>
          ) : partners.length === 0 ? (
            <div className="text-center py-20">
              <SectionHeader title="Partners Coming Soon" subtitle="Our partner organizations will be announced here." />
              <Button to="/sponsorship" size="lg" variant="outline" className="mt-4">Become a Partner</Button>
            </div>
          ) : (
            <div className="flex flex-col gap-14">
              {Object.entries(groups).map(([tier, items]) => (
                <div key={tier}>
                  <h2 className="text-xl font-bold text-slate-900 text-center mb-8 pb-2 border-b border-slate-100">{tier}</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
                    {items.map((partner) => (
                      <a
                        key={partner._id}
                        href={partner.website || '#'}
                        target="_blank"
                        rel="noreferrer"
                        className="group flex flex-col items-center gap-3 p-5 bg-white rounded-lg border border-slate-100 shadow-sm hover:shadow-md hover:border-teal-100 transition-all text-center"
                      >
                        {partner.logo ? (
                          <img
                            src={partner.logo}
                            alt={partner.name}
                            className="h-16 w-auto object-contain grayscale group-hover:grayscale-0 transition-all"
                          />
                        ) : (
                          <div className="h-16 w-full bg-slate-100 rounded-xl flex items-center justify-center">
                            <span className="font-bold text-slate-400 text-sm">{partner.name?.[0]}</span>
                          </div>
                        )}
                        <p className="text-xs font-semibold text-slate-700 group-hover:text-teal-700 transition-colors">
                          {partner.name}
                        </p>
                        {partner.website && (
                          <ExternalLink size={12} className="text-slate-300 group-hover:text-teal-500 transition-colors" />
                        )}
                      </a>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-16 text-center bg-teal-50 rounded-lg border border-teal-100 p-10">
            <h3 className="text-2xl font-bold text-slate-900 mb-3">Become a Partner</h3>
            <p className="text-slate-600 mb-6 max-w-xl mx-auto">
              Join our growing network of partners and sponsors. Connect your brand with leading aging researchers worldwide.
            </p>
            <Button to="/sponsorship" size="xl">View Sponsorship Options</Button>
          </div>
        </div>
      </section>
    </div>
  );
}
