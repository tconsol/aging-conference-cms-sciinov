import { useEffect, useState } from 'react';
import { Clock, Calendar, Mic, Tag } from 'lucide-react';
import PageHero from '../components/ui/PageHero';
import Spinner from '../components/ui/Spinner';
import SectionHeader from '../components/ui/SectionHeader';
import { congressAPI } from '../api/congress';
import { usecongress } from '../context/congressContext';

const TYPE_COLORS = {
  keynote:  { bg: 'rgba(245,158,11,0.12)', text: '#b45309',  dot: '#f59e0b' },
  panel:    { bg: 'color-mix(in srgb, var(--brand) 10%, white)', text: 'var(--brand-dark)', dot: 'var(--brand)' },
  workshop: { bg: 'rgba(139,92,246,0.1)', text: '#6d28d9',  dot: '#8b5cf6' },
  break:    { bg: '#f8fafc',              text: '#94a3b8',   dot: '#cbd5e1' },
  default:  { bg: 'color-mix(in srgb, var(--brand) 8%, white)', text: 'var(--brand-dark)', dot: 'var(--brand)' },
};

function typeColor(type) {
  return TYPE_COLORS[type?.toLowerCase()] || TYPE_COLORS.default;
}

export default function Program() {
  const { activeEdition, loading: congressLoading } = usecongress();
  const [program, setProgram] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeDay, setActiveDay] = useState(0);

  useEffect(() => {
    if (congressLoading) return;
    const params = activeEdition?._id ? { edition: activeEdition._id } : {};
    congressAPI.getProgram(params)
      .then((res) => {
        const data = res.data?.data ?? res.data ?? [];
        setProgram(Array.isArray(data) ? data : []);
      })
      .catch(() => setProgram([]))
      .finally(() => setLoading(false));
  }, [activeEdition, congressLoading]);

  const days = program.reduce((acc, item) => {
    const day = item.day || item.date || 'Day 1';
    if (!acc[day]) acc[day] = [];
    acc[day].push(item);
    return acc;
  }, {});
  const dayKeys = Object.keys(days);

  return (
    <div>
      <PageHero
        title="Scientific Program"
        subtitle="The complete schedule of talks, panels, and events for the congress."
        breadcrumb={[{ label: 'Home', href: '/' }, { label: 'Scientific Program' }]}
      />

      <section className="section-padding bg-white">
        <div className="container-custom">
          {loading ? (
            <div className="flex justify-center py-20"><Spinner size="lg" /></div>
          ) : program.length === 0 ? (
            <div className="text-center py-20">
              <SectionHeader title="Program Coming Soon" subtitle="The full scientific program will be published prior to the congress." />
            </div>
          ) : (
            <>
              {/* Day tabs */}
              {dayKeys.length > 1 && (
                <div className="flex flex-wrap gap-2 mb-10">
                  {dayKeys.map((day, i) => (
                    <button
                      key={day}
                      onClick={() => setActiveDay(i)}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-semibold transition-all duration-200"
                      style={{
                        background: activeDay === i ? 'var(--brand-dark)' : '#f1f5f9',
                        color: activeDay === i ? '#fff' : '#475569',
                        boxShadow: activeDay === i ? '0 4px 14px color-mix(in srgb, var(--brand-dark) 30%, transparent)' : 'none',
                      }}
                    >
                      <Calendar size={13} /> {day}
                    </button>
                  ))}
                </div>
              )}

              {/* Timeline */}
              <div className="max-w-3xl mx-auto relative">
                {/* Vertical line */}
                <div
                  className="absolute left-[22px] top-6 bottom-6 w-0.5"
                  style={{ background: 'linear-gradient(to bottom, var(--brand-light), var(--brand), var(--brand-light))' }}
                />

                <div className="flex flex-col gap-4">
                  {(days[dayKeys[activeDay]] || []).map((item, idx) => {
                    const tc = typeColor(item.type);
                    return (
                      <div key={item._id || idx} className="relative flex gap-5 pl-14">
                        {/* Dot */}
                        <div
                          className="absolute left-[15px] top-5 w-[15px] h-[15px] rounded-full border-[3px] border-white shadow"
                          style={{ background: tc.dot }}
                        />

                        {/* Card */}
                        <div className="flex-1 group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden">
                          {/* Top accent */}
                          <div className="h-[3px]" style={{ background: tc.dot }} />
                          <div className="p-5">
                            <div className="flex flex-col sm:flex-row sm:items-start gap-3 justify-between">
                              <div className="flex-1 min-w-0">
                                {/* Time */}
                                {(item.startTime || item.time) && (
                                  <div className="flex items-center gap-1.5 text-xs font-bold mb-2" style={{ color: tc.text }}>
                                    <Clock size={11} />
                                    {item.startTime || item.time}
                                    {item.endTime && ` – ${item.endTime}`}
                                  </div>
                                )}
                                <h3 className="font-black text-slate-900 leading-snug">{item.title}</h3>
                                {item.speaker && (
                                  <p className="flex items-center gap-1.5 text-sm text-slate-500 mt-1">
                                    <Mic size={12} className="shrink-0" />
                                    {typeof item.speaker === 'object'
                                      ? [item.speaker.fullName, item.speaker.designation, item.speaker.organization].filter(Boolean).join(' · ')
                                      : item.speaker}
                                  </p>
                                )}
                                {item.description && (
                                  <p className="text-sm text-slate-500 mt-2 leading-relaxed">{item.description}</p>
                                )}
                              </div>
                              {/* Type badge */}
                              {item.type && (
                                <span
                                  className="shrink-0 self-start text-[11px] font-bold uppercase tracking-wide px-3 py-1 rounded-xl capitalize"
                                  style={{ background: tc.bg, color: tc.text }}
                                >
                                  {item.type}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
