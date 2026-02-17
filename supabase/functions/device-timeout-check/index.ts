// @ts-nocheck
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

Deno.serve(async (_req: Request) => {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Mark devices offline if not seen for 60 seconds
    const cutoff = new Date(Date.now() - 60 * 1000).toISOString();

    const { data, error } = await supabase
        .from("device_status")
        .update({ status: "offline" })
        .lt("last_seen", cutoff)
        .eq("status", "online")
        .select();

    if (error) throw error;

    return new Response(JSON.stringify({ 
        message: "Checked device status", 
        updated: data?.length || 0 
    }), {
        headers: { "Content-Type": "application/json" }
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message || "Unknown error" }), { 
        status: 500,
        headers: { "Content-Type": "application/json" } 
    });
  }
});
