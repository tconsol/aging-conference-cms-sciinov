/**
 * Tidies admin-authored HTML before it is rendered on the public site.
 *
 * Typography is deliberately left alone: the editor has font, size, colour and
 * highlight controls, and an admin who picks Georgia at 20px expects to see
 * Georgia at 20px. An earlier version stripped those declarations, which made
 * the toolbar look broken.
 *
 * What is removed is only the debris a Word or Google Docs paste brings with
 * it — `MsoNormal`-style classes that mean nothing here and can collide with
 * the site's own class names.
 */

// Nothing is stripped from inline styles any more; the array is kept so a
// property can be blocked later without restructuring the function.
const STRIPPED_STYLE_PROPS = [];

// Families that exist on the visitor's machine already. Anything outside this
// list is assumed to be a Google font and its stylesheet is requested.
const WEB_SAFE = new Set([
  'arial', 'helvetica', 'calibri', 'candara', 'segoe', 'segoe ui', 'cambria',
  'courier new', 'courier', 'garamond', 'baskerville', 'georgia', 'palatino',
  'palatino linotype', 'tahoma', 'times new roman', 'times', 'trebuchet ms',
  'verdana', 'geneva', 'system-ui', 'sans-serif', 'serif', 'monospace',
  'cursive', 'fantasy', 'inherit', 'initial', 'unset',
]);

const requestedFonts = new Set();

/**
 * Loads the webfonts an admin chose inside the content.
 *
 * The editor offers the whole Google catalogue, so a page can name a family the
 * site never loads — without this the text silently falls back to system-ui and
 * the admin's choice appears to do nothing.
 *
 * Called from cleanCmsHtml because it already parses this HTML in the browser;
 * doing it here avoids repeating the same scan at ten render sites. Each family
 * is requested once per page load, and an unknown family simply fails to load,
 * leaving the fallback in place.
 */
function loadContentFonts(doc) {
  if (typeof document === 'undefined') return;

  doc.querySelectorAll('[style*="font-family"]').forEach((el) => {
    const stack = el.style.fontFamily;
    if (!stack) return;

    // First family in the stack is the one actually wanted.
    const family = stack.split(',')[0].trim().replace(/^["']|["']$/g, '');
    const key = family.toLowerCase();
    if (!family || WEB_SAFE.has(key) || requestedFonts.has(key)) return;
    requestedFonts.add(key);

    const id = `gf-content-${key.replace(/[^a-z0-9]+/g, '-')}`;
    if (document.getElementById(id)) return;

    const link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.href =
      `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family).replace(/%20/g, '+')}` +
      ':wght@400;500;600;700&display=swap';
    document.head.appendChild(link);
  });
}

const hasDom = () => typeof window !== 'undefined' && typeof DOMParser !== 'undefined';

// Fallback for non-DOM contexts (SSR/prerender). Style attributes are left
// intact here too — stripping them would drop the fonts and colours the admin
// chose, which is the whole point of the editor's formatting controls.
const regexClean = (html, stripLinks) => {
  if (!stripLinks) return html;
  return html.replace(/<a\b[^>]*>/gi, '').replace(/<\/a>/gi, '');
};

/**
 * @param {string} html raw HTML from the CMS
 * @param {{ stripLinks?: boolean }} [options] stripLinks unwraps <a>, keeping the text
 */
export function cleanCmsHtml(html, options = {}) {
  const { stripLinks = false } = options;
  if (!html) return '';
  if (!hasDom()) return regexClean(html, stripLinks);

  try {
    const doc = new DOMParser().parseFromString(html, 'text/html');

    if (STRIPPED_STYLE_PROPS.length) {
      doc.querySelectorAll('[style]').forEach((el) => {
        STRIPPED_STYLE_PROPS.forEach((prop) => el.style.removeProperty(prop));
        // An emptied style attribute is noise in the DOM; drop it entirely.
        if (!el.getAttribute('style')?.trim()) el.removeAttribute('style');
      });
    }

    // Word/Docs ship class names that map to nothing in our CSS but can collide
    // with utility classes (e.g. "MsoNormal", or a stray Tailwind-looking class).
    doc.querySelectorAll('[class]').forEach((el) => {
      const kept = el.getAttribute('class')
        .split(/\s+/)
        .filter((c) => c && !/^Mso/i.test(c));
      if (kept.length) el.setAttribute('class', kept.join(' '));
      else el.removeAttribute('class');
    });

    if (stripLinks) {
      doc.querySelectorAll('a').forEach((a) => a.replaceWith(...a.childNodes));
    }

    loadContentFonts(doc);

    return doc.body.innerHTML;
  } catch {
    return regexClean(html, stripLinks);
  }
}

export default cleanCmsHtml;
