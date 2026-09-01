import { useState, useEffect, useRef } from 'react';

function pad(n) { return String(n).padStart(2, '0'); }

const FLIP_MS = 260;
const R = 10; // card corner radius px

/* One half of the flip card (top or bottom) */
function Half({ isTop, bg, digit, style: extra = {} }) {
  return (
    <div style={{
      position: 'absolute',
      left: 0, right: 0,
      height: '50%',
      overflow: 'hidden',
      background: bg,
      ...(isTop
        ? { top: 0,    borderRadius: `${R}px ${R}px 0 0` }
        : { bottom: 0, borderRadius: `0 0 ${R}px ${R}px` }),
      backfaceVisibility: 'hidden',
      WebkitBackfaceVisibility: 'hidden',
      ...extra,
    }}>
      {/*
        Number spans full card height, centered.
        overflow:hidden on parent clips the correct half.
      */}
      <div style={{
        position: 'absolute',
        left: 0, right: 0,
        ...(isTop ? { top: 0, height: '200%' } : { bottom: 0, height: '200%' }),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <span style={{
          fontSize: 'clamp(1.6rem, 4.5vw, 2.4rem)',
          fontWeight: 900,
          fontFamily: "'Helvetica Neue', Arial, 'Segoe UI', sans-serif",
          color: '#dedede',
          letterSpacing: '-0.04em',
          fontVariantNumeric: 'tabular-nums',
          lineHeight: 1,
          userSelect: 'none',
          textShadow: '0 4px 18px rgba(0,0,0,0.8)',
        }}>
          {digit}
        </span>
      </div>
    </div>
  );
}

function FlipCard({ value, label }) {
  const target    = pad(value);
  const [shown, setShown]       = useState(target); // fully rendered value
  const [flipping, setFlipping] = useState(false);
  const timerRef  = useRef(null);
  const fkRef     = useRef(0); // flip key forces new element per animation

  useEffect(() => {
    if (target === shown) return;
    fkRef.current += 1;
    setFlipping(true);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setShown(target);
      setFlipping(false);
    }, FLIP_MS + 30);
  }, [target]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const fk      = fkRef.current;
  const topBg   = 'rgba(255,255,255,0.06)';
  const botBg   = 'rgba(255,255,255,0.03)';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>

      {/* ── Card ── */}
      <div style={{
        position: 'relative',
        width:  'clamp(56px, 9vw, 80px)',
        height: 'clamp(64px, 10.5vw, 90px)',
        borderRadius: R,
        perspective: 500,
        boxShadow: 'none',
      }}>

        {/* Static top  immediately shows TARGET when flip starts */}
        <Half isTop bg={topBg} digit={flipping ? target : shown} />

        {/* Static bottom shows SHOWN (prev) while flipping so the flap hides it */}
        <Half bg={botBg} digit={shown} />

        {/* Divider line */}
        <div style={{
          position: 'absolute', top: '50%', left: 0, right: 0,
          height: 3, background: '#080808',
          transform: 'translateY(-50%)', zIndex: 15,
        }} />

        {/* FLAP top: shows SHOWN (prev), rotates AWAY 0→-90° */}
        {flipping && (
          <Half
            key={`ft-${fk}`}
            isTop bg={topBg}
            digit={shown}
            style={{
              zIndex: 8,
              transformOrigin: '50% 100%',
              animation: `fc-away ${FLIP_MS / 2}ms ease-in forwards`,
            }}
          />
        )}

        {/* FLAP bot: shows TARGET, rotates IN  90→0° after top is gone */}
        {flipping && (
          <Half
            key={`fb-${fk}`}
            bg={botBg}
            digit={target}
            style={{
              zIndex: 8,
              transformOrigin: '50% 0%',
              transform: 'rotateX(90deg)',
              animation: `fc-in ${FLIP_MS / 2}ms ease-out ${FLIP_MS / 2}ms forwards`,
            }}
          />
        )}

        {/* Gloss sheen on top half */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: '50%',
          borderRadius: `${R}px ${R}px 0 0`,
          background: 'linear-gradient(180deg, rgba(255,255,255,0.06) 0%, transparent 60%)',
          pointerEvents: 'none', zIndex: 20,
        }} />

        {/* Outer rim shadow */}
        <div style={{
          position: 'absolute', inset: 0, borderRadius: R,
          boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.06)',
          pointerEvents: 'none', zIndex: 20,
        }} />
      </div>

      {/* Label */}
      <span style={{
        fontSize: 9,
        fontWeight: 800,
        letterSpacing: '0.22em',
        textTransform: 'uppercase',
        color: '#c9920c',
      }}>
        {label}
      </span>
    </div>
  );
}

export default function CountdownTimer({ targetDate, className = '' }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [expired, setExpired]   = useState(false);

  useEffect(() => {
    const tick = () => {
      const diff = new Date(targetDate) - Date.now();
      if (diff <= 0) { setExpired(true); return; }
      setTimeLeft({
        days:    Math.floor(diff / 86400000),
        hours:   Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000)  / 60000),
        seconds: Math.floor((diff % 60000)    / 1000),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetDate]);

  if (expired) return null;

  return (
    <>
      <style>{`
        @keyframes fc-away {
          from { transform: rotateX(0deg); }
          to   { transform: rotateX(-90deg); }
        }
        @keyframes fc-in {
          from { transform: rotateX(90deg); }
          to   { transform: rotateX(0deg); }
        }
      `}</style>

      <div
        className={className}
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          gap: 'clamp(6px, 1.5vw, 12px)',
          flexWrap: 'wrap',
          justifyContent: 'center',
        }}
      >
        <FlipCard value={timeLeft.days}    label="Days"    />
        <FlipCard value={timeLeft.hours}   label="Hours"   />
        <FlipCard value={timeLeft.minutes} label="Minutes" />
        <FlipCard value={timeLeft.seconds} label="Seconds" />
      </div>
    </>
  );
}
