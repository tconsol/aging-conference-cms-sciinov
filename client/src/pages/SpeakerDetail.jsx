import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Building, MapPin } from 'lucide-react';
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
    return <div className="flex justify-center items-center min-h-[60vh]"><Spinner size="lg" /></div>;
  }

  if (error || !speaker) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <p className="text-slate-600 text-lg font-semibold">Speaker not found.</p>
        <Link to="/speakers" style={{ color: 'var(--brand-dark)' }}
          className="flex items-center gap-2 text-sm font-bold hover:opacity-70 transition-opacity">
          <ArrowLeft size={16} /> Back to Speakers
        </Link>
      </div>
    );
  }

  const initials = speaker.fullName
    ? speaker.fullName.split(' ').map((w) => w[0]).slice(0, 2).join('')
    : 'S';

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500;1,600&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap');

        .sd-hero-inner {
          display: flex;
          align-items: flex-end;
          gap: 48px;
          min-height: 300px;
        }
        .sd-text-col {
          flex: 1;
          padding-top: 64px;
          padding-bottom: 56px;
        }
        .sd-photo-col {
          flex-shrink: 0;
          align-self: flex-end;
        }
        .sd-photo-frame {
          width: 200px;
          height: 264px;
          border-radius: 14px 14px 0 0;
          border-bottom: none;
          overflow: hidden;
          position: relative;
          border: 1px solid rgba(13,148,136,0.35);
        }
        .sd-bio-text {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: 1.22rem;
          line-height: 1.92;
          color: #1a2b28;
          font-weight: 500;
        }
        .sd-bio-text p { margin: 0 0 1.2em; }
        .sd-bio-text p:last-child { margin-bottom: 0; }

        @media (max-width: 640px) {
          .sd-hero-inner {
            flex-direction: column;
            align-items: flex-start;
            gap: 0;
            min-height: unset;
          }
          .sd-text-col {
            padding-top: 40px;
            padding-bottom: 32px;
            order: 1;
          }
          .sd-photo-col {
            order: 0;
            align-self: flex-start;
            padding-top: 36px;
          }
          .sd-photo-frame {
            width: 96px;
            height: 120px;
            border-radius: 10px;
            border: 1px solid rgba(13,148,136,0.35);
          }
          .sd-bio-text {
            font-size: 1.08rem;
          }
        }
      `}</style>

      <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", background: '#f8faf9', minHeight: '100vh' }}>

        {/* Back nav */}
        <div style={{ background: '#fff', borderBottom: '1px solid #e6edea' }}>
          <div className="container-custom" style={{ paddingTop: '13px', paddingBottom: '13px' }}>
            <Link
              to="/speakers"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '13px',
                fontWeight: '600',
                color: 'var(--brand-dark)',
                letterSpacing: '0.02em',
                textDecoration: 'none',
              }}
              className="opacity-80 hover:opacity-100 transition-opacity"
            >
              <ArrowLeft size={14} />
              All Speakers
            </Link>
          </div>
        </div>

        {/* ── Hero ── */}
        <div style={{ position: 'relative', background: '#081413', overflow: 'hidden' }}>

          {/* Dot-grid texture */}
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            backgroundImage: 'radial-gradient(circle, rgba(13,148,136,0.2) 1px, transparent 1px)',
            backgroundSize: '26px 26px',
            opacity: 0.8,
          }} />

          {/* Radial glow behind photo (right side) */}
          <div style={{
            position: 'absolute', right: '8%', top: '50%',
            transform: 'translate(40%, -50%)',
            width: '440px', height: '440px', borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(13,148,136,0.14) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />

          {/* Left amber vertical accent */}
          <div style={{
            position: 'absolute', top: 0, left: 0, width: '3px', height: '100%',
            background: 'linear-gradient(180deg, var(--brand-accent) 0%, rgba(245,158,11,0.25) 75%, transparent 100%)',
          }} />

          <div className="container-custom" style={{ position: 'relative', zIndex: 2 }}>
            <div className="sd-hero-inner">

              {/* Text column */}
              <div className="sd-text-col">

                {/* Eyebrow */}
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '9px', marginBottom: '18px' }}>
                  <div style={{ width: '20px', height: '2px', background: 'var(--brand-accent)', flexShrink: 0 }} />
                  <span style={{
                    fontFamily: "'DM Sans', system-ui, sans-serif",
                    fontSize: '10px', fontWeight: '700',
                    color: 'var(--brand-accent)',
                    letterSpacing: '0.22em',
                    textTransform: 'uppercase',
                  }}>
                    {speaker.isFeatured ? 'Featured Speaker' : 'Speaker Profile'}
                  </span>
                </div>

                {/* Name */}
                <h1 style={{
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  fontSize: 'clamp(2.6rem, 5vw, 4rem)',
                  fontWeight: '600',
                  color: '#ffffff',
                  lineHeight: '1.04',
                  letterSpacing: '-0.012em',
                  marginBottom: '12px',
                  maxWidth: '580px',
                }}>
                  {speaker.fullName}
                </h1>

                {/* Designation */}
                {speaker.designation && (
                  <p style={{
                    fontFamily: "'Cormorant Garamond', Georgia, serif",
                    fontSize: '1.18rem',
                    fontStyle: 'italic',
                    color: 'rgba(255,255,255,0.48)',
                    fontWeight: '500',
                    marginBottom: '28px',
                    lineHeight: '1.45',
                    maxWidth: '480px',
                  }}>
                    {speaker.designation}
                  </p>
                )}

                {/* Meta pills */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                  {speaker.organization && (
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: '7px',
                      padding: '6px 15px', borderRadius: '100px',
                      border: '1px solid rgba(13,148,136,0.4)',
                      background: 'rgba(13,148,136,0.1)',
                      color: 'rgba(255,255,255,0.8)',
                      fontSize: '13px', fontWeight: '400',
                    }}>
                      <Building size={12} color="var(--brand)" />
                      {speaker.organization}
                    </span>
                  )}
                  {speaker.country && (
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: '7px',
                      padding: '6px 15px', borderRadius: '100px',
                      border: '1px solid rgba(255,255,255,0.1)',
                      background: 'rgba(255,255,255,0.05)',
                      color: 'rgba(255,255,255,0.5)',
                      fontSize: '13px', fontWeight: '400',
                    }}>
                      <MapPin size={12} color="rgba(255,255,255,0.35)" />
                      {speaker.country}
                    </span>
                  )}
                </div>
              </div>

              {/* Photo column */}
              <div className="sd-photo-col">
                <div className="sd-photo-frame">
                  {speaker.photo ? (
                    <img
                      src={speaker.photo}
                      alt={speaker.fullName}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', display: 'block' }}
                    />
                  ) : (
                    <div style={{
                      width: '100%', height: '100%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: 'linear-gradient(160deg, rgba(13,148,136,0.22) 0%, rgba(13,148,136,0.06) 100%)',
                    }}>
                      <span style={{
                        fontFamily: "'Cormorant Garamond', Georgia, serif",
                        fontSize: '4.5rem', fontWeight: '600',
                        color: 'rgba(13,148,136,0.65)',
                        lineHeight: 1, userSelect: 'none',
                      }}>
                        {initials}
                      </span>
                    </div>
                  )}
                  {/* Bottom fade on photo */}
                  <div style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0,
                    height: '70px',
                    background: 'linear-gradient(0deg, rgba(8,20,19,0.55) 0%, transparent 100%)',
                  }} />
                </div>
              </div>

            </div>
          </div>

          {/* Hero bottom accent line */}
          <div style={{
            height: '2px',
            background: 'linear-gradient(90deg, var(--brand-accent) 0%, var(--brand) 30%, rgba(13,148,136,0.18) 65%, transparent 100%)',
          }} />
        </div>

        {/* ── Biography ── */}
        <section style={{ background: '#f8faf9', paddingTop: '72px', paddingBottom: '100px' }}>
          <div className="container-custom">
            <div style={{ maxWidth: '720px' }}>

              {speaker.biography ? (
                <>
                  {/* Section label with rule */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '40px' }}>
                    <div style={{ width: '24px', height: '2px', background: 'var(--brand-accent)', flexShrink: 0 }} />
                    <span style={{
                      fontFamily: "'DM Sans', system-ui, sans-serif",
                      fontSize: '10px', fontWeight: '700',
                      color: 'var(--brand)',
                      letterSpacing: '0.22em',
                      textTransform: 'uppercase',
                    }}>
                      Biography
                    </span>
                    <div style={{ flex: 1, height: '1px', background: '#dce9e5' }} />
                  </div>

                  {/* Bio text */}
                  <div className="sd-bio-text">
                    {typeof speaker.biography === 'string' && speaker.biography.trim().startsWith('<') ? (
                      <div dangerouslySetInnerHTML={{ __html: speaker.biography }} />
                    ) : (
                      <p>{speaker.biography}</p>
                    )}
                  </div>
                </>
              ) : (
                <p style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '15px' }}>
                  No biography available.
                </p>
              )}

            </div>
          </div>
        </section>

      </div>
    </>
  );
}
