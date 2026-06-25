import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LayoutDashboard, FileText, Users, Upload, Settings, LogOut, Menu, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useState, useEffect } from 'react';

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
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  const sidebarContent = (
    <>
      <div className="p-5 border-b border-white/20 flex items-center justify-between">
        <div>
          <img src="/brand/monte-logo-white.png" alt="Monte Hair Clinic" className="h-8" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; (e.target as HTMLImageElement).parentElement!.innerHTML = '<h1 class="text-2xl font-bold tracking-[4px]">MONTE</h1><p class="text-[10px] text-white/60 tracking-[2px] mt-0.5">HAIR CLINIC</p>'; }} />
        </div>
        <button onClick={() => setMobileOpen(false)} className="lg:hidden p-1 hover:bg-white/10 rounded">
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav className="flex-1 py-3">
        {navItems
          .filter(item => role && item.roles.includes(role))
          .map(item => {
            const active = pathname === item.to || (item.to !== '/' && pathname.startsWith(item.to));
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 px-5 py-3 text-sm transition-all ${
                  active
                    ? 'bg-white/15 font-semibold border-r-3 border-white'
                    : 'hover:bg-white/10 text-white/80 hover:text-white'
                }`}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                {item.label}
              </Link>
            );
          })}
      </nav>

      <div className="p-4 border-t border-white/20">
        <button
          onClick={() => supabase.auth.signOut()}
          className="flex items-center gap-3 px-2 py-2 text-sm text-white/60 hover:text-white w-full transition-colors"
        >
          <LogOut className="h-4 w-4" />
          ออกจากระบบ
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-3 left-3 z-40 p-2 bg-[#00868A] text-white rounded-lg shadow-lg"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar — desktop always visible, mobile slide-in */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-64 bg-[#00868A] text-white flex flex-col
        transition-transform duration-300 ease-in-out
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        min-h-screen
      `}>
        {sidebarContent}
      </aside>
    </>
  );
}
