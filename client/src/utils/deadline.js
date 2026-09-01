/**
 * Registration-tier deadline helpers.
 *
 * Tiers close on a date, so the closer that date the louder the UI gets:
 * comfortable → 30 days → 10 days → final day → closed.
 */

export const URGENCY = {
  normal: {
    key: 'normal',
    color: '#0f766e',
    bg: 'color-mix(in srgb, #0d9488 10%, white)',
    border: 'color-mix(in srgb, #0d9488 28%, transparent)',
    pulse: false,
  },
  soon: {          // <= 30 days
    key: 'soon',
    color: '#b45309',
    bg: '#fffbeb',
    border: '#fcd34d',
    pulse: false,
  },
  urgent: {        // <= 10 days
    key: 'urgent',
    color: '#c2410c',
    bg: '#fff7ed',
    border: '#fdba74',
    pulse: true,
  },
  critical: {      // <= 1 day
    key: 'critical',
    color: '#b91c1c',
    bg: '#fef2f2',
    border: '#fca5a5',
    pulse: true,
  },
  closed: {
    key: 'closed',
    color: '#64748b',
    bg: '#f1f5f9',
    border: '#e2e8f0',
    pulse: false,
  },
};

/** Whole days from now until `date` (negative once it has passed). */
export function daysUntil(date) {
  if (!date) return null;
  const end = new Date(date);
  if (Number.isNaN(end.getTime())) return null;
  // Compare at day granularity so "tomorrow" doesn't flip to 0 at midday
  const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  return Math.round((startOfDay(end) - startOfDay(new Date())) / 86_400_000);
}

/**
 * Countdown state for a tier deadline.
 * Returns null when there is no deadline to count down to.
 */
export function deadlineState(date) {
  const days = daysUntil(date);
  if (days === null) return null;

  let level;
  if (days < 0) level = 'closed';
  else if (days <= 1) level = 'critical';
  else if (days <= 10) level = 'urgent';
  else if (days <= 30) level = 'soon';
  else level = 'normal';

  let text;
  if (days < 0) text = 'Closed';
  else if (days === 0) text = 'Closes today';
  else if (days === 1) text = 'Last day tomorrow';
  else text = `${days} days left`;

  return { days, text, level, ...URGENCY[level], isClosed: days < 0 };
}

export const formatDeadline = (date) =>
  date
    ? new Date(date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : '';
