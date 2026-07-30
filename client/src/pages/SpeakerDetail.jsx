import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Globe, Building, MapPin } from 'lucide-react';
import Spinner from '../components/ui/Spinner';
import { peopleAPI } from '../api/people';

export default function SpeakerDetail() {
  const { slug } = useParams();
  const [speaker, setSpeaker] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(false);

  useEffect(() => {
    peopleAPI.getSpeakerBySlug(slug)
      .then((res) => setSpeaker(res.data?.data ?? res.data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return <div className="flex justify-center items-center min-h-[60vh]"><Spinner size="lg" /></div>;
  }

  if (error || !speaker) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <p className="text-slate-600 text-lg font-semibold">Speaker not found.</p>
        <Link to="/speakers" className="flex items-center gap-2 text-sm font-bold transition-opacity hover:opacity-70" style={{ color: 'var(--brand-dark)' }}>
          <ArrowLeft size={16} /> Back to Speakers
        </Link>
      </div>
    );
  }

  const initials = speaker.fullName
    ? speaker.fullName.split(' ').map((w) => w[0]).slice(0, 2).join('')
    : 'S';

  return (
    <div className="bg-white min-h-screen">
      {/* Breadcrumb */}
      <div className="border-b border-slate-100">
        <div className="container-custom py-4">
          <Link to="/speakers" className="inline-flex items-center gap-2 text-sm font-semibold transition-opacity hover:opacity-70" style={{ color: 'var(--brand-dark)' }}>
            <ArrowLeft size={15} /> All Speakers
          </Link>
        </div>
      </div>

      {/* Hero strip */}
      <div
        className="py-14"
        style={{ background: 'linear-gradient(135deg, var(--brand-dark) 0%, color-mix(in srgb, var(--brand-dark) 70%, black) 100%)' }}
      >
        <div className="container-custom">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-8">
            {/* Photo */}
            <div
              className="w-32 h-32 sm:w-40 sm:h-40 rounded-3xl overflow-hidden shrink-0 shadow-2xl"
              style={{ border: '4px solid rgba(255,255,255,0.15)' }}
            >
              {speaker.photo ? (
                <img src={speaker.photo} alt={speaker.fullName} className="w-full h-full object-cover object-top" />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center"
                  style={{ background: 'rgba(255,255,255,0.1)' }}
                >
                  <span className="text-5xl font-black text-white/70 select-none">{initials}</span>
                </div>
              )}
            </div>

            {/* Name + info */}
            <div className="pb-1">
              <h1 className="text-3xl sm:text-4xl font-black text-white leading-tight">{speaker.fullName}</h1>
              {speaker.designation && (
                <p className="text-white/70 mt-1.5 text-lg font-medium">{speaker.designation}</p>
              )}
              <div className="flex flex-wrap gap-4 mt-3">
                {speaker.organization && (
                  <span className="flex items-center gap-2 text-white/60 text-sm">
                    <Building size={13} /> {speaker.organization}
                  </span>
                )}
                {speaker.country && (
                  <span className="flex items-center gap-2 text-white/60 text-sm">
                    <MapPin size={13} /> {speaker.country}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <section className="section-padding">
        <div className="container-custom">
          <div className="max-w-3xl">
            {speaker.biography ? (
              <>
                <p className="text-xs font-black uppercase tracking-[0.25em] mb-4" style={{ color: 'var(--brand)' }}>Biography</p>
                <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed text-[15px]">
                  {typeof speaker.biography === 'string' && speaker.biography.startsWith('<') ? (
                    <div dangerouslySetInnerHTML={{ __html: speaker.biography }} />
                  ) : (
                    <p>{speaker.biography}</p>
                  )}
                </div>
              </>
            ) : (
              <p className="text-slate-400 italic">No biography available.</p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
