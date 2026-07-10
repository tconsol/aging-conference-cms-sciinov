import { useEffect, useState } from 'react';
import { Calendar, CheckCircle, AlertCircle } from 'lucide-react';
import PageHero from '../components/ui/PageHero';
import SectionHeader from '../components/ui/SectionHeader';
import Spinner from '../components/ui/Spinner';
import { congressAPI } from '../api/congress';
import { usecongress } from '../context/congressContext';
import { formatDate } from '../utils/helpers';

function DateStatus({ date }) {
  const now = new Date();
  const d = new Date(date);
  const isPast = d < now;
  const isUpcoming = d - now < 7 * 24 * 60 * 60 * 1000 && d >= now;
  if (isPast) return <span className="flex items-center gap-1 text-xs text-slate-400"><CheckCircle size={12} /> Passed</span>;
  if (isUpcoming) return <span className="flex items-center gap-1 text-xs text-amber-600 font-semibold"><AlertCircle size={12} /> Upcoming</span>;
  return null;
}

export default function ImportantDates() {
  const { activeEdition } = usecongress();
  const [dates, setDates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = activeEdition?._id ? { edition: activeEdition._id } : {};
    congressAPI.getImportantDates(params)
      .then((res) => {
        const data = res.data?.data ?? res.data ?? [];
        setDates(Array.isArray(data) ? data : []);
      })
      .catch(() => setDates([]))
      .finally(() => setLoading(false));
  }, [activeEdition]);

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
              <SectionHeader title="Dates Coming Soon" subtitle="Important deadlines will be announced shortly. Please check back." />
            </div>
          ) : (
            <div className="max-w-3xl mx-auto">
              <div className="relative">
                <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-teal-100" />
                <div className="flex flex-col gap-6">
                  {dates.map((d, idx) => {
                    const isPast = new Date(d.date) < new Date();
                    return (
                      <div key={d._id || idx} className="relative flex gap-6 pl-14">
                        <div className={`absolute left-3 top-4 w-5 h-5 rounded-full border-2 border-white shadow-md flex items-center justify-center ${isPast ? 'bg-slate-300' : 'bg-teal-700'}`}>
                          {isPast && <CheckCircle size={12} className="text-white" />}
                        </div>
                        <div className={`flex-1 rounded-lg border p-5 ${isPast ? 'bg-slate-50 border-slate-100 opacity-70' : 'bg-white border-slate-100 shadow-sm'}`}>
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                            <div>
                              <h3 className={`font-bold text-base ${isPast ? 'text-slate-500' : 'text-slate-900'}`}>
                                {d.label}
                              </h3>
                            </div>
                            <div className="flex flex-col items-start sm:items-end gap-1 shrink-0">
                              <span className={`flex items-center gap-1.5 font-semibold text-sm ${isPast ? 'text-slate-400' : 'text-teal-700'}`}>
                                <Calendar size={14} /> {formatDate(d.date)}
                              </span>
                              <DateStatus date={d.date} />
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
