import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, ArrowRight, MapPin, Users } from 'lucide-react';
import PageHero from '../components/ui/PageHero';
import Spinner from '../components/ui/Spinner';
import SectionHeader from '../components/ui/SectionHeader';
import { peopleAPI } from '../api/people';
import { congressAPI } from '../api/congress';
import { usecongress } from '../context/congressContext';

function PersonCard({ person, href }) {
  const initials = person.fullName
    ? person.fullName.split(' ').map((w) => w[0]).slice(0, 2).join('')
    : 'S';

  return (
    <Link
      to={href}
      className="group relative bg-white rounded-2xl overflow-hidden border border-slate-100 hover:border-transparent hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col"
      style={{ '--shadow-color': 'color-mix(in srgb, var(--brand) 12%, transparent)' }}
    >
      {/* Photo area */}
      <div
        className="relative overflow-hidden"
        style={{ aspectRatio: '4/5', background: 'linear-gradient(150deg, var(--brand-dark) 0%, color-mix(in srgb, var(--brand-dark) 70%, black) 100%)' }}
      >
        {person.photo ? (
          <>
            <img
              src={person.photo}
              alt={person.fullName}
              className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.1) 50%, transparent 100%)' }} />
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-5xl font-black text-white/80 select-none tracking-tight">{initials}</span>
          </div>
        )}

        {/* Hover arrow */}
        <div
          className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0"
          style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)' }}
        >
          <ArrowRight size={14} className="text-white" />
        </div>

        {/* Country badge */}
        {person.country && (
          <div className="absolute bottom-3 left-3 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-1 group-hover:translate-y-0">
            <span className="flex items-center gap-1 text-white text-[11px] font-semibold px-2.5 py-1 rounded-full" style={{ background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(6px)' }}>
              <MapPin size={9} /> {person.country}
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-black text-slate-900 text-sm leading-snug line-clamp-1 group-hover:text-slate-700 transition-colors">
          {person.fullName}
        </h3>
        {person.designation && (
          <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">{person.designation}</p>
        )}
        {person.organization && (
          <p className="text-xs font-bold mt-2 line-clamp-1" style={{ color: 'var(--brand-dark)' }}>
            {person.organization}
          </p>
        )}
      </div>

      {/* Bottom accent on hover */}
      <div
        className="h-0.5 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"
        style={{ background: 'linear-gradient(90deg, var(--brand-dark), var(--brand))' }}
      />
    </Link>
  );
}

export default function Speakers() {
  const { activeEdition, loading: congressLoading } = usecongress();
  const [searchParams] = useSearchParams();
  const editionParam = searchParams.get('edition');
  const [speakers, setSpeakers]         = useState([]);
  const [editionLabel, setEditionLabel] = useState(null);
  const [loading, setLoading]           = useState(true);
  const [query, setQuery]               = useState('');

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
    if (!editionParam) { setEditionLabel(null); return; }
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
        title={editionLabel ? `Speakers ${editionLabel}` : 'Speakers'}
        subtitle="Meet the world-leading experts presenting at the Aging Congress."
        breadcrumb={[{ label: 'Home', href: '/' }, { label: 'Speakers' }]}
      />

      <section className="section-padding bg-white">
        <div className="container-custom">
          {/* Search + count */}
          <div className="flex items-center gap-4 mb-10 flex-wrap">
            <div className="relative flex-1 min-w-[240px] max-w-sm">
              <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search speakers…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 text-sm rounded-2xl border border-slate-200 focus:outline-none bg-slate-50 focus:bg-white transition-colors"
                onFocus={(e) => { e.target.style.borderColor = 'var(--brand)'; e.target.style.boxShadow = '0 0 0 3px color-mix(in srgb, var(--brand) 20%, transparent)'; }}
                onBlur={(e) => { e.target.style.borderColor = ''; e.target.style.boxShadow = ''; }}
              />
            </div>
            {!loading && speakers.length > 0 && (
              <p className="text-sm text-slate-400">{filtered.length} speaker{filtered.length !== 1 ? 's' : ''}</p>
            )}
          </div>

          {loading ? (
            <div className="flex justify-center py-20"><Spinner size="lg" /></div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: 'var(--brand-light)' }}>
                <Users size={28} style={{ color: 'var(--brand-dark)' }} />
              </div>
              <SectionHeader
                title={query ? 'No speakers found' : 'Speakers Coming Soon'}
                subtitle={query ? 'Try a different search term.' : 'Speaker announcements will be made soon.'}
              />
              {query && (
                <button onClick={() => setQuery('')} className="mt-4 text-sm font-semibold hover:underline" style={{ color: 'var(--brand-dark)' }}>
                  Clear search
                </button>
              )}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filtered.map((speaker) => (
                <PersonCard key={speaker._id} person={speaker} href={`/speakers/${speaker.slug}`} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
