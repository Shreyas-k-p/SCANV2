import mqtt from "mqtt";

let client;
let connected = false;
const listeners = [];

export function connectMQTT() {
    if (client) return client;

    // Using EMQX public/private broker via WebSockets
    const brokerUrl = "wss://y12dbb61.ala.asia-southeast1.emqxsl.com:8084/mqtt";
    const options = {
        clientId: "dashboard_" + Math.random().toString(16).substr(2, 8),
        username: "table_T01",
        password: "scan4serve",
        reconnectPeriod: 3000,
        connectTimeout: 4000,
        clean: true,
    };

    client = mqtt.connect(brokerUrl, options);

    client.on("connect", () => {
        console.log("✅ MQTT Connected (Production Broker) - Subscribed to restaurant/#");
        connected = true;
        client.subscribe("restaurant/#");
    });

    client.on("reconnect", () => {
        console.log("🔄 Reconnecting MQTT...");
    });

    client.on("close", () => {
        console.log("❌ MQTT Closed");
        connected = false;
    });

    client.on("offline", () => {
        connected = false;
    });

    client.on("message", (topic, message) => {
        try {
            let data;
            try {
                data = JSON.parse(message.toString());
            } catch (e) {
                data = { message: message.toString() };
            }

            // Standardize hardware triggers (e.g., from ESP32 buttons)
            if (topic.includes("/call")) {
                const tableNo = topic.match(/table\/(\d+)/) ? topic.match(/table\/(\d+)/)[1] : topic.split("/")[3];
                data = { type: "CALL_WAITER", table: tableNo || "Unknown" };
            }

            listeners.forEach(callback => callback(topic, data));
        } catch (error) {
            console.error("Failed to process MQTT message:", error);
        }
    });

    client.on("error", (err) => {
        console.error("MQTT Error:", err);
        connected = false;
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

export function publishMQTT(topic, data) {
    if (!client || !connected) {
        console.warn("MQTT not connected yet, cannot publish");
        return;
    }
    const message = typeof data === 'string' ? data : JSON.stringify(data);
    client.publish(topic, message, { qos: 1 });
    console.log(`📤 Published to ${topic}:`, data);
}

const mqttService = {
    connect: connectMQTT,
    onMessage: onMQTTMessage,
    publish: publishMQTT
};

export default mqttService;
