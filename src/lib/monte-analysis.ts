// Monte Hair Clinic — Clinical analysis format
// Based on real clinic recommendation examples

export interface MonteAnalysisItem {
  testName: string;
  testNameTh: string;
  value: number | string;
  unit: string;
  status: 'normal' | 'low' | 'high' | 'positive' | 'negative';
  interpretation: string;
  recommendation: string;
  hairRelevance: string;
}

export interface MonteAnalysis {
  items: MonteAnalysisItem[];
  summary: string;
  hairHealthScore: number;
  urgentActions: string[];
}

// Clinical interpretation rules based on Monte Hair Clinic SOP
export function generateMonteAnalysis(parsedValues: Record<string, Record<string, any>>): MonteAnalysis {
  const items: MonteAnalysisItem[] = [];
  const urgentActions: string[] = [];
  let hairScore = 100;

  const allTests = Object.values(parsedValues).reduce((acc, group) => ({ ...acc, ...group }), {});

  // 1. Ferritin
  if (allTests.ferritin) {
    const val = allTests.ferritin.value;
    const flag = allTests.ferritin.flag;
    if (flag === 'low' || val < 70) {
      hairScore -= 20;
      items.push({
        testName: 'Ferritin',
        testNameTh: 'ค่าธาตุเหล็กสะสม',
        value: val, unit: allTests.ferritin.unit,
        status: 'low',
        interpretation: `ผลตรวจค่าได้ ${val}${allTests.ferritin.unit} ถือว่าค่อนข้างต่ำ ระดับธาตุเหล็กควรมากกว่า 70ng/mL ถึงจะเพียงพอต่อการทำงานของระบบเซลล์ร่างกายและรากผม`,
        recommendation: 'แนะนำให้ทานธาตุเหล็กเสริม และตรวจติดตามค่าเป็นระยะ',
        hairRelevance: 'ธาตุเหล็กสะสมต่ำทำให้รากผมอ่อนแอ ผมร่วงง่าย งอกช้า',
      });
      urgentActions.push('ทานธาตุเหล็กเสริม — ค่า Ferritin ควร > 70ng/mL');
    } else {
      items.push({
        testName: 'Ferritin', testNameTh: 'ค่าธาตุเหล็กสะสม',
        value: val, unit: allTests.ferritin.unit, status: 'normal',
        interpretation: `ผลตรวจค่าได้มากกว่า 70ng/mL อยู่ในระดับที่ปกติดี`,
        recommendation: '', hairRelevance: '',
      });
    }
  }

  // 2. CBC
  const cbcTests = ['hb', 'hct', 'rbc', 'wbc', 'plt'];
  const cbcAbnormal = cbcTests.filter(t => allTests[t]?.flag);
  if (cbcAbnormal.length > 0) {
    hairScore -= 10;
    const details = cbcAbnormal.map(t => `${t.toUpperCase()}: ${allTests[t].value}`).join(', ');
    const hasAnemia = allTests.hb?.flag === 'low' || allTests.hct?.flag === 'low';
    items.push({
      testName: 'CBC', testNameTh: 'ค่าความสมบูรณ์ของเม็ดเลือด',
      value: details, unit: '', status: 'low',
      interpretation: hasAnemia
        ? 'ผลตรวจพบว่ามีภาวะเลือดจางเล็กน้อย ' + (allTests.ferritin?.flag !== 'low' ? 'ไม่ได้เกิดจากการขาดธาตุเหล็ก' : 'อาจเกี่ยวข้องกับระดับธาตุเหล็กที่ต่ำ')
        : `พบค่าผิดปกติ: ${details}`,
      recommendation: hasAnemia ? 'ควรตรวจเพิ่มเติมหาสาเหตุของภาวะเลือดจาง' : 'ควรปรึกษาแพทย์เพิ่มเติม',
      hairRelevance: 'ภาวะเลือดจางทำให้ออกซิเจนไปเลี้ยงรากผมไม่เพียงพอ',
    });
  } else if (cbcTests.some(t => allTests[t])) {
    items.push({
      testName: 'CBC', testNameTh: 'ค่าความสมบูรณ์ของเม็ดเลือด',
      value: 'ปกติ', unit: '', status: 'normal',
      interpretation: 'ผลตรวจปกติดี ไม่มีภาวะอักเสบหรือติดเชื้อใดๆ',
      recommendation: '', hairRelevance: '',
    });
  }

  // 3. TSH
  if (allTests.tsh) {
    const val = allTests.tsh.value;
    if (allTests.tsh.flag) {
      hairScore -= 15;
      items.push({
        testName: 'TSH', testNameTh: 'ค่าฮอร์โมนไทรอยด์',
        value: val, unit: allTests.tsh.unit, status: allTests.tsh.flag,
        interpretation: `ค่า TSH ${val} ${allTests.tsh.flag === 'high' ? 'สูงกว่าปกติ อาจมีภาวะไทรอยด์ต่ำ' : 'ต่ำกว่าปกติ อาจมีภาวะไทรอยด์เป็นพิษ'}`,
        recommendation: 'ควรปรึกษาแพทย์เฉพาะทางต่อมไร้ท่อ',
        hairRelevance: 'ไทรอยด์ผิดปกติเป็นสาเหตุหลักของผมร่วง ทั้งไทรอยด์ต่ำและไทรอยด์เป็นพิษ',
      });
      urgentActions.push('ปรึกษาแพทย์ — ค่า TSH ผิดปกติ มีผลต่อผมร่วงโดยตรง');
    } else {
      items.push({
        testName: 'TSH', testNameTh: 'ค่าฮอร์โมนไทรอยด์',
        value: val, unit: allTests.tsh.unit, status: 'normal',
        interpretation: 'ผลตรวจปกติดี', recommendation: '', hairRelevance: '',
      });
    }
  }

  // 4. Testosterone + DHEA-S
  const hasTestosterone = allTests.testosterone;
  const hasDheas = allTests.dheas;
  if (hasTestosterone || hasDheas) {
    const testVal = hasTestosterone?.value;
    const dheasVal = hasDheas?.value;
    // DHEA-S clinical range for hair clinic: 98.80-340 µg/dL (not lab default 80-560)
    const dheasHigh = hasDheas && typeof dheasVal === 'number' && dheasVal > 340;
    const anyHigh = hasTestosterone?.flag === 'high' || hasDheas?.flag === 'high' || dheasHigh;

    if (anyHigh) {
      hairScore -= 10;
      items.push({
        testName: 'Testosterone + DHEA-S',
        testNameTh: 'ค่าฮอร์โมนเพศชาย และค่า DHEA-S คัดกรองภาวะถุงน้ำในรังไข่',
        value: `Testosterone: ${testVal || '-'}, DHEA-S: ${dheasVal || '-'}`,
        unit: '', status: 'high',
        interpretation: 'ผลตรวจพบว่าค่าสูงเล็กน้อย คุณหมอให้สังเกตอาการ หากมีประจำเดือนมาผิดปกติ หรือสิวขึ้นง่าย',
        recommendation: 'แนะนำให้ไปพบแพทย์สูตินารีเวชเพื่อตรวจหาภาวะถุงน้ำในรังไข่',
        hairRelevance: 'ฮอร์โมนเพศชายสูงเป็นสาเหตุหลักของผมร่วงแบบ Androgenetic Alopecia',
      });
    } else {
      items.push({
        testName: 'Testosterone + DHEA-S',
        testNameTh: 'ค่าฮอร์โมนเพศชาย และค่า DHEA-S คัดกรองภาวะถุงน้ำในรังไข่',
        value: `Testosterone: ${testVal || '-'}, DHEA-S: ${dheasVal || '-'}`,
        unit: '', status: 'normal',
        interpretation: 'ผลตรวจปกติดี', recommendation: '', hairRelevance: '',
      });
    }
  }

  // 5. Vitamin D
  if (allTests.vitamin_d) {
    const val = allTests.vitamin_d.value;
    if (val < 30) {
      hairScore -= 20;
      items.push({
        testName: 'Vitamin D', testNameTh: 'วิตามินดี',
        value: val, unit: allTests.vitamin_d.unit, status: 'low',
        interpretation: `ผลตรวจ Vitamin D ค่าได้ ${val}ng/mL อยู่ในเกณฑ์ต่ำ ค่าที่ดีควรเกิน 30ng/mL ขึ้นไป Vitamin D มีผลควบคุมระบบภูมิคุ้มกัน และมีผลต่อวงจรของรากผมโดยตรง`,
        recommendation: val < 20
          ? 'ค่าต่ำมาก ควรรักษาแบบยาฉีดก่อนในช่วงแรก แนะนำฉีด 3 เข็ม (ฉีด 1 เข็มทุก 3 เดือน) ฉีดที่กล้ามเนื้อแขน โดยธรรมชาติฉีด 1 เข็มค่าจะขึ้นประมาณ 10 หลังจากถึงเป้าหมายเปลี่ยนเป็นยาทานได้'
          : 'แนะนำทาน Vitamin D เสริมเพื่อเพิ่มระดับให้เกิน 40-70ng/mL',
        hairRelevance: 'ถ้าในร่างกายมี Vitamin D ต่ำ รากผมจะอ่อนแอ วงจรผมจะสั้นลง ทำให้ผมหลุดร่วงง่ายขึ้นและงอกขึ้นใหม่ช้า ค่าที่ดีสำหรับปัญหาเส้นผม ควรเกิน 40-70ng/mL',
      });
      urgentActions.push(`Vitamin D ต่ำ (${val}) — ${val < 20 ? 'แนะนำฉีด Vitamin D' : 'ทาน Vitamin D เสริม'}`);
    } else {
      items.push({
        testName: 'Vitamin D', testNameTh: 'วิตามินดี',
        value: val, unit: allTests.vitamin_d.unit, status: 'normal',
        interpretation: `ผลตรวจ Vitamin D อยู่ในเกณฑ์ปกติดี (${val}ng/mL)`,
        recommendation: '', hairRelevance: '',
      });
    }
  }

  // 6. ANA
  // ANA is typically text "Negative" or "Positive", not a number
  // Check if present in raw data
  const anaKey = Object.keys(allTests).find(k => k.toLowerCase().includes('ana'));
  if (anaKey) {
    const anaVal = allTests[anaKey].value;
    const isPositive = typeof anaVal === 'string' && anaVal.toLowerCase().includes('positive');
    if (isPositive) {
      hairScore -= 10;
      items.push({
        testName: 'ANA', testNameTh: 'การคัดกรองโรคภูมิคุ้มกันทำร้ายตัวเอง',
        value: 'Positive', unit: '', status: 'positive',
        interpretation: 'ANA คือการตรวจหาภูมิคุ้มกันที่ร่างกายสร้างขึ้นมาต่อต้านตัวเอง พบได้ในโรคภูมิคุ้มกันบางชนิด แต่ผลบวกเพียงอย่างเดียวยังไม่สามารถสรุปว่าเป็นโรคได้ บางคนสามารถมี ANA บวกได้โดยไม่มีโรค เช่น คนที่พึ่งหายจากไข้หวัดรุนแรง',
        recommendation: 'ไม่ต้องกังวล แค่เฝ้าดูอาการ: ปวดข้อ ข้อบวม / ผื่นแพ้แดด / ผมร่วงผิดปกติ / แผลในปาก / อ่อนเพลียเรื้อรัง หากมีอาการเหล่านี้ควรปรึกษาแพทย์',
        hairRelevance: 'โรคภูมิคุ้มกันบางชนิด เช่น Lupus สามารถทำให้ผมร่วงได้',
      });
    } else {
      items.push({
        testName: 'ANA', testNameTh: 'การคัดกรองโรคภูมิคุ้มกันทำร้ายตัวเอง',
        value: 'Negative', unit: '', status: 'normal',
        interpretation: 'ผลตรวจปกติดี', recommendation: '', hairRelevance: '',
      });
    }
  }

  hairScore = Math.max(0, Math.min(100, hairScore));

  const abnormalCount = items.filter(i => i.status !== 'normal' && i.status !== 'negative').length;
  const summary = abnormalCount === 0
    ? 'ผลตรวจเลือดทุกค่าอยู่ในเกณฑ์ปกติดี ไม่พบความผิดปกติที่มีผลต่อสุขภาพเส้นผม'
    : `พบค่าผิดปกติ ${abnormalCount} รายการที่อาจมีผลต่อสุขภาพเส้นผม ควรปฏิบัติตามคำแนะนำและตรวจติดตามเป็นระยะ`;

  return { items, summary, hairHealthScore: hairScore, urgentActions };
}
