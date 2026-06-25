import { BLOOD_TEST_RANGES, flagValue } from './blood-test-ranges';

export interface AnalysisResult {
  summary: string;
  flags: Array<{ test: string; value: number; severity: 'low' | 'high'; note: string }>;
  recommendations: string[];
  hairHealthScore: number;
}

export function analyzeBloodTest(parsedValues: Record<string, Record<string, any>>): AnalysisResult {
  const flags: AnalysisResult['flags'] = [];
  const recommendations: string[] = [];
  let hairScore = 100;

  for (const [, tests] of Object.entries(parsedValues)) {
    for (const [testKey, testData] of Object.entries(tests as Record<string, any>)) {
      const flag = flagValue(testKey, testData.value);
      if (flag) {
        const range = BLOOD_TEST_RANGES[testKey];
        flags.push({
          test: range?.name || testKey,
          value: testData.value,
          severity: flag,
          note: flag === 'low'
            ? `ต่ำกว่าค่าปกติ (${range?.refMin}-${range?.refMax} ${range?.unit})`
            : `สูงกว่าค่าปกติ (${range?.refMin}-${range?.refMax} ${range?.unit})`,
        });

        // Hair-related deductions
        if (['ferritin', 'iron', 'zinc', 'vitamin_d', 'vitamin_b12'].includes(testKey) && flag === 'low') {
          hairScore -= 15;
          recommendations.push(`${range?.name} ต่ำ — อาจส่งผลต่อสุขภาพเส้นผม แนะนำเสริม`);
        }
        if (['tsh'].includes(testKey)) {
          hairScore -= 10;
          recommendations.push('TSH ผิดปกติ — ไทรอยด์มีผลต่อผมร่วง ควรปรึกษาแพทย์');
        }
        if (['hb', 'hct', 'rbc'].includes(testKey) && flag === 'low') {
          hairScore -= 10;
          recommendations.push(`${range?.name} ต่ำ — ภาวะโลหิตจางอาจทำให้ผมร่วง`);
        }
        if (['dheas'].includes(testKey) && flag === 'low') {
          hairScore -= 5;
          recommendations.push('DHEA-S ต่ำ — อาจมีผลต่อวงจรการเจริญเติบโตของผม');
        }
      }
    }
  }

  hairScore = Math.max(0, Math.min(100, hairScore));
  const uniqueRecs = [...new Set(recommendations)];

  const summary = flags.length === 0
    ? 'ผลตรวจเลือดทุกค่าอยู่ในเกณฑ์ปกติ ไม่พบความผิดปกติ'
    : `พบค่าผิดปกติ ${flags.length} รายการ${hairScore < 80 ? ' มีผลกระทบต่อสุขภาพเส้นผม' : ''}`;

  return { summary, flags, recommendations: uniqueRecs, hairHealthScore: hairScore };
}
