import { createContext, useContext, useEffect, useState } from 'react';
import { congressAPI } from '../api/congress';
import { contentAPI } from '../api/content';

const congressContext = createContext({});
export const usecongress = () => useContext(congressContext);

export function CongressProvider({ children }) {
  const [activeEdition, setActiveEdition] = useState(null);
  const [siteSettings, setSiteSettings] = useState(null);
  const [visibility, setVisibility] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchAll = async (isInitial = false) => {
    if (isInitial) setLoading(true);
    try {
      const [editionRes, settingsRes, visibilityRes] = await Promise.all([
        congressAPI.getActive().catch(() => ({ data: { data: null } })),
        contentAPI.getSiteSettings().catch(() => ({ data: { data: null } })),
        // Failing open matters here: if this call breaks, the site shows
        // everything rather than hiding pages the admin never chose to hide.
        contentAPI.getVisibility().catch(() => ({ data: { data: {} } })),
      ]);
      setActiveEdition(editionRes.data?.data ?? editionRes.data ?? null);
      const settings = settingsRes.data?.data ?? settingsRes.data ?? null;
      setSiteSettings(settings);
      setVisibility(visibilityRes.data?.data ?? {});
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

  /**
   * A page or section is shown unless an admin explicitly switched it off.
   * Unknown keys are visible — adding a new entry to the server registry must
   * never hide something retroactively.
   *
   * `hasContent` layers the automatic rule on top: pass the item count (or any
   * truthy/falsy content value) and an empty section hides itself without an
   * admin having to do anything.
   */
  const isVisible = (key, hasContent = true) => {
    if (visibility[key] === false) return false;
    if (hasContent === undefined || hasContent === null) return true;
    if (typeof hasContent === 'number') return hasContent > 0;
    if (Array.isArray(hasContent)) return hasContent.length > 0;
    return Boolean(hasContent);
  };

  return (
    <congressContext.Provider value={{ activeEdition, siteSettings, visibility, isVisible, loading }}>
      {children}
    </congressContext.Provider>
  );
}
