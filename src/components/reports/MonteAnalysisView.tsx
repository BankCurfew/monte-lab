import type { MonteAnalysis } from '@/lib/monte-analysis';

export function MonteAnalysisView({ analysis, patient, report, allReports }: {
  analysis: MonteAnalysis;
  patient?: { hn?: string; first_name?: string; last_name?: string; age?: number; gender?: string };
  report?: { test_date?: string; lab_name?: string; raw_pdf_url?: string };
  allReports?: { test_date?: string; lab_name?: string }[];
}) {
  const flaggedItems = analysis.items.filter(i => i.status !== 'normal' && i.status !== 'negative');
  const normalItems = analysis.items.filter(i => i.status === 'normal' || i.status === 'negative');

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden" style={{ fontFamily: "'Sarabun', 'Noto Sans Thai', sans-serif" }}>
      {/* Monte Header */}
      <div className="px-6 pt-6 pb-4 border-b border-gray-100">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight" style={{ color: '#00868A' }}>MONTE</h1>
            <p className="text-[11px] text-gray-400 mt-0.5">Monte Hair Clinic</p>
          </div>
          <div className="text-right text-sm text-gray-600">
            {patient && (
              <>
                <p>ชื่อ-สกุล / Name: <span className="font-semibold">{patient.first_name} {patient.last_name}</span></p>
                <p>HN: <span className="font-semibold">{patient.hn || '-'}</span>
                  {patient.age && <> &nbsp;อายุ / AGE: <span className="font-semibold">{patient.age} ปี</span></>}
                  {patient.gender && <> &nbsp;เพศ: <span className="font-semibold">{patient.gender === 'male' ? 'ชาย' : 'หญิง'}</span></>}
                </p>
                {report?.test_date && <p>วันที่ตรวจ/Collected: <span className="font-semibold">{report.test_date}</span></p>}
                {report?.lab_name && <p>แล็บ LAB: <span className="font-semibold">{report.lab_name}</span></p>}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Section: Overview */}
      <div className="px-6 py-4">
        <h2 className="text-base font-bold mb-3" style={{ color: '#1A2B3C' }}>
          ในสรุปผลการตรวจเลือด
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          {/* Findings */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">สรุปภาพรวม / Overview</h3>
            <p className="text-sm text-gray-600 leading-relaxed">{analysis.summary}</p>
            {flaggedItems.length > 0 && (
              <p className="text-sm text-amber-700 mt-2">
                พบค่าผิดปกติ {flaggedItems.length} รายการ จากทั้งหมด {analysis.items.length} รายการ
              </p>
            )}
          </div>

          {/* Hair Health Score */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">สุขภาพเส้นผมที่เกี่ยวข้อง</h3>
            <div className="flex items-center gap-3">
              <div className={`text-3xl font-bold ${analysis.hairHealthScore >= 80 ? 'text-emerald-600' : analysis.hairHealthScore >= 50 ? 'text-amber-600' : 'text-red-600'}`}>
                {analysis.hairHealthScore}
              </div>
              <div className="text-sm text-gray-500">
                <p>Hair Health Score</p>
                <p className="text-xs">{analysis.hairHealthScore >= 80 ? 'ปกติ' : analysis.hairHealthScore >= 50 ? 'ควรเฝ้าระวัง' : 'ต้องรักษา'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section: Test Results Table */}
      <div className="px-6 py-4">
        <h2 className="text-base font-bold mb-3" style={{ color: '#1A2B3C' }}>
          ผลการตรวจ / Test Results
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: '#00868A' }}>
                <th className="px-3 py-2.5 text-left text-xs font-semibold text-white">รายการ</th>
                <th className="px-3 py-2.5 text-left text-xs font-semibold text-white">ชื่อไทย</th>
                <th className="px-3 py-2.5 text-right text-xs font-semibold text-white">ค่า</th>
                <th className="px-3 py-2.5 text-center text-xs font-semibold text-white">สถานะ</th>
                <th className="px-3 py-2.5 text-left text-xs font-semibold text-white">หน่วย</th>
                <th className="px-3 py-2.5 text-left text-xs font-semibold text-white">ค่าอ้างอิง</th>
                <th className="px-3 py-2.5 text-left text-xs font-semibold text-white">หมายเหตุ</th>
              </tr>
            </thead>
            <tbody>
              {analysis.items.map((item, i) => {
                const rowBg = item.status === 'high' || item.status === 'positive' ? 'bg-red-50'
                  : item.status === 'low' ? 'bg-amber-50'
                  : i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50';
                const statusIcon = item.status === 'normal' || item.status === 'negative' ? '✓'
                  : item.status === 'high' || item.status === 'positive' ? '⬆ สูง'
                  : '⬇ ต่ำ';
                const statusColor = item.status === 'normal' || item.status === 'negative' ? 'text-emerald-600'
                  : item.status === 'high' || item.status === 'positive' ? 'text-red-600'
                  : 'text-amber-600';

                return (
                  <tr key={i} className={`border-t border-gray-100 ${rowBg}`}>
                    <td className="px-3 py-2 font-medium text-gray-800">{item.testName}</td>
                    <td className="px-3 py-2 text-gray-500">{item.testNameTh}</td>
                    <td className="px-3 py-2 text-right font-mono font-semibold">{item.value}</td>
                    <td className={`px-3 py-2 text-center font-semibold ${statusColor}`}>{statusIcon}</td>
                    <td className="px-3 py-2 text-gray-500">{item.unit}</td>
                    <td className="px-3 py-2 text-gray-400 text-xs">-</td>
                    <td className="px-3 py-2 text-gray-400 text-xs max-w-[200px] truncate" title={item.hairRelevance}>{item.hairRelevance || '-'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Section: Recommendations */}
      {(analysis.urgentActions.length > 0 || analysis.items.some(i => i.recommendation)) && (
        <div className="px-6 py-4 border-t border-gray-100">
          <h2 className="text-base font-bold mb-3" style={{ color: '#1A2B3C' }}>
            คำแนะนำเบื้องต้น / Recommendations
          </h2>

          {analysis.urgentActions.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <ol className="list-decimal list-inside space-y-2">
                {analysis.urgentActions.map((action, i) => (
                  <li key={i} className="text-sm text-red-700 leading-relaxed">{action}</li>
                ))}
              </ol>
            </div>
          )}

          <ol className="list-decimal list-inside space-y-3">
            {analysis.items.filter(i => i.recommendation).map((item, i) => (
              <li key={i} className="text-sm text-gray-700 leading-relaxed">
                <span className="font-semibold">{item.testName} ({item.testNameTh})</span>
                {item.value && <span className="text-gray-500"> — ค่า {item.value} {item.unit}</span>}
                <br />
                <span className="text-gray-600 ml-4">{item.interpretation}</span>
                <br />
                <span className="text-[#006B6E] ml-4">💊 {item.recommendation}</span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Section: Overall Summary */}
      <div className="px-6 py-4 border-t border-gray-100">
        <h2 className="text-base font-bold mb-3" style={{ color: '#1A2B3C' }}>
          แนวโน้มและวิเคราะห์ / Overall Trend Summary
        </h2>
        <p className="text-sm text-gray-600 leading-relaxed">{analysis.summary}</p>
        {allReports && allReports.length > 1 && (
          <p className="text-sm text-[#006B6E] mt-2">
            รวมข้อมูลจาก {allReports.length} รายงาน ({allReports.map(r => r.test_date).filter(Boolean).join(', ')})
          </p>
        )}
      </div>

      {/* Footer */}
      <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 text-[10px] text-gray-400">
        <p>Monte Hair Clinic · email: care@monteclinic.com · Tel: 02-XXX-XXXX · LINE: @monteclinic</p>
        <p className="mt-0.5">ผลวิเคราะห์นี้เป็นเพียงข้อมูลเบื้องต้น กรุณาปรึกษาแพทย์ก่อนตัดสินใจรักษา</p>
      </div>
    </div>
  );
}
