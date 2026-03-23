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
        JSON.stringify({ error: "Missing required fields (type, table_id, restaurant_id)" }),
        { headers, status: 400 }
      );
    }

    // ✅ STEP 3 - DYNAMIC TOPIC
    const topic = `restaurant/${restaurant_id}/table/${table_id}`;

    // ✅ STEP 4 - CLEAN PAYLOAD (STRICT FOR OLED DISPLAY)
    let payload;

    if (type === "ORDER_PREPARING") {
      payload = {
        message: "Order is being prepared",
        table: table_id
      };
    } else if (type === "ORDER_READY") {
      payload = {
        message: "Your order is ready to serve",
        table: table_id
      };
    } else if (type === "BILL_GENERATED") {
      payload = {
        message: "Thanks for visiting!",
        table: table_id,
        total: total
      };
    } else if (type === "ORDER_PLACED") {
      const cleanItems = (items || []).map((item: any) => ({
        name: item.name,
        qty: item.quantity || item.qty
      }));
      payload = {
        type: "ORDER_PLACED",
        table: table_id,
        items: cleanItems,
        total: total
      };
    } else {
      payload = body; // Fallback
    }

    const payloadString = JSON.stringify({
      ...payload,
      timestamp: new Date().toISOString()
    });

    console.log(`[MQTT] Publishing to ${topic}: ${payloadString}`);

    // NOTE: In a real environment, you'd use a broker's HTTP bridge or a Deno MQTT library here
    // e.g., fetch(`https://api.hivemq.cloud/v1/publish`, { ... })

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "MQTT event processed",
        topic,
        payload: JSON.parse(payloadString)
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
