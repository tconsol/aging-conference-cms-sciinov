import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import PageHero from '../components/ui/PageHero';
import Spinner from '../components/ui/Spinner';
import SectionHeader from '../components/ui/SectionHeader';
import { peopleAPI } from '../api/people';
import { usecongress } from '../context/congressContext';

export default function Speakers() {
  const { activeEdition } = usecongress();
  const [speakers, setSpeakers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  useEffect(() => {
    const params = activeEdition?._id ? { edition: activeEdition._id } : {};
    peopleAPI.getSpeakers(params)
      .then((res) => {
        const data = res.data?.data ?? res.data ?? [];
        setSpeakers(Array.isArray(data) ? data : []);
      })
      .catch(() => setSpeakers([]))
      .finally(() => setLoading(false));
  }, [activeEdition]);

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
        title="Speakers"
        subtitle="Meet the world-leading experts presenting at this year's Aging congress."
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
                  className="bg-white rounded-lg border border-slate-100 shadow-sm p-5 hover:shadow-md hover:border-teal-100 transition-all group text-center"
                >
                  {speaker.photo ? (
                    <img
                      src={speaker.photo}
                      alt={speaker.fullName}
                      className="w-20 h-20 rounded-lg object-cover mx-auto mb-4"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-lg bg-teal-100 flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl font-bold text-teal-700">{speaker.fullName?.[0] ?? 'S'}</span>
                    </div>
                  )}
                  <h3 className="font-bold text-slate-900 group-hover:text-teal-700 transition-colors text-sm">
                    {speaker.fullName}
                  </h3>
                  {speaker.designation && (
                    <p className="text-xs text-slate-500 mt-0.5">{speaker.designation}</p>
                  )}
                  {speaker.organization && (
                    <p className="text-xs text-teal-600 font-medium mt-1">{speaker.organization}</p>
                  )}
                  {speaker.country && (
                    <p className="text-xs text-slate-400 mt-1">{speaker.country}</p>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
