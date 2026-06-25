import { useAuth } from '@/contexts/AuthContext';
import { NotificationBell } from './NotificationBell';
import { LogOut } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const roleLabel: Record<string, string> = {
  admin: 'ผู้ดูแลระบบ',
  doctor: 'แพทย์',
  staff: 'เจ้าหน้าที่',
};

export function Header() {
  const { user, role } = useAuth();

  return (
    <header className="h-14 lg:h-16 bg-white border-b flex items-center justify-between px-4 lg:px-6">
      <div className="lg:hidden flex items-center gap-2 ml-10">
        <img src="/brand/monte-logo-primary.png" alt="Monte" className="h-6" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
      </div>
      <div className="hidden lg:block" />
      <div className="flex items-center gap-3 lg:gap-4">
        <NotificationBell />
        <div className="text-right hidden sm:block">
          <p className="text-sm font-medium text-[#1A2B3C] truncate max-w-[200px]">{user?.email}</p>
          <p className="text-xs text-[#006B6E]">{role ? roleLabel[role] || role : ''}</p>
        </div>
        <div className="sm:hidden w-8 h-8 bg-[#00868A] rounded-full flex items-center justify-center text-white text-xs font-bold">
          {user?.email?.[0]?.toUpperCase() || 'U'}
        </div>
        <button onClick={() => supabase.auth.signOut()} className="p-2 text-[#94A3B8] hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="ออกจากระบบ">
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
