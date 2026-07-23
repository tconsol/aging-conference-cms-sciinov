import { useEffect, useState } from 'react';
import { Clock, Calendar } from 'lucide-react';
import PageHero from '../components/ui/PageHero';
import Spinner from '../components/ui/Spinner';
import SectionHeader from '../components/ui/SectionHeader';
import { congressAPI } from '../api/congress';
import { usecongress } from '../context/congressContext';
import { formatDateShort } from '../utils/helpers';

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

  // Group by day
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
              {dayKeys.length > 1 && (
                <div className="flex flex-wrap gap-2 mb-10">
                  {dayKeys.map((day, i) => (
                    <button
                      key={day}
                      onClick={() => setActiveDay(i)}
                      className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                        activeDay === i
                          ? 'bg-teal-700 text-white shadow-md'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      <span className="flex items-center gap-1.5">
                        <Calendar size={13} /> {day}
                      </span>
                    </button>
                  ))}
                </div>
              )}
              <div className="relative">
                <div className="absolute left-8 top-0 bottom-0 w-px bg-slate-200" />
                <div className="flex flex-col gap-4">
                  {(days[dayKeys[activeDay]] || []).map((item) => (
                    <div key={item._id} className="relative flex gap-6 pl-16">
                      <div className="absolute left-6 top-5 w-4 h-4 bg-teal-700 rounded-full border-2 border-white shadow" />
                      <div className="flex-1 bg-white rounded-lg border border-slate-100 shadow-sm p-5">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                          <div>
                            {(item.startTime || item.time) && (
                              <span className="flex items-center gap-1 text-xs text-teal-600 font-semibold mb-1">
                                <Clock size={11} /> {item.startTime || item.time}
                                {item.endTime && ` – ${item.endTime}`}
                              </span>
                            )}
                            <h3 className="font-bold text-slate-900">{item.title}</h3>
                            {item.speaker && (
                              <p className="text-sm text-slate-500 mt-0.5">
                                {typeof item.speaker === 'object'
                                  ? [item.speaker.fullName, item.speaker.designation, item.speaker.organization].filter(Boolean).join(' · ')
                                  : item.speaker}
                              </p>
                            )}
                            {item.description && (
                              <p className="text-sm text-slate-600 mt-2 leading-relaxed">{item.description}</p>
                            )}
                          </div>
                          {item.type && (
                            <span className="shrink-0 text-xs font-medium bg-teal-50 text-teal-700 px-2 py-1 rounded-full capitalize">
                              {item.type}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
