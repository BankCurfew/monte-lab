import { type LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  actionTo?: string;
}

export function EmptyState({ icon: Icon, title, description, actionLabel, actionTo }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-16 h-16 bg-[#E0F5F5] rounded-2xl flex items-center justify-center mb-4">
        <Icon className="h-8 w-8 text-[#006B6E]" />
      </div>
      <h3 className="text-lg font-semibold text-[#1A2B3C] mb-1">{title}</h3>
      {description && <p className="text-sm text-[#5A6B7C] mb-4 text-center max-w-xs">{description}</p>}
      {actionLabel && actionTo && (
        <Link to={actionTo} className="px-5 py-2.5 bg-[#00868A] text-white rounded-xl text-sm font-medium hover:bg-[#006B6E] shadow-sm">
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
