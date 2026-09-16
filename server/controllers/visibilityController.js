const SiteSettings = require('../models/SiteSettings');
const { ALL, KEYS } = require('../config/visibilityRegistry');
const log = require('../utils/logger').child('visibility');

const toPlain = (settings) => {
  const v = settings?.visibility;
  if (!v) return {};
  return v instanceof Map ? Object.fromEntries(v) : { ...v };
};

// Effective visibility means running every registry count, which is ~30 queries.
// That is far too much for an endpoint every visitor hits, so the computed map
// is cached briefly. Content changes are rare and a minute of staleness is
// invisible; the admin panel reads uncached figures from /admin regardless.
const PUBLIC_CACHE_TTL_MS = 60 * 1000;
let publicCache = { at: 0, data: null };

exports.invalidatePublicCache = () => { publicCache = { at: 0, data: null }; };

/**
 * Public: the switches, already combined with whether each entry has content.
 *
 * Emptiness is resolved here rather than in the browser so one rule governs
 * everything — nav links, route guards and the sitemap all read the same map.
 * The client would otherwise need every collection's count to make the same
 * decision, which is not something a public page should be fetching.
 *
 * Entries with no count function (contact, registration, the forms) are never
 * auto-hidden: a form has nothing to count but is never empty.
 */
exports.getPublic = async (req, res, next) => {
  try {
    if (publicCache.data && Date.now() - publicCache.at < PUBLIC_CACHE_TTL_MS) {
      return res.json({ success: true, data: publicCache.data });
    }

    const settings = await SiteSettings.findOne();
    const toggles = toPlain(settings);

    const pairs = await Promise.all(ALL.map(async (entry) => {
      if (toggles[entry.key] === false) return [entry.key, false];
      if (typeof entry.count !== 'function') return [entry.key, true];
      try {
        const { count } = await entry.count();
        return [entry.key, count > 0];
      } catch (err) {
        // A failed count must not hide a page that actually has content.
        log.warn(`Count failed for ${entry.key}, keeping visible — ${err.message}`);
        return [entry.key, true];
      }
    }));

    const data = Object.fromEntries(pairs);
    publicCache = { at: Date.now(), data };
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

/**
 * Admin: the registry plus live counts, so each toggle can say what it controls
 * and how much content sits behind it.
 *
 * Counts run in parallel and each is isolated — one failing model lookup must
 * not blank out the whole settings screen.
 */
exports.getAdmin = async (req, res, next) => {
  try {
    const settings = await SiteSettings.findOne();
    const visibility = toPlain(settings);

    const entries = await Promise.all(ALL.map(async (entry) => {
      let count = null;
      let items = [];
      if (typeof entry.count === 'function') {
        try {
          const result = await entry.count();
          count = result?.count ?? null;
          items = result?.items ?? [];
        } catch (err) {
          log.warn(`Preview failed for ${entry.key} — ${err.message}`);
          count = null;
        }
      }
      return {
        key: entry.key,
        label: entry.label,
        description: entry.description,
        type: entry.type,
        path: entry.path || null,
        page: entry.page || null,
        // Absent means visible: see the model comment on `visibility`.
        visible: visibility[entry.key] !== false,
        count,
        // A sample of the real content behind this switch, so the admin can see
        // what disappears before switching it off.
        items,
        // Drives the "auto-hidden (no content)" hint. Only meaningful where a
        // count exists — a form page has no items to count but is never empty.
        autoHidden: count === 0,
      };
    }));

    res.json({ success: true, data: entries });
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    let settings = await SiteSettings.findOne();
    if (!settings) settings = await SiteSettings.create({});

    const incoming = req.body?.visibility;
    if (!incoming || typeof incoming !== 'object') {
      return res.status(400).json({ success: false, message: 'visibility object is required.' });
    }

    // Only keys the registry knows about, and only real booleans — otherwise a
    // typo in the admin panel would silently persist a dead switch forever.
    //
    // The dot check is not paranoia: Mongoose refuses to cast a plain object
    // into a Map when any key contains "." (MongoDB treats dots as path
    // separators), and the whole save fails with an opaque "Cast to Map failed".
    // Section keys therefore use "about-values", never "about.values".
    const next_ = toPlain(settings);
    for (const [key, value] of Object.entries(incoming)) {
      if (!KEYS.includes(key)) continue;
      if (key.includes('.') || key.startsWith('$')) {
        log.warn(`Skipping key illegal in a Map: ${key}`);
        continue;
      }
      next_[key] = Boolean(value);
    }

    settings.visibility = next_;
    await settings.save();

    // Without this the public site would keep serving the cached map for up
    // to a minute after the admin hit save, which reads as "it didn't work".
    exports.invalidatePublicCache();

    res.json({ success: true, data: toPlain(settings) });
  } catch (err) { next(err); }
};
