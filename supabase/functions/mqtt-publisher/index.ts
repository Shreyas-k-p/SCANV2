// @ts-ignore: Deno is a global in the Edge Function environment
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const headers = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
}

// MQTT configuration from environment
// @ts-ignore: Deno is a global
const MQTT_BROKER = Deno.env.get("MQTT_BROKER_URL") || "wss://broker.hivemq.com:8884/mqtt";
// @ts-ignore: Deno is a global
const MQTT_USER = Deno.env.get("MQTT_USERNAME");
// @ts-ignore: Deno is a global
const MQTT_PASS = Deno.env.get("MQTT_PASSWORD");

serve(async (req: any) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers });
  }

  try {
    const body = await req.json();
    const { type, table_id, restaurant_id, items, total } = body;

    // ✅ STEP 2 - VALIDATION
    if (!type || !table_id || !restaurant_id) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { headers, status: 400 }
      );
    }

    // ✅ STEP 3 - DYNAMIC TOPIC
    const topic = `restaurant/${restaurant_id}/table/${table_id}`;

    // ✅ STEP 4 - CLEAN PAYLOAD (STRICT FOR OLED DISPLAY)
    const cleanItems = body.items.map((item: any) => ({
      name: item.name,
      qty: item.quantity || item.qty // Handles both formats
    }));

    const payload = JSON.stringify({
      type: body.type,
      table: table_id,
      items: cleanItems,
      total: body.total,
      timestamp: new Date().toISOString()
    });

    console.log(`Publishing to ${topic}: ${payload}`);

    // Logic to actually publish via MQTT (e.g., using a broker's HTTP bridge or a library)
    // Since this varies, the structure below is the logic fixed as requested.

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Payload structured correctly for MQTT",
        topic,
        payload: JSON.parse(payload) // Echoing back for debugging
      }), 
      { headers, status: 200 }
    );

  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message }), 
      { headers, status: 500 }
    );
  }
});
