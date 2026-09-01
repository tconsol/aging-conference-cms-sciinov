import { deadlineState, formatDeadline } from '../../utils/deadline';

/**
 * Countdown chip for a registration-tier deadline.
 * Colour and motion escalate as the date approaches: 30 days → 10 days → final day.
 */
export default function DeadlineBadge({ date, compact = false, className = '' }) {
  const state = deadlineState(date);
  if (!state) return null;

  const pulseClass = state.level === 'critical'
    ? 'deadline-pulse-fast'
    : state.pulse ? 'deadline-pulse' : '';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-bold whitespace-nowrap ${
        compact ? 'text-[10px] px-2 py-0.5' : 'text-[11px] px-2.5 py-1'
      } ${pulseClass} ${className}`}
      style={{ background: state.bg, color: state.color, borderColor: state.border }}
      title={`Deadline: ${formatDeadline(date)}`}
    >
      <span
        className={`block rounded-full relative ${state.pulse ? 'deadline-dot' : ''}`}
        style={{ width: 6, height: 6, background: 'currentColor' }}
      />
      {state.text}
    </span>
  );
}
