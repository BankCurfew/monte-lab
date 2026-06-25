import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCheck } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';

const typeIcon: Record<string, string> = {
  new_report: '📋',
  pending_approval: '⏳',
  approved: '✅',
  rejected: '❌',
};

export function NotificationBell() {
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleClick = (n: typeof notifications[0]) => {
    markRead(n.id);
    if (n.report_id) navigate(`/reports/${n.report_id}`);
    setOpen(false);
  };

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'เมื่อกี้';
    if (mins < 60) return `${mins} นาที`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs} ชม.`;
    return `${Math.floor(hrs / 24)} วัน`;
  };

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(!open)} className="relative p-2 hover:bg-gray-100 rounded-full">
        <Bell className="h-5 w-5 text-gray-600" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 w-80 bg-white rounded-lg shadow-lg border z-50 max-h-96 overflow-auto">
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <span className="font-semibold text-sm text-gray-700">การแจ้งเตือน</span>
            {unreadCount > 0 && (
              <button onClick={markAllRead} className="flex items-center gap-1 text-xs text-[#00868A] hover:underline">
                <CheckCheck className="h-3 w-3" /> อ่านทั้งหมด
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <div className="px-4 py-8 text-center text-gray-400 text-sm">ไม่มีการแจ้งเตือน</div>
          ) : (
            notifications.slice(0, 20).map(n => (
              <button
                key={n.id}
                onClick={() => handleClick(n)}
                className={`w-full text-left px-4 py-3 hover:bg-gray-50 border-b last:border-b-0 ${!n.read ? 'bg-blue-50/50' : ''}`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-lg">{typeIcon[n.type] || '📌'}</span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${!n.read ? 'font-semibold' : ''} text-gray-700`}>{n.title}</p>
                    {n.message && <p className="text-xs text-gray-500 truncate">{n.message}</p>}
                    <p className="text-[10px] text-gray-400 mt-1">{timeAgo(n.created_at)}</p>
                  </div>
                  {!n.read && <div className="w-2 h-2 bg-[#00868A] rounded-full mt-1 flex-shrink-0" />}
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
