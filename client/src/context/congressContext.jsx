import { createContext, useContext, useEffect, useState } from 'react';
import { congressAPI } from '../api/congress';
import { contentAPI } from '../api/content';

const congressContext = createContext({});
export const usecongress = () => useContext(congressContext);

export function CongressProvider({ children }) {
  const [activeEdition, setActiveEdition] = useState(null);
  const [siteSettings, setSiteSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAll = async (isInitial = false) => {
    if (isInitial) setLoading(true);
    try {
      const [editionRes, settingsRes] = await Promise.all([
        congressAPI.getActive().catch(() => ({ data: { data: null } })),
        contentAPI.getSiteSettings().catch(() => ({ data: { data: null } })),
      ]);
      setActiveEdition(editionRes.data?.data ?? editionRes.data ?? null);
      const settings = settingsRes.data?.data ?? settingsRes.data ?? null;
      setSiteSettings(settings);
      if (settings?.favicon) {
        let link = document.querySelector('link[rel="icon"]');
        if (!link) {
          link = document.createElement('link');
          link.rel = 'icon';
          document.head.appendChild(link);
        }
        // Cache-bust so Chrome actually re-fetches the new favicon
        link.href = `${settings.favicon}?v=${Date.now()}`;
      }
      const t = settings?.theme;
      if (t) {
        const root = document.documentElement;
        if (t.primaryColor) root.style.setProperty('--brand', t.primaryColor);
        if (t.primaryDark)  root.style.setProperty('--brand-dark', t.primaryDark);
        if (t.primaryLight) root.style.setProperty('--brand-light', t.primaryLight);
        if (t.accentColor)  root.style.setProperty('--brand-accent', t.accentColor);
      }
    } finally {
      if (isInitial) setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll(true);

    const handleVisibility = () => {
      if (!document.hidden) fetchAll(false);
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  return (
    <congressContext.Provider value={{ activeEdition, siteSettings, loading }}>
      {children}
    </congressContext.Provider>
  );
}
