import { useEffect, useState } from 'react';
import { Calendar, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import PageHero from '../components/ui/PageHero';
import SectionHeader from '../components/ui/SectionHeader';
import Spinner from '../components/ui/Spinner';
import { congressAPI } from '../api/congress';
import { usecongress } from '../context/congressContext';
import { formatDate } from '../utils/helpers';

function getStatus(date) {
  const now = new Date();
  const d = new Date(date);
  const diff = d - now;
  if (diff < 0) return 'past';
  if (diff < 14 * 24 * 60 * 60 * 1000) return 'soon';
  return 'future';
}

export default function ImportantDates() {
  const { activeEdition, loading: congressLoading } = usecongress();
  const [dates, setDates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (congressLoading) return;
    const params = activeEdition?._id ? { edition: activeEdition._id } : {};
    congressAPI.getImportantDates(params)
      .then((res) => {
        const data = res.data?.data ?? res.data ?? [];
        setDates(Array.isArray(data) ? data : []);
      })
      .catch(() => setDates([]))
      .finally(() => setLoading(false));
  }, [activeEdition, congressLoading]);

  return (
    <div>
      <PageHero
        title="Important Dates"
        subtitle="Key deadlines for abstract submission, registration, and other congress milestones."
        breadcrumb={[{ label: 'Home', href: '/' }, { label: 'Important Dates' }]}
      />

      <section className="section-padding bg-white">
        <div className="container-custom">
          {loading ? (
            <div className="flex justify-center py-20"><Spinner size="lg" /></div>
          ) : dates.length === 0 ? (
            <div className="text-center py-20">
              <SectionHeader title="Dates Coming Soon" subtitle="Important deadlines will be announced shortly." />
            </div>
          ) : (
            <div className="max-w-2xl mx-auto">
              {/* Legend */}
              <div className="flex items-center gap-6 mb-10 justify-center flex-wrap">
                {[
                  { color: 'var(--brand-dark)', label: 'Upcoming' },
                  { color: '#f59e0b',            label: 'Closing Soon' },
                  { color: '#94a3b8',            label: 'Passed' },
                ].map(({ color, label }) => (
                  <span key={label} className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
                    {label}
                  </span>
                ))}
              </div>

              {/* Timeline */}
              <div className="relative">
                {/* Vertical line */}
                <div
                  className="absolute left-6 top-4 bottom-4 w-px"
                  style={{ background: 'linear-gradient(to bottom, var(--brand-light), var(--brand), var(--brand-light))' }}
                />

                <div className="flex flex-col gap-5">
                  {dates.map((d, idx) => {
                    const status = getStatus(d.date);
                    const dotColor = status === 'past' ? '#94a3b8' : status === 'soon' ? '#f59e0b' : 'var(--brand-dark)';

                    return (
                      <div key={d._id || idx} className="relative flex gap-6 pl-16">
                        {/* Dot */}
                        <div
                          className="absolute left-4 top-5 w-5 h-5 rounded-full border-4 border-white shadow-md z-10 flex items-center justify-center"
                          style={{ background: dotColor, boxShadow: status !== 'past' ? `0 0 0 4px color-mix(in srgb, ${dotColor} 20%, transparent)` : undefined }}
                        >
                          {status === 'past' && <CheckCircle size={10} className="text-white" />}
                        </div>

                        {/* Card */}
                        <div
                          className="flex-1 rounded-2xl border p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                          style={{
                            background: status === 'past' ? '#f8fafc' : 'white',
                            borderColor: status === 'past'
                              ? '#e2e8f0'
                              : status === 'soon'
                              ? '#fde68a'
                              : 'color-mix(in srgb, var(--brand) 20%, transparent)',
                            opacity: status === 'past' ? 0.75 : 1,
                            boxShadow: status !== 'past' ? '0 2px 12px rgba(0,0,0,0.06)' : 'none',
                          }}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex-1">
                              <h3 className={`font-bold text-base leading-snug ${status === 'past' ? 'text-slate-400' : 'text-slate-900'}`}>
                                {d.label}
                              </h3>
                              {d.description && (
                                <p className="text-sm text-slate-500 mt-1 leading-relaxed">{d.description}</p>
                              )}
                            </div>
                            <div className="shrink-0 flex flex-col items-start sm:items-end gap-1.5">
                              <span
                                className="flex items-center gap-1.5 text-sm font-bold px-3 py-1.5 rounded-xl"
                                style={{
                                  background: status === 'past'
                                    ? '#f1f5f9'
                                    : status === 'soon'
                                    ? '#fef3c7'
                                    : 'var(--brand-light)',
                                  color: status === 'past'
                                    ? '#94a3b8'
                                    : status === 'soon'
                                    ? '#d97706'
                                    : 'var(--brand-dark)',
                                }}
                              >
                                <Calendar size={13} />
                                {formatDate(d.date)}
                              </span>
                              {status === 'soon' && (
                                <span className="flex items-center gap-1 text-[11px] font-semibold text-amber-600">
                                  <AlertCircle size={11} /> Closing Soon
                                </span>
                              )}
                              {status === 'past' && (
                                <span className="flex items-center gap-1 text-[11px] text-slate-400">
                                  <CheckCircle size={11} /> Passed
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
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
