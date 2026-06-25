import { useAuth } from '@/contexts/AuthContext';
import { Bell } from 'lucide-react';

export function Header() {
  const { user, role } = useAuth();

  return (
    <header className="h-16 bg-white border-b flex items-center justify-between px-6">
      <div />
      <div className="flex items-center gap-4">
        <button className="relative p-2 hover:bg-gray-100 rounded-full">
          <Bell className="h-5 w-5 text-gray-600" />
        </button>
        <div className="text-right">
          <p className="text-sm font-medium text-gray-700">{user?.email}</p>
          <p className="text-xs text-[#00868A] capitalize">{role}</p>
        </div>
      </div>
    </header>
  );
}
