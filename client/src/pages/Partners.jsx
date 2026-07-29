import { useEffect, useState } from 'react';
import { ExternalLink, Handshake } from 'lucide-react';
import PageHero from '../components/ui/PageHero';
import SectionHeader from '../components/ui/SectionHeader';
import Spinner from '../components/ui/Spinner';
import Button from '../components/ui/Button';
import { communityAPI } from '../api/community';

const TIER_CONFIG = {
  'Sponsors':      { size: 'lg', cols: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4', logoH: 'h-20', accent: 'var(--brand-dark)' },
  'Partners':      { size: 'md', cols: 'grid-cols-3 sm:grid-cols-4 lg:grid-cols-5', logoH: 'h-14', accent: 'var(--brand)' },
  'Media Partners':{ size: 'sm', cols: 'grid-cols-3 sm:grid-cols-5 lg:grid-cols-6', logoH: 'h-10', accent: '#64748b' },
};

const TYPE_LABELS = {
  sponsor:      'Sponsors',
  partner:      'Partners',
  media_partner:'Media Partners',
};

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

  const groups = partners.reduce((acc, p) => {
    const label = TYPE_LABELS[p.type] || 'Partners';
    if (!acc[label]) acc[label] = [];
    acc[label].push(p);
    return acc;
  }, {});

  const tierOrder = ['Sponsors', 'Partners', 'Media Partners'];
  const sortedGroups = tierOrder
    .filter((t) => groups[t])
    .map((t) => [t, groups[t]])
    .concat(Object.entries(groups).filter(([t]) => !tierOrder.includes(t)));

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
            <div className="flex flex-col gap-16">
              {sortedGroups.map(([tier, items]) => {
                const cfg = TIER_CONFIG[tier] || TIER_CONFIG['Partners'];
                return (
                  <div key={tier}>
                    {/* Tier header */}
                    <div className="flex items-center gap-4 mb-8">
                      <div
                        className="h-px flex-1"
                        style={{ background: 'linear-gradient(to right, transparent, #e2e8f0)' }}
                      />
                      <span
                        className="flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border"
                        style={{
                          color: cfg.accent,
                          borderColor: `color-mix(in srgb, ${cfg.accent} 25%, transparent)`,
                          background: `color-mix(in srgb, ${cfg.accent} 8%, white)`,
                        }}
                      >
                        {tier}
                      </span>
                      <div
                        className="h-px flex-1"
                        style={{ background: 'linear-gradient(to left, transparent, #e2e8f0)' }}
                      />
                    </div>

                    {/* Partner cards */}
                    <div className={`grid ${cfg.cols} gap-4`}>
                      {items.map((partner) => (
                        <a
                          key={partner._id}
                          href={partner.website || '#'}
                          target="_blank"
                          rel="noreferrer"
                          className="group relative flex flex-col items-center justify-center gap-3 p-5 bg-white rounded-2xl border border-slate-100 hover:border-transparent hover:shadow-lg transition-all duration-200 text-center overflow-hidden"
                          style={{ '--hover-accent': cfg.accent }}
                        >
                          {/* Hover border glow */}
                          <div
                            className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                            style={{ boxShadow: `0 0 0 2px color-mix(in srgb, ${cfg.accent} 40%, transparent)` }}
                          />

                          {/* Logo */}
                          {partner.logo ? (
                            <img
                              src={partner.logo}
                              alt={partner.name}
                              className={`${cfg.logoH} w-auto object-contain grayscale group-hover:grayscale-0 transition-all duration-300`}
                            />
                          ) : (
                            <div
                              className={`${cfg.logoH} w-full rounded-xl flex items-center justify-center font-black text-lg`}
                              style={{ background: `color-mix(in srgb, ${cfg.accent} 10%, white)`, color: cfg.accent }}
                            >
                              {partner.name?.[0]}
                            </div>
                          )}

                          <div>
                            <p className="text-xs font-bold text-slate-600 group-hover:text-slate-900 transition-colors">
                              {partner.name}
                            </p>
                            {partner.website && (
                              <ExternalLink
                                size={10}
                                className="mx-auto mt-1.5 text-slate-300 group-hover:text-slate-500 transition-colors"
                              />
                            )}
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Become a partner CTA */}
          <div
            className="mt-20 rounded-3xl p-10 text-center border overflow-hidden relative"
            style={{
              background: 'linear-gradient(135deg, var(--brand-dark) 0%, color-mix(in srgb, var(--brand-dark) 75%, black) 100%)',
              borderColor: 'transparent',
            }}
          >
            <div className="relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-5">
                <Handshake size={26} className="text-white" />
              </div>
              <h3 className="text-2xl font-black text-white mb-3">Become a Partner</h3>
              <p className="text-white/60 text-sm mb-7 max-w-md mx-auto leading-relaxed">
                Join our growing network of sponsors and partners. Connect your brand with leading aging researchers worldwide.
              </p>
              <Button to="/sponsorship" variant="white" size="xl">View Sponsorship Options</Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
