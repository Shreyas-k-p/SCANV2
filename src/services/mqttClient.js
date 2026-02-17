import mqtt from "mqtt";

let client;
const listeners = [];

export function connectMQTT() {
    if (client) return;

    client = mqtt.connect("wss://y12dbb61.ala.asia-southeast1.emqxsl.com:8084/mqtt", {
        username: "dashboard_user",
        password: "dashboard_password"
    });

    client.on("connect", () => {
        console.log("✅ MQTT Connected (Dashboard)");
        // Subscribe to all relevant topics
        client.subscribe("restaurant/snmimt/alerts");
        client.subscribe("restaurant/snmimt/tables/+/status");
    });

    client.on("message", (topic, message) => {
        try {
            const data = JSON.parse(message.toString());
            // Notify all registered listeners with topic and data
            listeners.forEach(callback => callback(topic, data));
        } catch (error) {
            console.error("Failed to parse MQTT message:", error);
        }
    });

    client.on("error", (err) => {
        console.error("MQTT Error:", err);
    });
}

export function onMQTTMessage(callback) {
    listeners.push(callback);
    // Ensure connection is established
    if (!client) connectMQTT();

    // Return cleanup function
    return () => {
        const index = listeners.indexOf(callback);
        if (index > -1) {
            listeners.splice(index, 1);
        }
    };
}
