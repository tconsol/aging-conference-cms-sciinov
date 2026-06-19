import { useEffect, useState } from 'react';
import { Clock, Tag, ChevronDown } from 'lucide-react';
import PageHero from '../components/ui/PageHero';
import SectionHeader from '../components/ui/SectionHeader';
import Spinner from '../components/ui/Spinner';
import { congressAPI } from '../api/congress';
import { usecongress } from '../context/congressContext';
import { formatDateShort } from '../utils/helpers';

export default function Sessions() {
  const { activeEdition } = usecongress();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');

  useEffect(() => {
    const params = activeEdition?._id ? { edition: activeEdition._id } : {};
    congressAPI.getSessions(params)
      .then((res) => {
        const data = res.data?.data ?? res.data ?? [];
        setSessions(Array.isArray(data) ? data : []);
      })
      .catch(() => setSessions([]))
      .finally(() => setLoading(false));
  }, [activeEdition]);

  const categories = ['all', ...new Set(sessions.map((s) => s.category || s.type).filter(Boolean))];
  const filtered = activeCategory === 'all'
    ? sessions
    : sessions.filter((s) => (s.category || s.type) === activeCategory);

  return (
    <div>
      <PageHero
        title="congress Sessions"
        subtitle="Explore the full range of scientific sessions, workshops, and symposia."
        breadcrumb={[{ label: 'Home', href: '/' }, { label: 'Sessions' }]}
      />

      <section className="section-padding bg-white">
        <div className="container-custom">
          {loading ? (
            <div className="flex justify-center py-20"><Spinner size="lg" /></div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-20">
              <SectionHeader title="Sessions Coming Soon" subtitle="The session schedule for this edition will be announced shortly." />
            </div>
          ) : (
            <>
              {categories.length > 1 && (
                <div className="flex flex-wrap gap-2 mb-10">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors capitalize ${
                        activeCategory === cat
                          ? 'bg-teal-700 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {cat === 'all' ? 'All Sessions' : cat}
                    </button>
                  ))}
                </div>
              )}
              <div className="flex flex-col gap-4">
                {filtered.map((session) => (
                  <div
                    key={session._id}
                    className="bg-white rounded-lg border border-slate-100 shadow-sm p-6 hover:shadow-md hover:border-teal-100 transition-all"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          {(session.category || session.type) && (
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full">
                              <Tag size={10} />
                              {session.category || session.type}
                            </span>
                          )}
                          {session.mode && (
                            <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full capitalize">
                              {session.mode}
                            </span>
                          )}
                        </div>
                        <h3 className="font-bold text-slate-900 text-lg">{session.title}</h3>
                        {session.description && (
                          <p className="text-slate-600 text-sm mt-2 leading-relaxed">{session.description}</p>
                        )}
                        {session.speakers && session.speakers.length > 0 && (
                          <p className="text-xs text-teal-600 font-medium mt-2">
                            Speakers: {session.speakers.map((s) => typeof s === 'object' ? (s.fullName || s.name || '') : s).filter(Boolean).join(', ')}
                          </p>
                        )}
                      </div>
                      {(session.date || session.time || session.duration) && (
                        <div className="flex flex-col gap-1 shrink-0 text-right">
                          {session.date && (
                            <span className="text-sm font-semibold text-slate-700">{formatDateShort(session.date)}</span>
                          )}
                          {session.time && (
                            <span className="flex items-center gap-1 text-xs text-slate-500 justify-end">
                              <Clock size={12} /> {session.time}
                            </span>
                          )}
                          {session.duration && (
                            <span className="text-xs text-slate-400">{session.duration} min</span>
                          )}
                        </div>
                      )}
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
