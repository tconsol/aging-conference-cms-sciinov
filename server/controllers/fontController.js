/**
 * Google Fonts catalogue, proxied.
 *
 * Proxied rather than called from the browser for two reasons: the API key stays
 * server-side, and the Google endpoint sends no CORS headers usable from our
 * origins. The list changes rarely, so it is cached in memory for a day — a cold
 * start refetches, which is cheap enough.
 */

const GOOGLE_FONTS_ENDPOINT = 'https://www.googleapis.com/webfonts/v1/webfonts';
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

// Used when GOOGLE_FONTS_API_KEY is not configured, or the fetch fails. These
// all exist on Google Fonts, so the client loads them the same way either way.
const FALLBACK_FONTS = [
  'Inter', 'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Poppins', 'Raleway',
  'Nunito', 'Work Sans', 'Rubik', 'Manrope', 'DM Sans', 'Outfit', 'Sora',
  'Playfair Display', 'Merriweather', 'Lora', 'PT Serif', 'Bitter', 'Cormorant Garamond',
  'Oswald', 'Bebas Neue', 'Anton', 'Archivo', 'Barlow', 'Cabin', 'Karla',
  'Source Sans 3', 'Fira Sans', 'Space Grotesk', 'Libre Baskerville', 'Josefin Sans',
].map((family) => ({ family, category: 'sans-serif' }));

let cache = { at: 0, fonts: null, source: null };

exports.getFonts = async (req, res, next) => {
  try {
    if (cache.fonts && Date.now() - cache.at < CACHE_TTL_MS) {
      return res.json({ success: true, source: cache.source, data: cache.fonts });
    }

    const key = process.env.GOOGLE_FONTS_API_KEY;
    if (!key) {
      cache = { at: Date.now(), fonts: FALLBACK_FONTS, source: 'fallback' };
      return res.json({ success: true, source: 'fallback', data: FALLBACK_FONTS });
    }

    // Aborted rather than left hanging: a slow upstream must not hold the
    // admin's font dropdown open indefinitely.
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);

    try {
      const url = `${GOOGLE_FONTS_ENDPOINT}?sort=popularity&key=${encodeURIComponent(key)}`;
      const r = await fetch(url, { signal: controller.signal });
      if (!r.ok) throw new Error(`Google Fonts responded ${r.status}`);
      const json = await r.json();

      const fonts = (json.items || []).map((f) => ({
        family: f.family,
        category: f.category,
        variants: f.variants,
      }));
      if (!fonts.length) throw new Error('Google Fonts returned an empty list');

      cache = { at: Date.now(), fonts, source: 'google' };
      res.json({ success: true, source: 'google', data: fonts });
    } finally {
      clearTimeout(timer);
    }
  } catch (err) {
    // A font list is decoration: serve the fallback rather than failing the
    // request and leaving the admin with no dropdown at all.
    console.warn(`[fonts] falling back to built-in list: ${err.message}`);
    cache = { at: Date.now(), fonts: FALLBACK_FONTS, source: 'fallback' };
    res.json({ success: true, source: 'fallback', data: FALLBACK_FONTS });
  }
};
