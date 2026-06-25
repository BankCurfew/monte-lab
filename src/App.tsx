import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AppLayout } from '@/components/layout/AppLayout';
import { lazy, Suspense } from 'react';
import { Loader2 } from 'lucide-react';

const Auth = lazy(() => import('@/pages/Auth'));
const Dashboard = lazy(() => import('@/pages/Dashboard'));

const queryClient = new QueryClient();

const Loading = () => (
  <div className="min-h-screen flex items-center justify-center">
    <Loader2 className="h-8 w-8 animate-spin text-[#00868A]" />
  </div>
);

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Suspense fallback={<Loading />}>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
                <Route index element={<Dashboard />} />
              </Route>
            </Routes>
          </Suspense>
          <Toaster position="top-right" richColors />
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
