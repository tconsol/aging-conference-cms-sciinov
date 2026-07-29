import { useEffect, useRef, useState, useCallback } from 'react';

const THEMES = {
  'cyber-neon':       { path: 'rgba(0,255,255,0.18)',    meteor: '#00ffff', trail: 'rgba(0,255,255,0.35)',    spark: '#00ff88', glow: '#00ffff' },
  'cosmic-fire':      { path: 'rgba(255,80,0,0.18)',     meteor: '#ff6600', trail: 'rgba(255,100,0,0.35)',   spark: '#ffaa00', glow: '#ff4400' },
  'emerald-matrix':   { path: 'rgba(0,220,60,0.18)',     meteor: '#00ee44', trail: 'rgba(0,220,60,0.35)',    spark: '#aaff00', glow: '#00cc33' },
  'solar-flare':      { path: 'rgba(255,200,0,0.18)',    meteor: '#ffcc00', trail: 'rgba(255,200,0,0.35)',   spark: '#ffffff', glow: '#ff8800' },
  'amethyst-shadow':  { path: 'rgba(150,50,255,0.18)',   meteor: '#aa44ff', trail: 'rgba(150,50,255,0.35)', spark: '#ff44cc', glow: '#7700ff' },
  'ice-aurora':       { path: 'rgba(68,200,255,0.18)',   meteor: '#88eeff', trail: 'rgba(100,220,255,0.35)',spark: '#ffffff', glow: '#00aaff' },
};

function cubicBezier(t, p0, p1, p2, p3) {
  const mt = 1 - t;
  return {
    x: mt*mt*mt*p0.x + 3*mt*mt*t*p1.x + 3*mt*t*t*p2.x + t*t*t*p3.x,
    y: mt*mt*mt*p0.y + 3*mt*mt*t*p1.y + 3*mt*t*t*p2.y + t*t*t*p3.y,
  };
}

function controlPoints(src, tgt, curvature) {
  const dx = tgt.x - src.x;
  return {
    p1: { x: src.x + dx * 0.35, y: src.y - curvature },
    p2: { x: src.x + dx * 0.65, y: tgt.y - curvature },
  };
}

