import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const serviceAccountJson = Deno.env.get("GMAIL_SERVICE_ACCOUNT_JSON");
    const gmailUser = Deno.env.get("GMAIL_USER_EMAIL") || "lab.montehair@gmail.com";

    if (!serviceAccountJson) {
      return new Response(
        JSON.stringify({ error: "GMAIL_SERVICE_ACCOUNT_JSON not configured", hint: "Set up Google Cloud service account with Gmail API access" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Authenticate with Google service account
    const serviceAccount = JSON.parse(serviceAccountJson);
    const now = Math.floor(Date.now() / 1000);
    const jwtHeader = btoa(JSON.stringify({ alg: "RS256", typ: "JWT" }));
    const jwtClaim = btoa(JSON.stringify({
      iss: serviceAccount.client_email,
      sub: gmailUser,
      scope: "https://www.googleapis.com/auth/gmail.readonly",
      aud: "https://oauth2.googleapis.com/token",
      iat: now,
      exp: now + 3600,
    }));

    // Note: Full JWT signing with RS256 requires crypto library
    // For production: use googleapis npm package or Google Auth Library
    // This is a placeholder showing the flow

    // Step 1: List messages with PDF attachments (last 24h)
    // GET https://gmail.googleapis.com/gmail/v1/users/me/messages?q=has:attachment filename:pdf newer_than:1d

    // Step 2: For each new message (not in monte_reports.gmail_message_id)
    //   - Get message details
    //   - Download PDF attachment
    //   - Upload to Supabase Storage
    //   - Try to match patient from subject/body
    //   - Create report record (status: pending, source: gmail)

    // Step 3: Call parse-lab-pdf for each new report

    return new Response(
      JSON.stringify({
        success: true,
        message: "Gmail scan placeholder — configure service account to activate",
        scanned: 0,
        newReports: 0,
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
