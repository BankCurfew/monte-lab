import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { FileText, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { EmptyState } from '@/components/ui/EmptyState';
import { TableSkeleton } from '@/components/ui/TableSkeleton';

interface Stats {
  total: number;
  pending: number;
  analyzed: number;
  ready: number;
  approved: number;
  rejected: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({ total: 0, pending: 0, analyzed: 0, ready: 0, approved: 0, rejected: 0 });
  const [recentReports, setRecentReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data: all } = await supabase
        .from('monte_reports')
        .select('id, test_date, status, lab_name, patient_id, created_at, monte_patients(hn, first_name, last_name)')
        .order('created_at', { ascending: false });

      if (all) {
        const byPatient = new Map<string, any[]>();
        for (const r of all) {
          const key = r.patient_id || r.id;
          if (!byPatient.has(key)) byPatient.set(key, []);
          byPatient.get(key)!.push(r);
        }
        const patients = [...byPatient.values()];
        const bestStatus = (reps: any[]) => {
          if (reps.some(r => r.status === 'approved')) return 'approved';
          if (reps.some(r => r.status === 'ready')) return 'ready';
          if (reps.some(r => r.status === 'analyzing')) return 'analyzing';
          return 'pending';
        };
        setStats({
          total: patients.length,
          pending: patients.filter(p => bestStatus(p) === 'pending').length,
          analyzed: patients.filter(p => ['ready', 'approved'].includes(bestStatus(p))).length,
          ready: patients.filter(p => bestStatus(p) === 'ready').length,
          approved: patients.filter(p => bestStatus(p) === 'approved').length,
          rejected: patients.filter(p => p.some((r: any) => r.status === 'rejected')).length,
        });
        const grouped = patients.map(reps => {
          const first = reps[0];
          return { ...first, status: bestStatus(reps), pdfCount: reps.length };
        });
        setRecentReports(grouped.slice(0, 10));
      }
      setLoading(false);
    };
    fetch();
  }, []);

  const statCards = [
    { label: 'ทั้งหมด', value: stats.total, icon: FileText, borderColor: 'border-l-[#00868A]', iconBg: 'bg-[#E0F5F5]', iconColor: 'text-[#006B6E]' },
    { label: 'วิเคราะห์แล้ว', value: stats.analyzed, icon: CheckCircle, borderColor: 'border-l-blue-400', iconBg: 'bg-blue-50', iconColor: 'text-blue-600' },
    { label: 'รอดำเนินการ', value: stats.pending, icon: Clock, borderColor: 'border-l-amber-400', iconBg: 'bg-amber-50', iconColor: 'text-amber-600' },
    { label: 'รออนุมัติ', value: stats.ready, icon: AlertCircle, borderColor: 'border-l-orange-400', iconBg: 'bg-orange-50', iconColor: 'text-orange-600' },
    { label: 'อนุมัติแล้ว', value: stats.approved, icon: CheckCircle, borderColor: 'border-l-emerald-400', iconBg: 'bg-emerald-50', iconColor: 'text-emerald-600' },
    { label: 'ปฏิเสธ', value: stats.rejected, icon: XCircle, borderColor: 'border-l-red-400', iconBg: 'bg-red-50', iconColor: 'text-red-600' },
  ];

  return (
    <div className="pl-0 lg:pl-0">
      <h2 className="text-xl lg:text-2xl font-bold text-[#1A2B3C] mb-6">Dashboard</h2>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 lg:gap-4 mb-8">
        {statCards.map(card => (
          <div key={card.label} className={`bg-white rounded-xl shadow-sm p-4 border-l-4 ${card.borderColor} hover:-translate-y-0.5 hover:shadow-md transition-all`}>
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-8 h-8 ${card.iconBg} rounded-lg flex items-center justify-center`}>
                <card.icon className={`h-4 w-4 ${card.iconColor}`} />
              </div>
            </div>
            <p className="text-2xl lg:text-3xl font-bold text-[#1A2B3C]">{card.value}</p>
            <p className="text-xs text-[#5A6B7C] mt-0.5">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Recent Reports */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="px-4 lg:px-6 py-4 border-b border-[#E2E8F0]">
          <h3 className="font-semibold text-[#1A2B3C]">รายงานล่าสุด</h3>
        </div>

        {loading ? (
          <TableSkeleton rows={5} columns={5} />
        ) : recentReports.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="ยังไม่มีรายงานผลเลือด"
            description="อัปโหลด PDF ผลตรวจเพื่อเริ่มต้นใช้งาน"
            actionLabel="อัปโหลด PDF"
            actionTo="/upload"
          />
        ) : (
          <>
            {/* Desktop table */}
            <table className="w-full hidden sm:table">
              <thead className="bg-[#F8FAFB]">
                <tr>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs font-semibold text-[#5A6B7C] uppercase tracking-wider">HN</th>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs font-semibold text-[#5A6B7C] uppercase tracking-wider">ชื่อลูกค้า</th>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs font-semibold text-[#5A6B7C] uppercase tracking-wider">วันที่ตรวจ</th>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs font-semibold text-[#5A6B7C] uppercase tracking-wider">LAB</th>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs font-semibold text-[#5A6B7C] uppercase tracking-wider">สถานะ</th>
                </tr>
              </thead>
              <tbody>
                {recentReports.map(report => (
                  <tr key={report.id} className="border-t border-[#E2E8F0] hover:bg-[#F8FAFB] cursor-pointer" onClick={() => window.location.href = `/reports/${report.id}`}>
                    <td className="px-4 lg:px-6 py-3.5 text-sm">
                      <Link to={`/reports/${report.id}`} className="text-[#006B6E] font-medium hover:underline">{report.monte_patients?.hn}</Link>
                    </td>
                    <td className="px-4 lg:px-6 py-3.5 text-sm text-[#1A2B3C]">{report.monte_patients?.first_name} {report.monte_patients?.last_name}</td>
                    <td className="px-4 lg:px-6 py-3.5 text-sm text-[#5A6B7C]">{report.test_date}</td>
                    <td className="px-4 lg:px-6 py-3.5 text-sm text-[#5A6B7C]">{report.lab_name || '-'}</td>
                    <td className="px-4 lg:px-6 py-3.5"><StatusBadge status={report.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Mobile cards */}
            <div className="sm:hidden divide-y divide-[#E2E8F0]">
              {recentReports.map(report => (
                <Link key={report.id} to={`/reports/${report.id}`} className="block px-4 py-3.5 hover:bg-[#F8FAFB]">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-[#006B6E]">{report.monte_patients?.hn}</p>
                      <p className="text-sm text-[#1A2B3C]">{report.monte_patients?.first_name} {report.monte_patients?.last_name}</p>
                      <p className="text-xs text-[#94A3B8] mt-0.5">{report.test_date} · {report.lab_name || '-'}</p>
                    </div>
                    <StatusBadge status={report.status} />
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
