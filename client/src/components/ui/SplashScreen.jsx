import { useEffect, useState } from 'react';
import { usecongress } from '../../context/congressContext';

const MIN_DISPLAY_MS = 1400;

export default function SplashScreen() {
  const { loading, siteSettings } = usecongress();
  const [minElapsed, setMinElapsed] = useState(false);
  const [visible, setVisible] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMinElapsed(true), MIN_DISPLAY_MS);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!loading && minElapsed) {
      setFadeOut(true);
      const t = setTimeout(() => setVisible(false), 700);
      return () => clearTimeout(t);
    }
  }, [loading, minElapsed]);

  if (!visible) return null;

  const siteName = siteSettings?.siteName || 'Aging Congress';
  const logo = siteSettings?.logo;
  const initials = siteName.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase();

  return (
    <div className={`sp-root${fadeOut ? ' sp-out' : ''}`}>
      <style>{`
        .sp-root {
          position: fixed; inset: 0; z-index: 9999;
          background-color: #060e18;
          background-image:
            linear-gradient(rgba(45,212,191,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(45,212,191,0.04) 1px, transparent 1px);
          background-size: 44px 44px;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center; gap: 0;
          opacity: 1; transition: opacity 0.7s ease;
        }
        .sp-out { opacity: 0; pointer-events: none; }

        /* ── Rings wrap ── */
        .sp-rings {
          position: relative;
          width: 140px; height: 140px;
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 28px;
          animation: spDrop 0.7s cubic-bezier(0.34,1.56,0.64,1) both;
        }
        @keyframes spDrop {
          from { opacity: 0; transform: scale(0.7); }
          to   { opacity: 1; transform: scale(1); }
        }

        /* Pulsing rings */
        .sp-ring {
          position: absolute; border-radius: 50%;
          border: 1.5px solid rgba(45,212,191,0.35);
          animation: spRing 2.6s ease-out infinite;
        }
        .sp-ring-1 { width:  72px; height:  72px; animation-delay: 0s; }
        .sp-ring-2 { width: 100px; height: 100px; animation-delay: 0.65s; }
        .sp-ring-3 { width: 130px; height: 130px; animation-delay: 1.3s; }
        @keyframes spRing {
          0%   { opacity: 0.9; transform: scale(0.85); }
          100% { opacity: 0;   transform: scale(1.25); }
        }

        /* Center badge */
        .sp-badge {
          position: absolute;
          width: 58px; height: 58px; border-radius: 16px;
          background: linear-gradient(135deg, #0f766e 0%, #0d9488 100%);
          box-shadow: 0 0 0 6px rgba(45,212,191,0.12), 0 0 40px rgba(45,212,191,0.3);
          display: flex; align-items: center; justify-content: center;
          overflow: hidden;
        }
        .sp-badge img { width: 100%; height: 100%; object-fit: contain; padding: 6px; }
        .sp-badge-text {
          font-size: 20px; font-weight: 900; color: #fff;
          letter-spacing: -0.02em; font-family: Georgia, serif;
        }

        /* Text */
        .sp-name {
          font-size: clamp(1.4rem, 4vw, 2rem);
          font-weight: 800; color: #e2e8f0; letter-spacing: 0.01em;
          margin: 0 0 6px; text-align: center;
          font-family: Georgia, "Times New Roman", serif;
          animation: spFadeUp 0.6s ease 0.3s both;
        }
        .sp-tag {
          font-size: 10px; font-weight: 700;
          letter-spacing: 0.2em; text-transform: uppercase;
          color: #2dd4bf; margin: 0 0 28px;
          animation: spFadeUp 0.6s ease 0.45s both;
        }
        @keyframes spFadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* Progress bar */
        .sp-bar-wrap {
          width: 200px; height: 2px;
          background: rgba(255,255,255,0.07);
          border-radius: 2px; overflow: hidden;
          animation: spFadeUp 0.6s ease 0.55s both;
        }
        .sp-bar-fill {
          height: 100%;
          background: linear-gradient(90deg, #0f766e, #2dd4bf, #0f766e);
          background-size: 200% 100%;
          border-radius: 2px;
          animation: spBarSlide 1.6s ease 0.8s both, spBarShimmer 1.8s linear 0.8s infinite;
        }
        @keyframes spBarSlide {
          from { width: 0%; }
          to   { width: 100%; }
        }
        @keyframes spBarShimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        /* Status */
        .sp-status {
          font-size: 11px; color: rgba(148,163,184,0.6);
          letter-spacing: 0.06em; margin-top: 10px;
          animation: spFadeUp 0.6s ease 0.7s both;
        }

        /* Corner accents */
        .sp-corner {
          position: absolute; width: 28px; height: 28px;
          border-color: rgba(45,212,191,0.2); border-style: solid;
        }
        .sp-corner-tl { top: 24px; left: 24px; border-width: 2px 0 0 2px; border-radius: 3px 0 0 0; }
        .sp-corner-tr { top: 24px; right: 24px; border-width: 2px 2px 0 0; border-radius: 0 3px 0 0; }
        .sp-corner-bl { bottom: 24px; left: 24px; border-width: 0 0 2px 2px; border-radius: 0 0 0 3px; }
        .sp-corner-br { bottom: 24px; right: 24px; border-width: 0 2px 2px 0; border-radius: 0 0 3px 0; }
      `}</style>

      {/* Corner brackets */}
      <div className="sp-corner sp-corner-tl" />
      <div className="sp-corner sp-corner-tr" />
      <div className="sp-corner sp-corner-bl" />
      <div className="sp-corner sp-corner-br" />

      {/* Rings + badge */}
      <div className="sp-rings">
        <div className="sp-ring sp-ring-1" />
        <div className="sp-ring sp-ring-2" />
        <div className="sp-ring sp-ring-3" />
        <div className="sp-badge">
          {logo
            ? <img src={logo} alt={siteName} />
            : <span className="sp-badge-text">{initials}</span>
          }
        </div>
      </div>

      <h1 className="sp-name">{siteName}</h1>
      <p className="sp-tag">International Aging Congress</p>

      <div className="sp-bar-wrap">
        <div className="sp-bar-fill" />
      </div>
      <p className="sp-status">{loading ? 'Loading congress data…' : 'Almost ready'}</p>
    </div>
  );
}
