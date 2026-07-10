import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MapPin, Calendar, ArrowRight } from 'lucide-react';
import PageHero from '../components/ui/PageHero';
import SectionHeader from '../components/ui/SectionHeader';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import { congressAPI } from '../api/congress';
import { formatDate } from '../utils/helpers';

const STATUS_LABELS = {
  active: 'Active',
  upcoming: 'Upcoming',
  past: 'Past Edition',
};

const STATUS_STYLES = {
  active: 'bg-teal-50 text-teal-700 border-teal-200',
  upcoming: 'bg-amber-50 text-amber-700 border-amber-200',
  past: 'bg-slate-100 text-slate-500 border-slate-200',
};

export default function Editions() {
  const [searchParams] = useSearchParams();
  const pastOnly = searchParams.get('status') === 'past';
  const [editions, setEditions] = useState([]);
  const [loading, setLoading] = useState(true);

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
          ? 'Browse previous editions of the Aging congress.'
          : 'Explore past, present, and upcoming editions of the Aging congress.'}
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
              {visibleEditions.map((ed) => (
                <div
                  key={ed._id}
                  className="bg-white rounded-lg border border-slate-100 shadow-sm overflow-hidden hover:shadow-md hover:border-teal-100 transition-all flex flex-col"
                >
                  {ed.bannerImage && (
                    <div className="aspect-[16/9] overflow-hidden">
                      <img src={ed.bannerImage} alt={ed.title} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="p-5 flex flex-col gap-3 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-teal-700 uppercase tracking-wide">{ed.year}</span>
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${STATUS_STYLES[ed.status] || STATUS_STYLES.upcoming}`}>
                        {STATUS_LABELS[ed.status] || ed.status}
                      </span>
                    </div>
                    <h3 className="font-bold text-slate-900 text-lg leading-snug">{ed.title}</h3>
                    {ed.theme && <p className="text-sm text-slate-500 italic">{ed.theme}</p>}

                    <div className="flex flex-col gap-1.5 text-sm text-slate-600 mt-1">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-teal-600 shrink-0" />
                        <span>{formatDate(ed.startDate)} – {formatDate(ed.endDate)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin size={14} className="text-teal-600 shrink-0" />
                        <span>{ed.city}, {ed.country}</span>
                      </div>
                    </div>

                    {ed.description && (
                      <p className="text-sm text-slate-500 line-clamp-3">{ed.description}</p>
                    )}

                    {ed.highlights?.length > 0 && (
                      <div className="grid grid-cols-2 gap-2 mt-1">
                        {ed.highlights.slice(0, 4).map((h, i) => (
                          <div key={i} className="text-center bg-slate-50 rounded-lg py-2">
                            <p className="font-bold text-teal-700 text-sm">{h.value}</p>
                            <p className="text-[11px] text-slate-500">{h.label}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {(ed.status === 'active' || ed.status === 'upcoming') && (
                      <Button to="/registration" size="sm" variant="secondary" className="mt-auto self-start">
                        Register Now <ArrowRight size={14} />
                      </Button>
                    )}
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
