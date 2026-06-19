import { useEffect, useState } from 'react';
import { Star } from 'lucide-react';
import PageHero from '../components/ui/PageHero';
import SectionHeader from '../components/ui/SectionHeader';
import Spinner from '../components/ui/Spinner';
import { communityAPI } from '../api/community';

export default function Testimonials() {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);

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
        title="Testimonials"
        subtitle="What past attendees say about their experience at the Aging congress."
        breadcrumb={[{ label: 'Home', href: '/' }, { label: 'Testimonials' }]}
      />

      <section className="section-padding bg-white">
        <div className="container-custom">
          {loading ? (
            <div className="flex justify-center py-20"><Spinner size="lg" /></div>
          ) : testimonials.length === 0 ? (
            <div className="text-center py-20">
              <SectionHeader title="Testimonials Coming Soon" subtitle="Attendee testimonials will be added here." />
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {testimonials.map((t) => (
                <div
                  key={t._id}
                  className="bg-white rounded-lg border border-slate-100 shadow-sm p-6 flex flex-col"
                >
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={15}
                        className={i < (t.rating ?? 5) ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}
                      />
                    ))}
                  </div>
                  <p className="text-slate-600 text-sm leading-relaxed flex-1 mb-5">
                    "{t.message || t.content}"
                  </p>
                  <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                    {t.photo ? (
                      <img src={t.photo} alt={t.name} className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center">
                        <span className="text-teal-700 font-bold text-sm">{t.name?.[0] ?? 'A'}</span>
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-bold text-slate-900">{t.name}</p>
                      {(t.role || t.institution) && (
                        <p className="text-xs text-slate-500">{[t.role, t.institution].filter(Boolean).join(', ')}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
