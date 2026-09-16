/**
 * Fonts offered in the editor, and how a Google face gets loaded.
 *
 * Shared between the toolbar picker and anything else that needs to render a
 * stored font stack, so the quoting rules stay in one place.
 */

/** Installed on Windows, macOS and most Linux desktops — no download needed. */
export const WEB_SAFE_FONTS = [
  { label: 'Arial',           value: 'Arial, Helvetica, sans-serif' },
  { label: 'Calibri',         value: 'Calibri, Candara, Segoe, sans-serif' },
  { label: 'Cambria',         value: 'Cambria, Georgia, serif' },
  { label: 'Courier New',     value: '"Courier New", Courier, monospace' },
  { label: 'Garamond',        value: 'Garamond, Baskerville, serif' },
  { label: 'Georgia',         value: 'Georgia, "Times New Roman", serif' },
  { label: 'Helvetica',       value: 'Helvetica, Arial, sans-serif' },
  { label: 'Palatino',        value: '"Palatino Linotype", Palatino, serif' },
  { label: 'Segoe UI',        value: '"Segoe UI", Tahoma, sans-serif' },
  { label: 'Tahoma',          value: 'Tahoma, Verdana, sans-serif' },
  { label: 'Times New Roman', value: '"Times New Roman", Times, serif' },
  { label: 'Trebuchet MS',    value: '"Trebuchet MS", Tahoma, sans-serif' },
  { label: 'Verdana',         value: 'Verdana, Geneva, sans-serif' },
];

/**
 * CSS font stack for a Google family. The name is quoted because many contain
 * spaces, and a generic fallback follows so text stays readable if the webfont
 * never arrives.
 */
export const fontStack = (family) => `"${family}", system-ui, sans-serif`;

const linkId = (family) => `gf-${family.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;

/**
 * Injects the stylesheet for a Google family, once. The <link> is never removed:
 * switching fonts would otherwise unload a face still painted on screen and
 * flash the text back to its fallback.
 */
export function loadGoogleFont(family) {
  if (!family || typeof document === 'undefined') return;
  const id = linkId(family);
  if (document.getElementById(id)) return;

  const link = document.createElement('link');
  link.id = id;
  link.rel = 'stylesheet';
  link.href =
    `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family).replace(/%20/g, '+')}` +
    ':wght@400;500;600;700&display=swap';
  document.head.appendChild(link);
}

export default { WEB_SAFE_FONTS, fontStack, loadGoogleFont };
