import { useEffect, useRef, useState } from 'react';
import { usecongress } from '../../context/congressContext';

const MIN_DISPLAY_MS = 1400;
const FADE_MS = 800;

export default function SplashScreen() {
  const { loading, siteSettings } = usecongress();
  const [minElapsed, setMinElapsed] = useState(false);
  const [visible, setVisible] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);
  // Creeps toward 90 while data is in flight, then snaps to 100 on the way out —
  // a real percentage isn't available, but a stalled bar reads as a broken app.
  const [progress, setProgress] = useState(0);
  const progressRef = useRef(0);

  useEffect(() => {
    const t = setTimeout(() => setMinElapsed(true), MIN_DISPLAY_MS);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      progressRef.current += (90 - progressRef.current) * 0.09 + 0.6;
      setProgress(Math.min(90, progressRef.current));
    }, 90);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!loading && minElapsed) {
      setProgress(100);
      setFadeOut(true);
      const t = setTimeout(() => setVisible(false), FADE_MS);
      return () => clearTimeout(t);
    }
  }, [loading, minElapsed]);

  if (!visible) return null;

  const siteName = siteSettings?.siteName || 'Aging Congress';
  const logo = siteSettings?.logo;
  const initials = siteName.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase();
  const chars = [...siteName];

  return (
    <div className={`sp-root${fadeOut ? ' sp-out' : ''}`} role="status" aria-live="polite">
      <style>{`
        .sp-root {
          position: fixed; inset: 0; z-index: 9999;
          overflow: hidden;
          background: #05070c;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          opacity: 1; transform: scale(1); filter: blur(0);
          transition: opacity ${FADE_MS}ms cubic-bezier(0.4,0,0.2,1),
                      transform ${FADE_MS}ms cubic-bezier(0.4,0,0.2,1),
                      filter ${FADE_MS}ms ease;
        }
        .sp-out { opacity: 0; transform: scale(1.07); filter: blur(10px); pointer-events: none; }

        /* ── Drifting aurora field ── */
        .sp-aurora {
          position: absolute; border-radius: 50%;
          filter: blur(90px); opacity: 0.5;
          will-change: transform;
        }
        .sp-aurora-1 {
          width: 620px; height: 620px; top: -18%; left: -12%;
          background: radial-gradient(circle, color-mix(in srgb, var(--brand) 85%, transparent) 0%, transparent 70%);
          animation: spDrift1 18s ease-in-out infinite;
        }
        .sp-aurora-2 {
          width: 520px; height: 520px; bottom: -20%; right: -10%;
          background: radial-gradient(circle, color-mix(in srgb, var(--brand-dark) 90%, transparent) 0%, transparent 70%);
          animation: spDrift2 22s ease-in-out infinite;
        }
        .sp-aurora-3 {
          width: 380px; height: 380px; top: 40%; left: 55%;
          background: radial-gradient(circle, color-mix(in srgb, var(--brand-accent, #f59e0b) 45%, transparent) 0%, transparent 70%);
          opacity: 0.22;
          animation: spDrift1 26s ease-in-out infinite reverse;
        }
        @keyframes spDrift1 {
          0%,100% { transform: translate(0,0) scale(1); }
          50%     { transform: translate(90px, 70px) scale(1.18); }
        }
        @keyframes spDrift2 {
          0%,100% { transform: translate(0,0) scale(1.1); }
          50%     { transform: translate(-80px,-60px) scale(0.92); }
        }

        /* ── Grid, faded toward the edges so it never fights the logo ── */
        .sp-grid {
          position: absolute; inset: 0;
          background-image:
            linear-gradient(color-mix(in srgb, var(--brand) 14%, transparent) 1px, transparent 1px),
            linear-gradient(90deg, color-mix(in srgb, var(--brand) 14%, transparent) 1px, transparent 1px);
          background-size: 52px 52px;
          -webkit-mask-image: radial-gradient(ellipse 65% 55% at 50% 50%, #000 15%, transparent 100%);
                  mask-image: radial-gradient(ellipse 65% 55% at 50% 50%, #000 15%, transparent 100%);
          animation: spGridPan 24s linear infinite;
        }
        @keyframes spGridPan {
          from { background-position: 0 0, 0 0; }
          to   { background-position: 52px 52px, 52px 52px; }
        }

        .sp-vignette {
          position: absolute; inset: 0;
          background: radial-gradient(ellipse at center, transparent 45%, rgba(0,0,0,0.75) 100%);
        }

        .sp-stage {
          position: relative;
          display: flex; flex-direction: column; align-items: center;
          padding: 0 24px;
        }

        /* ── Orb: gradient sweep ring + counter-rotating dashes + orbiting dots ── */
        .sp-orb {
          position: relative;
          width: 148px; height: 148px;
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 34px;
          animation: spOrbIn 0.9s cubic-bezier(0.22,1,0.36,1) both;
        }
        @keyframes spOrbIn {
          from { opacity: 0; transform: scale(0.72) translateY(14px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }

        .sp-sweep {
          position: absolute; inset: 0; border-radius: 50%;
          background: conic-gradient(from 0deg,
            transparent 0deg,
            color-mix(in srgb, var(--brand) 20%, transparent) 180deg,
            var(--brand) 320deg,
            #ffffff 350deg,
            transparent 360deg);
          -webkit-mask: radial-gradient(farthest-side, transparent calc(100% - 2px), #000 calc(100% - 2px));
                  mask: radial-gradient(farthest-side, transparent calc(100% - 2px), #000 calc(100% - 2px));
          animation: spSpin 2.4s linear infinite;
        }
        .sp-dashes {
          position: absolute; inset: 14px; border-radius: 50%;
          border: 1px dashed color-mix(in srgb, var(--brand) 35%, transparent);
          animation: spSpin 14s linear infinite reverse;
        }
        @keyframes spSpin { to { transform: rotate(360deg); } }

        /* Pulsing halos */
        .sp-halo {
          position: absolute; border-radius: 50%;
          border: 1px solid color-mix(in srgb, var(--brand) 40%, transparent);
          width: 84px; height: 84px;
          animation: spHalo 3s cubic-bezier(0.22,1,0.36,1) infinite;
        }
        .sp-halo-2 { animation-delay: 1s; }
        .sp-halo-3 { animation-delay: 2s; }
        @keyframes spHalo {
          0%   { opacity: 0.85; transform: scale(0.8); }
          100% { opacity: 0;    transform: scale(1.75); }
        }

        /* Orbiting satellites */
        .sp-orbit { position: absolute; inset: 0; animation: spSpin 6s linear infinite; }
        .sp-orbit-b { animation-duration: 9s; animation-direction: reverse; }
        .sp-dot {
          position: absolute; top: -3px; left: 50%;
          width: 6px; height: 6px; margin-left: -3px;
          border-radius: 50%; background: var(--brand);
          box-shadow: 0 0 12px var(--brand), 0 0 24px color-mix(in srgb, var(--brand) 60%, transparent);
        }
        .sp-dot-sm { width: 4px; height: 4px; margin-left: -2px; background: #ffffff; box-shadow: 0 0 10px #fff; }

        /* Glass badge */
        .sp-badge {
          position: relative;
          width: 68px; height: 68px; border-radius: 20px;
          background: linear-gradient(145deg,
            color-mix(in srgb, var(--brand) 26%, transparent),
            rgba(255,255,255,0.04));
          -webkit-backdrop-filter: blur(12px); backdrop-filter: blur(12px);
          border: 1px solid color-mix(in srgb, var(--brand) 40%, transparent);
          box-shadow: 0 0 0 1px rgba(255,255,255,0.05) inset,
                      0 8px 32px color-mix(in srgb, var(--brand) 35%, transparent);
          display: flex; align-items: center; justify-content: center;
          overflow: hidden;
          animation: spBreathe 3.4s ease-in-out infinite;
        }
        @keyframes spBreathe {
          0%,100% { transform: scale(1);    box-shadow: 0 0 0 1px rgba(255,255,255,0.05) inset, 0 8px 32px color-mix(in srgb, var(--brand) 32%, transparent); }
          50%     { transform: scale(1.06); box-shadow: 0 0 0 1px rgba(255,255,255,0.08) inset, 0 12px 46px color-mix(in srgb, var(--brand) 55%, transparent); }
        }
        .sp-badge img { width: 100%; height: 100%; object-fit: contain; padding: 9px; }
        .sp-badge-text {
          font-size: 22px; font-weight: 900; color: #fff;
          letter-spacing: -0.03em;
        }
        /* Light sweep across the badge */
        .sp-badge::after {
          content: ''; position: absolute; top: 0; left: -120%;
          width: 60%; height: 100%;
          background: linear-gradient(100deg, transparent, rgba(255,255,255,0.45), transparent);
          animation: spShine 3.2s ease-in-out infinite;
        }
        @keyframes spShine {
          0%       { left: -120%; }
          55%,100% { left: 160%; }
        }

        /* ── Name: per-character reveal + gradient ── */
        .sp-name {
          display: flex; flex-wrap: wrap; justify-content: center;
          margin: 0 0 14px;
          font-size: clamp(1.5rem, 5vw, 2.35rem);
          font-weight: 800; letter-spacing: -0.02em; text-align: center;
          background: linear-gradient(100deg, #ffffff 20%, color-mix(in srgb, var(--brand) 70%, white) 50%, #ffffff 80%);
          background-size: 220% 100%;
          -webkit-background-clip: text; background-clip: text;
          color: transparent; -webkit-text-fill-color: transparent;
          animation: spTextSheen 4s linear infinite;
        }
        @keyframes spTextSheen {
          from { background-position: 180% 0; }
          to   { background-position: -60% 0; }
        }
        .sp-char {
          display: inline-block;
          animation: spCharIn 0.55s cubic-bezier(0.22,1,0.36,1) both;
        }
        @keyframes spCharIn {
          from { opacity: 0; transform: translateY(18px) rotateX(-60deg); filter: blur(5px); }
          to   { opacity: 1; transform: translateY(0) rotateX(0); filter: blur(0); }
        }

        .sp-tag-row {
          display: flex; align-items: center; gap: 12px;
          margin-bottom: 34px;
          animation: spFadeUp 0.7s ease 0.5s both;
        }
        .sp-rule {
          height: 1px; width: 34px;
          background: linear-gradient(90deg, transparent, color-mix(in srgb, var(--brand) 80%, transparent));
        }
        .sp-rule-r { background: linear-gradient(90deg, color-mix(in srgb, var(--brand) 80%, transparent), transparent); }
        .sp-tag {
          font-size: 10px; font-weight: 700;
          letter-spacing: 0.28em; text-transform: uppercase;
          color: color-mix(in srgb, var(--brand) 75%, white);
          margin: 0; white-space: nowrap;
        }
        @keyframes spFadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* ── Progress ── */
        .sp-bar-wrap {
          position: relative;
          width: min(260px, 70vw); height: 3px;
          background: rgba(255,255,255,0.08);
          border-radius: 99px; overflow: hidden;
          animation: spFadeUp 0.7s ease 0.62s both;
        }
        .sp-bar-fill {
          height: 100%; border-radius: 99px;
          background: linear-gradient(90deg, var(--brand-dark), var(--brand), #ffffff);
          box-shadow: 0 0 14px color-mix(in srgb, var(--brand) 70%, transparent);
          transition: width 0.45s cubic-bezier(0.22,1,0.36,1);
        }
        .sp-meta {
          display: flex; align-items: center; justify-content: space-between;
          width: min(260px, 70vw); margin-top: 12px;
          animation: spFadeUp 0.7s ease 0.72s both;
        }
        .sp-status {
          font-size: 10.5px; letter-spacing: 0.1em; text-transform: uppercase;
          color: rgba(148,163,184,0.7); margin: 0;
        }
        .sp-ell span {
          animation: spEllipsis 1.3s ease-in-out infinite;
        }
        .sp-ell span:nth-child(2) { animation-delay: 0.18s; }
        .sp-ell span:nth-child(3) { animation-delay: 0.36s; }
        @keyframes spEllipsis {
          0%, 60%, 100% { opacity: 0.2; }
          30%           { opacity: 1; }
        }
        .sp-pct {
          font-size: 10.5px; font-weight: 700; font-variant-numeric: tabular-nums;
          color: color-mix(in srgb, var(--brand) 70%, white);
          letter-spacing: 0.06em;
        }

        /* Corner brackets */
        .sp-corner {
          position: absolute; width: 26px; height: 26px;
          border-color: color-mix(in srgb, var(--brand) 45%, transparent); border-style: solid;
          animation: spFadeUp 0.8s ease 0.2s both;
        }
        .sp-corner-tl { top: 26px; left: 26px; border-width: 1.5px 0 0 1.5px; }
        .sp-corner-tr { top: 26px; right: 26px; border-width: 1.5px 1.5px 0 0; }
        .sp-corner-bl { bottom: 26px; left: 26px; border-width: 0 0 1.5px 1.5px; }
        .sp-corner-br { bottom: 26px; right: 26px; border-width: 0 1.5px 1.5px 0; }

        @media (prefers-reduced-motion: reduce) {
          .sp-root *, .sp-root *::after { animation: none !important; }
          .sp-root { transition: opacity 0.3s ease; }
          .sp-out { transform: none; filter: none; }
        }
      `}</style>

      <div className="sp-aurora sp-aurora-1" />
      <div className="sp-aurora sp-aurora-2" />
      <div className="sp-aurora sp-aurora-3" />
      <div className="sp-grid" />
      <div className="sp-vignette" />

      <div className="sp-corner sp-corner-tl" />
      <div className="sp-corner sp-corner-tr" />
      <div className="sp-corner sp-corner-bl" />
      <div className="sp-corner sp-corner-br" />

      <div className="sp-stage">
        <div className="sp-orb">
          <div className="sp-sweep" />
          <div className="sp-dashes" />
          <div className="sp-halo" />
          <div className="sp-halo sp-halo-2" />
          <div className="sp-halo sp-halo-3" />
          <div className="sp-orbit"><span className="sp-dot" /></div>
          <div className="sp-orbit sp-orbit-b"><span className="sp-dot sp-dot-sm" /></div>
          <div className="sp-badge">
            {logo
              ? <img src={logo} alt={siteName} />
              : <span className="sp-badge-text">{initials}</span>
            }
          </div>
        </div>

        <h1 className="sp-name" aria-label={siteName}>
          {chars.map((c, i) => (
            <span
              key={`${c}-${i}`}
              className="sp-char"
              aria-hidden="true"
              style={{ animationDelay: `${0.25 + i * 0.035}s` }}
            >
              {c === ' ' ? ' ' : c}
            </span>
          ))}
        </h1>

        <div className="sp-tag-row">
          <span className="sp-rule" />
          <p className="sp-tag">International Aging Congress</p>
          <span className="sp-rule sp-rule-r" />
        </div>

        <div className="sp-bar-wrap">
          <div className="sp-bar-fill" style={{ width: `${progress}%` }} />
        </div>
        <div className="sp-meta">
          <p className="sp-status">
            {loading ? 'Loading congress data' : 'Almost ready'}
            <span className="sp-ell"><span>.</span><span>.</span><span>.</span></span>
          </p>
          <span className="sp-pct">{Math.round(progress)}%</span>
        </div>
      </div>
    </div>
  );
}
