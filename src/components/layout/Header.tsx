import { useAuth } from '@/contexts/AuthContext';
import { NotificationBell } from './NotificationBell';

export function Header() {
  const { user, role } = useAuth();

  return (
    <header className="h-16 bg-white border-b flex items-center justify-between px-6">
      <div />
      <div className="flex items-center gap-4">
        <NotificationBell />
        <div className="text-right">
          <p className="text-sm font-medium text-gray-700">{user?.email}</p>
          <p className="text-xs text-[#00868A] capitalize">{role}</p>
        </div>
      </div>
    </header>
  );
}
