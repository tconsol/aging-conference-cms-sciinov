const variants = {
  success: 'bg-green-100 text-green-700',
  warning: 'bg-amber-100 text-amber-700',
  danger: 'bg-red-100 text-red-700',
  info: 'bg-blue-100 text-blue-700',
  default: 'bg-slate-100 text-slate-600',
  purple: 'bg-purple-100 text-purple-700',
  teal: 'bg-teal-100 text-teal-700',
};

export default function Badge({ children, variant = 'default', className = '' }) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
}

export function statusBadge(status) {
  const map = {
    // Abstract statuses
    pending: { label: 'Pending', variant: 'warning' },
    under_review: { label: 'Under Review', variant: 'info' },
    approved: { label: 'Approved', variant: 'success' },
    rejected: { label: 'Rejected', variant: 'danger' },
    // Payment statuses
    confirmed: { label: 'Confirmed', variant: 'success' },
    cancelled: { label: 'Cancelled', variant: 'danger' },
    // Generic
    active: { label: 'Active', variant: 'success' },
    inactive: { label: 'Inactive', variant: 'default' },
    published: { label: 'Published', variant: 'success' },
    draft: { label: 'Draft', variant: 'warning' },
    new: { label: 'New', variant: 'info' },
    read: { label: 'Read', variant: 'default' },
    follow_up: { label: 'Follow Up', variant: 'warning' },
    closed: { label: 'Closed', variant: 'default' },
    open: { label: 'Open', variant: 'danger' },
    in_progress: { label: 'In Progress', variant: 'warning' },
    resolved: { label: 'Resolved', variant: 'success' },
    upcoming: { label: 'Upcoming', variant: 'info' },
    past: { label: 'Past', variant: 'default' },
  };
  const config = map[status] || { label: status, variant: 'default' };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
