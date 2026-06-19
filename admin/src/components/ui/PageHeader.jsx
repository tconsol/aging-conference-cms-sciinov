import Button from './Button';
import { Plus } from 'lucide-react';

export default function PageHeader({
  title,
  subtitle,
  action,
  actionLabel,
  actionIcon: Icon = Plus,
  secondaryAction,
  secondaryLabel,
  secondaryIcon: SecIcon,
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div>
        <h1 className="text-xl font-bold text-slate-800">{title}</h1>
        {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
      {(action || secondaryAction) && (
        <div className="flex items-center gap-2 flex-shrink-0">
          {secondaryAction && (
            <Button variant="secondary" onClick={secondaryAction}>
              {SecIcon && <SecIcon size={15} />}
              {secondaryLabel}
            </Button>
          )}
          {action && (
            <Button onClick={action}>
              <Icon size={15} />
              {actionLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
