import { useEffect, useState } from 'react';
import PageHero from '../components/ui/PageHero';
import SectionHeader from '../components/ui/SectionHeader';
import Spinner from '../components/ui/Spinner';
import { peopleAPI } from '../api/people';

export default function Organizers() {
  const [organizers, setOrganizers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    peopleAPI.getOrganizers()
      .then((res) => {
        const data = res.data?.data ?? res.data ?? [];
        setOrganizers(Array.isArray(data) ? data : []);
      })
      .catch(() => setOrganizers([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <PageHero
        title="Organizers"
        subtitle="The dedicated team behind the Aging congress."
        breadcrumb={[{ label: 'Home', href: '/' }, { label: 'Organizers' }]}
      />

      <section className="section-padding bg-white">
        <div className="container-custom">
          {loading ? (
            <div className="flex justify-center py-20"><Spinner size="lg" /></div>
          ) : organizers.length === 0 ? (
            <div className="text-center py-20">
              <SectionHeader title="Organizers Coming Soon" subtitle="Organizer information will be published soon." />
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {organizers.map((org) => (
                <div
                  key={org._id}
                  className="bg-white rounded-lg border border-slate-100 shadow-sm p-6 hover:shadow-md transition-all"
                >
                  <div className="flex items-start gap-4">
                    {org.photo ? (
                      <img src={org.photo} alt={org.name} className="w-16 h-16 rounded-xl object-cover shrink-0" />
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-teal-100 flex items-center justify-center shrink-0">
                        <span className="text-xl font-bold text-teal-700">{org.name?.[0] ?? 'O'}</span>
                      </div>
                    )}
                    <div className="min-w-0">
                      <h3 className="font-bold text-slate-900">{org.name}</h3>
                      {org.designation && <p className="text-xs text-slate-500 mt-0.5">{org.designation}</p>}
                    </div>
                  </div>
                  {org.bio && <p className="text-sm text-slate-600 mt-4 leading-relaxed">{org.bio}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
