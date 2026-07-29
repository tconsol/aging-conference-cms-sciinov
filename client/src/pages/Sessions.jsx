import { useEffect, useState } from 'react';
import * as LucideIcons from 'lucide-react';
import { BookOpen, Search, ArrowRight, Layers } from 'lucide-react';
import PageHero from '../components/ui/PageHero';
import Spinner from '../components/ui/Spinner';
import Button from '../components/ui/Button';
import { congressAPI } from '../api/congress';
import { usecongress } from '../context/congressContext';

function toPascalCase(str) {
  return str.split(/[-_\s]+/).map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join('');
}
function SessionIcon({ icon, size = 22, style }) {
  const Comp = (icon && LucideIcons[toPascalCase(icon)]) || BookOpen;
  return <Comp size={size} style={style} />;
}

const ACCENTS = [
  { light: 'color-mix(in srgb, var(--brand) 10%, white)',       dark: 'var(--brand-dark)' },
  { light: 'rgba(245,158,11,0.1)',  dark: '#b45309' },
  { light: 'rgba(14,165,233,0.1)',  dark: '#0369a1' },
  { light: 'rgba(139,92,246,0.1)',  dark: '#6d28d9' },
  { light: 'rgba(239,68,68,0.1)',   dark: '#b91c1c' },
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
  const filtered = sessions.filter((s) =>
    !q || s.title?.toLowerCase().includes(q) || s.description?.toLowerCase().includes(q)
  );

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
            <div className="text-center py-16 rounded-3xl border border-dashed border-slate-200 bg-slate-50">
              <Layers size={36} className="mx-auto mb-4" style={{ color: 'var(--brand)' }} />
              <h3 className="text-lg font-black text-slate-900 mb-2">Sessions Coming Soon</h3>
              <p className="text-slate-500 text-sm mb-6">The session schedule will be announced shortly.</p>
              <Button to="/contact" variant="primary">Contact Us</Button>
            </div>
          ) : (
            <>
              {/* Header + search */}
              <div className="max-w-2xl mx-auto text-center mb-14">
                <span
                  className="inline-block text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-4"
                  style={{ background: 'var(--brand-light)', color: 'var(--brand-dark)' }}
                >
                  Scientific Tracks
                </span>
                <h2 className="text-3xl font-black text-slate-900 mb-6">What's on the agenda</h2>
                <div className="relative">
                  <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search sessions…"
                    className="w-full py-3.5 pl-11 pr-4 text-sm rounded-2xl border border-slate-200 focus:outline-none focus:border-transparent bg-slate-50 focus:bg-white transition-colors"
                    style={{ '--tw-ring-color': 'var(--brand)' }}
                    onFocus={(e) => { e.target.style.boxShadow = '0 0 0 3px color-mix(in srgb, var(--brand) 20%, transparent)'; e.target.style.borderColor = 'var(--brand)'; }}
                    onBlur={(e) => { e.target.style.boxShadow = ''; e.target.style.borderColor = ''; }}
                  />
                </div>
                <p className="text-xs text-slate-400 mt-3">{sessions.length} scientific tracks this edition</p>
              </div>

              {filtered.length === 0 ? (
                <div className="text-center py-12 rounded-3xl border border-dashed border-slate-200 bg-slate-50">
                  <p className="text-slate-500 text-sm">No sessions match your search.</p>
                  <button onClick={() => setQuery('')} className="mt-3 text-sm font-semibold hover:underline" style={{ color: 'var(--brand-dark)' }}>
                    Clear search
                  </button>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filtered.map((session, i) => {
                    const a = ACCENTS[i % ACCENTS.length];
                    return (
                      <div
                        key={session._id}
                        className="group relative bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 p-6 overflow-hidden"
                      >
                        {/* Top accent line */}
                        <div
                          className="absolute top-0 left-0 right-0 h-[3px] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                          style={{ background: `linear-gradient(90deg, ${a.dark}, ${a.dark}80)` }}
                        />

                        {/* Index badge */}
                        <div className="flex items-start justify-between mb-5">
                          <div
                            className="w-12 h-12 rounded-2xl flex items-center justify-center"
                            style={{ background: a.light }}
                          >
                            <SessionIcon icon={session.icon} size={22} style={{ color: a.dark }} />
                          </div>
                          <span className="text-[10px] font-mono font-bold text-slate-300 mt-1">
                            {String(i + 1).padStart(2, '0')}
                          </span>
                        </div>

                        <h3 className="font-black text-slate-900 text-base leading-snug mb-2">{session.title}</h3>
                        {session.description && (
                          <p className="text-slate-500 text-sm leading-relaxed line-clamp-3">{session.description}</p>
                        )}

                        {/* Hover CTA */}
                        <div className="mt-5 flex items-center gap-1 text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: a.dark }}>
                          Learn more <ArrowRight size={12} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* CTA */}
              <div
                className="max-w-2xl mx-auto text-center rounded-3xl p-10 mt-16 border"
                style={{ background: 'var(--brand-light)', borderColor: 'color-mix(in srgb, var(--brand) 20%, transparent)' }}
              >
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-5"
                  style={{ background: 'var(--brand-dark)' }}
                >
                  <Layers size={22} className="text-white" />
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-2">Have research to share?</h3>
                <p className="text-slate-500 text-sm mb-6">Submit an abstract and present your work at the congress.</p>
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
