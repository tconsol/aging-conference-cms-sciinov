import { useEffect, useState } from 'react';
import { usecongress } from '../../context/congressContext';

const MIN_DISPLAY_MS = 1200;

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
      const t = setTimeout(() => setVisible(false), 600);
      return () => clearTimeout(t);
    }
  }, [loading, minElapsed]);

  if (!visible) return null;

  const siteName = siteSettings?.siteName || 'Aging Congress';

  return (
    <div className={`splash-screen ${fadeOut ? 'splash-fade-out' : ''}`}>
      <div className="splash-content">
        <div className="splash-logo-ring">
          <div className="splash-logo-inner">
            <span style={{
              fontFamily: 'Georgia, "Times New Roman", serif',
              fontSize: 22,
              fontWeight: 900,
              color: '#C4933F',
              letterSpacing: '-0.03em',
              lineHeight: 1,
            }}>
              AC
            </span>
          </div>
        </div>

        <h1 className="splash-title">{siteName}</h1>
        <p className="splash-subtitle">International congress</p>

        <div className="splash-loader">
          <div className="splash-loader-bar" />
        </div>

        <p className="splash-status">
          {loading ? 'Loading congress data…' : 'Ready'}
        </p>
      </div>

      <div className="splash-particles">
        {[...Array(6)].map((_, i) => (
          <div key={i} className={`splash-particle splash-particle-${i + 1}`} />
        ))}
      </div>
    </div>
  );
}
