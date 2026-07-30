import { useEffect, useState } from 'react';
import { Star, Quote } from 'lucide-react';
import PageHero from '../components/ui/PageHero';
import SectionHeader from '../components/ui/SectionHeader';
import Spinner from '../components/ui/Spinner';
import { communityAPI } from '../api/community';

const CARD_ACCENTS = [
  'rgba(13,148,136,0.06)',
  'rgba(245,158,11,0.06)',
  'rgba(139,92,246,0.06)',
  'rgba(14,165,233,0.06)',
  'rgba(239,68,68,0.06)',
  'rgba(34,197,94,0.06)',
];

export default function Testimonials() {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading]           = useState(true);

  useEffect(() => {
    communityAPI.getTestimonials()
      .then((res) => {
        const data = res.data?.data ?? res.data ?? [];
        setTestimonials(Array.isArray(data) ? data : []);
      })
      .catch(() => setTestimonials([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <PageHero
        title="What Attendees Say"
        subtitle="Hear from researchers, clinicians, and professionals who attended the Aging Congress."
        breadcrumb={[{ label: 'Home', href: '/' }, { label: 'Testimonials' }]}
      />

      <section className="section-padding" style={{ background: '#f8fafc' }}>
        <div className="container-custom">
          {loading ? (
            <div className="flex justify-center py-20"><Spinner size="lg" /></div>
          ) : testimonials.length === 0 ? (
            <div className="text-center py-20">
              <SectionHeader title="Testimonials Coming Soon" subtitle="Attendee testimonials will be added here." />
            </div>
          ) : (
            <>
              {/* Top aggregate */}
              <div className="text-center mb-14">
                <div className="flex items-center justify-center gap-1 mb-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={24} className="text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-slate-500 text-sm">{testimonials.length} verified attendee review{testimonials.length !== 1 ? 's' : ''}</p>
              </div>

              {/* Masonry-style: first card spans 2 cols if ≥4 testimonials */}
              <div className="columns-1 sm:columns-2 lg:columns-3 gap-5 space-y-5">
                {testimonials.map((t, i) => (
                  <div
                    key={t._id}
                    className="break-inside-avoid rounded-3xl p-7 border border-slate-100 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 bg-white"
                  >
                    {/* Quote mark */}
                    <Quote
                      size={32}
                      className="mb-4 opacity-40"
                      style={{ color: 'var(--brand-dark)' }}
                    />

                    {/* Stars */}
                    <div className="flex gap-0.5 mb-4">
                      {Array.from({ length: 5 }).map((_, si) => (
                        <Star
                          key={si}
                          size={13}
                          className={si < (t.rating ?? 5) ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-200'}
                        />
                      ))}
                    </div>

                    {/* Message */}
                    <p className="text-slate-600 text-sm leading-relaxed mb-6 italic">
                      "{t.message}"
                    </p>

                    {/* Attribution */}
                    <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                      {t.photo ? (
                        <img src={t.photo} alt={t.name} className="w-10 h-10 rounded-full object-cover ring-2 ring-white shadow-sm" />
                      ) : (
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 font-black text-sm text-white"
                          style={{ background: 'linear-gradient(135deg, var(--brand-dark), var(--brand))' }}
                        >
                          {t.name?.[0] ?? 'A'}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-black text-slate-900 leading-tight">{t.name}</p>
                        {(t.designation || t.country) && (
                          <p className="text-xs text-slate-400 mt-0.5 truncate">
                            {[t.designation, t.country].filter(Boolean).join(' · ')}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
