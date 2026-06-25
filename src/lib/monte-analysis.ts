// Monte Hair Clinic — Clinical analysis based on ANALYSIS-CONDUCT.md
// 3-priority system: P1 (Action Required), P2 (Optimize), P3 (Healthy)

export interface MonteAnalysisItem {
  testName: string;
  testNameTh: string;
  value: number | string;
  unit: string;
  status: 'normal' | 'low' | 'high' | 'positive' | 'negative';
  priority: 1 | 2 | 3;
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

export function generateMonteAnalysis(parsedValues: Record<string, Record<string, any>>): MonteAnalysis {
  const items: MonteAnalysisItem[] = [];
  const urgentActions: string[] = [];
  let hairScore = 100;

  const allTests = Object.values(parsedValues).reduce((acc, group) => ({ ...acc, ...group }), {});

  // 1. Hemoglobin (Hb)
  if (allTests.hb) {
    const val = allTests.hb.value;
    if (val < 10.0) {
      hairScore -= 25;
      items.push({ testName: 'Hemoglobin (Hb)', testNameTh: 'ฮีโมโกลบิน', value: val, unit: 'g/dL', status: 'low', priority: 1,
        interpretation: `ค่า Hb ${val} g/dL ต่ำกว่า 10.0 — ภาวะโลหิตจางรุนแรง เลือดนำออกซิเจนไปเลี้ยงรากผมได้น้อยลง เสี่ยงต่อการผ่าตัดและกราฟท์ติดยาก`,
        recommendation: 'Hold Procedure — แนะนำพบแพทย์เพื่อรักษาภาวะโลหิตจางก่อนทำหัตถการ',
        hairRelevance: 'ออกซิเจนไปเลี้ยงรากผมไม่เพียงพอ ผมร่วงและกราฟท์ติดยาก' });
      urgentActions.push(`Hemoglobin ${val} g/dL — โลหิตจางรุนแรง Hold Procedure`);
    } else if (val < 12.0) {
      hairScore -= 10;
      items.push({ testName: 'Hemoglobin (Hb)', testNameTh: 'ฮีโมโกลบิน', value: val, unit: 'g/dL', status: 'low', priority: 2,
        interpretation: `ค่า Hb ${val} g/dL — โลหิตจางเล็กน้อย ทำหัตถการได้แต่ควรเสริมวิตามิน`,
        recommendation: 'ให้วิตามินเสริมธาตุเหล็ก เฝ้าระวังระหว่างหัตถการ',
        hairRelevance: 'เลือดนำออกซิเจนไปเลี้ยงรากผมได้น้อยลง' });
    } else {
      items.push({ testName: 'Hemoglobin (Hb)', testNameTh: 'ฮีโมโกลบิน', value: val, unit: 'g/dL', status: 'normal', priority: 3,
        interpretation: `ค่า Hb ${val} g/dL อยู่ในเกณฑ์ปกติ (12.0-16.0)`, recommendation: '', hairRelevance: '' });
    }
  }

  // 2. Hematocrit (Hct)
  if (allTests.hct) {
    const val = allTests.hct.value;
    if (val < 30) {
      hairScore -= 15;
      items.push({ testName: 'Hematocrit (Hct)', testNameTh: 'ฮีมาโตคริต', value: val, unit: '%', status: 'low', priority: 1,
        interpretation: `ค่า Hct ${val}% ต่ำกว่า 30 — เสี่ยงภาวะแทรกซ้อนจากการเสียเลือด`,
        recommendation: 'เฝ้าระวังภาวะแทรกซ้อน พิจารณาระงับผ่าตัดหากจำเป็น',
        hairRelevance: 'ความเข้มข้นเม็ดเลือดแดงต่ำ ส่งผลต่อการหล่อเลี้ยงรากผม' });
    } else if (val < 36) {
      hairScore -= 5;
      items.push({ testName: 'Hematocrit (Hct)', testNameTh: 'ฮีมาโตคริต', value: val, unit: '%', status: 'low', priority: 2,
        interpretation: `ค่า Hct ${val}% — เลือดจางเล็กน้อย เฝ้าระวังระหว่างผ่าตัด`,
        recommendation: 'เฝ้าระวังระหว่างผ่าตัด ติดตามค่าเลือด', hairRelevance: '' });
    } else {
      items.push({ testName: 'Hematocrit (Hct)', testNameTh: 'ฮีมาโตคริต', value: val, unit: '%', status: 'normal', priority: 3,
        interpretation: `ค่า Hct ${val}% ปกติ (36-47%)`, recommendation: '', hairRelevance: '' });
    }
  }

  // 3. Platelet
  if (allTests.plt) {
    const val = allTests.plt.value;
    if (val < 100000) {
      hairScore -= 15;
      items.push({ testName: 'Platelet', testNameTh: 'เกล็ดเลือด', value: val, unit: '/mm³', status: 'low', priority: 1,
        interpretation: `เกล็ดเลือด ${val} ต่ำกว่า 100,000 — เสี่ยงเลือดหยุดยาก ระงับผ่าตัด`,
        recommendation: 'ระงับผ่าตัด พบแพทย์เพื่อตรวจสาเหตุเกล็ดเลือดต่ำ',
        hairRelevance: 'ส่งผลต่อ Microcirculation บริเวณหนังศีรษะ' });
      urgentActions.push(`Platelet ${val} — เสี่ยงเลือดหยุดยาก ระงับผ่าตัด`);
    } else if (val < 150000) {
      hairScore -= 5;
      items.push({ testName: 'Platelet', testNameTh: 'เกล็ดเลือด', value: val, unit: '/mm³', status: 'low', priority: 2,
        interpretation: `เกล็ดเลือด ${val} ค่อนข้างต่ำ — เฝ้าระวังการเกิด Hematoma`,
        recommendation: 'เฝ้าระวังการเกิด Hematoma ระหว่างหัตถการ', hairRelevance: '' });
    } else {
      items.push({ testName: 'Platelet', testNameTh: 'เกล็ดเลือด', value: val, unit: '/mm³', status: 'normal', priority: 3,
        interpretation: `เกล็ดเลือดปกติ (${val})`, recommendation: '', hairRelevance: '' });
    }
  }

  // 4. Ferritin
  if (allTests.ferritin) {
    const val = allTests.ferritin.value;
    if (val < 30) {
      hairScore -= 25;
      items.push({ testName: 'Ferritin', testNameTh: 'ค่าธาตุเหล็กสะสม', value: val, unit: 'ng/mL', status: 'low', priority: 1,
        interpretation: `ค่า Ferritin ${val} ng/mL ต่ำกว่า 30 — ธาตุเหล็กต่ำวิกฤต เสี่ยงผมร่วง TE แบบเฉียบพลัน`,
        recommendation: 'แพทย์แนะนำให้รับประทานยาเสริมธาตุเหล็กตามที่จัดให้ เพื่อปรับสมดุลและฟื้นฟูรากผม',
        hairRelevance: 'ธาตุเหล็กจำเป็นต่อการทำงานของเซลล์รากผม ระดับต่ำทำให้ผมร่วงและอ่อนแอ' });
      urgentActions.push(`Ferritin ${val} ng/mL — ธาตุเหล็กต่ำวิกฤต ต้องเสริมธาตุเหล็กทันที`);
    } else if (val < 70) {
      hairScore -= 10;
      items.push({ testName: 'Ferritin', testNameTh: 'ค่าธาตุเหล็กสะสม', value: val, unit: 'ng/mL', status: 'low', priority: 2,
        interpretation: `ค่า Ferritin ${val} ng/mL — ไม่เพียงพอต่อการสร้างรากผมใหม่ (เป้าหมาย > 70 ng/mL)`,
        recommendation: 'จ่ายยาเสริมธาตุเหล็ก ติดตามค่าเป็นระยะ',
        hairRelevance: 'ธาตุเหล็กจำเป็นต่อเซลล์รากผม เป้าหมายควร > 70 ng/mL' });
    } else {
      items.push({ testName: 'Ferritin', testNameTh: 'ค่าธาตุเหล็กสะสม', value: val, unit: 'ng/mL', status: 'normal', priority: 3,
        interpretation: `ค่า Ferritin ${val} ng/mL อยู่ในเกณฑ์ที่ดีสำหรับสุขภาพผม (≥ 70)`, recommendation: '', hairRelevance: '' });
    }
  }

  // 5. Vitamin D (25-OH)
  if (allTests.vitamin_d) {
    const val = allTests.vitamin_d.value;
    if (val < 20) {
      hairScore -= 25;
      items.push({ testName: 'Vitamin D (25-OH)', testNameTh: 'วิตามินดี', value: val, unit: 'ng/mL', status: 'low', priority: 1,
        interpretation: `ค่า Vitamin D ${val} ng/mL ต่ำกว่า 20 — พร่องวิตามินดีรุนแรง ส่งผลต่อ Graft Survival Rate วงจรผมสั้นลง ผมร่วงง่ายและงอกใหม่ช้า`,
        recommendation: 'ระยะเริ่มต้น (Boost Phase): แนะนำวิตามินดีแบบฉีดเข้ากล้ามเนื้อ (1 เข็ม ทุก 3 เดือน รวม 3 เข็ม) โดยเฉลี่ย 1 เข็มจะเพิ่มค่าเลือดได้ประมาณ 10 หน่วย หลังจากถึงเป้าหมายเปลี่ยนเป็นยาทานได้',
        hairRelevance: 'วิตามินดีมีผลโดยตรงต่อวงจรการงอกของเส้นผมและระบบภูมิคุ้มกัน เป้าหมาย 40-70 ng/mL' });
      urgentActions.push(`Vitamin D ${val} ng/mL — พร่องรุนแรง แนะนำฉีดวิตามินดี`);
    } else if (val < 30) {
      hairScore -= 10;
      items.push({ testName: 'Vitamin D (25-OH)', testNameTh: 'วิตามินดี', value: val, unit: 'ng/mL', status: 'low', priority: 2,
        interpretation: `ค่า Vitamin D ${val} ng/mL — ต่ำกว่าเกณฑ์ปกติ (≥ 30) ส่งผลต่อวงจรผม`,
        recommendation: 'แนะนำทาน Vitamin D เสริม เพื่อเพิ่มระดับให้ถึง 40-70 ng/mL',
        hairRelevance: 'วิตามินดีต่ำทำให้วงจรผมสั้นลง ผมหลุดร่วงง่าย' });
    } else {
      items.push({ testName: 'Vitamin D (25-OH)', testNameTh: 'วิตามินดี', value: val, unit: 'ng/mL', status: 'normal', priority: 3,
        interpretation: `ค่า Vitamin D ${val} ng/mL ปกติ (≥ 30)`, recommendation: '', hairRelevance: '' });
    }
  }

  // 6. TSH
  if (allTests.tsh) {
    const val = allTests.tsh.value;
    if (val < 0.1 || val > 10.0) {
      hairScore -= 20;
      items.push({ testName: 'TSH', testNameTh: 'ฮอร์โมนไทรอยด์', value: val, unit: 'uIU/mL', status: val < 0.1 ? 'low' : 'high', priority: 1,
        interpretation: `ค่า TSH ${val} uIU/mL — ไทรอยด์ผิดปกติชัดเจน ${val < 0.1 ? 'อาจมีภาวะไทรอยด์เป็นพิษ' : 'อาจมีภาวะไทรอยด์ต่ำ'} ทำให้ผมร่วงทั่วศีรษะ (Diffuse Hair Loss)`,
        recommendation: 'พบแพทย์เฉพาะทางต่อมไร้ท่อ เพื่อรักษาภาวะไทรอยด์ก่อนทำหัตถการ',
        hairRelevance: 'ไทรอยด์แฝงทำให้ผมร่วงทั่วศีรษะ (Diffuse Hair Loss)' });
      urgentActions.push(`TSH ${val} — ไทรอยด์ผิดปกติ พบแพทย์เฉพาะทาง`);
    } else if (val < 0.35 || val > 4.94) {
      hairScore -= 8;
      items.push({ testName: 'TSH', testNameTh: 'ฮอร์โมนไทรอยด์', value: val, unit: 'uIU/mL', status: val < 0.35 ? 'low' : 'high', priority: 2,
        interpretation: `ค่า TSH ${val} uIU/mL — เริ่มมีความผิดปกติของไทรอยด์`,
        recommendation: 'ติดตามอาการ ตรวจซ้ำใน 3-6 เดือน', hairRelevance: 'ไทรอยด์มีผลต่อวงจรผม' });
    } else {
      items.push({ testName: 'TSH', testNameTh: 'ฮอร์โมนไทรอยด์', value: val, unit: 'uIU/mL', status: 'normal', priority: 3,
        interpretation: `ค่า TSH ${val} uIU/mL ปกติ (0.35-4.94) ต่อมไทรอยด์ทำงานปกติ`, recommendation: '', hairRelevance: '' });
    }
  }

  // 7. Free Testosterone
  if (allTests.testosterone) {
    const val = allTests.testosterone.value;
    if (val > 60.0) {
      hairScore -= 15;
      items.push({ testName: 'Free Testosterone', testNameTh: 'ฮอร์โมนเพศชายอิสระ', value: val, unit: 'ng/dL', status: 'high', priority: 1,
        interpretation: `ค่า Free Testosterone ${val} ng/dL สูงเกินเกณฑ์มาก (> 60) — ฮอร์โมนเพศชายอิสระที่แปลงเป็น DHT ตัวการหลักทำลายรากผม เสี่ยง AGA ลุกลาม`,
        recommendation: 'ปรึกษาแพทย์เพื่อพิจารณาการรักษาด้วยยาต้าน DHT',
        hairRelevance: 'Free Testosterone แปลงเป็น DHT (Dihydrotestosterone) ตัวการหลักที่ทำลายรากผม' });
    } else if (val > 53.35) {
      hairScore -= 5;
      items.push({ testName: 'Free Testosterone', testNameTh: 'ฮอร์โมนเพศชายอิสระ', value: val, unit: 'ng/dL', status: 'high', priority: 2,
        interpretation: `ค่า Free Testosterone ${val} ng/dL — ปริ่มเกณฑ์ เฝ้าระวังอาการผมบาง`,
        recommendation: 'เฝ้าระวังอาการผมบาง ตรวจติดตามเป็นระยะ', hairRelevance: 'ฮอร์โมนเพศชายใกล้เกณฑ์สูง' });
    } else {
      items.push({ testName: 'Free Testosterone', testNameTh: 'ฮอร์โมนเพศชายอิสระ', value: val, unit: 'ng/dL', status: 'normal', priority: 3,
        interpretation: `ค่า Free Testosterone ${val} ng/dL ปกติ (13.84-53.35)`, recommendation: '', hairRelevance: '' });
    }
  }

  // 8. DHEA-S
  if (allTests.dheas) {
    const val = allTests.dheas.value;
    if (val > 400) {
      hairScore -= 15;
      items.push({ testName: 'DHEA-S', testNameTh: 'ฮอร์โมนแอนโดรเจนจากต่อมหมวกไต', value: val, unit: 'µg/dL', status: 'high', priority: 1,
        interpretation: `ค่า DHEA-S ${val} µg/dL สูงผิดปกติ (> 400) — อาจบ่งชี้ความเครียดสะสม หรือภาวะที่กระตุ้นให้ร่างกายสร้าง Androgen มากขึ้น เร่งกระบวนการผมบางจากพันธุกรรม (AGA)`,
        recommendation: 'หากมีสิว/ประจำเดือนผิดปกติ แนะนำปรึกษาสูตินรีแพทย์',
        hairRelevance: 'เร่งกระบวนการผมบางจากพันธุกรรม (AGA) ให้รุนแรงขึ้น' });
    } else if (val > 340) {
      hairScore -= 5;
      items.push({ testName: 'DHEA-S', testNameTh: 'ฮอร์โมนแอนโดรเจนจากต่อมหมวกไต', value: val, unit: 'µg/dL', status: 'high', priority: 2,
        interpretation: `ค่า DHEA-S ${val} µg/dL — สูงเล็กน้อย เฝ้าระวังภาวะ PCOS`,
        recommendation: 'เฝ้าระวังอาการ สังเกตสิว/ประจำเดือน', hairRelevance: 'ฮอร์โมนแอนโดรเจนสูงเล็กน้อย' });
    } else {
      items.push({ testName: 'DHEA-S', testNameTh: 'ฮอร์โมนแอนโดรเจนจากต่อมหมวกไต', value: val, unit: 'µg/dL', status: 'normal', priority: 3,
        interpretation: `ค่า DHEA-S ${val} µg/dL ปกติ (98.8-340)`, recommendation: '', hairRelevance: '' });
    }
  }

  // 9. ANA
  const anaKey = Object.keys(allTests).find(k => k.toLowerCase().includes('ana'));
  if (anaKey) {
    const anaVal = allTests[anaKey].value;
    const isPositive = typeof anaVal === 'string' && anaVal.toLowerCase().includes('positive');
    if (isPositive) {
      hairScore -= 10;
      items.push({ testName: 'ANA (ANF/FANA)', testNameTh: 'การคัดกรองโรคภูมิคุ้มกันทำร้ายตัวเอง', value: 'Positive', unit: '', status: 'positive', priority: 2,
        interpretation: 'ผลตรวจ ANA เป็น Positive — ตรวจพบภูมิคุ้มกันที่ร่างกายสร้างขึ้นต่อต้านตัวเอง อาจเป็นผลบวกลวงหรือยังไม่แสดงอาการ',
        recommendation: 'หากมีอาการร่วม (ปวดข้อ ผื่นแพ้แดด ผมร่วงผิดปกติ แผลในปาก อ่อนเพลียเรื้อรัง) แนะนำปรึกษาแพทย์อายุรกรรมโรคข้อและรูมาติซั่ม หรือแพทย์ผิวหนัง',
        hairRelevance: 'กลุ่มโรค SLE หรือ Autoimmune ทำให้เกิดผมร่วง' });
    } else {
      items.push({ testName: 'ANA (ANF/FANA)', testNameTh: 'การคัดกรองโรคภูมิคุ้มกันทำร้ายตัวเอง', value: 'Negative', unit: '', status: 'negative', priority: 3,
        interpretation: 'ผลตรวจ ANA ปกติ — ไม่พบภูมิคุ้มกันทำร้ายตัวเอง', recommendation: '', hairRelevance: '' });
    }
  }

  hairScore = Math.max(0, Math.min(100, hairScore));

  const p1Count = items.filter(i => i.priority === 1).length;
  const p2Count = items.filter(i => i.priority === 2).length;

  const summary = p1Count > 0
    ? `พบค่าผิดปกติที่ต้องดำเนินการเร่งด่วน ${p1Count} รายการ${p2Count > 0 ? ` และควรเฝ้าระวัง ${p2Count} รายการ` : ''} ควรปฏิบัติตามคำแนะนำและปรึกษาแพทย์`
    : p2Count > 0
    ? `พบค่าที่ควรปรับปรุง ${p2Count} รายการ ควรปฏิบัติตามคำแนะนำและตรวจติดตามเป็นระยะ`
    : 'ผลตรวจเลือดทุกค่าอยู่ในเกณฑ์ปกติ ไม่พบความผิดปกติที่มีผลต่อสุขภาพเส้นผม';

  return { items, summary, hairHealthScore: hairScore, urgentActions };
}
