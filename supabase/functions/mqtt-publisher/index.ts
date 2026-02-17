import mqtt from "npm:mqtt";

const MQTT_URL = "mqtts://y12dbb61.ala.asia-southeast1.emqxsl.com:8883";

const client = mqtt.connect(MQTT_URL, {
  username: "server_bridge",
  password: "bridge_password"
});

Deno.serve(async (req) => {
  try {
    const body = await req.json();

    const { table_id, type, total, items } = body;

    const topic = `restaurant/snmimt/table/${table_id}`;

    const payload = JSON.stringify({
      type,
      total,
      items,
      timestamp: Date.now()
    });

    client.publish(topic, payload);

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500
    });
  }
});
