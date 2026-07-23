import { useEffect, useState } from 'react';
import * as LucideIcons from 'lucide-react';
import { BookOpen, Search, ArrowRight, Layers } from 'lucide-react';
import PageHero from '../components/ui/PageHero';
import SectionHeader from '../components/ui/SectionHeader';
import Spinner from '../components/ui/Spinner';
import Button from '../components/ui/Button';
import { congressAPI } from '../api/congress';
import { usecongress } from '../context/congressContext';

function toPascalCase(str) {
  return str.split(/[-_\s]+/).map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join('');
}

function SessionIcon({ icon, className }) {
  const Comp = (icon && LucideIcons[toPascalCase(icon)]) || BookOpen;
  return <Comp size={22} className={className} />;
}

const TRACK_ACCENTS = [
  { bg: 'bg-teal-50',   text: 'text-teal-700',   ring: 'group-hover:ring-teal-200' },
  { bg: 'bg-amber-50',  text: 'text-amber-700',  ring: 'group-hover:ring-amber-200' },
  { bg: 'bg-sky-50',    text: 'text-sky-700',    ring: 'group-hover:ring-sky-200' },
  { bg: 'bg-violet-50', text: 'text-violet-700', ring: 'group-hover:ring-violet-200' },
  { bg: 'bg-rose-50',   text: 'text-rose-700',   ring: 'group-hover:ring-rose-200' },
];

export default function Sessions() {
  const { activeEdition, loading: congressLoading } = usecongress();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (congressLoading) return;

    const params = activeEdition?._id ? { edition: activeEdition._id } : {};
    congressAPI.getSessions(params)
      .then((res) => {
        const data = res.data?.data ?? res.data ?? [];
        setSessions(Array.isArray(data) ? data : []);
      })
      .catch(() => setSessions([]))
      .finally(() => setLoading(false));
  }, [activeEdition, congressLoading]);

  const q = query.trim().toLowerCase();
  const filtered = sessions.filter((s) => {
    if (!q) return true;
    return s.title?.toLowerCase().includes(q) || s.description?.toLowerCase().includes(q);
  });

  return (
    <div>
      <PageHero
        title="Congress Sessions"
        subtitle="Explore the full range of scientific tracks, workshops, and symposia."
        breadcrumb={[{ label: 'Home', href: '/' }, { label: 'Sessions' }]}
      />

      <section className="section-padding bg-white">
        <div className="container-custom">
          {loading ? (
            <div className="flex justify-center py-20"><Spinner size="lg" /></div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-16 bg-stone-50 border border-stone-200 rounded-2xl">
              <Layers size={36} className="text-teal-600 mx-auto mb-4" />
              <h3 className="text-lg font-black text-slate-900 mb-2">Sessions Coming Soon</h3>
              <p className="text-slate-600 text-sm mb-6">
                The session schedule for this edition will be announced shortly.
              </p>
              <Button to="/contact" variant="primary">
                Contact Us for Information
              </Button>
            </div>
          ) : (
            <>
              {/* Intro + search */}
              <div className="max-w-xl mx-auto text-center mb-12">
                <span className="section-label inline-block border-l-0 pl-0 border-b-4 border-teal-500 pb-1 mx-auto">Scientific Tracks</span>
                <h2 className="text-3xl font-black text-slate-900 mt-2 mb-6">What's on the agenda</h2>
                <div className="relative">
                  <Search size={17} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search sessions (e.g. senolytics, neurodegeneration)"
                    className="w-full py-3.5 pl-12 pr-4 border border-slate-200 rounded-full text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white"
                  />
                </div>
                <p className="text-xs text-slate-400 mt-3">{sessions.length} scientific tracks this edition</p>
              </div>

              {filtered.length === 0 ? (
                <div className="text-center py-12 bg-stone-50 border border-stone-200 rounded-2xl">
                  <p className="text-slate-600 text-sm">No sessions match your search. Try different keywords.</p>
                  <button
                    onClick={() => setQuery('')}
                    className="mt-3 text-teal-700 text-sm font-semibold hover:underline"
                  >
                    Clear search
                  </button>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filtered.map((session, i) => {
                    const accent = TRACK_ACCENTS[i % TRACK_ACCENTS.length];
                    return (
                      <div
                        key={session._id}
                        className="group bg-white border border-slate-100 rounded-2xl shadow-sm p-6 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className={`w-12 h-12 rounded-xl ${accent.bg} flex items-center justify-center ring-4 ring-transparent ${accent.ring} transition-all`}>
                            <SessionIcon icon={session.icon} className={accent.text} />
                          </div>
                          <span className="text-[10px] font-mono font-bold text-slate-300 tracking-wider mt-1">
                            {String(i + 1).padStart(2, '0')}
                          </span>
                        </div>
                        <h3 className="font-black text-slate-900 text-base leading-snug">{session.title}</h3>
                        {session.description && (
                          <p className="text-slate-600 text-sm mt-2.5 leading-relaxed">{session.description}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Bottom CTA */}
              <div className="max-w-2xl mx-auto text-center bg-stone-50 border border-stone-200 rounded-2xl p-10 mt-16">
                <h3 className="text-xl font-black text-slate-900 mb-2">Have research to share?</h3>
                <p className="text-slate-600 text-sm mb-6">
                  Submit an abstract under any of these tracks and present your work at the congress.
                </p>
                <Button to="/abstract-submission" variant="primary">
                  Submit an Abstract <ArrowRight size={16} />
                </Button>
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
