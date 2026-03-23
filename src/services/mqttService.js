import mqtt from "mqtt";

// ─── INBOUND ONLY (ESP32 → Frontend) ─────────────────────────────────────────
// We keep MQTT client ONLY for receiving messages (e.g. waiter call button).
// ALL outgoing publishes go through the Supabase Edge Function instead.
// ─────────────────────────────────────────────────────────────────────────────

let client = null;
let connected = false;
const listeners = [];

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const MQTT_PUBLISHER_URL = `${SUPABASE_URL}/functions/v1/mqtt-publisher`;

export function connectMQTT() {
    if (client) return client;

    const brokerUrl = import.meta.env.VITE_MQTT_BROKER_URL || "wss://broker.hivemq.com:8884/mqtt";
    const username = import.meta.env.VITE_MQTT_USERNAME || "table_T01";
    const password = import.meta.env.VITE_MQTT_PASSWORD || "scan4serve";

    // Unique clientId per session — avoids EMQX "duplicate client" rejection
    const clientId = `scan4serve_dash_${Date.now()}_${Math.random().toString(16).slice(2, 6)}`;

    console.log(`[MQTT] Connecting to ${brokerUrl} as "${username}" (id: ${clientId})`);

    const options = {
        clientId,
        username,
        password,
        reconnectPeriod: 8000,   // don't hammer broker on auth failure
        connectTimeout: 15000,
        keepalive: 60,
        clean: true,
        rejectUnauthorized: false,  // needed for some self-signed EMQX certs
    };

    client = mqtt.connect(brokerUrl, options);

    client.on("connect", () => {
        console.log("✅ MQTT Connected (receive-only) — subscribing to restaurant/#");
        connected = true;
        client.subscribe("restaurant/#", { qos: 1 });
    });

    client.on("reconnect", () => console.log("🔄 MQTT Reconnecting..."));

    client.on("close", () => {
        connected = false;
        console.log("🔌 MQTT connection closed");
    });

    client.on("offline", () => { connected = false; });

    client.on("error", (err) => {
        console.error("❌ MQTT Error:", err.message);
        connected = false;
        // Stop reconnecting on auth failure — credentials won't change at runtime
        if (err.message?.includes("Bad username") || err.message?.includes("Not authorized")) {
            console.warn("⛔ MQTT: Auth failed — stopping reconnect. Check EMQX credentials.");
            client.end(true);
            client = null;
        }
    });

    client.on("message", (topic, message) => {
        try {
            let data;
            try { data = JSON.parse(message.toString()); }
            catch (e) { data = { message: message.toString() }; }

            // Hardware waiter call button (ESP32)
            if (topic.includes("/call")) {
                const tableNo = topic.match(/table\/(\d+)/)?.[1] || topic.split("/")[3];
                data = { type: "CALL_WAITER", table: tableNo || "Unknown" };
            }

            listeners.forEach(cb => cb(topic, data));
        } catch (error) {
            console.error("Failed to process MQTT message:", error);
        }
    });

    return client;
}

export function onMQTTMessage(callback) {
    listeners.push(callback);
    if (!client) connectMQTT();
    return () => {
        const index = listeners.indexOf(callback);
        if (index > -1) listeners.splice(index, 1);
    };
}

/**
 * ✅ CORRECT APPROACH: Route all outgoing MQTT publishes through Supabase Edge Function.
 * This avoids browser MQTT connection issues (CORS, timing, "not ready" errors).
 *
 * @param {string} restaurantId - The restaurant ID (e.g. "snmimt")
 * @param {string} tableId      - The table number (e.g. "T01")
 * @param {string} type         - Event type: ORDER_PLACED | ORDER_PREPARING | ORDER_READY | BILL_GENERATED
 * @param {object} extra        - Extra data like { items, total }
 */
export async function publishEvent(restaurantId, tableId, type, extra = {}) {
    try {
        console.log(`📤 [MQTT→Supabase] ${type} → restaurant/${restaurantId}/table/${tableId}`);
        const res = await fetch(MQTT_PUBLISHER_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                type,
                restaurant_id: restaurantId || "snmimt",
                table_id: String(tableId),
                ...extra
            })
        });
        const result = await res.json();
        console.log("✅ MQTT published via Supabase:", result);
        return result;
    } catch (err) {
        console.error("❌ Failed to publish via Supabase:", err);
    }
}

// Legacy shim — redirects old publishMQTT calls to Supabase function
// topic format: "restaurant/{restaurantId}/table/{tableId}"
export async function publishMQTT(topic, data) {
    const parts = topic.split("/");
    const restaurantId = parts[1] || "snmimt";
    const tableId = parts[3] || "T01";
    const type = data?.type || "ORDER_PLACED";
    await publishEvent(restaurantId, tableId, type, data);
}

const mqttService = {
    connect: connectMQTT,
    onMessage: onMQTTMessage,
    publish: publishMQTT,
    publishEvent
};

export default mqttService;
