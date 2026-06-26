// Monte Hair Clinic — Clinical analysis based on ANALYSIS-CONDUCT.md
// 3-priority system: P1 (Action Required), P2 (Optimize), P3 (Healthy)
// CBC group rule: worst priority among Hb/Hct/Plt/RBC/MCV/WBC applies to all

export interface MonteAnalysisItem {
  testName: string;
  testNameTh: string;
  value: number | string;
  unit: string;
  status: 'normal' | 'low' | 'high' | 'positive' | 'negative';
  priority: 1 | 2 | 3;
  group?: string;
  interpretation: string;
  recommendation: string;
  hairRelevance: string;
}

export interface MonteAnalysis {
  items: MonteAnalysisItem[];
  summary: string;
  hairHealthScore: number;
  urgentActions: string[];
  cbcGroupPriority: 1 | 2 | 3;
}

function evaluateCBC(allTests: Record<string, any>): { items: MonteAnalysisItem[]; worstPriority: 1 | 2 | 3; urgentActions: string[] } {
  const items: MonteAnalysisItem[] = [];
  const urgentActions: string[] = [];
  let worstPriority: 1 | 2 | 3 = 3;

  // Hb
  if (allTests.hb) {
    const val = allTests.hb.value;
    let p: 1 | 2 | 3 = 3;
    if (val < 10.0) {
      p = 1;
      items.push({ testName: 'Hemoglobin (Hb)', testNameTh: 'ฮีโมโกลบิน', value: val, unit: 'g/dL', status: 'low', priority: 1, group: 'CBC',
        interpretation: `ค่า Hb ${val} g/dL ต่ำกว่า 10.0 — ภาวะโลหิตจางรุนแรง เลือดนำออกซิเจนไปเลี้ยงรากผมได้น้อยลง เสี่ยงต่อการผ่าตัดและกราฟท์ติดยาก`,
        recommendation: 'Hold Procedure — แนะนำพบแพทย์เพื่อรักษาภาวะโลหิตจางก่อนทำหัตถการ',
        hairRelevance: 'ออกซิเจนไปเลี้ยงรากผมไม่เพียงพอ ผมร่วงและกราฟท์ติดยาก' });
      urgentActions.push(`Hemoglobin ${val} g/dL — โลหิตจางรุนแรง Hold Procedure`);
    } else if (val < 12.0) {
      p = 2;
      items.push({ testName: 'Hemoglobin (Hb)', testNameTh: 'ฮีโมโกลบิน', value: val, unit: 'g/dL', status: 'low', priority: 2, group: 'CBC',
        interpretation: `ค่า Hb ${val} g/dL — โลหิตจางเล็กน้อย ทำหัตถการได้แต่ควรเสริมวิตามิน`,
        recommendation: 'ให้วิตามินเสริมธาตุเหล็ก เฝ้าระวังระหว่างหัตถการ',
        hairRelevance: 'เลือดนำออกซิเจนไปเลี้ยงรากผมได้น้อยลง' });
    } else {
      items.push({ testName: 'Hemoglobin (Hb)', testNameTh: 'ฮีโมโกลบิน', value: val, unit: 'g/dL', status: 'normal', priority: 3, group: 'CBC',
        interpretation: `ค่า Hb ${val} g/dL ปกติ (12.0-16.0)`, recommendation: '', hairRelevance: '' });
    }
    if (p < worstPriority) worstPriority = p;
  }

  // Hct
  if (allTests.hct) {
    const val = allTests.hct.value;
    let p: 1 | 2 | 3 = 3;
    if (val < 30) {
      p = 1;
      items.push({ testName: 'Hematocrit (Hct)', testNameTh: 'ฮีมาโตคริต', value: val, unit: '%', status: 'low', priority: 1, group: 'CBC',
        interpretation: `ค่า Hct ${val}% ต่ำกว่า 30 — เสี่ยงภาวะแทรกซ้อนจากการเสียเลือด`,
        recommendation: 'เฝ้าระวังภาวะแทรกซ้อน พิจารณาระงับผ่าตัดหากจำเป็น',
        hairRelevance: 'ความเข้มข้นเม็ดเลือดแดงต่ำ' });
    } else if (val < 36) {
      p = 2;
      items.push({ testName: 'Hematocrit (Hct)', testNameTh: 'ฮีมาโตคริต', value: val, unit: '%', status: 'low', priority: 2, group: 'CBC',
        interpretation: `ค่า Hct ${val}% — เลือดจางเล็กน้อย`, recommendation: 'เฝ้าระวังระหว่างผ่าตัด', hairRelevance: '' });
    } else {
      items.push({ testName: 'Hematocrit (Hct)', testNameTh: 'ฮีมาโตคริต', value: val, unit: '%', status: 'normal', priority: 3, group: 'CBC',
        interpretation: `ค่า Hct ${val}% ปกติ (36-47%)`, recommendation: '', hairRelevance: '' });
    }
    if (p < worstPriority) worstPriority = p;
  }

  // Platelet
  if (allTests.plt) {
    const val = allTests.plt.value;
    let p: 1 | 2 | 3 = 3;
    if (val < 100000) {
      p = 1;
      items.push({ testName: 'Platelet', testNameTh: 'เกล็ดเลือด', value: val, unit: '/mm³', status: 'low', priority: 1, group: 'CBC',
        interpretation: `เกล็ดเลือด ${val} ต่ำกว่า 100,000 — เสี่ยงเลือดหยุดยาก ระงับผ่าตัด`,
        recommendation: 'ระงับผ่าตัด พบแพทย์เพื่อตรวจสาเหตุ',
        hairRelevance: 'ส่งผลต่อ Microcirculation บริเวณหนังศีรษะ' });
      urgentActions.push(`Platelet ${val} — เสี่ยงเลือดหยุดยาก`);
    } else if (val < 150000) {
      p = 2;
      items.push({ testName: 'Platelet', testNameTh: 'เกล็ดเลือด', value: val, unit: '/mm³', status: 'low', priority: 2, group: 'CBC',
        interpretation: `เกล็ดเลือด ${val} ค่อนข้างต่ำ`, recommendation: 'เฝ้าระวัง Hematoma', hairRelevance: '' });
    } else {
      items.push({ testName: 'Platelet', testNameTh: 'เกล็ดเลือด', value: val, unit: '/mm³', status: 'normal', priority: 3, group: 'CBC',
        interpretation: `เกล็ดเลือดปกติ (${val})`, recommendation: '', hairRelevance: '' });
    }
    if (p < worstPriority) worstPriority = p;
  }

  // RBC
  if (allTests.rbc) {
    const val = allTests.rbc.value;
    let p: 1 | 2 | 3 = 3;
    if (val < 3.5) {
      p = 1;
      items.push({ testName: 'RBC', testNameTh: 'เม็ดเลือดแดง', value: val, unit: 'M/mm³', status: 'low', priority: 1, group: 'CBC',
        interpretation: `ค่า RBC ${val} M/mm³ ต่ำมาก — จำนวนเม็ดเลือดแดงตั้งต้นน้อย`,
        recommendation: 'พบแพทย์เพื่อตรวจสาเหตุ', hairRelevance: 'เม็ดเลือดแดงน้อย ส่งผลต่อ Microcirculation หนังศีรษะ' });
    } else if (val < 4.0) {
      p = 2;
      items.push({ testName: 'RBC', testNameTh: 'เม็ดเลือดแดง', value: val, unit: 'M/mm³', status: 'low', priority: 2, group: 'CBC',
        interpretation: `ค่า RBC ${val} M/mm³ — ค่อนข้างต่ำ`, recommendation: 'ติดตามค่าเลือด', hairRelevance: '' });
    } else {
      items.push({ testName: 'RBC', testNameTh: 'เม็ดเลือดแดง', value: val, unit: 'M/mm³', status: 'normal', priority: 3, group: 'CBC',
        interpretation: `ค่า RBC ${val} M/mm³ ปกติ (4.0-5.5)`, recommendation: '', hairRelevance: '' });
    }
    if (p < worstPriority) worstPriority = p;
  }

  // MCV
  if (allTests.mcv) {
    const val = allTests.mcv.value;
    let p: 1 | 2 | 3 = 3;
    if (val < 70 || val > 110) {
      p = 2;
      items.push({ testName: 'MCV', testNameTh: 'ปริมาตรเม็ดเลือดแดง', value: val, unit: 'fL', status: val < 70 ? 'low' : 'high', priority: 2, group: 'CBC',
        interpretation: `ค่า MCV ${val} fL — ${val < 70 ? 'เม็ดเลือดแดงเล็กผิดปกติ อาจบ่งชี้ภาวะขาดธาตุเหล็ก' : 'เม็ดเลือดแดงใหญ่ผิดปกติ'}`,
        recommendation: 'ตรวจเพิ่มเติมหาสาเหตุ', hairRelevance: '' });
    } else {
      items.push({ testName: 'MCV', testNameTh: 'ปริมาตรเม็ดเลือดแดง', value: val, unit: 'fL', status: 'normal', priority: 3, group: 'CBC',
        interpretation: `ค่า MCV ${val} fL ปกติ (80-100)`, recommendation: '', hairRelevance: '' });
    }
    if (p < worstPriority) worstPriority = p;
  }

  // WBC
  if (allTests.wbc) {
    const val = allTests.wbc.value;
    let p: 1 | 2 | 3 = 3;
    if (val < 3000 || val > 15000) {
      p = 2;
      items.push({ testName: 'WBC', testNameTh: 'เม็ดเลือดขาว', value: val, unit: '/mm³', status: val < 3000 ? 'low' : 'high', priority: 2, group: 'CBC',
        interpretation: `ค่า WBC ${val} — ${val < 3000 ? 'เม็ดเลือดขาวต่ำ อาจมีภูมิคุ้มกันอ่อนแอ' : 'เม็ดเลือดขาวสูง อาจมีการอักเสบหรือติดเชื้อ'}`,
        recommendation: 'ปรึกษาแพทย์เพิ่มเติม', hairRelevance: '' });
    } else {
      items.push({ testName: 'WBC', testNameTh: 'เม็ดเลือดขาว', value: val, unit: '/mm³', status: 'normal', priority: 3, group: 'CBC',
        interpretation: `ค่า WBC ${val} ปกติ (4,500-11,000)`, recommendation: '', hairRelevance: '' });
    }
    if (p < worstPriority) worstPriority = p;
  }

  // Apply worst priority to ALL CBC items
  if (worstPriority < 3) {
    for (const item of items) {
      if (item.priority > worstPriority) {
        item.priority = worstPriority;
      }
    }
  }

  return { items, worstPriority, urgentActions };
}

