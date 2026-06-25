import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

type MonteRole = 'admin' | 'doctor' | 'staff' | null;

interface AuthState {
  session: Session | null;
  user: User | null;
  role: MonteRole;
  loading: boolean;
}

const AuthContext = createContext<AuthState>({
  session: null,
  user: null,
  role: null,
  loading: true,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<MonteRole>(null);
  const [loading, setLoading] = useState(true);

  const fetchRole = async (userId: string) => {
    const { data } = await supabase
      .from('monte_app_roles')
      .select('role')
      .eq('user_id', userId)
      .single();
    setRole(data?.role as MonteRole || null);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) fetchRole(session.user.id);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) fetchRole(session.user.id);
      else { setRole(null); setLoading(false); }
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ session, user, role, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
