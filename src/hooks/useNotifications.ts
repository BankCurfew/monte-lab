import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string | null;
  report_id: string | null;
  read: boolean;
  created_at: string;
}

export function useNotifications() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: notifications = [] } = useQuery({
    queryKey: ['monte-notifications', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase
        .from('monte_notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);
      return (data || []) as Notification[];
    },
    enabled: !!user,
  });

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('monte-notifications')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'monte_notifications',
        filter: `user_id=eq.${user.id}`,
      }, () => {
        queryClient.invalidateQueries({ queryKey: ['monte-notifications'] });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user, queryClient]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markRead = async (id: string) => {
    await supabase.from('monte_notifications').update({ read: true }).eq('id', id);
    queryClient.invalidateQueries({ queryKey: ['monte-notifications'] });
  };

  const markAllRead = async () => {
    if (!user) return;
    await supabase.from('monte_notifications').update({ read: true }).eq('user_id', user.id).eq('read', false);
    queryClient.invalidateQueries({ queryKey: ['monte-notifications'] });
  };

  return { notifications, unreadCount, markRead, markAllRead };
}
