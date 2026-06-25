import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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

    // Get report + patient
    const { data: report } = await supabase
      .from("monte_reports")
      .select("*, monte_patients(*)")
      .eq("id", report_id)
      .single();
    if (!report) throw new Error("Report not found");

    const patient = report.monte_patients;
    const parsed = report.parsed_values || {};

    // Build prompt for Claude
    const testSummary = Object.entries(parsed)
      .map(([group, tests]: [string, any]) =>
        `${group}: ${Object.entries(tests)
          .map(([name, val]: [string, any]) => `${name}=${val.value}${val.unit}${val.flag ? ` (${val.flag})` : ""}`)
          .join(", ")}`
      )
      .join("\n");

    const prompt = `You are a clinical laboratory analyst for Monte Hair Clinic, a hair restoration clinic.
Analyze these blood test results for a ${patient?.gender || "unknown"} patient (${patient?.first_name} ${patient?.last_name}).

Blood Test Results:
${testSummary}

Focus on:
1. Values outside reference ranges
2. Relevance to hair health (iron, ferritin, zinc, thyroid, hormones, vitamin D)
3. Potential nutritional deficiencies
4. Recommendations for the treating physician

Respond in Thai. Return valid JSON only:
{
  "summary": "สรุปภาพรวม 2-3 ประโยค",
  "flags": [{"test": "ชื่อ", "value": 0, "severity": "low|high", "note": "คำอธิบายสั้น"}],
  "recommendations": ["คำแนะนำ 1", "คำแนะนำ 2"],
  "hairHealthScore": 0-100
}`;

    // Call Claude API
    const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
    if (!apiKey) throw new Error("ANTHROPIC_API_KEY not set");

    const claudeResponse = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1024,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const claudeData = await claudeResponse.json();
    const responseText = claudeData.content?.[0]?.text || "{}";

    // Parse JSON from Claude response
    let analysis;
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : { summary: responseText, flags: [], recommendations: [], hairHealthScore: 50 };
    } catch {
      analysis = { summary: responseText, flags: [], recommendations: [], hairHealthScore: 50 };
    }

    // Update report
    await supabase
      .from("monte_reports")
      .update({
        analysis_json: analysis,
        ai_summary: analysis.summary,
        flags: analysis.flags,
        status: "ready",
      })
      .eq("id", report_id);

    return new Response(
      JSON.stringify({ success: true, hairHealthScore: analysis.hairHealthScore }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
