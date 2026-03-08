import mqtt from "mqtt";

let client;
const listeners = [];

export function connectMQTT() {
    if (client) return client;

    // Using public HiveMQ broker via WebSockets
    client = mqtt.connect("wss://broker.hivemq.com:8884/mqtt", {
        clientId: "dashboard_" + Math.random().toString(16).substr(2, 8)
    });

    client.on("connect", () => {
        console.log("✅ MQTT Connected (Production Broker) - Subscribed to restaurant/#");
        client.subscribe("restaurant/#");
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
    if (!client || !client.connected) {
        console.warn("MQTT not connected, cannot publish");
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
