import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Monte Lab brand colors
const MONTE_TEAL = { r: 0, g: 134, b: 138 };     // #00868A
const MONTE_DARK = { r: 0, g: 107, b: 110 };      // #006B6E
const MONTE_GRAY = { r: 107, g: 114, b: 128 };     // #6B7280
const FLAG_RED = { r: 192, g: 57, b: 43 };         // #C0392B
const FLAG_BLUE = { r: 41, g: 128, b: 185 };       // #2980B9

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { report_id } = await req.json();
    if (!report_id) throw new Error("report_id required");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Get report + patient + doctor
    const { data: report } = await supabase
      .from("monte_reports")
      .select("*, monte_patients(*), monte_doctors(full_name, license_no, signature_url)")
      .eq("id", report_id)
      .single();
    if (!report) throw new Error("Report not found");

    const patient = report.monte_patients;
    const doctor = report.monte_doctors;
    const parsed = report.parsed_values || {};
    const analysis = report.analysis_json || {};

    // Note: Full PDF generation with pdf-lib requires importing the library
    // and embedding fonts. This is a placeholder showing the structure.
    //
    // Production implementation:
    // 1. Import pdf-lib: import { PDFDocument, rgb, StandardFonts } from 'https://esm.sh/pdf-lib'
    // 2. Load Monte logo from Storage
    // 3. Embed Sukhumvit Set font (TTF from Storage assets bucket)
    // 4. Build A4 page with:
    //    - Monte teal header bar + logo
    //    - Patient info block (HN, name, DOB, test date)
    //    - Blood test results table (grouped, flagged values in red)
    //    - AI analysis section (summary + recommendations)
    //    - Doctor signature image + name + license + approval date
    //    - Footer: Monte Hair Clinic address + disclaimer
    // 5. Upload generated PDF to Storage report-pdfs bucket
    // 6. Update report.summary_pdf_url

    const pdfStructure = {
      page1: {
        header: {
          logo: "monte-logo-primary.png",
          title: "ใบสรุปผลการตรวจเลือด",
          subtitle: "Blood Test Summary Report",
          color: MONTE_TEAL,
        },
        patientInfo: {
          hn: patient?.hn,
          name: `${patient?.first_name} ${patient?.last_name}`,
          dob: patient?.date_of_birth,
          gender: patient?.gender,
          testDate: report.test_date,
          labName: report.lab_name,
        },
        results: parsed,
        analysis: {
          summary: analysis.summary,
          flags: analysis.flags,
          recommendations: analysis.recommendations,
          hairHealthScore: analysis.hairHealthScore,
        },
        approval: report.status === "approved" ? {
          doctorName: doctor?.full_name,
          licenseNo: doctor?.license_no,
          signatureUrl: doctor?.signature_url,
          approvedAt: report.approved_at,
        } : null,
        footer: {
          clinic: "Monte Hair Clinic",
          disclaimer: "ผลตรวจเลือดนี้เป็นเพียงข้อมูลเบื้องต้น กรุณาปรึกษาแพทย์ผู้เชี่ยวชาญ",
        },
      },
    };

    // Placeholder: return structure (actual PDF generation needs pdf-lib import)
    return new Response(
      JSON.stringify({
        success: true,
        message: "PDF structure prepared — deploy with pdf-lib for actual generation",
        structure: pdfStructure,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
