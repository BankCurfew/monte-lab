import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { FileText, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface Stats {
  total: number;
  pending: number;
  ready: number;
  approved: number;
  rejected: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({ total: 0, pending: 0, ready: 0, approved: 0, rejected: 0 });
  const [recentReports, setRecentReports] = useState<any[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      const { data } = await supabase.from('monte_reports').select('status');
      if (data) {
        setStats({
          total: data.length,
          pending: data.filter(r => r.status === 'pending' || r.status === 'analyzing').length,
          ready: data.filter(r => r.status === 'ready').length,
          approved: data.filter(r => r.status === 'approved').length,
          rejected: data.filter(r => r.status === 'rejected').length,
        });
      }
    };

    const fetchRecent = async () => {
      const { data } = await supabase
        .from('monte_reports')
        .select('id, test_date, status, lab_name, monte_patients(hn, first_name, last_name)')
        .order('created_at', { ascending: false })
        .limit(10);
      setRecentReports(data || []);
    };

    fetchStats();
    fetchRecent();
  }, []);

  const statCards = [
    { label: 'ทั้งหมด', value: stats.total, icon: FileText, color: 'text-[#00868A]', bg: 'bg-[#00868A]/10' },
    { label: 'รอดำเนินการ', value: stats.pending, icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50' },
    { label: 'รออนุมัติ', value: stats.ready, icon: AlertCircle, color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: 'อนุมัติแล้ว', value: stats.approved, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'ปฏิเสธ', value: stats.rejected, icon: XCircle, color: 'text-red-600', bg: 'bg-red-50' },
  ];

  const statusLabel: Record<string, string> = {
    pending: 'รอดำเนินการ', analyzing: 'กำลังวิเคราะห์', ready: 'รออนุมัติ',
    approved: 'อนุมัติแล้ว', rejected: 'ปฏิเสธ',
  };
  const statusColor: Record<string, string> = {
    pending: 'bg-gray-100 text-gray-700', analyzing: 'bg-blue-100 text-blue-700',
    ready: 'bg-orange-100 text-orange-700', approved: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h2>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        {statCards.map(card => (
          <div key={card.label} className={`${card.bg} rounded-lg p-4`}>
            <div className="flex items-center gap-2 mb-2">
              <card.icon className={`h-5 w-5 ${card.color}`} />
              <span className="text-sm text-gray-600">{card.label}</span>
            </div>
            <p className={`text-3xl font-bold ${card.color}`}>{card.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <h3 className="font-semibold text-gray-700">รายงานล่าสุด</h3>
        </div>
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">HN</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">ชื่อผู้ป่วย</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">วันที่ตรวจ</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">ห้อง LAB</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">สถานะ</th>
            </tr>
          </thead>
          <tbody>
            {recentReports.map(report => (
              <tr key={report.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-3 text-sm">
                  <Link to={`/reports/${report.id}`} className="text-[#00868A] hover:underline">
                    {report.monte_patients?.hn}
                  </Link>
                </td>
                <td className="px-4 py-3 text-sm">{report.monte_patients?.first_name} {report.monte_patients?.last_name}</td>
                <td className="px-4 py-3 text-sm">{report.test_date}</td>
                <td className="px-4 py-3 text-sm">{report.lab_name || '-'}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-1 rounded-full ${statusColor[report.status] || ''}`}>
                    {statusLabel[report.status] || report.status}
                  </span>
                </td>
              </tr>
            ))}
            {recentReports.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">ยังไม่มีรายงาน</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
