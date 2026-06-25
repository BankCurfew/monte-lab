import { useEffect, useState, useMemo, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft, FileText, CheckCircle, XCircle, Download, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { MonteAnalysisView } from '@/components/reports/MonteAnalysisView';
import { generateMonteAnalysis } from '@/lib/monte-analysis';

function InlineHNEdit({ patientId, currentHN }: { patientId: string; currentHN: string }) {
  const [editing, setEditing] = useState(false);
  const [hn, setHn] = useState(currentHN || '');

  if (!editing) {
    return (
      <span className="cursor-pointer hover:text-[#006B6E] hover:underline" onClick={() => setEditing(true)} title="คลิกเพื่อแก้ไข HN">
        {currentHN || 'ไม่ระบุ'} ✏️
      </span>
    );
  }

  const save = async () => {
    const { error } = await supabase.from('monte_patients').update({ hn }).eq('id', patientId);
    if (error) toast.error(error.message);
    else { toast.success('อัพเดท HN แล้ว'); setEditing(false); }
  };

  return (
    <span className="inline-flex items-center gap-1">
      <input value={hn} onChange={e => setHn(e.target.value)} className="px-1 py-0.5 border rounded text-sm w-24"
        autoFocus onKeyDown={e => e.key === 'Enter' && save()} />
      <button onClick={save} className="text-xs text-[#006B6E] hover:underline">บันทึก</button>
      <button onClick={() => setEditing(false)} className="text-xs text-gray-400">ยกเลิก</button>
    </span>
  );
}

const statusLabel: Record<string, string> = {
  pending: 'รอดำเนินการ', analyzing: 'กำลังวิเคราะห์', ready: 'รออนุมัติ',
  approved: 'อนุมัติแล้ว', rejected: 'ปฏิเสธ',
};
const statusColor: Record<string, string> = {
  pending: 'bg-gray-100 text-gray-700', analyzing: 'bg-blue-100 text-blue-700',
  ready: 'bg-orange-100 text-orange-700', approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
};

export default function ReportDetail() {
  const { id } = useParams();
  const { role, user } = useAuth();
  const [report, setReport] = useState<any>(null);
  const [allPatientReports, setAllPatientReports] = useState<any[]>([]);
  const [rejectReason, setRejectReason] = useState('');
  const [showReject, setShowReject] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);
  const analysisRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!id) return;
    supabase
      .from('monte_reports')
      .select('*, monte_patients(*), monte_doctors(full_name, license_no)')
      .eq('id', id)
      .single()
      .then(({ data }) => {
        setReport(data);
        if (data?.patient_id) {
          supabase
            .from('monte_reports')
            .select('id, test_date, lab_name, parsed_values, status')
            .eq('patient_id', data.patient_id)
            .order('test_date', { ascending: false })
            .then(({ data: all }) => setAllPatientReports(all || []));
        }
      });
  }, [id]);

  const aggregatedParsed = useMemo(() => {
    if (!report) return {};
    const merged: Record<string, any> = {};
    for (const r of allPatientReports) {
      const pv = r.parsed_values || {};
      for (const [group, tests] of Object.entries(pv) as [string, any][]) {
        if (!merged[group]) merged[group] = {};
        Object.assign(merged[group], tests);
      }
    }
    return Object.keys(merged).length > 0 ? merged : (report.parsed_values || {});
  }, [allPatientReports, report]);

  const monteAnalysis = useMemo(
    () => Object.keys(aggregatedParsed).length > 0 ? generateMonteAnalysis(aggregatedParsed) : null,
    [aggregatedParsed]
  );

  if (!report) return <div className="text-center py-12 text-gray-400">กำลังโหลด...</div>;

  const patient = report.monte_patients;
  const parsed = aggregatedParsed;

  const handleApprove = async () => {
    // Find doctor record for current user
    const { data: doctorData } = await supabase
      .from('monte_doctors')
      .select('id, full_name, license_no, signature_url')
      .eq('user_id', user?.id)
      .single();

    const { error } = await supabase
      .from('monte_reports')
      .update({
        status: 'approved',
        approved_at: new Date().toISOString(),
        approved_by: doctorData?.id || null,
      })
      .eq('id', id);
    if (error) toast.error(error.message);
    else {
      toast.success('อนุมัติแล้ว');
      setReport({ ...report, status: 'approved', approved_by: doctorData?.id, monte_doctors: doctorData });
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) { toast.error('กรุณาระบุเหตุผล'); return; }
    const { error } = await supabase
      .from('monte_reports')
      .update({ status: 'rejected', rejection_reason: rejectReason })
      .eq('id', id);
    if (error) toast.error(error.message);
    else { toast.success('ปฏิเสธแล้ว'); setReport({ ...report, status: 'rejected' }); setShowReject(false); }
  };

  const handleExportPdf = async () => {
    if (!analysisRef.current) return;
    setExportingPdf(true);
    try {
      const html2canvas = (await import('html2canvas-pro')).default;
      const { jsPDF } = await import('jspdf');

      const canvas = await html2canvas(analysisRef.current, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
      const imgData = canvas.toDataURL('image/png');

      const pdfWidth = 210;
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      const pdf = new jsPDF({ orientation: pdfHeight > 297 ? 'p' : 'p', unit: 'mm', format: 'a4' });

      const pageHeight = 297;
      const totalPages = Math.ceil(pdfHeight / pageHeight);

      for (let page = 0; page < totalPages; page++) {
        if (page > 0) pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, -page * pageHeight, pdfWidth, pdfHeight);
      }

      const patientName = `${patient?.first_name || ''}_${patient?.hn || 'report'}`;
      pdf.save(`Monte_Lab_${patientName}_${report.test_date || 'report'}.pdf`);
      toast.success('ดาวน์โหลด PDF เรียบร้อย');
    } catch (err) {
      toast.error('ไม่สามารถสร้าง PDF ได้');
    }
    setExportingPdf(false);
  };

  const renderBloodTests = () => {
    const groups = Object.entries(parsed);
    if (groups.length === 0) return <p className="text-gray-400 text-sm">ยังไม่มีข้อมูลผลตรวจ (รอประมวลผล PDF)</p>;

    return groups.map(([group, tests]: [string, any]) => (
      <div key={group} className="mb-4">
        <h4 className="text-sm font-semibold text-[#006B6E] uppercase mb-2">{group}</h4>
        <table className="w-full text-sm">
          <thead><tr className="bg-gray-50">
            <th className="px-3 py-2 text-left text-xs text-gray-500">รายการ</th>
            <th className="px-3 py-2 text-right text-xs text-gray-500">ค่า</th>
            <th className="px-3 py-2 text-left text-xs text-gray-500">หน่วย</th>
            <th className="px-3 py-2 text-left text-xs text-gray-500">ค่าอ้างอิง</th>
            <th className="px-3 py-2 text-center text-xs text-gray-500">สถานะ</th>
          </tr></thead>
          <tbody>
            {Object.entries(tests).map(([testName, val]: [string, any]) => (
              <tr key={testName} className={`border-t ${val.flag ? 'bg-red-50' : ''}`}>
                <td className="px-3 py-2">{testName}</td>
                <td className="px-3 py-2 text-right font-mono">{val.value}</td>
                <td className="px-3 py-2 text-gray-500">{val.unit}</td>
                <td className="px-3 py-2 text-gray-500">{val.ref_min}-{val.ref_max}</td>
                <td className="px-3 py-2 text-center">
                  {val.flag === 'low' && <span className="text-blue-600">⬇</span>}
                  {val.flag === 'high' && <span className="text-red-600">⬆</span>}
                  {!val.flag && <span className="text-green-600">✓</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ));
  };

  return (
    <div>
      <Link to="/reports" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-4">
        <ArrowLeft className="h-4 w-4" /> กลับ
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-800">ผลตรวจเลือด — {patient?.first_name} {patient?.last_name}</h2>
                <p className="text-sm text-gray-500">
                  HN: <InlineHNEdit patientId={report.patient_id} currentHN={patient?.hn} /> | วันที่ตรวจ: {report.test_date} | LAB: {report.lab_name || '-'}
                  {allPatientReports.length > 1 && <span className="ml-2 text-[#006B6E] font-medium">({allPatientReports.length} รายงานรวม)</span>}
                </p>
              </div>
              <span className={`text-xs px-3 py-1 rounded-full ${statusColor[report.status]}`}>
                {statusLabel[report.status]}
              </span>
            </div>
            {!monteAnalysis && renderBloodTests()}
          </div>

          {monteAnalysis && (
            <div ref={analysisRef}>
              <MonteAnalysisView analysis={monteAnalysis} patient={patient} report={report} allReports={allPatientReports} parsedValues={aggregatedParsed} doctor={report.monte_doctors} />
            </div>
          )}
        </div>

        <div className="space-y-4">
          {report.status === 'approved' && monteAnalysis && (
            <button onClick={handleExportPdf} disabled={exportingPdf}
              className="w-full flex items-center gap-2 p-4 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 text-sm font-medium disabled:opacity-50">
              {exportingPdf ? <Loader2 className="h-5 w-5 animate-spin" /> : <Download className="h-5 w-5" />}
              {exportingPdf ? 'กำลังสร้าง PDF...' : 'ดู PDF ที่ Approve แล้ว'}
            </button>
          )}

          {report.raw_pdf_url && (
            <a href={report.raw_pdf_url} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 p-4 bg-white rounded-lg shadow hover:bg-gray-50 text-sm text-[#006B6E]">
              <FileText className="h-5 w-5" /> ดู PDF ต้นฉบับ
            </a>
          )}

          {report.summary_pdf_url && (
            <a href={report.summary_pdf_url} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 p-4 bg-white rounded-lg shadow hover:bg-gray-50 text-sm text-green-600">
              <FileText className="h-5 w-5" /> ดู PDF สรุป
            </a>
          )}

          {role === 'doctor' && report.status === 'ready' && (
            <div className="bg-white rounded-lg shadow p-4 space-y-3">
              <h3 className="font-semibold text-gray-700">การอนุมัติ</h3>
              <button onClick={handleApprove}
                className="w-full flex items-center justify-center gap-2 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm">
                <CheckCircle className="h-4 w-4" /> อนุมัติ
              </button>
              {showReject ? (
                <div className="space-y-2">
                  <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)}
                    placeholder="เหตุผลที่ปฏิเสธ..." className="w-full px-3 py-2 border rounded-md text-sm" rows={3} />
                  <div className="flex gap-2">
                    <button onClick={() => setShowReject(false)} className="flex-1 py-2 text-sm text-gray-600">ยกเลิก</button>
                    <button onClick={handleReject} className="flex-1 py-2 bg-red-600 text-white rounded-md text-sm">ยืนยันปฏิเสธ</button>
                  </div>
                </div>
              ) : (
                <button onClick={() => setShowReject(true)}
                  className="w-full flex items-center justify-center gap-2 py-2 border border-red-300 text-red-600 rounded-md hover:bg-red-50 text-sm">
                  <XCircle className="h-4 w-4" /> ปฏิเสธ
                </button>
              )}
            </div>
          )}

          {report.status === 'rejected' && report.rejection_reason && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm font-medium text-red-700">เหตุผลที่ปฏิเสธ:</p>
              <p className="text-sm text-red-600 mt-1">{report.rejection_reason}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
