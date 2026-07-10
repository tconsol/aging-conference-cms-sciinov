import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Globe, Building } from 'lucide-react';
import PageHero from '../components/ui/PageHero';
import Spinner from '../components/ui/Spinner';
import { peopleAPI } from '../api/people';

export default function SpeakerDetail() {
  const { slug } = useParams();
  const [speaker, setSpeaker] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    peopleAPI.getSpeakerBySlug(slug)
      .then((res) => setSpeaker(res.data?.data ?? res.data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !speaker) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-4">
        <p className="text-slate-600 text-lg">Speaker not found.</p>
        <Link to="/speakers" className="text-teal-700 hover:underline flex items-center gap-2">
          <ArrowLeft size={16} /> Back to Speakers
        </Link>
      </div>
    );
  }

  return (
    <div>
      <PageHero
        title={speaker.fullName}
        subtitle={[speaker.designation, speaker.organization].filter(Boolean).join(' · ')}
        breadcrumb={[
          { label: 'Home', href: '/' },
          { label: 'Speakers', href: '/speakers' },
          { label: speaker.fullName },
        ]}
      />

      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="grid lg:grid-cols-3 gap-10">
            {/* Sidebar */}
            <div className="flex flex-col gap-5">
              {speaker.photo ? (
                <img
                  src={speaker.photo}
                  alt={speaker.fullName}
                  className="w-full rounded-lg object-cover shadow-md aspect-[3/4]"
                />
              ) : (
                <div className="w-full rounded-lg bg-teal-100 flex items-center justify-center aspect-[3/4]">
                  <span className="text-6xl font-bold text-teal-300">{speaker.fullName?.[0] ?? 'S'}</span>
                </div>
              )}

              {/* Info card */}
              <div className="bg-slate-50 rounded-lg border border-slate-100 p-5 flex flex-col gap-3">
                {speaker.organization && (
                  <div className="flex items-start gap-2">
                    <Building size={16} className="text-teal-600 shrink-0 mt-0.5" />
                    <span className="text-sm text-slate-700">{speaker.organization}</span>
                  </div>
                )}
                {speaker.country && (
                  <div className="flex items-center gap-2">
                    <Globe size={16} className="text-teal-600 shrink-0" />
                    <span className="text-sm text-slate-700">{speaker.country}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Main content */}
            <div className="lg:col-span-2">
              {speaker.biography && (
                <div className="mb-8">
                  <h2 className="text-xl font-bold text-slate-900 mb-4">Biography</h2>
                  <div className="prose prose-slate max-w-none text-slate-600">
                    {typeof speaker.biography === 'string' && speaker.biography.startsWith('<') ? (
                      <div dangerouslySetInnerHTML={{ __html: speaker.biography }} />
                    ) : (
                      <p className="leading-relaxed">{speaker.biography}</p>
                    )}
                  </div>
                </div>
              )}

              <Link
                to="/speakers"
                className="inline-flex items-center gap-2 text-teal-700 hover:text-teal-900 font-medium text-sm transition-colors"
              >
                <ArrowLeft size={16} /> Back to All Speakers
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
