export const formatDate = (date, options = {}) => {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options,
  });
};

export const formatDateTime = (date) => {
  if (!date) return '—';
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatCurrency = (amount, currency = 'USD') => {
  if (amount == null) return '—';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
};

export const truncate = (str, length = 60) => {
  if (!str) return '';
  return str.length > length ? `${str.slice(0, length)}...` : str;
};

export const buildFormData = (data) => {
  const fd = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    if (value instanceof FileList) {
      Array.from(value).forEach((file) => fd.append(key, file));
    } else if (value instanceof File) {
      fd.append(key, value);
    } else if (Array.isArray(value)) {
      fd.append(key, JSON.stringify(value));
    } else if (typeof value === 'object' && !(value instanceof File)) {
      fd.append(key, JSON.stringify(value));
    } else {
      fd.append(key, value);
    }
  });
  return fd;
};

export const downloadBlob = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

export const getErrorMessage = (error) =>
  error?.response?.data?.message || error?.message || 'Something went wrong.';

export const CATEGORY_LABELS = {
  oral_inperson: 'Oral (In-Person)',
  oral_virtual: 'Oral (Virtual)',
  poster_inperson: 'Poster (In-Person)',
  poster_virtual: 'Poster (Virtual)',
  listener_inperson: 'Listener (In-Person)',
  listener_virtual: 'Listener (Virtual)',
  student: 'Student',
};

export const SLOT_TYPE_LABELS = {
  keynote: 'Keynote',
  plenary: 'Plenary',
  scientific: 'Scientific Session',
  coffee_break: 'Coffee Break',
  lunch: 'Lunch',
  workshop: 'Workshop',
  opening: 'Opening Ceremony',
  closing: 'Closing Ceremony',
  other: 'Other',
};
