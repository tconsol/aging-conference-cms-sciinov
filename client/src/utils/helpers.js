export const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '';

export const formatDateShort = (d) =>
  d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '';

export const getErrorMessage = (err) =>
  err?.response?.data?.message || err?.message || 'Something went wrong.';

export const truncate = (str, n = 100) =>
  str && str.length > n ? str.substring(0, n) + '...' : str;

export const downloadBlob = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

export const CATEGORY_LABELS = {
  oral_inperson: 'Oral (In-Person)',
  oral_virtual: 'Oral (Virtual)',
  poster_inperson: 'Poster (In-Person)',
  poster_virtual: 'Poster (Virtual)',
  listener_inperson: 'Listener (In-Person)',
  listener_virtual: 'Listener (Virtual)',
  student: 'Student',
};

/**
 * Label for a pricing/registration category.
 * Falls back to humanising the key so admin-defined categories
 * (e.g. "workshop_inperson") display sensibly without a code change.
 */
export const categoryLabel = (key) => {
  if (!key) return '';
  if (CATEGORY_LABELS[key]) return CATEGORY_LABELS[key];
  const mode = key.endsWith('_inperson') ? ' (In-Person)'
    : key.endsWith('_virtual') ? ' (Virtual)'
    : '';
  const base = key.replace(/_(inperson|virtual)$/, '');
  const words = base
    .split('_')
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
  return words + mode;
};
