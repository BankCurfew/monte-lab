import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Common Thai lab PDF patterns for blood test extraction
const TEST_PATTERNS: Record<string, RegExp> = {
  wbc: /WBC[:\s]*([0-9,.]+)/i,
  rbc: /RBC[:\s]*([0-9,.]+)/i,
  hb: /(?:Hb|Hemoglobin|HGB)[:\s]*([0-9,.]+)/i,
  hct: /(?:Hct|Hematocrit|HCT)[:\s]*([0-9,.]+)/i,
  plt: /(?:Platelet|PLT)[:\s]*([0-9,.]+)/i,
  mcv: /MCV[:\s]*([0-9,.]+)/i,
  mch: /MCH[:\s]*([0-9,.]+)/i,
  mchc: /MCHC[:\s]*([0-9,.]+)/i,
  fbs: /(?:FBS|Fasting.*Blood.*Sugar|Glucose.*Fasting)[:\s]*([0-9,.]+)/i,
  bun: /BUN[:\s]*([0-9,.]+)/i,
  creatinine: /(?:Creatinine|Cr)[:\s]*([0-9,.]+)/i,
  uric_acid: /(?:Uric.*Acid)[:\s]*([0-9,.]+)/i,
  cholesterol: /(?:Total.*Cholesterol|Cholesterol.*Total)[:\s]*([0-9,.]+)/i,
  hdl: /HDL[:\s]*([0-9,.]+)/i,
  ldl: /LDL[:\s]*([0-9,.]+)/i,
  triglycerides: /(?:Triglyceride|TG)[:\s]*([0-9,.]+)/i,
  ast: /(?:AST|SGOT)[:\s]*([0-9,.]+)/i,
  alt: /(?:ALT|SGPT)[:\s]*([0-9,.]+)/i,
  alp: /(?:ALP|Alkaline.*Phosphatase)[:\s]*([0-9,.]+)/i,
  tsh: /TSH[:\s]*([0-9,.]+)/i,
  ft3: /(?:Free.*T3|FT3)[:\s]*([0-9,.]+)/i,
  ft4: /(?:Free.*T4|FT4)[:\s]*([0-9,.]+)/i,
  testosterone: /(?:Testosterone)[:\s]*([0-9,.]+)/i,
  dheas: /(?:DHEA-S|DHEA.*S)[:\s]*([0-9,.]+)/i,
  vitamin_d: /(?:Vitamin.*D|25.*OH.*D)[:\s]*([0-9,.]+)/i,
  vitamin_b12: /(?:Vitamin.*B12|B12)[:\s]*([0-9,.]+)/i,
  ferritin: /Ferritin[:\s]*([0-9,.]+)/i,
  iron: /(?:Iron|Fe|Serum.*Iron)[:\s]*([0-9,.]+)/i,
  zinc: /Zinc[:\s]*([0-9,.]+)/i,
};

const REFERENCE_RANGES: Record<string, { min: number; max: number; unit: string; group: string }> = {
  wbc: { min: 4500, max: 11000, unit: "/mm³", group: "cbc" },
  rbc: { min: 4.0, max: 5.5, unit: "M/mm³", group: "cbc" },
  hb: { min: 12.0, max: 16.0, unit: "g/dL", group: "cbc" },
  hct: { min: 36, max: 47, unit: "%", group: "cbc" },
  plt: { min: 150, max: 400, unit: "x10³/µL", group: "cbc" },
  mcv: { min: 80, max: 100, unit: "fL", group: "cbc" },
  mch: { min: 27, max: 33, unit: "pg", group: "cbc" },
  mchc: { min: 32, max: 36, unit: "g/dL", group: "cbc" },
  fbs: { min: 70, max: 100, unit: "mg/dL", group: "chemistry" },
  bun: { min: 7, max: 20, unit: "mg/dL", group: "chemistry" },
  creatinine: { min: 0.6, max: 1.2, unit: "mg/dL", group: "chemistry" },
  uric_acid: { min: 3.5, max: 7.2, unit: "mg/dL", group: "chemistry" },
  cholesterol: { min: 0, max: 200, unit: "mg/dL", group: "chemistry" },
  hdl: { min: 40, max: 999, unit: "mg/dL", group: "chemistry" },
  ldl: { min: 0, max: 130, unit: "mg/dL", group: "chemistry" },
  triglycerides: { min: 0, max: 150, unit: "mg/dL", group: "chemistry" },
  ast: { min: 0, max: 40, unit: "U/L", group: "chemistry" },
  alt: { min: 0, max: 41, unit: "U/L", group: "chemistry" },
  alp: { min: 40, max: 129, unit: "U/L", group: "chemistry" },
  tsh: { min: 0.27, max: 4.2, unit: "mIU/L", group: "thyroid" },
  ft3: { min: 2.0, max: 4.4, unit: "pg/mL", group: "thyroid" },
  ft4: { min: 0.93, max: 1.7, unit: "ng/dL", group: "thyroid" },
  testosterone: { min: 249, max: 836, unit: "ng/dL", group: "hormones" },
  dheas: { min: 80, max: 560, unit: "µg/dL", group: "hormones" },
  vitamin_d: { min: 30, max: 100, unit: "ng/mL", group: "vitamins" },
  vitamin_b12: { min: 200, max: 900, unit: "pg/mL", group: "vitamins" },
  ferritin: { min: 20, max: 250, unit: "ng/mL", group: "vitamins" },
  iron: { min: 60, max: 170, unit: "µg/dL", group: "vitamins" },
  zinc: { min: 66, max: 110, unit: "µg/dL", group: "vitamins" },
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { report_id } = await req.json();
    if (!report_id) throw new Error("report_id required");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Get report
    const { data: report, error: reportErr } = await supabase
      .from("monte_reports")
      .select("raw_pdf_url")
      .eq("id", report_id)
      .single();
    if (reportErr || !report) throw new Error("Report not found");

    // Download PDF
    const pdfResponse = await fetch(report.raw_pdf_url);
    const pdfBuffer = await pdfResponse.arrayBuffer();

    // Extract text (basic — for production use pdf-parse or Document AI)
    const textDecoder = new TextDecoder();
    const rawText = textDecoder.decode(pdfBuffer);

    // Parse blood test values
    const parsedValues: Record<string, Record<string, any>> = {};
    const flags: any[] = [];

    for (const [key, pattern] of Object.entries(TEST_PATTERNS)) {
      const match = rawText.match(pattern);
      if (match) {
        const value = parseFloat(match[1].replace(",", ""));
        const ref = REFERENCE_RANGES[key];
        if (!ref || isNaN(value)) continue;

        const flag = value < ref.min ? "low" : value > ref.max ? "high" : null;
        const group = ref.group;

        if (!parsedValues[group]) parsedValues[group] = {};
        parsedValues[group][key] = {
          value,
          unit: ref.unit,
          ref_min: ref.min,
          ref_max: ref.max,
          flag,
        };

        if (flag) {
          flags.push({ test: key, value, severity: flag, note: `${flag === "low" ? "ต่ำ" : "สูง"}กว่าค่าปกติ` });
        }
      }
    }

    // Update report
    await supabase
      .from("monte_reports")
      .update({
        parsed_values: parsedValues,
        flags,
        status: "analyzing",
      })
      .eq("id", report_id);

    return new Response(
      JSON.stringify({ success: true, parsed: Object.keys(parsedValues).length, flags: flags.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
