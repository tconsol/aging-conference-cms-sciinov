import { useEffect } from 'react';

/**
 * Loads a Google Font stylesheet for `family` and leaves it in place.
 *
 * The <link> is keyed by family and never removed: switching fonts in the admin
 * preview would otherwise unload a face that is still painted, causing a visible
 * flash back to the fallback. A handful of stylesheets is cheap; the flash is not.
 */
export function useGoogleFont(family) {
  useEffect(() => {
    const name = (family || '').trim();
    if (!name) return;

    const id = `gf-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
    if (document.getElementById(id)) return;

    const link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    // wght range covers the weights the UI actually uses (400–900).
    link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(name).replace(/%20/g, '+')}:wght@400;500;600;700;800;900&display=swap`;
    document.head.appendChild(link);
  }, [family]);
}

export default useGoogleFont;
