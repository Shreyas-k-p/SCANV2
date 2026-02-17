// @ts-nocheck
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  try {
    const body = await req.json();
    const { table_id, device_id, battery } = body;

    if (!table_id) {
        return new Response(JSON.stringify({ error: "Missing table_id" }), { 
            status: 400,
             headers: { "Content-Type": "application/json" }
        });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { error } = await supabase.from("device_status").upsert({
      table_id: table_id,
      device_id: device_id,
      last_seen: new Date().toISOString(),
      status: "online",
      battery: battery || 0
    }, { onConflict: "table_id" });

    if (error) throw error;

    return new Response(JSON.stringify({ success: true }), { 
        headers: { "Content-Type": "application/json" } 
    });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message || "Unknown error" }), { 
        status: 500,
        headers: { "Content-Type": "application/json" } 
    });
  }
});
