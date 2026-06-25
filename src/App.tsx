import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { RoleGuard } from '@/components/auth/RoleGuard';
import { AppLayout } from '@/components/layout/AppLayout';
import { lazy, Suspense } from 'react';
import { Loader2 } from 'lucide-react';

const Auth = lazy(() => import('@/pages/Auth'));
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const Reports = lazy(() => import('@/pages/Reports'));
const ReportDetail = lazy(() => import('@/pages/ReportDetail'));
const UploadReport = lazy(() => import('@/pages/UploadReport'));
const Patients = lazy(() => import('@/pages/Patients'));
const Settings = lazy(() => import('@/pages/Settings'));
const PatientDetail = lazy(() => import('@/pages/PatientDetail'));

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
                <Route path="reports" element={<Reports />} />
                <Route path="reports/:id" element={<ReportDetail />} />
                <Route path="upload" element={<RoleGuard roles={['admin', 'doctor']}><UploadReport /></RoleGuard>} />
                <Route path="patients" element={<RoleGuard roles={['admin', 'doctor']}><Patients /></RoleGuard>} />
                <Route path="patients/:id" element={<RoleGuard roles={['admin', 'doctor']}><PatientDetail /></RoleGuard>} />
                <Route path="settings" element={<Settings />} />
              </Route>
            </Routes>
          </Suspense>
          <Toaster position="top-right" richColors />
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
