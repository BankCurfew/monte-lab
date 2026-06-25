import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LayoutDashboard, FileText, Users, Upload, Settings, LogOut } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard', roles: ['admin', 'doctor', 'staff'] },
  { to: '/reports', icon: FileText, label: 'รายงานผลเลือด', roles: ['admin', 'doctor', 'staff'] },
  { to: '/upload', icon: Upload, label: 'อัปโหลด PDF', roles: ['admin', 'doctor'] },
  { to: '/patients', icon: Users, label: 'ผู้ป่วย', roles: ['admin', 'doctor'] },
  { to: '/settings', icon: Settings, label: 'ตั้งค่า', roles: ['admin'] },
];

export function Sidebar() {
  const { pathname } = useLocation();
  const { role } = useAuth();

  return (
    <aside className="w-64 min-h-screen bg-[#00868A] text-white flex flex-col">
      <div className="p-6 border-b border-white/20">
        <h1 className="text-2xl font-bold tracking-wider">MONTE</h1>
        <p className="text-xs text-white/70 mt-1">Lab Report System</p>
      </div>

      <nav className="flex-1 py-4">
        {navItems
          .filter(item => role && item.roles.includes(role))
          .map(item => {
            const active = pathname === item.to || (item.to !== '/' && pathname.startsWith(item.to));
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 px-6 py-3 text-sm transition-colors ${
                  active ? 'bg-white/20 font-semibold' : 'hover:bg-white/10'
                }`}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
      </nav>

      <div className="p-4 border-t border-white/20">
        <button
          onClick={() => supabase.auth.signOut()}
          className="flex items-center gap-3 px-2 py-2 text-sm text-white/80 hover:text-white w-full"
        >
          <LogOut className="h-4 w-4" />
          ออกจากระบบ
        </button>
      </div>
    </aside>
  );
}
