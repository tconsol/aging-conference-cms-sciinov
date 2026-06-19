import { Inbox, Plus } from 'lucide-react';
import Button from './Button';

export default function EmptyState({
  message = 'No items found.',
  description,
  action,
  actionLabel = 'Add New',
  icon: Icon = Inbox,
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
        <Icon size={28} className="text-slate-400" />
      </div>
      <p className="text-base font-medium text-slate-700">{message}</p>
      {description && <p className="text-sm text-slate-500 mt-1 max-w-xs">{description}</p>}
      {action && (
        <Button onClick={action} className="mt-4">
          <Plus size={15} />
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
