export const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '';

export const formatDateShort = (d) =>
  d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '';

export const getErrorMessage = (err) =>
  err?.response?.data?.message || err?.message || 'Something went wrong.';

export const truncate = (str, n = 100) =>
  str && str.length > n ? str.substring(0, n) + '...' : str;

export const CATEGORY_LABELS = {
  oral_inperson: 'Oral (In-Person)',
  oral_virtual: 'Oral (Virtual)',
  poster_inperson: 'Poster (In-Person)',
  poster_virtual: 'Poster (Virtual)',
  listener_inperson: 'Listener (In-Person)',
  listener_virtual: 'Listener (Virtual)',
  student: 'Student',
};
