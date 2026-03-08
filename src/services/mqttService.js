import mqtt from "mqtt";

let client = null;
let connected = false;

// Message queue: stores messages that arrive before connection is ready
const pendingQueue = [];
const listeners = [];

export function connectMQTT() {
    if (client) return client;

    const brokerUrl = import.meta.env.VITE_MQTT_BROKER_URL || "wss://broker.hivemq.com:8884/mqtt";
    const options = {
        clientId: "dashboard_" + Math.random().toString(16).substr(2, 8),
        username: import.meta.env.VITE_MQTT_USERNAME,
        password: import.meta.env.VITE_MQTT_PASSWORD,
        reconnectPeriod: 5000,
        connectTimeout: 10000,
        clean: true,
    };

    client = mqtt.connect(brokerUrl, options);

    client.on("connect", () => {
        console.log("✅ MQTT Connected - Subscribed to restaurant/#");
        connected = true;
        client.subscribe("restaurant/#");

        // Flush any messages that were queued before connection was ready
        if (pendingQueue.length > 0) {
            console.log(`📬 Flushing ${pendingQueue.length} queued MQTT message(s)...`);
            pendingQueue.forEach(({ topic, message }) => {
                client.publish(topic, message, { qos: 1 });
                console.log(`📤 Flushed to ${topic}`);
            });
            pendingQueue.length = 0; // Clear the queue
        }
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
    const message = typeof data === 'string' ? data : JSON.stringify(data);

    if (!client || !connected) {
        // Queue the message instead of dropping it silently
        console.warn(`⏳ MQTT not ready — queuing message for topic: ${topic}`);
        pendingQueue.push({ topic, message });
        return;
    }

    client.publish(topic, message, { qos: 1 });
    console.log(`📤 Published to ${topic}:`, data);
}

const mqttService = {
    connect: connectMQTT,
    onMessage: onMQTTMessage,
    publish: publishMQTT
};

export default mqttService;
