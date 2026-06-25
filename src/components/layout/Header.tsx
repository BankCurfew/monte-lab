import { useAuth } from '@/contexts/AuthContext';
import { NotificationBell } from './NotificationBell';

export function Header() {
  const { user, role } = useAuth();

  const roleLabel: Record<string, string> = {
    admin: 'ผู้ดูแลระบบ',
    doctor: 'แพทย์',
    staff: 'เจ้าหน้าที่',
  };

  return (
    <header className="h-14 lg:h-16 bg-white border-b flex items-center justify-end px-4 lg:px-6">
      <div className="flex items-center gap-3 lg:gap-4">
        <NotificationBell />
        <div className="text-right hidden sm:block">
          <p className="text-sm font-medium text-gray-700 truncate max-w-[200px]">{user?.email}</p>
          <p className="text-xs text-[#00868A]">{role ? roleLabel[role] || role : ''}</p>
        </div>
        <div className="sm:hidden w-8 h-8 bg-[#00868A] rounded-full flex items-center justify-center text-white text-xs font-bold">
          {user?.email?.[0]?.toUpperCase() || 'U'}
        </div>
      </div>
    </header>
  );
}
