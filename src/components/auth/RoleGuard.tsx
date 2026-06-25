import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

type MonteRole = 'admin' | 'doctor' | 'staff';

export function RoleGuard({ children, roles }: { children: React.ReactNode; roles: MonteRole[] }) {
  const { role } = useAuth();
  if (!role || !roles.includes(role)) return <Navigate to="/" replace />;
  return <>{children}</>;
}
