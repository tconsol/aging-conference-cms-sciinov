import { createContext, useContext, useEffect, useState } from 'react';
import { congressAPI } from '../api/congress';
import { contentAPI } from '../api/content';

const congressContext = createContext({});
export const usecongress = () => useContext(congressContext);

export function congressProvider({ children }) {
  const [activeEdition, setActiveEdition] = useState(null);
  const [siteSettings, setSiteSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      congressAPI.getActive().catch(() => ({ data: { data: null } })),
      contentAPI.getSiteSettings().catch(() => ({ data: { data: null } })),
    ]).then(([editionRes, settingsRes]) => {
      setActiveEdition(editionRes.data?.data ?? editionRes.data ?? null);
      const settings = settingsRes.data?.data ?? settingsRes.data ?? null;
      setSiteSettings(settings);
      if (settings?.favicon) {
        const link = document.querySelector('link[rel="icon"]');
        if (link) link.href = settings.favicon;
      }
    }).finally(() => setLoading(false));
  }, []);

  return (
    <congressContext.Provider value={{ activeEdition, siteSettings, loading }}>
      {children}
    </congressContext.Provider>
  );
}