export function generateMonteAnalysis(parsedValues: Record<string, Record<string, any>>): MonteAnalysis {
  const items: MonteAnalysisItem[] = [];
  const urgentActions: string[] = [];
  let hairScore = 100;

  const allTests = Object.values(parsedValues).reduce((acc, group) => ({ ...acc, ...group }), {});

  // CBC Group — evaluated together, worst priority applies to all
  const cbc = evaluateCBC(allTests);
  items.push(...cbc.items);
  urgentActions.push(...cbc.urgentActions);
  if (cbc.worstPriority === 1) hairScore -= 25;
  else if (cbc.worstPriority === 2) hairScore -= 10;

  // Ferritin
  if (allTests.ferritin) {
    const val = allTests.ferritin.value;
    if (val < 30) {
      hairScore -= 25;
      items.push({ testName: 'Ferritin', testNameTh: 'ค่าธาตุเหล็กสะสม', value: val, unit: 'ng/mL', status: 'low', priority: 1,
        interpretation: `ค่า Ferritin ${val} ng/mL ต่ำกว่า 30 — ธาตุเหล็กต่ำวิกฤต เสี่ยงผมร่วง TE แบบเฉียบพลัน`,
        recommendation: 'แพทย์แนะนำให้รับประทานยาเสริมธาตุเหล็กตามที่จัดให้ เพื่อปรับสมดุลและฟื้นฟูรากผม',
        hairRelevance: 'ธาตุเหล็กจำเป็นต่อเซลล์รากผม ระดับต่ำทำให้ผมร่วงและอ่อนแอ' });
      urgentActions.push(`Ferritin ${val} ng/mL — ธาตุเหล็กต่ำวิกฤต`);
    } else if (val < 70) {
      hairScore -= 10;
      items.push({ testName: 'Ferritin', testNameTh: 'ค่าธาตุเหล็กสะสม', value: val, unit: 'ng/mL', status: 'low', priority: 2,
        interpretation: `ค่า Ferritin ${val} ng/mL — ไม่เพียงพอต่อการสร้างรากผมใหม่ (เป้าหมาย > 70 ng/mL)`,
        recommendation: 'จ่ายยาเสริมธาตุเหล็ก ติดตามค่าเป็นระยะ',
        hairRelevance: 'ธาตุเหล็กจำเป็นต่อเซลล์รากผม เป้าหมายควร > 70 ng/mL' });
    } else {
      items.push({ testName: 'Ferritin', testNameTh: 'ค่าธาตุเหล็กสะสม', value: val, unit: 'ng/mL', status: 'normal', priority: 3,
        interpretation: `ค่า Ferritin ${val} ng/mL อยู่ในเกณฑ์ดีสำหรับสุขภาพผม (≥ 70)`, recommendation: '', hairRelevance: '' });
    }
  }

  // Vitamin D (25-OH)
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
        interpretation: `ค่า Vitamin D ${val} ng/mL — ต่ำกว่าเกณฑ์ปกติ (≥ 30)`,
        recommendation: 'แนะนำทาน Vitamin D เสริม เพื่อเพิ่มระดับให้ถึง 40-70 ng/mL',
        hairRelevance: 'วิตามินดีต่ำทำให้วงจรผมสั้นลง' });
    } else {
      items.push({ testName: 'Vitamin D (25-OH)', testNameTh: 'วิตามินดี', value: val, unit: 'ng/mL', status: 'normal', priority: 3,
        interpretation: `ค่า Vitamin D ${val} ng/mL ปกติ (≥ 30)`, recommendation: '', hairRelevance: '' });
    }
  }

  // TSH
  if (allTests.tsh) {
    const val = allTests.tsh.value;
    if (val < 0.1 || val > 10.0) {
      hairScore -= 20;
      items.push({ testName: 'TSH', testNameTh: 'ฮอร์โมนไทรอยด์', value: val, unit: 'uIU/mL', status: val < 0.1 ? 'low' : 'high', priority: 1,
        interpretation: `ค่า TSH ${val} uIU/mL — ไทรอยด์ผิดปกติชัดเจน ${val < 0.1 ? 'อาจมีภาวะไทรอยด์เป็นพิษ' : 'อาจมีภาวะไทรอยด์ต่ำ'} ทำให้ผมร่วงทั่วศีรษะ (Diffuse Hair Loss)`,
        recommendation: 'พบแพทย์เฉพาะทางต่อมไร้ท่อ',
        hairRelevance: 'ไทรอยด์แฝงทำให้ผมร่วงทั่วศีรษะ (Diffuse Hair Loss)' });
      urgentActions.push(`TSH ${val} — ไทรอยด์ผิดปกติ`);
    } else if (val < 0.35 || val > 4.94) {
      hairScore -= 8;
      items.push({ testName: 'TSH', testNameTh: 'ฮอร์โมนไทรอยด์', value: val, unit: 'uIU/mL', status: val < 0.35 ? 'low' : 'high', priority: 2,
        interpretation: `ค่า TSH ${val} uIU/mL — เริ่มมีความผิดปกติ`,
        recommendation: 'ติดตามอาการ ตรวจซ้ำใน 3-6 เดือน', hairRelevance: '' });
    } else {
      items.push({ testName: 'TSH', testNameTh: 'ฮอร์โมนไทรอยด์', value: val, unit: 'uIU/mL', status: 'normal', priority: 3,
        interpretation: `ค่า TSH ${val} uIU/mL ปกติ (0.35-4.94)`, recommendation: '', hairRelevance: '' });
    }
  }

  // Testosterone
  if (allTests.testosterone) {
    const val = allTests.testosterone.value;
    if (val > 60.0) {
      hairScore -= 15;
      items.push({ testName: 'Testosterone', testNameTh: 'ฮอร์โมนเพศชาย', value: val, unit: 'ng/dL', status: 'high', priority: 1,
        interpretation: `ค่า Testosterone ${val} ng/dL สูงเกินเกณฑ์มาก (> 60) — ฮอร์โมนเพศชายที่แปลงเป็น DHT ตัวการหลักทำลายรากผม เสี่ยง AGA ลุกลาม`,
        recommendation: 'ปรึกษาแพทย์เพื่อพิจารณาการรักษาด้วยยาต้าน DHT',
        hairRelevance: 'Testosterone แปลงเป็น DHT ตัวการหลักที่ทำลายรากผม' });
    } else if (val > 53.35) {
      hairScore -= 5;
      items.push({ testName: 'Testosterone', testNameTh: 'ฮอร์โมนเพศชาย', value: val, unit: 'ng/dL', status: 'high', priority: 2,
        interpretation: `ค่า Testosterone ${val} ng/dL — ปริ่มเกณฑ์ เฝ้าระวังอาการผมบาง`,
        recommendation: 'เฝ้าระวังอาการผมบาง ตรวจติดตามเป็นระยะ', hairRelevance: '' });
    } else {
      items.push({ testName: 'Testosterone', testNameTh: 'ฮอร์โมนเพศชาย', value: val, unit: 'ng/dL', status: 'normal', priority: 3,
        interpretation: `ค่า Testosterone ${val} ng/dL ปกติ (13.84-53.35)`, recommendation: '', hairRelevance: '' });
    }
  }

  // DHEA-S
  if (allTests.dheas) {
    const val = allTests.dheas.value;
    if (val > 400) {
      hairScore -= 15;
      items.push({ testName: 'DHEA-S', testNameTh: 'ฮอร์โมนแอนโดรเจน', value: val, unit: 'µg/dL', status: 'high', priority: 1,
        interpretation: `ค่า DHEA-S ${val} µg/dL สูงผิดปกติ (> 400) — อาจบ่งชี้ความเครียดสะสม หรือภาวะที่กระตุ้นให้สร้าง Androgen มากขึ้น เร่ง AGA`,
        recommendation: 'หากมีสิว/ประจำเดือนผิดปกติ แนะนำปรึกษาสูตินรีแพทย์',
        hairRelevance: 'เร่งกระบวนการผมบางจากพันธุกรรม (AGA)' });
    } else if (val > 340) {
      hairScore -= 5;
      items.push({ testName: 'DHEA-S', testNameTh: 'ฮอร์โมนแอนโดรเจน', value: val, unit: 'µg/dL', status: 'high', priority: 2,
        interpretation: `ค่า DHEA-S ${val} µg/dL — สูงเล็กน้อย เฝ้าระวัง PCOS`,
        recommendation: 'เฝ้าระวังอาการ สังเกตสิว/ประจำเดือน', hairRelevance: '' });
    } else {
      items.push({ testName: 'DHEA-S', testNameTh: 'ฮอร์โมนแอนโดรเจน', value: val, unit: 'µg/dL', status: 'normal', priority: 3,
        interpretation: `ค่า DHEA-S ${val} µg/dL ปกติ (98.8-340)`, recommendation: '', hairRelevance: '' });
    }
  }

  // ANA
  const anaKey = Object.keys(allTests).find(k => k.toLowerCase().includes('ana'));
  if (anaKey) {
    const anaVal = allTests[anaKey].value;
    const isPositive = typeof anaVal === 'string' && anaVal.toLowerCase().includes('positive');
    if (isPositive) {
      hairScore -= 10;
      items.push({ testName: 'ANA (ANF/FANA)', testNameTh: 'ภูมิคุ้มกันทำร้ายตัวเอง', value: 'Positive', unit: '', status: 'positive', priority: 2,
        interpretation: 'ผลตรวจ ANA เป็น Positive — ตรวจพบภูมิคุ้มกันที่ร่างกายสร้างขึ้นต่อต้านตัวเอง อาจเป็นผลบวกลวงหรือยังไม่แสดงอาการ',
        recommendation: 'หากมีอาการร่วม (ปวดข้อ ผื่นแพ้แดด ผมร่วงผิดปกติ แผลในปาก อ่อนเพลียเรื้อรัง) แนะนำปรึกษาแพทย์อายุรกรรมโรคข้อและรูมาติซั่ม',
        hairRelevance: 'กลุ่มโรค SLE/Autoimmune ทำให้ผมร่วง' });
    } else {
      items.push({ testName: 'ANA (ANF/FANA)', testNameTh: 'ภูมิคุ้มกันทำร้ายตัวเอง', value: 'Negative', unit: '', status: 'negative', priority: 3,
        interpretation: 'ผลตรวจ ANA ปกติ — ไม่พบภูมิคุ้มกันทำร้ายตัวเอง', recommendation: '', hairRelevance: '' });
    }
  }

  hairScore = Math.max(0, Math.min(100, hairScore));

  const p1Count = items.filter(i => i.priority === 1).length;
  const p2Count = items.filter(i => i.priority === 2).length;

  const summary = p1Count > 0
    ? `พบค่าผิดปกติที่ต้องดูแลเร่งด่วน ${p1Count} รายการ${p2Count > 0 ? ` และควรเฝ้าระวัง ${p2Count} รายการ` : ''} ควรปฏิบัติตามคำแนะนำและปรึกษาแพทย์`
    : p2Count > 0
    ? `พบค่าที่ควรปรับปรุง ${p2Count} รายการ ควรปฏิบัติตามคำแนะนำและตรวจติดตามเป็นระยะ`
    : 'ผลตรวจเลือดทุกค่าอยู่ในเกณฑ์ปกติ ไม่พบความผิดปกติที่มีผลต่อสุขภาพเส้นผม CBC ปกติ ไม่มีภาวะโลหิตจาง';

  return { items, summary, hairHealthScore: hairScore, urgentActions, cbcGroupPriority: cbc.worstPriority };
}
