import { useEffect, useState } from 'react';
import * as LucideIcons from 'lucide-react';
import { BookOpen } from 'lucide-react';
import PageHero from '../components/ui/PageHero';
import SectionHeader from '../components/ui/SectionHeader';
import Spinner from '../components/ui/Spinner';
import { congressAPI } from '../api/congress';
import { usecongress } from '../context/congressContext';

function toPascalCase(str) {
  return str.split(/[-_\s]+/).map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join('');
}

function SessionIcon({ icon }) {
  const Comp = (icon && LucideIcons[toPascalCase(icon)]) || BookOpen;
  return <Comp size={20} className="text-teal-700" />;
}

export default function Sessions() {
  const { activeEdition } = usecongress();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

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
            <div className="flex flex-col gap-4">
              {sessions.map((session) => (
                <div
                  key={session._id}
                  className="bg-white rounded-lg border border-slate-100 shadow-sm p-6 hover:shadow-md hover:border-teal-100 transition-all flex items-start gap-4"
                >
                  <div className="w-11 h-11 bg-teal-50 rounded-lg flex items-center justify-center shrink-0">
                    <SessionIcon icon={session.icon} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-900 text-lg">{session.title}</h3>
                    {session.description && (
                      <p className="text-slate-600 text-sm mt-2 leading-relaxed">{session.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
