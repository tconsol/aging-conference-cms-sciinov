import { useEffect, useRef } from 'react';

const fract = x => x - Math.floor(x);

const noise = (x, y) => {
  const G = Math.E;
  const rx = G * Math.sin(G * x);
  const ry = G * Math.sin(G * y);
  return fract(rx * ry * (1.0 + x));
};

const hexToRgb = hex => {
  hex = hex.replace('#', '');
  return [
    parseInt(hex.slice(0, 2), 16),
    parseInt(hex.slice(2, 4), 16),
    parseInt(hex.slice(4, 6), 16),
  ];
};

// Mirrors the GLSL fragment shader exactly, at low resolution then scaled up
export default function Silk({
  speed = 5,
  scale = 1,
  color = '#0d9488',
  noiseIntensity = 1.5,
  rotation = 0,
}) {
  const canvasRef = useRef(null);
  const stateRef  = useRef({ speed, scale, color, noiseIntensity, rotation });

  useEffect(() => {
    stateRef.current = { speed, scale, color, noiseIntensity, rotation };
  }, [speed, scale, color, noiseIntensity, rotation]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Render at 1/4 resolution, stretch via CSS looks identical with bilinear filter
    const W = 320;
    const H = 180;
    canvas.width  = W;
    canvas.height = H;

    const ctx = canvas.getContext('2d');
    const buf = ctx.createImageData(W, H);
    const data = buf.data;

    let tVal = 0;
    let rafId;

    const draw = () => {
      const { speed: spd, scale: scl, color: col, noiseIntensity: ni, rotation: rot } = stateRef.current;
      const [cr, cg, cb] = hexToRgb(col);
      const tOffset = spd * tVal * 0.016; // ~60fps assumed

      const cosR = Math.cos(rot);
      const sinR = Math.sin(rot);

      for (let py = 0; py < H; py++) {
        for (let px = 0; px < W; px++) {
          const uvx = px / W;
          const uvy = py / H;

          // rotateUvs
          const rux = (cosR * uvx - sinR * uvy) * scl;
          const ruy = (sinR * uvx + cosR * uvy) * scl;

          let tx = rux * scl;
          let ty = ruy * scl;

          ty += 0.03 * Math.sin(8.0 * tx - tOffset);

          const pattern =
            0.6 +
            0.4 * Math.sin(
              5.0 * (tx + ty + Math.cos(3.0 * tx + 5.0 * ty) + 0.02 * tOffset) +
              Math.sin(20.0 * (tx + ty - 0.1 * tOffset))
            );

          const rnd = noise(px, py);
          const val = Math.max(0, Math.min(1, pattern - (rnd / 15.0) * ni));

          const idx = (py * W + px) * 4;
          data[idx]     = (cr * val) | 0;
          data[idx + 1] = (cg * val) | 0;
          data[idx + 2] = (cb * val) | 0;
          data[idx + 3] = 255;
        }
      }

      ctx.putImageData(buf, 0, 0);
      tVal++;
      rafId = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(rafId);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: '100%',
        height: '100%',
        display: 'block',
        imageRendering: 'auto',
      }}
    />
  );
}
