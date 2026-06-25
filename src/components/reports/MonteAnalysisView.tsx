import type { MonteAnalysis } from '@/lib/monte-analysis';

interface ParsedTest {
  value: number | string;
  unit?: string;
  flag?: 'low' | 'high' | null;
  ref_min?: number;
  ref_max?: number;
}

const S = {
  teal: '#2A8C8C',
  red: '#c0392b',
  orange: '#e67e22',
  yellow: '#d4a017',
  green: '#27866a',
  ok: '#27866a',
  low: '#c0392b',
  warn: '#d4a017',
} as const;

export function MonteAnalysisView({ analysis, patient, report, allReports, parsedValues, doctor }: {
  analysis: MonteAnalysis;
  patient?: { hn?: string; first_name?: string; last_name?: string; date_of_birth?: string | null; gender?: string | null };
  report?: { test_date?: string; lab_name?: string; status?: string; approved_at?: string };
  allReports?: { test_date?: string; lab_name?: string }[];
  parsedValues?: Record<string, Record<string, ParsedTest>>;
  doctor?: { full_name?: string; license_no?: string; signature_url?: string | null } | null;
}) {
  const allTests = parsedValues
    ? Object.values(parsedValues).reduce((acc, group) => ({ ...acc, ...group }), {} as Record<string, ParsedTest>)
    : {};

  const age = patient?.date_of_birth
    ? Math.floor((Date.now() - new Date(patient.date_of_birth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
    : null;
  const sex = patient?.gender === 'male' ? 'ชาย' : patient?.gender === 'female' ? 'หญิง' : patient?.gender || '-';

  const statusIcon = (flag?: string | null) => {
    if (!flag) return <span style={{ color: S.ok, fontWeight: 700 }}>✓</span>;
    if (flag === 'low') return <span style={{ color: S.low, fontWeight: 700 }}>⬇</span>;
    if (flag === 'high') return <span style={{ color: S.warn, fontWeight: 700 }}>⚡</span>;
    return <span style={{ color: S.ok }}>✓</span>;
  };

  const leftTests: [string, string, ParsedTest | undefined][] = [
    ['Hemoglobin (Hb)', 'hb', allTests.hb],
    ['Hematocrit (Hct)', 'hct', allTests.hct],
    ['RBC Count', 'rbc', allTests.rbc],
    ['WBC Count', 'wbc', allTests.wbc],
    ['MCV', 'mcv', allTests.mcv],
    ['MCH', 'mch', allTests.mch],
    ['MCHC', 'mchc', allTests.mchc],
    ['RDW', 'rdw', allTests.rdw],
    ['Platelet', 'plt', allTests.plt],
    ['Neutrophil', 'pmn_neutrophil', allTests.pmn_neutrophil],
    ['Lymphocyte', 'lymphocyte', allTests.lymphocyte],
  ];

  const rightTests: [string, string, ParsedTest | undefined][] = [
    ['Ferritin', 'ferritin', allTests.ferritin],
    ['Vitamin D 025-OH', 'vitamin_d', allTests.vitamin_d],
    ['TSH', 'tsh', allTests.tsh],
    ['Free Testosterone', 'testosterone', allTests.testosterone],
    ['DHEA-S', 'dheas', allTests.dheas],
    ['ANA (ANF/FANA)', 'ana', allTests.ana],
    ['RBC Morphology', 'rbc_morphology', allTests.rbc_morphology],
    ['Platelet (smear)', 'platelet_smear', allTests.platelet_smear],
    ['Monocyte', 'monocyte', allTests.monocyte],
    ['Eosinophil / Baso', 'eosinophil', allTests.eosinophil],
  ];

  const renderLabTable = (tests: [string, string, ParsedTest | undefined][]) => (
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '8pt' }}>
      <thead>
        <tr>
          {['รายการ', 'ค่า', 'หน่วย', 'ค่าอ้างอิง', 'สถานะ'].map(h => (
            <th key={h} style={{ background: '#e8f4f4', color: S.teal, fontWeight: 700, padding: '3px 5px', textAlign: 'left', borderBottom: `1.5px solid ${S.teal}`, fontSize: '7.5pt' }}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {tests.filter(([,, t]) => t).map(([label,, test], i) => {
          const t = test!;
          const ref = t.ref_min != null && t.ref_max != null ? `${t.ref_min}–${t.ref_max}` : t.ref_min != null ? `≥ ${t.ref_min}` : '-';
          return (
            <tr key={label} style={{ background: i % 2 === 1 ? '#fafcfc' : undefined }}>
              <td style={{ padding: '2.5px 5px', borderBottom: '0.5px solid #e0e0e0', fontWeight: 600, color: '#333' }}>{label}</td>
              <td style={{ padding: '2.5px 5px', borderBottom: '0.5px solid #e0e0e0', fontWeight: 700, color: '#1a1a1a' }}>{t.value}</td>
              <td style={{ padding: '2.5px 5px', borderBottom: '0.5px solid #e0e0e0', color: '#666' }}>{t.unit || '—'}</td>
              <td style={{ padding: '2.5px 5px', borderBottom: '0.5px solid #e0e0e0', color: '#666' }}>{ref}</td>
              <td style={{ padding: '2.5px 5px', borderBottom: '0.5px solid #e0e0e0', textAlign: 'center' }}>{statusIcon(t.flag)}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );

  return (
    <div style={{ fontFamily: "'Sarabun', 'Noto Sans Thai', 'Segoe UI', sans-serif", fontSize: '9.5pt', color: '#222', background: '#fff', padding: '24px', lineHeight: 1.45, maxWidth: '900px' }}>

      {/* ── HEADER ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8, borderBottom: `2.5px solid ${S.teal}`, paddingBottom: 6 }}>
        <div>
          <img src="/brand/monte-logo-primary.png" alt="Monte Hair Clinic" style={{ height: 48 }} crossOrigin="anonymous" />
        </div>
        <div style={{ textAlign: 'center', flex: 1, paddingTop: 4 }}>
          <div style={{ fontSize: '16pt', fontWeight: 700, color: S.teal }}>ใบสรุปผลการตรวจเลือด</div>
          <div style={{ fontSize: '7.5pt', color: '#888', marginTop: 1 }}>Blood Test Summary Report</div>
        </div>
        <div style={{ width: 40 }} />
      </div>

      {/* ── PATIENT INFO ── */}
      <div style={{ background: '#f5f5f5', borderRadius: 4, padding: '6px 10px', marginBottom: 8, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px 20px', fontSize: '8.5pt' }}>
        <div><span style={{ color: '#777' }}>ชื่อ-นามสกุล / NAME:</span> <span style={{ fontWeight: 600 }}>{patient?.first_name} {patient?.last_name}</span></div>
        <div><span style={{ color: '#777' }}>HN:</span> <span style={{ fontWeight: 600 }}>{patient?.hn || '-'}</span></div>
        <div><span style={{ color: '#777' }}>เพศ / SEX:</span> <span style={{ fontWeight: 600 }}>{sex}</span></div>
        <div><span style={{ color: '#777' }}>อายุ / AGE:</span> <span style={{ fontWeight: 600 }}>{age ? `${age} ปี` : '-'}</span></div>
        <div><span style={{ color: '#777' }}>วันที่ตรวจ/วันที่รายงาน:</span> <span style={{ fontWeight: 600 }}>{report?.test_date || '-'}</span></div>
        <div><span style={{ color: '#777' }}>ห้อง LAB:</span> <span style={{ fontWeight: 600 }}>{report?.lab_name || '-'}</span></div>
      </div>

      {/* ── OVERVIEW ── */}
      <div style={{ fontSize: '10.5pt', fontWeight: 700, color: S.teal, marginBottom: 5 }}>สรุปภาพรวม / Overview</div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
        {analysis.urgentActions.length > 0 || allTests.hb?.flag ? (
          <div style={{ flex: 1, borderRadius: 5, padding: '7px 10px', color: '#fff', background: `linear-gradient(135deg, #e85d5d, ${S.red})` }}>
            <div style={{ fontSize: '10pt', fontWeight: 700 }}>ภาวะโลหิตจาง</div>
            <div style={{ fontSize: '7.5pt', opacity: 0.92, marginTop: 1 }}>Hb, Hct, RBC ต่ำกว่าปกติ</div>
          </div>
        ) : null}
        {allTests.vitamin_d?.flag === 'low' ? (
          <div style={{ flex: 1, borderRadius: 5, padding: '7px 10px', color: '#fff', background: `linear-gradient(135deg, #f0c040, ${S.yellow})` }}>
            <div style={{ fontSize: '10pt', fontWeight: 700 }}>วิตามินดีต่ำมาก</div>
            <div style={{ fontSize: '7.5pt', opacity: 0.92, marginTop: 1 }}>Vitamin D {allTests.vitamin_d.value} (ควรมากกว่า30)</div>
          </div>
        ) : null}
        <div style={{ flex: 1, borderRadius: 5, padding: '7px 10px', color: '#fff', background: `linear-gradient(135deg, #48b084, ${S.green})` }}>
          <div style={{ fontSize: '10pt', fontWeight: 700 }}>ดัชนีสุขภาพเส้นผม</div>
          <div style={{ fontSize: '7.5pt', opacity: 0.92, marginTop: 1 }}>
            <span style={{ fontSize: '18pt', fontWeight: 900 }}>{analysis.hairHealthScore}</span>/100
            {allReports && allReports.length > 1 && <span> &nbsp;({allReports.length} รายงานรวม)</span>}
          </div>
        </div>
      </div>

      {/* ── TEST RESULTS ── */}
      <div style={{ background: S.teal, color: '#fff', padding: '5px 10px', borderRadius: 4, fontSize: '10pt', fontWeight: 700, marginBottom: 4 }}>ผลการตรวจ / Test Results</div>
      <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
        <div style={{ flex: 1 }}>{renderLabTable(leftTests)}</div>
        <div style={{ flex: 1 }}>{renderLabTable(rightTests)}</div>
      </div>

      {/* ── RECOMMENDATIONS ── */}
      <div style={{ marginTop: 8 }}>
        <div style={{ fontSize: '10.5pt', fontWeight: 700, color: S.teal, marginBottom: 5, fontStyle: 'italic' }}>คำแนะนำเบื้องต้น / Recommendations</div>

        {analysis.items.filter(i => i.recommendation).map((item, idx) => {
          const numColors = [S.red, S.orange, S.yellow, S.teal, S.green];
          const headingColors = [S.red, S.orange, '#b8860b', S.teal, S.green];
          const bg = numColors[idx] || S.teal;
          const hc = headingColors[idx] || S.teal;
          return (
            <div key={idx} style={{ display: 'flex', marginBottom: 6, borderRadius: 4, overflow: 'hidden', background: '#fafafa', border: '0.5px solid #e8e8e8' }}>
              <div style={{ width: 28, minWidth: 28, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: 7, color: '#fff', fontWeight: 900, fontSize: '12pt', background: bg }}>{idx + 1}</div>
              <div style={{ padding: '6px 10px', flex: 1, fontSize: '8pt', lineHeight: 1.5 }}>
                <div style={{ fontWeight: 700, color: hc, fontSize: '8.5pt', marginBottom: 2 }}>
                  {item.testName} ({item.testNameTh}) — ค่า {item.value} {item.unit}
                </div>
                <p style={{ marginTop: 2, color: '#444' }}>{item.interpretation}</p>
                {item.recommendation && <p style={{ marginTop: 2, color: '#444' }}>💊 {item.recommendation}</p>}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── DISCLAIMER ── */}
      <div style={{ marginTop: 6, fontSize: '7pt', color: '#888', borderLeft: `3px solid ${S.teal}`, paddingLeft: 8 }}>
        ผลตรวจเลือดนี้เป็นเพียงข้อมูลเบื้องต้นเพื่อประกอบการพิจารณา ไม่ถือว่าเป็นการ วินิจฉัย หรือ สั่งยา หากมีข้อสงสัย กรุณาปรึกษาแพทย์ผู้เชี่ยวชาญ
      </div>

      {/* ── DOCTOR SIGNATURE ── */}
      <div style={{ marginTop: 16, textAlign: 'right', fontSize: '8pt', color: '#555' }}>
        {report?.status === 'approved' && doctor?.full_name ? (
          <div>
            <div style={{ marginBottom: 4, fontSize: '9pt', color: S.teal, fontWeight: 600 }}>อนุมัติโดย</div>
            {doctor.signature_url && (
              <img src={doctor.signature_url} alt="ลายเซ็นแพทย์" style={{ height: 48, objectFit: 'contain', marginBottom: 4 }} />
            )}
            <div style={{ fontWeight: 700, fontSize: '10pt', color: '#222' }}>{doctor.full_name}</div>
            {doctor.license_no && <div style={{ fontSize: '7.5pt', color: '#777' }}>ใบอนุญาตเลขที่ {doctor.license_no}</div>}
            <div style={{ fontSize: '7pt', color: '#999', marginTop: 2 }}>วันที่อนุมัติ: {report.approved_at ? new Date(report.approved_at).toLocaleDateString('th-TH') : '-'}</div>
          </div>
        ) : (
          <div>
            <div style={{ color: '#aaa', marginBottom: 8 }}>ผ./ทพ. _________________________</div>
            <div style={{ fontSize: '7pt', color: '#bbb' }}>รอลายเซ็นแพทย์</div>
          </div>
        )}
      </div>

      {/* ── FOOTER P1 ── */}
      <div style={{ marginTop: 10, paddingTop: 6, borderTop: '1px solid #ccc', display: 'flex', justifyContent: 'space-between', fontSize: '7pt', color: '#999' }}>
        <div><strong>Monte Hair Clinic</strong> &nbsp; โทร. 02-XXX-XXXX &nbsp; LINE: @monteclinic</div>
        <div style={{ textAlign: 'right', fontSize: '6.5pt', maxWidth: '50%' }}>ผลการตรวจเลือดนี้เป็นเพียงข้อมูลเบื้องต้นสำหรับการพิจารณาร่วมกับแพทย์</div>
      </div>
      <div style={{ marginTop: 12, textAlign: 'right', fontSize: '8pt', color: '#555' }}>ก.1/ก.2</div>

      {/* ═══════════ PAGE 2: TREND & HISTORY ═══════════ */}
      <div style={{ marginTop: 32, paddingTop: 24, borderTop: '2px dashed #ddd' }}>
        {/* HEADER P2 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8, borderBottom: `2.5px solid ${S.teal}`, paddingBottom: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <img src="/brand/monte-logo-primary.png" alt="Monte" style={{ height: 40 }} crossOrigin="anonymous" />
            <div>
              <div style={{ fontSize: '22pt', fontWeight: 900, color: '#1a1a1a', letterSpacing: 3, lineHeight: 1 }}>MONTE</div>
              <div style={{ fontSize: '7.5pt', color: '#888', letterSpacing: 2, marginTop: 1 }}>HAIR CLINIC</div>
            </div>
          </div>
          <div style={{ textAlign: 'center', flex: 1, paddingTop: 4 }}>
            <div style={{ fontSize: '16pt', fontWeight: 700, color: S.teal }}>รายละเอียดผลตรวจย้อนหลัง</div>
            <div style={{ fontSize: '7.5pt', color: '#888', marginTop: 1 }}>Detailed Trend &amp; History</div>
          </div>
          <div style={{ width: 40 }} />
        </div>

        {/* Patient ID bar */}
        <div style={{ background: '#f5f5f5', borderRadius: 4, padding: '5px 10px', marginBottom: 10, fontSize: '8.5pt' }}>
          <span style={{ color: '#777' }}>HN</span> <span style={{ fontWeight: 600 }}>{patient?.hn || '-'}</span>
        </div>

        {/* CBC Section */}
        {renderCategorySection('CBC — ความสมบูรณ์เม็ดเลือด', [
          ['Hemoglobin (Hb)', allTests.hb],
          ['Hematocrit (Hct)', allTests.hct],
          ['RBC Count', allTests.rbc],
          ['MCV', allTests.mcv],
          ['Platelet Count', allTests.plt],
        ], report?.test_date)}

        {/* Vitamin Section */}
        {renderCategorySection('วิตามินและแร่ธาตุ', [
          ['Ferritin', allTests.ferritin],
          ['Vitamin D (25-OH)', allTests.vitamin_d],
        ], report?.test_date)}

        {/* Hormone Section */}
        {renderCategorySection('ฮอร์โมน', [
          ['TSH', allTests.tsh],
          ['Free Testosterone', allTests.testosterone],
          ['DHEA-S', allTests.dheas],
        ], report?.test_date)}

        {/* Overall Trend Summary */}
        <div style={{ fontSize: '10.5pt', fontWeight: 700, color: S.teal, marginBottom: 5 }}>บทสรุปแนวโน้มโดยรวม / Overall Trend Summary</div>
        <div style={{ fontSize: '8.5pt', lineHeight: 1.65, color: '#333', padding: '6px 0' }}>
          <p style={{ marginBottom: 6 }}>{analysis.summary}</p>
          {analysis.urgentActions.map((a, i) => <p key={i} style={{ marginBottom: 6 }}>• {a}</p>)}
        </div>

        {/* Disclaimer P2 */}
        <div style={{ marginTop: 8, fontSize: '7pt', color: '#888', borderLeft: `3px solid ${S.teal}`, paddingLeft: 8 }}>
          ผลตรวจเลือดนี้เป็นเพียงข้อมูลเบื้องต้นเพื่อประกอบการพิจารณา ไม่ถือว่าเป็นการ วินิจฉัย หรือ สั่งยา หากมีข้อสงสัย กรุณาปรึกษาแพทย์ผู้เชี่ยวชาญ
        </div>

        <div style={{ marginTop: 10, paddingTop: 6, borderTop: '1px solid #ccc', display: 'flex', justifyContent: 'space-between', fontSize: '7pt', color: '#999' }}>
          <div><strong>Monte Hair Clinic</strong> &nbsp; โทร. 02-XXX-XXXX &nbsp; LINE: @monteclinic</div>
          <div style={{ textAlign: 'right', fontSize: '6.5pt', maxWidth: '50%' }}>ผลการตรวจเลือดนี้เป็นเพียงข้อมูลเบื้องต้นสำหรับการพิจารณาร่วมกับแพทย์</div>
        </div>
        <div style={{ marginTop: 12, textAlign: 'right', fontSize: '8pt', color: '#555' }}>ก.2/ก.2</div>
      </div>
    </div>
  );
}

function renderCategorySection(title: string, tests: [string, ParsedTest | undefined][], testDate?: string) {
  const filtered = tests.filter(([, t]) => t) as [string, ParsedTest][];
  if (filtered.length === 0) return null;

  const TH = { background: '#2A8C8C' };
  const thStyle = { padding: '3px 5px', textAlign: 'left' as const, fontSize: '7.5pt', color: '#fff', fontWeight: 700 };

  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontSize: '10.5pt', fontWeight: 700, color: '#2A8C8C', marginBottom: 5 }}>{title}</div>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '8pt' }}>
        <thead>
          <tr>
            <th style={{ ...thStyle, background: '#e8f4f4', color: '#2A8C8C', borderBottom: '1.5px solid #2A8C8C' }}>รายการตรวจ</th>
            <th style={{ ...thStyle, ...TH }}>{testDate || 'ล่าสุด'}</th>
            <th style={{ ...thStyle, background: '#e8f4f4', color: '#2A8C8C', borderBottom: '1.5px solid #2A8C8C' }}>หน่วย</th>
            <th style={{ ...thStyle, background: '#e8f4f4', color: '#2A8C8C', borderBottom: '1.5px solid #2A8C8C' }}>ค่าอ้างอิง</th>
            <th style={{ ...thStyle, background: '#e8f4f4', color: '#2A8C8C', borderBottom: '1.5px solid #2A8C8C' }}>แนวโน้ม / สถานะ</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map(([name, test], i) => {
            const ref = test.ref_min != null && test.ref_max != null ? `${test.ref_min}–${test.ref_max}` : test.ref_min != null ? `≥ ${test.ref_min}` : '-';
            const sc = !test.flag ? '#27866a' : test.flag === 'high' ? '#d4a017' : '#c0392b';
            const statusText = !test.flag ? '→ ปกติ' : test.flag === 'low' ? '⬇ ต่ำกว่าเกณฑ์' : '⬆ สูงกว่าเกณฑ์';
            return (
              <tr key={name} style={{ background: i % 2 === 1 ? '#fafcfc' : undefined }}>
                <td style={{ padding: '2.5px 5px', borderBottom: '0.5px solid #e0e0e0', fontWeight: 600, color: '#333' }}>{name}</td>
                <td style={{ padding: '2.5px 5px', borderBottom: '0.5px solid #e0e0e0', fontWeight: 700, color: '#1a1a1a' }}>{test.value}</td>
                <td style={{ padding: '2.5px 5px', borderBottom: '0.5px solid #e0e0e0', color: '#666' }}>{test.unit || '—'}</td>
                <td style={{ padding: '2.5px 5px', borderBottom: '0.5px solid #e0e0e0', color: '#666' }}>{ref}</td>
                <td style={{ padding: '2.5px 5px', borderBottom: '0.5px solid #e0e0e0', fontWeight: 700, color: sc }}>{statusText}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
