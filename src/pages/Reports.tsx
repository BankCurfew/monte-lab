import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Search } from 'lucide-react';

const statusLabel: Record<string, string> = {
  pending: 'รอดำเนินการ', analyzing: 'กำลังวิเคราะห์', ready: 'รออนุมัติ',
  approved: 'อนุมัติแล้ว', rejected: 'ปฏิเสธ',
};
const statusColor: Record<string, string> = {
  pending: 'bg-gray-100 text-gray-700', analyzing: 'bg-blue-100 text-blue-700',
  ready: 'bg-orange-100 text-orange-700', approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
};

export default function Reports() {
  const [reports, setReports] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from('monte_reports')
        .select('id, test_date, status, lab_name, source, created_at, monte_patients(hn, first_name, last_name)')
        .order('created_at', { ascending: false });
      setReports(data || []);
    };
    fetch();
  }, []);

  const filtered = reports.filter(r => {
    if (statusFilter !== 'all' && r.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      const name = `${r.monte_patients?.first_name} ${r.monte_patients?.last_name}`.toLowerCase();
      return r.monte_patients?.hn?.toLowerCase().includes(q) || name.includes(q);
    }
    return true;
  });

  const grouped = filtered.reduce((acc: Record<string, any[]>, r) => {
    const key = r.monte_patients?.hn || r.id;
    (acc[key] = acc[key] || []).push(r);
    return acc;
  }, {});

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">รายงานผลเลือด</h2>

      <div className="flex gap-4 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input type="text" placeholder="ค้นหา HN หรือชื่อ..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#00868A] text-sm" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#00868A]">
          <option value="all">ทุกสถานะ</option>
          <option value="pending">รอดำเนินการ</option>
          <option value="analyzing">กำลังวิเคราะห์</option>
          <option value="ready">รออนุมัติ</option>
          <option value="approved">อนุมัติแล้ว</option>
          <option value="rejected">ปฏิเสธ</option>
        </select>
      </div>

      <div className="bg-white rounded-lg shadow">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">HN</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">ชื่อผู้ป่วย</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">วันที่ตรวจ</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">ห้อง LAB</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">แหล่ง</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">สถานะ</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(grouped).map(([hn, patientReports]: [string, any[]]) => {
              const first = patientReports[0];
              const latestStatus = first.status;
              const latestDate = patientReports.map(r => r.test_date).filter(Boolean).sort().pop() || '-';
              const labs = [...new Set(patientReports.map(r => r.lab_name).filter(Boolean))].join(', ') || '-';
              return (
                <tr key={hn} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm">
                    <Link to={`/reports/${first.id}`} className="text-[#006B6E] hover:underline font-medium">
                      {first.monte_patients?.hn}
                    </Link>
                    {patientReports.length > 1 && (
                      <span className="ml-1 text-[10px] bg-[#E0F5F5] text-[#006B6E] px-1.5 py-0.5 rounded-full">{patientReports.length} PDF</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm">{first.monte_patients?.first_name} {first.monte_patients?.last_name}</td>
                  <td className="px-4 py-3 text-sm">{latestDate}</td>
                  <td className="px-4 py-3 text-sm">{labs}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{patientReports.length} ไฟล์</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${statusColor[latestStatus] || ''} ${latestStatus === 'analyzing' ? 'animate-pulse' : ''}`}>{statusLabel[latestStatus] || latestStatus}</span>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">ยังไม่มีรายงาน</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
