import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MapPin, Calendar, ArrowRight } from 'lucide-react';
import PageHero from '../components/ui/PageHero';
import SectionHeader from '../components/ui/SectionHeader';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import { congressAPI } from '../api/congress';
import { formatDate } from '../utils/helpers';

const STATUS_CONFIG = {
  active:   { label: 'Active',      style: { background: 'var(--brand-light)', color: 'var(--brand-dark)', borderColor: 'color-mix(in srgb, var(--brand) 30%, transparent)' } },
  upcoming: { label: 'Upcoming',    style: { background: '#fef3c7', color: '#b45309', borderColor: '#fde68a' } },
  past:     { label: 'Past Edition', style: { background: '#f8fafc', color: '#64748b', borderColor: '#e2e8f0' } },
};

export default function Editions() {
  const [searchParams] = useSearchParams();
  const pastOnly = searchParams.get('status') === 'past';
  const [editions, setEditions] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    congressAPI.getAll()
      .then((res) => {
        const data = res.data?.data ?? res.data ?? [];
        setEditions(Array.isArray(data) ? data : []);
      })
      .catch(() => setEditions([]))
      .finally(() => setLoading(false));
  }, []);

  const visibleEditions = pastOnly ? editions.filter((e) => e.status === 'past') : editions;

  return (
    <div>
      <PageHero
        title={pastOnly ? 'Past Events' : 'Congress Editions'}
        subtitle={pastOnly
          ? 'Browse previous editions of the Aging Congress.'
          : 'Explore past, present, and upcoming editions of the Aging Congress.'}
        breadcrumb={[{ label: 'Home', href: '/' }, { label: 'Congress' }, { label: pastOnly ? 'Past Events' : 'Editions' }]}
      />

      <section className="section-padding bg-white">
        <div className="container-custom">
          {loading ? (
            <div className="flex justify-center py-20"><Spinner size="lg" /></div>
          ) : visibleEditions.length === 0 ? (
            <div className="text-center py-20">
              <SectionHeader
                title={pastOnly ? 'No past events yet' : 'No editions yet'}
                subtitle={pastOnly ? 'Past editions will appear here once completed.' : 'Check back soon for congress edition announcements.'}
              />
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {visibleEditions.map((ed) => {
                const sc = STATUS_CONFIG[ed.status] || STATUS_CONFIG.upcoming;
                return (
                  <div
                    key={ed._id}
                    className="group bg-white rounded-3xl border border-slate-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col"
                  >
                    {/* Banner / Placeholder */}
                    {ed.bannerImage ? (
                      <div className="aspect-[16/9] overflow-hidden">
                        <img
                          src={ed.bannerImage}
                          alt={ed.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                      </div>
                    ) : (
                      <div
                        className="aspect-[16/9] flex items-end p-5"
                        style={{ background: 'linear-gradient(135deg, var(--brand-dark) 0%, color-mix(in srgb, var(--brand-dark) 70%, black) 100%)' }}
                      >
                        <span className="text-4xl font-black text-white/20 select-none leading-none">{ed.year}</span>
                      </div>
                    )}

                    <div className="p-6 flex flex-col gap-4 flex-1">
                      {/* Year + status */}
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-black uppercase tracking-[0.2em]" style={{ color: 'var(--brand)' }}>
                          {ed.year}
                        </span>
                        <span
                          className="text-[11px] font-bold px-3 py-1 rounded-full border"
                          style={sc.style}
                        >
                          {sc.label}
                        </span>
                      </div>

                      <div className="flex-1">
                        <h3 className="font-black text-slate-900 text-lg leading-snug mb-1">{ed.title}</h3>
                        {ed.theme && <p className="text-sm text-slate-400 italic mb-3">{ed.theme}</p>}

                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center gap-2 text-sm text-slate-500">
                            <Calendar size={13} style={{ color: 'var(--brand-dark)' }} className="shrink-0" />
                            <span>{formatDate(ed.startDate)} – {formatDate(ed.endDate)}</span>
                          </div>
                          {(ed.city || ed.country) && (
                            <div className="flex items-center gap-2 text-sm text-slate-500">
                              <MapPin size={13} style={{ color: 'var(--brand-dark)' }} className="shrink-0" />
                              <span>{[ed.city, ed.country].filter(Boolean).join(', ')}</span>
                            </div>
                          )}
                        </div>

                        {ed.description && (
                          <p className="text-sm text-slate-400 mt-3 line-clamp-3 leading-relaxed">{ed.description}</p>
                        )}

                        {ed.highlights?.length > 0 && (
                          <div className="grid grid-cols-2 gap-2 mt-4">
                            {ed.highlights.slice(0, 4).map((h, i) => (
                              <div
                                key={i}
                                className="text-center rounded-2xl py-2.5 px-2"
                                style={{ background: 'var(--brand-light)' }}
                              >
                                <p className="font-black text-sm" style={{ color: 'var(--brand-dark)' }}>{h.value}</p>
                                <p className="text-[11px] text-slate-500">{h.label}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* CTA */}
                      <div className="flex gap-2 pt-2 border-t border-slate-50 mt-auto">
                        {ed.status !== 'past' && (
                          <Button to="/registration" size="sm" variant="primary">
                            Register <ArrowRight size={13} />
                          </Button>
                        )}
                        {ed.status === 'past' && (
                          <Button to={`/speakers?edition=${ed._id}`} size="sm" variant="outline">
                            View Speakers
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