export default function AnimatedMeteorsLink({
  containerRef,
  sourceRef,
  targetRef,
  curvature = 40,
  meteorCount = 2,
  duration = 3,
  bidirectional = false,
  enableSplash = true,
  themePreset = 'cyber-neon',
}) {
  const rafRef = useRef(null);
  const meteorHeadRefs = useRef([]);
  const meteorTrailRefs = useRef([]);
  const prevT = useRef([]);
  const [bounds, setBounds] = useState(null);
  const [sparks, setSparks] = useState([]);

  const theme = THEMES[themePreset] ?? THEMES['cyber-neon'];

  const calcBounds = useCallback(() => {
    if (!containerRef?.current || !sourceRef?.current || !targetRef?.current) return;
    const c = containerRef.current.getBoundingClientRect();
    const s = sourceRef.current.getBoundingClientRect();
    const t = targetRef.current.getBoundingClientRect();
    setBounds({
      src: { x: s.left + s.width / 2 - c.left, y: s.top + s.height / 2 - c.top },
      tgt: { x: t.left + t.width / 2 - c.left, y: t.top + t.height / 2 - c.top },
      w: c.width,
      h: c.height,
    });
  }, [containerRef, sourceRef, targetRef]);

  useEffect(() => {
    calcBounds();
    window.addEventListener('resize', calcBounds);
    return () => window.removeEventListener('resize', calcBounds);
  }, [calcBounds]);

  const emitSparks = useCallback((x, y) => {
    if (!enableSplash) return;
    const batch = Array.from({ length: 8 }, (_, i) => ({
      id: Date.now() + Math.random() + i,
      x, y,
      angle: (i / 8) * Math.PI * 2,
      dist: 18 + Math.random() * 20,
    }));
    setSparks((prev) => [...prev.slice(-32), ...batch]);
    setTimeout(() => setSparks((prev) => prev.filter((s) => !batch.find((b) => b.id === s.id))), 700);
  }, [enableSplash]);

  useEffect(() => {
    if (!bounds) return;
    const { src, tgt } = bounds;
    const fwd = controlPoints(src, tgt, curvature);
    const rev = controlPoints(tgt, src, curvature);
    const total = bidirectional ? meteorCount * 2 : meteorCount;
    prevT.current = Array(total).fill(0);

    const tick = () => {
      const now = performance.now() / 1000;
      for (let i = 0; i < total; i++) {
        const isRev = bidirectional && i >= meteorCount;
        const idx  = isRev ? i - meteorCount : i;
        const t    = ((now / duration) + idx / meteorCount) % 1;

        if (prevT.current[i] > 0.88 && t < 0.12) {
          emitSparks(isRev ? src.x : tgt.x, isRev ? src.y : tgt.y);
        }
        prevT.current[i] = t;

        const pos = isRev
          ? cubicBezier(t, tgt, rev.p1, rev.p2, src)
          : cubicBezier(t, src, fwd.p1, fwd.p2, tgt);

        const tTrail = Math.max(0, t - 0.045);
        const trail = isRev
          ? cubicBezier(tTrail, tgt, rev.p1, rev.p2, src)
          : cubicBezier(tTrail, src, fwd.p1, fwd.p2, tgt);

        meteorHeadRefs.current[i]?.setAttribute('cx', pos.x);
        meteorHeadRefs.current[i]?.setAttribute('cy', pos.y);
        meteorTrailRefs.current[i]?.setAttribute('cx', trail.x);
        meteorTrailRefs.current[i]?.setAttribute('cy', trail.y);
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [bounds, curvature, meteorCount, duration, bidirectional, emitSparks]);

  if (!bounds) return null;

  const { src, tgt, w, h } = bounds;
  const fwd = controlPoints(src, tgt, curvature);
  const rev = controlPoints(tgt, src, curvature);
  const total = bidirectional ? meteorCount * 2 : meteorCount;
  const uid = themePreset;

  return (
    <svg
      width={w} height={h}
      className="absolute inset-0 pointer-events-none overflow-visible"
      style={{ zIndex: 5 }}
    >
      <defs>
        <filter id={`glow-${uid}`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="5" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id={`spark-${uid}`} x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* Forward path */}
      <path
        d={`M ${src.x} ${src.y} C ${fwd.p1.x} ${fwd.p1.y} ${fwd.p2.x} ${fwd.p2.y} ${tgt.x} ${tgt.y}`}
        stroke={theme.path} strokeWidth="2" fill="none" strokeDasharray="8 5"
      />

      {/* Reverse path */}
      {bidirectional && (
        <path
          d={`M ${tgt.x} ${tgt.y} C ${rev.p1.x} ${rev.p1.y} ${rev.p2.x} ${rev.p2.y} ${src.x} ${src.y}`}
          stroke={theme.path} strokeWidth="2" fill="none" strokeDasharray="8 5"
        />
      )}

      {/* Meteors */}
      {Array.from({ length: total }, (_, i) => (
        <g key={i} filter={`url(#glow-${uid})`}>
          <circle ref={(el) => (meteorTrailRefs.current[i] = el)} r="3.5" fill={theme.trail} />
          <circle ref={(el) => (meteorHeadRefs.current[i] = el)} r="5"   fill={theme.meteor} />
        </g>
      ))}

      {/* Sparks */}
      {sparks.map((sp) => (
        <circle key={sp.id} r="2.5" fill={theme.spark} filter={`url(#spark-${uid})`}>
          <animate attributeName="cx" from={sp.x} to={sp.x + Math.cos(sp.angle) * sp.dist} dur="0.6s" fill="freeze" />
          <animate attributeName="cy" from={sp.y} to={sp.y + Math.sin(sp.angle) * sp.dist} dur="0.6s" fill="freeze" />
          <animate attributeName="opacity" from="1" to="0" dur="0.6s" fill="freeze" />
          <animate attributeName="r" from="2.5" to="0.5" dur="0.6s" fill="freeze" />
        </circle>
      ))}
    </svg>
  );
}
