import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import * as LucideIcons from 'lucide-react';
import { ArrowLeft, BookOpen, Calendar, MapPin, Users, Clock, Layers } from 'lucide-react';
import Spinner from '../components/ui/Spinner';
import Button from '../components/ui/Button';
import { congressAPI } from '../api/congress';
import { usecongress } from '../context/congressContext';
import { formatDate } from '../utils/helpers';

function toPascalCase(str) {
  return str.split(/[-_\s]+/).map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join('');
}
function SessionIcon({ icon, size = 32, className = '' }) {
  const Comp = (icon && LucideIcons[toPascalCase(icon)]) || BookOpen;
  return <Comp size={size} className={className} />;
}

export default function SessionDetail() {
  const { id } = useParams();
  const { activeEdition } = usecongress();
  const [session, setSession] = useState(null);
  const [related, setRelated]  = useState([]);
  const [loading, setLoading]  = useState(true);
  const [error, setError]      = useState(false);

  useEffect(() => {
    congressAPI.getSessionById(id)
      .then((res) => setSession(res.data?.data ?? res.data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!session) return;
    const params = activeEdition?._id ? { edition: activeEdition._id } : {};
    congressAPI.getSessions(params)
      .then((res) => {
        const data = res.data?.data ?? res.data ?? [];
        setRelated(Array.isArray(data) ? data.filter((s) => s._id !== id).slice(0, 3) : []);
      })
      .catch(() => {});
  }, [session, activeEdition, id]);

  if (loading) {
    return <div className="flex justify-center items-center min-h-[60vh]"><Spinner size="lg" /></div>;
  }

  if (error || !session) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: 'var(--brand-light)' }}>
          <Layers size={28} style={{ color: 'var(--brand-dark)' }} />
        </div>
        <p className="text-slate-600 text-lg font-semibold">Session not found.</p>
        <Link to="/sessions" className="flex items-center gap-2 text-sm font-bold transition-opacity hover:opacity-70" style={{ color: 'var(--brand-dark)' }}>
          <ArrowLeft size={15} /> All Sessions
        </Link>
      </div>
    );
  }

  const speakerList = session.speakers ?? [];
  const scheduleList = session.schedule ?? [];

  return (
    <div className="bg-white min-h-screen">
      {/* Breadcrumb */}
      <div className="border-b border-slate-100">
        <div className="container-custom py-4">
          <Link
            to="/sessions"
            className="inline-flex items-center gap-2 text-sm font-semibold transition-opacity hover:opacity-70"
            style={{ color: 'var(--brand-dark)' }}
          >
            <ArrowLeft size={15} /> All Sessions
          </Link>
        </div>
      </div>

      {/* Hero */}
      <div
        className="py-16"
        style={{ background: 'linear-gradient(135deg, var(--brand-dark) 0%, color-mix(in srgb, var(--brand-dark) 65%, black) 100%)' }}
      >
        <div className="container-custom max-w-4xl">
          {/* Icon circle */}
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-xl"
            style={{ background: 'rgba(255,255,255,0.12)', border: '1.5px solid rgba(255,255,255,0.18)' }}
          >
            <SessionIcon icon={session.icon} size={30} className="text-white" />
          </div>

          <h1
            className="text-2xl sm:text-3xl lg:text-4xl font-black text-white leading-tight mb-4"
            style={{ textWrap: 'balance' }}
          >
            {session.title}
          </h1>

          {/* Meta chips */}
          <div className="flex flex-wrap gap-3 mt-2">
            {session.date && (
              <span className="inline-flex items-center gap-1.5 text-white/70 text-xs font-semibold">
                <Calendar size={12} /> {formatDate(session.date)}
              </span>
            )}
            {session.time && (
              <span className="inline-flex items-center gap-1.5 text-white/70 text-xs font-semibold">
                <Clock size={12} /> {session.time}
              </span>
            )}
            {session.location && (
              <span className="inline-flex items-center gap-1.5 text-white/70 text-xs font-semibold">
                <MapPin size={12} /> {session.location}
              </span>
            )}
            {speakerList.length > 0 && (
              <span className="inline-flex items-center gap-1.5 text-white/70 text-xs font-semibold">
                <Users size={12} /> {speakerList.length} Speaker{speakerList.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <section className="section-padding">
        <div className="container-custom">
          <div className="grid lg:grid-cols-3 gap-10 max-w-5xl">
            {/* Main */}
            <div className="lg:col-span-2">
              {session.description && (
                <>
                  <p className="text-xs font-black uppercase tracking-[0.25em] mb-4" style={{ color: 'var(--brand)' }}>
                    About This Session
                  </p>
                  <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed text-[15px]">
                    {session.description.startsWith?.('<') ? (
                      <div dangerouslySetInnerHTML={{ __html: session.description }} />
                    ) : (
                      <p>{session.description}</p>
                    )}
                  </div>
                </>
              )}

              {/* Schedule / topics */}
              {scheduleList.length > 0 && (
                <div className="mt-10 pt-8 border-t border-slate-100">
                  <p className="text-xs font-black uppercase tracking-[0.25em] mb-6" style={{ color: 'var(--brand)' }}>
                    Session Schedule
                  </p>
                  <div className="flex flex-col gap-4">
                    {scheduleList.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex gap-4 p-4 rounded-2xl border border-slate-100 hover:border-transparent hover:shadow-md transition-all"
                      >
                        {item.time && (
                          <div
                            className="shrink-0 text-xs font-black tabular-nums pt-0.5 min-w-[60px]"
                            style={{ color: 'var(--brand-dark)' }}
                          >
                            {item.time}
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-slate-900 text-sm">{item.title}</p>
                          {item.speaker && <p className="text-xs text-slate-500 mt-0.5">{item.speaker}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Speakers list */}
              {speakerList.length > 0 && (
                <div className="mt-10 pt-8 border-t border-slate-100">
                  <p className="text-xs font-black uppercase tracking-[0.25em] mb-6" style={{ color: 'var(--brand)' }}>
                    Session Speakers
                  </p>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {speakerList.map((sp, idx) => {
                      const name = typeof sp === 'object' ? (sp.name ?? sp.fullName) : sp;
                      const photo = typeof sp === 'object' ? sp.photo : null;
                      const designation = typeof sp === 'object' ? sp.designation : null;
                      const spId = typeof sp === 'object' ? sp._id : null;

                      const card = (
                        <div className="flex items-center gap-3 p-4 rounded-2xl border border-slate-100 group hover:shadow-md hover:border-transparent transition-all">
                          <div
                            className="w-12 h-12 rounded-2xl overflow-hidden shrink-0"
                            style={{ background: 'var(--brand-light)' }}
                          >
                            {photo ? (
                              <img src={photo} alt={name} className="w-full h-full object-cover" />
                            ) : (
                              <div
                                className="w-full h-full flex items-center justify-center font-black text-lg"
                                style={{ color: 'var(--brand-dark)' }}
                              >
                                {name?.[0]}
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 text-sm group-hover:underline">{name}</p>
                            {designation && <p className="text-xs text-slate-500">{designation}</p>}
                          </div>
                        </div>
                      );

                      return spId ? (
                        <Link key={spId} to={`/speakers/${spId}`}>{card}</Link>
                      ) : (
                        <div key={idx}>{card}</div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="flex flex-col gap-4">
              {/* Session details */}
              <div
                className="rounded-2xl p-6 border"
                style={{ background: 'var(--brand-light)', borderColor: 'color-mix(in srgb, var(--brand) 20%, transparent)' }}
              >
                <h3 className="font-black text-slate-900 text-sm mb-4">Session Details</h3>
                <div className="flex flex-col gap-3">
                  {session.date && (
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Date</p>
                      <p className="text-sm font-semibold text-slate-700">{formatDate(session.date)}</p>
                    </div>
                  )}
                  {session.time && (
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Time</p>
                      <p className="text-sm font-semibold text-slate-700">{session.time}</p>
                    </div>
                  )}
                  {session.location && (
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Room / Hall</p>
                      <p className="text-sm font-semibold text-slate-700">{session.location}</p>
                    </div>
                  )}
                  {session.edition && (
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Edition</p>
                      <p className="text-sm font-semibold text-slate-700">
                        {typeof session.edition === 'object'
                          ? (session.edition.title || session.edition.year || '')
                          : session.edition}
                      </p>
                    </div>
                  )}
                  {session.capacity && (
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Capacity</p>
                      <p className="text-sm font-semibold text-slate-700">{session.capacity} seats</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Register CTA */}
              <div className="rounded-2xl border border-slate-100 p-6 shadow-sm flex flex-col gap-3">
                <h3 className="font-black text-slate-900 text-sm">Attend This Session</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Register for the congress to participate in this session.
                </p>
                <Button to="/registration" variant="primary" size="sm">
                  Register Now
                </Button>
                <Button to="/abstract-submission" variant="outline" size="sm">
                  Submit an Abstract
                </Button>
              </div>

              {/* Back */}
              <Button to="/sessions" variant="outline" size="sm">
                <ArrowLeft size={14} /> All Sessions
              </Button>
            </div>
          </div>

          {/* Related sessions */}
          {related.length > 0 && (
            <div className="mt-16 pt-12 border-t border-slate-100 max-w-5xl">
              <p className="text-xs font-black uppercase tracking-[0.25em] mb-8" style={{ color: 'var(--brand)' }}>
                Other Sessions
              </p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {related.map((s, i) => (
                  <Link
                    key={s._id}
                    to={`/sessions/${s._id}`}
                    className="group p-5 rounded-2xl border border-slate-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col gap-3"
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: 'var(--brand-light)' }}
                    >
                      <SessionIcon icon={s.icon} size={18} className="" style={{ color: 'var(--brand-dark)' }} />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-sm leading-snug line-clamp-2 group-hover:underline">
                        {s.title}
                      </p>
                      {s.description && (
                        <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">{s.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-xs font-bold mt-auto" style={{ color: 'var(--brand-dark)' }}>
                      Learn more <ArrowLeft size={11} className="rotate-180" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
