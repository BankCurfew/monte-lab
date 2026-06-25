import { STATUS_CONFIG } from '@/lib/constants';

export function StatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] || { label: status, color: 'text-gray-700', bg: 'bg-gray-50' };
  return (
    <span className={`inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full ${config.bg} ${config.color}`}>
      {config.label}
    </span>
  );
}
