import type { MonteAnalysis } from '@/lib/monte-analysis';

// Hair-optimal reference ranges (Monte clinic SOP)
const HAIR_REF: Record<string, { min?: number; max?: number; label: string }> = {
  ferritin: { min: 70, label: '> 70' },
  hemoglobin: { min: 12, label: '> 12' },
  hematocrit: { min: 36, label: '> 36' },
  rbc: { min: 4, label: '> 4.0' },
  vitamin_d: { min: 40, max: 70, label: '40-70' },
  tsh: { min: 0.4, max: 4.0, label: '0.4-4.0' },
  dheas: { max: 340, label: '< 340' },
  free_testosterone: { max: 37.10, label: '< 37.10' },
};

function hairStatus(key: string, value: number): 'good' | 'watch' | 'bad' | null {
  const ref = HAIR_REF[key];
  if (!ref || typeof value !== 'number') return null;
  if (ref.min && value < ref.min) return 'bad';
  if (ref.max && value > ref.max) return 'bad';
  return 'good';
}

const HAIR_STATUS_STYLE = {
  good: { text: 'ปกติ', color: 'text-emerald-600' },
  watch: { text: 'เฝ้าระวัง', color: 'text-amber-600' },
  bad: { text: '⚠️ ดูแลเรื่องสุขภาพเส้นผม', color: 'text-red-600' },
};

interface ParsedTest {
  value: number | string;
  unit?: string;
  flag?: 'low' | 'high' | null;
  ref_min?: number;
  ref_max?: number;
}

