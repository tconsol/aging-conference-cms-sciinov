import { useEffect, useState } from 'react';
import PageHero from '../components/ui/PageHero';
import SectionHeader from '../components/ui/SectionHeader';
import Spinner from '../components/ui/Spinner';
import OrganizerCarousel from '../components/ui/OrganizerCarousel';
import { peopleAPI } from '../api/people';
import { contentAPI } from '../api/content';

export default function Organizers() {
  const [organizers, setOrganizers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [orgContent, setOrgContent] = useState('');

  useEffect(() => {
    peopleAPI.getOrganizers()
      .then((res) => {
        const data = res.data?.data ?? res.data ?? [];
        setOrganizers(Array.isArray(data) ? data : []);
      })
      .catch(() => setOrganizers([]))
      .finally(() => setLoading(false));

    contentAPI.getSiteSettings()
      .then((res) => {
        const s = res.data?.data ?? res.data ?? {};
        setOrgContent(s.organizerPageContent || '');
      })
      .catch(() => {});
  }, []);

  const sorted = [...organizers].sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));

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
          ) : sorted.length === 0 ? (
            <div className="text-center py-20">
              <SectionHeader title="Organizers Coming Soon" subtitle="Organizer information will be published soon." />
            </div>
          ) : (
            <OrganizerCarousel organizers={sorted} />
          )}
        </div>
      </section>

      {orgContent && (
        <section className="section-padding" style={{ background: '#f8fafc' }}>
          <div className="container-custom max-w-4xl">
            <div
              className="w-12 h-1 rounded-full mb-6"
              style={{ background: 'var(--brand-dark)' }}
            />
            <div
              className="prose prose-slate max-w-none text-slate-600 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: orgContent }}
            />
          </div>
        </section>
      )}
    </div>
  );
}
