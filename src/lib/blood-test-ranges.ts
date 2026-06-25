export interface TestRange {
  name: string;
  nameEn: string;
  unit: string;
  refMin: number;
  refMax: number;
  group: string;
}

export const BLOOD_TEST_RANGES: Record<string, TestRange> = {
  // CBC
  wbc: { name: 'WBC', nameEn: 'White Blood Cell', unit: '/mm³', refMin: 4500, refMax: 11000, group: 'cbc' },
  rbc: { name: 'RBC', nameEn: 'Red Blood Cell', unit: 'M/mm³', refMin: 4.0, refMax: 5.5, group: 'cbc' },
  hb: { name: 'Hemoglobin', nameEn: 'Hemoglobin', unit: 'g/dL', refMin: 12.0, refMax: 16.0, group: 'cbc' },
  hct: { name: 'Hematocrit', nameEn: 'Hematocrit', unit: '%', refMin: 36, refMax: 47, group: 'cbc' },
  plt: { name: 'Platelet', nameEn: 'Platelet', unit: 'x10³/µL', refMin: 150, refMax: 400, group: 'cbc' },
  mcv: { name: 'MCV', nameEn: 'Mean Corpuscular Volume', unit: 'fL', refMin: 80, refMax: 100, group: 'cbc' },
  mch: { name: 'MCH', nameEn: 'Mean Corpuscular Hemoglobin', unit: 'pg', refMin: 27, refMax: 33, group: 'cbc' },
  mchc: { name: 'MCHC', nameEn: 'MCHC', unit: 'g/dL', refMin: 32, refMax: 36, group: 'cbc' },

  // Chemistry
  fbs: { name: 'FBS', nameEn: 'Fasting Blood Sugar', unit: 'mg/dL', refMin: 70, refMax: 100, group: 'chemistry' },
  bun: { name: 'BUN', nameEn: 'Blood Urea Nitrogen', unit: 'mg/dL', refMin: 7, refMax: 20, group: 'chemistry' },
  creatinine: { name: 'Creatinine', nameEn: 'Creatinine', unit: 'mg/dL', refMin: 0.6, refMax: 1.2, group: 'chemistry' },
  uric_acid: { name: 'Uric Acid', nameEn: 'Uric Acid', unit: 'mg/dL', refMin: 3.5, refMax: 7.2, group: 'chemistry' },
  cholesterol: { name: 'Total Cholesterol', nameEn: 'Total Cholesterol', unit: 'mg/dL', refMin: 0, refMax: 200, group: 'chemistry' },
  hdl: { name: 'HDL', nameEn: 'HDL Cholesterol', unit: 'mg/dL', refMin: 40, refMax: 999, group: 'chemistry' },
  ldl: { name: 'LDL', nameEn: 'LDL Cholesterol', unit: 'mg/dL', refMin: 0, refMax: 130, group: 'chemistry' },
  triglycerides: { name: 'Triglycerides', nameEn: 'Triglycerides', unit: 'mg/dL', refMin: 0, refMax: 150, group: 'chemistry' },
  ast: { name: 'AST (SGOT)', nameEn: 'AST', unit: 'U/L', refMin: 0, refMax: 40, group: 'chemistry' },
  alt: { name: 'ALT (SGPT)', nameEn: 'ALT', unit: 'U/L', refMin: 0, refMax: 41, group: 'chemistry' },
  alp: { name: 'ALP', nameEn: 'Alkaline Phosphatase', unit: 'U/L', refMin: 40, refMax: 129, group: 'chemistry' },
  hba1c: { name: 'HbA1c', nameEn: 'Glycated Hemoglobin', unit: '%', refMin: 0, refMax: 5.7, group: 'chemistry' },

  // Thyroid
  tsh: { name: 'TSH', nameEn: 'Thyroid Stimulating Hormone', unit: 'mIU/L', refMin: 0.27, refMax: 4.2, group: 'thyroid' },
  ft3: { name: 'Free T3', nameEn: 'Free Triiodothyronine', unit: 'pg/mL', refMin: 2.0, refMax: 4.4, group: 'thyroid' },
  ft4: { name: 'Free T4', nameEn: 'Free Thyroxine', unit: 'ng/dL', refMin: 0.93, refMax: 1.7, group: 'thyroid' },

  // Hormones (hair-related)
  testosterone: { name: 'Testosterone', nameEn: 'Testosterone', unit: 'ng/dL', refMin: 249, refMax: 836, group: 'hormones' },
  dht: { name: 'DHT', nameEn: 'Dihydrotestosterone', unit: 'pg/mL', refMin: 250, refMax: 990, group: 'hormones' },
  dheas: { name: 'DHEA-S', nameEn: 'DHEA Sulfate', unit: 'µg/dL', refMin: 80, refMax: 560, group: 'hormones' },
  estradiol: { name: 'Estradiol', nameEn: 'Estradiol', unit: 'pg/mL', refMin: 11, refMax: 44, group: 'hormones' },
  prolactin: { name: 'Prolactin', nameEn: 'Prolactin', unit: 'ng/mL', refMin: 4.0, refMax: 15.2, group: 'hormones' },
  ana: { name: 'ANA', nameEn: 'Antinuclear Antibody', unit: '', refMin: 0, refMax: 1, group: 'hormones' },

  // Vitamins & Minerals (hair-related)
  vitamin_d: { name: 'Vitamin D', nameEn: '25-OH Vitamin D', unit: 'ng/mL', refMin: 30, refMax: 100, group: 'vitamins' },
  vitamin_b12: { name: 'Vitamin B12', nameEn: 'Vitamin B12', unit: 'pg/mL', refMin: 200, refMax: 900, group: 'vitamins' },
  folate: { name: 'Folate', nameEn: 'Folate', unit: 'ng/mL', refMin: 3.9, refMax: 26.8, group: 'vitamins' },
  ferritin: { name: 'Ferritin', nameEn: 'Ferritin', unit: 'ng/mL', refMin: 20, refMax: 250, group: 'vitamins' },
  iron: { name: 'Iron', nameEn: 'Serum Iron', unit: 'µg/dL', refMin: 60, refMax: 170, group: 'vitamins' },
  zinc: { name: 'Zinc', nameEn: 'Zinc', unit: 'µg/dL', refMin: 66, refMax: 110, group: 'vitamins' },
};

export const GROUP_LABELS: Record<string, string> = {
  cbc: 'ความสมบูรณ์ของเลือด (CBC)',
  chemistry: 'เคมีในเลือด',
  thyroid: 'ไทรอยด์',
  hormones: 'ฮอร์โมน (เกี่ยวกับผม)',
  vitamins: 'วิตามินและแร่ธาตุ',
};

export function flagValue(key: string, value: number): 'low' | 'high' | null {
  const range = BLOOD_TEST_RANGES[key];
  if (!range) return null;
  if (value < range.refMin) return 'low';
  if (value > range.refMax) return 'high';
  return null;
}