export function MonteAnalysisView({ analysis, patient, report, allReports, parsedValues }: {
  analysis: MonteAnalysis;
  patient?: { hn?: string; first_name?: string; last_name?: string; age?: number; gender?: string };
  report?: { test_date?: string; lab_name?: string };
  allReports?: { test_date?: string; lab_name?: string }[];
  parsedValues?: Record<string, Record<string, ParsedTest>>;
}) {
  const allTests = parsedValues
    ? Object.values(parsedValues).reduce((acc, group) => ({ ...acc, ...group }), {} as Record<string, ParsedTest>)
    : {};
  const testEntries = Object.entries(allTests);
  const flaggedItems = analysis.items.filter(i => i.status !== 'normal' && i.status !== 'negative');

  // Category grouping for page 2
  const cbcKeys = ['hemoglobin', 'hematocrit', 'rbc', 'wbc', 'mcv', 'mch', 'mchc', 'rdw', 'platelet', 'pmn_neutrophil', 'lymphocyte', 'monocyte', 'eosinophil', 'basophil', 'rbc_morphology', 'platelet_smear'];
  const vitaminKeys = ['ferritin', 'vitamin_d'];
  const hormoneKeys = ['tsh', 'free_testosterone', 'dheas', 'ana'];

  const categorize = (keys: string[]) =>
    testEntries.filter(([k]) => keys.some(ck => k.toLowerCase().replace(/[\s-_]/g, '').includes(ck.replace(/[\s-_]/g, ''))));

  const cbcTests = categorize(cbcKeys);
  const vitaminTests = categorize(vitaminKeys);
  const hormoneTests = categorize(hormoneKeys);

  const TH = { background: '#00868A' };

  const renderTestRow = ([name, test]: [string, ParsedTest], i: number) => {
    const val = test.value;
    const numVal = typeof val === 'number' ? val : parseFloat(String(val));
    const flag = test.flag;
    const rowBg = flag === 'high' ? 'bg-red-50' : flag === 'low' ? 'bg-amber-50' : i % 2 === 0 ? 'bg-white' : 'bg-gray-50/30';
    const statusText = !flag ? 'normal' : flag === 'high' ? 'สูง' : 'ต่ำ';
    const statusColor = !flag ? 'text-emerald-600' : flag === 'high' ? 'text-red-600' : 'text-amber-600';
    const refRange = test.ref_min != null && test.ref_max != null ? `${test.ref_min}-${test.ref_max}` : '-';
    const nameKey = name.toLowerCase().replace(/[\s-_()]/g, '');
    const hs = !isNaN(numVal) ? hairStatus(nameKey, numVal) : null;
    const hairRef = Object.entries(HAIR_REF).find(([k]) => nameKey.includes(k));

    return (
      <tr key={name} className={`border-t border-gray-100 ${rowBg}`}>
        <td className="px-3 py-1.5 text-[13px] font-medium text-gray-800">{name}</td>
        <td className="px-3 py-1.5 text-[13px] text-right font-mono font-semibold">{val}</td>
        <td className="px-3 py-1.5 text-[12px] text-gray-400">{refRange}</td>
        <td className="px-3 py-1.5 text-[12px] text-gray-500">{test.unit || '-'}</td>
        <td className={`px-3 py-1.5 text-[12px] text-center font-semibold ${statusColor}`}>{statusText}</td>
        <td className="px-3 py-1.5 text-[12px] text-gray-400">{hairRef ? hairRef[1].label : '-'}</td>
        <td className="px-3 py-1.5 text-[12px] text-gray-400">{refRange}</td>
        <td className={`px-3 py-1.5 text-[12px] text-center ${hs ? HAIR_STATUS_STYLE[hs].color : 'text-gray-400'}`}>
          {hs ? HAIR_STATUS_STYLE[hs].text : '-'}
        </td>
      </tr>
    );
  };

  const renderCategoryTable = (title: string, tests: [string, ParsedTest][]) => {
    if (tests.length === 0) return null;
    return (
      <div className="mb-6">
        <h3 className="text-sm font-bold text-gray-700 mb-2">{title}</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={TH}>
                <th className="px-3 py-2 text-left text-xs font-semibold text-white">รายการ</th>
                <th className="px-3 py-2 text-right text-xs font-semibold text-white">ค่าปกติ ผญ.</th>
                <th className="px-3 py-2 text-right text-xs font-semibold text-white">ค่าปกติ ผช.</th>
                <th className="px-3 py-2 text-right text-xs font-semibold text-white">ค่า ผล</th>
                <th className="px-3 py-2 text-center text-xs font-semibold text-white">สถานะ</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-white">หน่วย</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-white">คำแนะนำ</th>
              </tr>
            </thead>
            <tbody>
              {tests.map(([name, test], i) => {
                const flag = test.flag;
                const rowBg = flag === 'high' ? 'bg-red-50' : flag === 'low' ? 'bg-amber-50' : i % 2 === 0 ? 'bg-white' : 'bg-gray-50/30';
                const statusText = !flag ? 'normal' : flag;
                const statusColor = !flag ? 'text-emerald-600' : flag === 'high' ? 'text-red-600' : 'text-amber-600';
                const refRange = test.ref_min != null && test.ref_max != null ? `${test.ref_min}-${test.ref_max}` : '-';
                const nameKey = name.toLowerCase().replace(/[\s-_()]/g, '');
                const hs = typeof test.value === 'number' ? hairStatus(nameKey, test.value) : null;
                return (
                  <tr key={name} className={`border-t border-gray-100 ${rowBg}`}>
                    <td className="px-3 py-1.5 text-[13px] text-gray-800">{name}</td>
                    <td className="px-3 py-1.5 text-[12px] text-right text-gray-400">{refRange}</td>
                    <td className="px-3 py-1.5 text-[12px] text-right text-gray-400">{refRange}</td>
                    <td className="px-3 py-1.5 text-[13px] text-right font-mono font-semibold">{test.value}</td>
                    <td className={`px-3 py-1.5 text-[12px] text-center font-semibold ${statusColor}`}>{statusText}</td>
                    <td className="px-3 py-1.5 text-[12px] text-gray-500">{test.unit || '-'}</td>
                    <td className="px-3 py-1.5 text-[11px] text-gray-400 max-w-[180px]">
                      {hs === 'bad' ? <span className="text-red-500">⚠️ ดูแลเรื่องสุขภาพเส้นผม</span> : '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const scoreColor = analysis.hairHealthScore >= 80 ? 'text-emerald-600' : analysis.hairHealthScore >= 50 ? 'text-amber-600' : 'text-red-600';
  const scoreDot = analysis.hairHealthScore >= 80 ? 'bg-emerald-500' : analysis.hairHealthScore >= 50 ? 'bg-amber-500' : 'bg-red-500';

  return (
    <div className="space-y-0" style={{ fontFamily: "'Sarabun', 'Noto Sans Thai', sans-serif" }}>

      {/* ===== PAGE 1 ===== */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {/* Monte Header */}
        <div className="px-6 pt-5 pb-3">
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: '#00868A' }}>MONTE</h1>
          <p className="text-[11px] text-gray-400">Monte Hair Clinic</p>
        </div>

        {/* Title */}
        <div className="px-6 pb-2">
          <h2 className="text-base font-bold text-gray-800">ในสรุปผลการตรวจเลือด</h2>
        </div>

        {/* Patient Info — horizontal row with pipes */}
        {patient && (
          <div className="px-6 pb-3 text-sm text-gray-600">
            <p>
              ชื่อ-สกุล / HNAME: <span className="font-semibold">{patient.first_name} {patient.last_name}</span>
              {' | '}HN: <span className="font-semibold">{patient.hn || '-'}</span>
              {patient.age && <>{' | '}อายุ AGE: <span className="font-semibold">{patient.age} ปี</span></>}
              {patient.gender && <>{' | '}เพศ: <span className="font-semibold">{patient.gender === 'male' ? 'ชาย' : 'หญิง'}</span></>}
            </p>
            <p>
              {report?.test_date && <>วันที่ตรวจ/Collected: <span className="font-semibold">{report.test_date}</span></>}
              {report?.lab_name && <>{' | '}แล็บ LAB: <span className="font-semibold">{report.lab_name}</span></>}
            </p>
          </div>
        )}

        {/* Overview Section */}
        <div className="px-6 py-3">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm font-bold" style={{ color: '#00868A' }}>สรุปภาพรวม / Overview</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
            {/* Left: รายละเอียดเลือด */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">รายละเอียดเลือด</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{analysis.summary}</p>
              {flaggedItems.length > 0 && (
                <ul className="mt-2 space-y-1">
                  {flaggedItems.slice(0, 4).map((item, i) => (
                    <li key={i} className="text-sm text-amber-700">• {item.testName}: {item.value} {item.unit}</li>
                  ))}
                </ul>
              )}
            </div>

            {/* Right: ดัชนีสุขภาพเส้นผม */}
            <div className="bg-gray-50 rounded-lg p-4 flex items-center gap-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-1">ดัชนีสุขภาพเส้นผม</h3>
                <p className="text-xs text-gray-400">ดัชนีสุขภาพ / Hair</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`w-3 h-3 rounded-full ${scoreDot}`} />
                  <span className="text-xs text-gray-500">
                    {analysis.hairHealthScore >= 80 ? 'ปกติ' : analysis.hairHealthScore >= 50 ? 'เฝ้าระวัง' : 'ต้องดูแล'}
                  </span>
                </div>
              </div>
              <div className={`text-4xl font-bold ${scoreColor} ml-auto`}>
                {analysis.hairHealthScore}
              </div>
            </div>
          </div>
        </div>

        {/* Test Results Table — ALL tests from parsed_values */}
        <div className="px-6 py-3">
          <h3 className="text-sm font-bold mb-2" style={{ color: '#00868A' }}>ผลการตรวจ / Test Results</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={TH}>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-white">รายการ</th>
                  <th className="px-3 py-2 text-right text-xs font-semibold text-white">ค่า</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-white">ค่าปกติ</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-white">หน่วย</th>
                  <th className="px-3 py-2 text-center text-xs font-semibold text-white">สถานะ</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-white">ค่าที่ดีสำหรับผม</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-white">ค่าอ้างอิง</th>
                  <th className="px-3 py-2 text-center text-xs font-semibold text-white">สถานะ</th>
                </tr>
              </thead>
              <tbody>
                {testEntries.length > 0
                  ? testEntries.map((entry, i) => renderTestRow(entry, i))
                  : analysis.items.map((item, i) => (
                    <tr key={i} className={`border-t border-gray-100 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
                      <td className="px-3 py-1.5 text-[13px] font-medium text-gray-800">{item.testName}</td>
                      <td className="px-3 py-1.5 text-[13px] text-right font-mono font-semibold">{item.value}</td>
                      <td className="px-3 py-1.5 text-[12px] text-gray-400">-</td>
                      <td className="px-3 py-1.5 text-[12px] text-gray-500">{item.unit}</td>
                      <td className={`px-3 py-1.5 text-[12px] text-center font-semibold ${item.status === 'normal' || item.status === 'negative' ? 'text-emerald-600' : 'text-red-600'}`}>
                        {item.status === 'normal' || item.status === 'negative' ? 'normal' : item.status}
                      </td>
                      <td className="px-3 py-1.5 text-[12px] text-gray-400">-</td>
                      <td className="px-3 py-1.5 text-[12px] text-gray-400">-</td>
                      <td className="px-3 py-1.5 text-[12px] text-gray-400">-</td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
        </div>

        {/* Recommendations — numbered paragraphs */}
        {(analysis.urgentActions.length > 0 || analysis.items.some(i => i.recommendation)) && (
          <div className="px-6 py-4 border-t border-gray-100">
            <h3 className="text-sm font-bold mb-3" style={{ color: '#00868A' }}>คำแนะนำเบื้องต้น / Recommendations</h3>
            <div className="space-y-4">
              {analysis.items.filter(i => i.recommendation).map((item, i) => (
                <div key={i} className="text-sm">
                  <p className="font-bold text-gray-800">
                    {i + 1}{' '}{item.testNameTh} ({item.value} {item.unit} — ค่าปกติ {
                      item.status === 'low' ? '> ค่าที่ควร' : item.status === 'high' ? '< ค่าที่ควร' : 'ปกติ'
                    })
                  </p>
                  <p className="text-gray-600 leading-relaxed mt-1 ml-4">{item.interpretation}</p>
                  {item.recommendation && <p className="text-[#006B6E] mt-1 ml-4">💊 {item.recommendation}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer — Page 1 */}
        <div className="px-6 py-2 bg-gray-50 border-t border-gray-100 flex justify-between text-[10px] text-gray-400">
          <div>
            <p>Monte Hair Clinic · email: care@monteclinic.com · Tel: 02-XXX-XXXX · LINE: @monteclinic</p>
            <p>ผลการวิเคราะห์นี้เป็นเพียงข้อเสนอแนะเบื้องต้น กรุณาปรึกษาแพทย์ก่อนตัดสินใจ</p>
          </div>
          <span>ก.1/ก.2</span>
        </div>
      </div>

      {/* ===== PAGE 2 ===== */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden mt-6">
        {/* Header */}
        <div className="px-6 pt-5 pb-2 flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold tracking-tight" style={{ color: '#00868A' }}>MONTE</h1>
            <p className="text-[11px] text-gray-400">Diagnostic Panel & History, Monte Hair Clinic</p>
          </div>
        </div>

        <div className="px-6 py-3">
          <h2 className="text-base font-bold text-gray-800 mb-1">รายละเอียดผลตรวจย้อนหลัง</h2>
          {allReports && allReports.length > 1 && (
            <p className="text-xs text-gray-400 mb-4">
              ประวัติตรวจ {allReports.length} ครั้ง ({allReports.map(r => r.test_date).filter(Boolean).join(', ')})
            </p>
          )}

          {/* CBC */}
          {renderCategoryTable('CBC — ตรวจความสมบูรณ์ของเม็ดเลือด', cbcTests)}

          {/* Vitamins */}
          {renderCategoryTable('วิตามินและสารอาหาร', vitaminTests)}

          {/* Hormones */}
          {renderCategoryTable('ฮอร์โมน', hormoneTests)}
        </div>

        {/* Overall Trend Summary */}
        <div className="px-6 py-4 border-t border-gray-100">
          <h3 className="text-sm font-bold mb-2" style={{ color: '#00868A' }}>แนวโน้มและข้อเสนอแนะ / Overall Trend Summary</h3>
          <p className="text-sm text-gray-600 leading-relaxed">{analysis.summary}</p>
        </div>

        {/* Footer — Page 2 */}
        <div className="px-6 py-2 bg-gray-50 border-t border-gray-100 flex justify-between text-[10px] text-gray-400">
          <div>
            <p>Monte Hair Clinic · email: care@monteclinic.com · Tel: 02-XXX-XXXX · LINE: @monteclinic</p>
            <p>ผลการวิเคราะห์นี้เป็นเพียงข้อเสนอแนะเบื้องต้น กรุณาปรึกษาแพทย์ก่อนตัดสินใจ</p>
          </div>
          <span>ก.2/ก.2</span>
        </div>
      </div>
    </div>
  );
}
