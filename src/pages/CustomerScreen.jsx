import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import mqtt from "mqtt";
import "./CustomerScreen.css";

const MQTT_HOST = "wss://y12dbb61.ala.asia-southeast1.emqxsl.com:8084/mqtt";
const MQTT_USERNAME = "dashboard_user";
const MQTT_PASSWORD = "dashboard_password";

export default function CustomerScreen() {
    const { id } = useParams();
    const tableId = id || "T01";

    const [status, setStatus] = useState("WELCOME");
    const [orderId, setOrderId] = useState(null);
    const [total, setTotal] = useState(null);

    // 🔊 sound effects
    const playSound = (type) => {
        try {
            const audio = new Audio(`/sounds/${type}.mp3`);
            audio.play().catch((err) => console.log("Audio play failed (interaction needed first):", err));
        } catch (e) {
            console.error("Audio error", e);
        }
    };

    // 🎨 color mapping (Tailwind-like colors)
    const getStatusColor = () => {
        switch (status) {
            case "ORDER_PLACED":
                return "#2563eb"; // blue-600
            case "PREPARING":
                return "#eab308"; // yellow-500
            case "ORDER_READY":
                return "#16a34a"; // green-600
            case "ORDER_SERVED":
                return "#9333ea"; // purple-600
            case "PAYMENT_REQUEST":
                return "#ea580c"; // orange-600
            case "THANK_YOU":
                return "#1f2937"; // gray-800
            default:
                return "#374151"; // gray-700
        }
    };

    const getMessage = () => {
        switch (status) {
            case "ORDER_PLACED":
                return `Order #${orderId || ''} placed successfully`;
            case "PREPARING":
                return "Your food is being prepared 👨‍🍳";
            case "ORDER_READY":
                return "Your order is ready! 🍽️";
            case "ORDER_SERVED":
                return "Food served. Enjoy your meal 😋";
            case "PAYMENT_REQUEST":
                return `Please pay ₹${total}`;
            case "THANK_YOU":
                return "Thank you! Visit again ❤️";
            default:
                return "Welcome! Scan to order 📱";
        }
    };

    // 🔌 MQTT Connection
    useEffect(() => {
        // Add randomness to clientId to prevent conflicts
        const clientId = `cust_${tableId}_${Math.random().toString(16).substr(2, 6)}`;
        const client = mqtt.connect(MQTT_HOST, {
            username: MQTT_USERNAME,
            password: MQTT_PASSWORD,
            clientId,
            reconnectPeriod: 1000,
        });

        const topic = `restaurant/snmimt/table/${tableId}`;

        client.on("connect", () => {
            console.log("Customer MQTT connected");
            client.subscribe(topic);
        });

        client.on("message", (_, message) => {
            try {
                const data = JSON.parse(message.toString());
                console.log("Customer received:", data);

                // Update state based on message type
                // Some messages might rely on existing status or be transient, 
                // but here we just set status to type.
                setStatus(data.type);

                if (data.order_id) setOrderId(data.order_id);
                if (data.total) setTotal(data.total);

                // 🔊 play sound
                playSound(data.type);
            } catch (e) {
                console.log("Invalid message", e);
            }
        });

        return () => {
            client.end();
        };
    }, [tableId]);

    return (
        <div
            className="customer-screen"
            style={{ backgroundColor: getStatusColor() }}
        >
            <div className="screen-content">
                <h1 className="table-title">Table {tableId}</h1>

                <div className="status-message">
                    {getMessage()}
                </div>

                {status === "ORDER_PLACED" && (
                    <p className="sub-text">We have received your order</p>
                )}

                {status === "PREPARING" && (
                    <div className="cooking-text">🔥 Cooking...</div>
                )}

                {status === "ORDER_READY" && (
                    <div className="ready-text">
                        🚨 Please collect your food
                    </div>
                )}

                {status === "PAYMENT_REQUEST" && (
                    <div className="payment-text">
                        Scan QR or pay to waiter 💳
                    </div>
                )}
            </div>
        </div>
    );
}
