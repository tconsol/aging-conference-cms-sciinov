import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, ArrowRight, MapPin } from 'lucide-react';
import PageHero from '../components/ui/PageHero';
import Spinner from '../components/ui/Spinner';
import SectionHeader from '../components/ui/SectionHeader';
import { peopleAPI } from '../api/people';
import { congressAPI } from '../api/congress';
import { usecongress } from '../context/congressContext';

export default function Speakers() {
  const { activeEdition, loading: congressLoading } = usecongress();
  const [searchParams] = useSearchParams();
  const editionParam = searchParams.get('edition');
  const [speakers, setSpeakers] = useState([]);
  const [editionLabel, setEditionLabel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (!editionParam && congressLoading) return;

    const editionId = editionParam || activeEdition?._id;
    const params = editionId ? { edition: editionId, active: true } : { active: true };
    peopleAPI.getSpeakers(params)
      .then((res) => {
        const data = res.data?.data ?? res.data ?? [];
        setSpeakers(Array.isArray(data) ? data : []);
      })
      .catch(() => setSpeakers([]))
      .finally(() => setLoading(false));
  }, [editionParam, activeEdition, congressLoading]);

  useEffect(() => {
    if (!editionParam) {
      setEditionLabel(null);
      return;
    }
    congressAPI.getAll()
      .then((res) => {
        const data = res.data?.data ?? res.data ?? [];
        const match = Array.isArray(data) ? data.find((e) => e._id === editionParam) : null;
        setEditionLabel(match ? `${match.year} ${match.city}` : null);
      })
      .catch(() => setEditionLabel(null));
  }, [editionParam]);

  const filtered = speakers.filter((s) => {
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      s.fullName?.toLowerCase().includes(q) ||
      s.organization?.toLowerCase().includes(q) ||
      s.designation?.toLowerCase().includes(q)
    );
  });

  return (
    <div>
      <PageHero
        title={editionLabel ? `Speakers — ${editionLabel}` : 'Speakers'}
        subtitle="Meet the world-leading experts presenting at the Aging congress."
        breadcrumb={[{ label: 'Home', href: '/' }, { label: 'Speakers' }]}
      />

      <section className="section-padding bg-white">
        <div className="container-custom">
          {/* Search */}
          <div className="max-w-md mb-10">
            <div className="relative">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search speakers..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-20"><Spinner size="lg" /></div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <SectionHeader title={query ? 'No speakers found' : 'Speakers Coming Soon'} subtitle={query ? 'Try a different search term.' : 'Speaker announcements will be made soon.'} />
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filtered.map((speaker) => (
                <Link
                  key={speaker._id}
                  to={`/speakers/${speaker.slug}`}
                  className="group relative bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                >
                  {/* Photo / Avatar */}
                  <div className="relative h-52 w-full overflow-hidden bg-gradient-to-br from-teal-500 to-emerald-600">
                    {speaker.photo ? (
                      <>
                        <img
                          src={speaker.photo}
                          alt={speaker.fullName}
                          className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-6xl font-bold text-white/90 select-none">
                          {speaker.fullName?.[0] ?? 'S'}
                        </span>
                      </div>
                    )}
                    {/* Hover overlay arrow */}
                    <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <ArrowRight size={14} className="text-white" />
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <h3 className="font-bold text-slate-900 group-hover:text-teal-700 transition-colors text-sm leading-snug line-clamp-1">
                      {speaker.fullName}
                    </h3>
                    {speaker.designation && (
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">{speaker.designation}</p>
                    )}
                    {speaker.organization && (
                      <p className="text-xs font-semibold text-teal-600 mt-2 line-clamp-1">{speaker.organization}</p>
                    )}
                    {speaker.country && (
                      <div className="flex items-center gap-1 mt-2">
                        <MapPin size={11} className="text-slate-400 shrink-0" />
                        <span className="text-xs text-slate-400">{speaker.country}</span>
                      </div>
                    )}
                  </div>

                  {/* Bottom accent bar */}
                  <div className="h-0.5 bg-gradient-to-r from-teal-400 to-emerald-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
