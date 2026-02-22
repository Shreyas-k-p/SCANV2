import React, { useEffect, useState, useCallback } from "react";
import mqtt from "mqtt";
import { useParams } from "react-router-dom";
import "./CustomerScreen.css";

// ─── Status config ────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
    WELCOME: {
        icon: "🍽️",
        label: "Welcome!",
        message: "Scan the QR code to place your order",
        bg: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
        accent: "#e94560",
        pulse: false,
    },
    ORDER_PLACED: {
        icon: "🧾",
        label: "Order Placed",
        message: "Your order has been placed successfully",
        bg: "linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)",
        accent: "#00d2ff",
        pulse: false,
    },
    PREPARING: {
        icon: "👨‍🍳",
        label: "Preparing",
        message: "Chef is preparing your food with love",
        bg: "linear-gradient(135deg, #f7971e 0%, #ffd200 100%)",
        accent: "#fff",
        pulse: true,
    },
    ORDER_READY: {
        icon: "🔔",
        label: "Order Ready!",
        message: "Your order is ready — please collect it",
        bg: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
        accent: "#fff",
        pulse: true,
    },
    ORDER_SERVED: {
        icon: "🍛",
        label: "Enjoy Your Meal",
        message: "Food served — bon appétit!",
        bg: "linear-gradient(135deg, #4776e6 0%, #8e54e9 100%)",
        accent: "#fff",
        pulse: false,
    },
    PAYMENT_REQUEST: {
        icon: "💳",
        label: "Payment Requested",
        message: "Please make payment to your waiter",
        bg: "linear-gradient(135deg, #c94b4b 0%, #4b134f 100%)",
        accent: "#ffd700",
        pulse: true,
    },
    THANK_YOU: {
        icon: "🙏",
        label: "Thank You!",
        message: "Thank you for visiting — see you again!",
        bg: "linear-gradient(135deg, #1f4037 0%, #99f2c8 100%)",
        accent: "#fff",
        pulse: false,
    },
};

// ─── Web Audio beep (no MP3 file needed, works on all devices) ─────────────
function playBeep(type = "ORDER_READY") {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();

        const configs = {
            ORDER_PLACED: [{ freq: 520, dur: 0.12 }, { freq: 660, dur: 0.18 }],
            PREPARING: [{ freq: 440, dur: 0.15 }],
            ORDER_READY: [{ freq: 880, dur: 0.15 }, { freq: 880, dur: 0.15 }, { freq: 1100, dur: 0.25 }],
            ORDER_SERVED: [{ freq: 660, dur: 0.2 }, { freq: 880, dur: 0.2 }],
            PAYMENT_REQUEST: [{ freq: 330, dur: 0.2 }, { freq: 330, dur: 0.2 }, { freq: 440, dur: 0.3 }],
            THANK_YOU: [{ freq: 660, dur: 0.15 }, { freq: 880, dur: 0.25 }],
        };

        const tones = configs[type] || configs["ORDER_READY"];
        let time = ctx.currentTime;

        tones.forEach(({ freq, dur }) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.frequency.value = freq;
            osc.type = "sine";
            gain.gain.setValueAtTime(0.4, time);
            gain.gain.exponentialRampToValueAtTime(0.001, time + dur);
            osc.start(time);
            osc.stop(time + dur);
            time += dur + 0.05;
        });
    } catch (e) {
        console.warn("Audio not available:", e);
    }
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function CustomerScreen() {
    const { id } = useParams();
    const tableId = id || "T01";

    const [statusKey, setStatusKey] = useState("WELCOME");
    const [orderData, setOrderData] = useState(null);
    const [flash, setFlash] = useState(false);
    const [connected, setConnected] = useState(false);
    const [lastUpdate, setLastUpdate] = useState(null);
    const [isFullscreen, setIsFullscreen] = useState(false);

    const config = STATUS_CONFIG[statusKey] || STATUS_CONFIG.WELCOME;

    // ─── Flash helper ──────────────────────────────────────────────────────────
    const triggerFlash = useCallback(() => {
        setFlash(true);
        setTimeout(() => setFlash(false), 1000);
    }, []);

    // ─── MQTT ──────────────────────────────────────────────────────────────────
    useEffect(() => {
        const url = "wss://y12dbb61.ala.asia-southeast1.emqxsl.com:8084/mqtt";

        const options = {
            username: "dashboard_user",
            password: "dashboard_password",
            clientId: "web_" + Math.random().toString(16).substr(2, 8),
            clean: true,
            reconnectPeriod: 2000,
            connectTimeout: 4000,
        };

        console.log("🔌 Connecting to MQTT...");
        const client = mqtt.connect(url, options);

        client.on("connect", () => {
            console.log("✅ MQTT Connected");
            setConnected(true);
            const topic = `restaurant/snmimt/table/${tableId}`;
            client.subscribe(topic, (err) => {
                if (err) {
                    console.error("❌ Subscribe error:", err);
                } else {
                    console.log("📡 Subscribed to:", topic);
                }
            });
        });

        client.on("message", (_topic, message) => {
            console.log("📥 Message received:", message.toString());
            try {
                const data = JSON.parse(message.toString());
                setOrderData(data);
                setStatusKey(data.type || "WELCOME");
                setLastUpdate(new Date().toLocaleTimeString());
                triggerFlash();
                playBeep(data.type);
            } catch (e) {
                console.error("❌ JSON parse error:", e);
            }
        });

        client.on("error", (err) => {
            console.error("MQTT Error:", err);
            setConnected(false);
        });

        client.on("reconnect", () => {
            console.log("🔄 Reconnecting...");
            setConnected(false);
        });

        return () => {
            client.end();
        };
    }, [tableId, triggerFlash]);

    // ─── Fullscreen listener ───────────────────────────────────────────────────
    useEffect(() => {
        const handler = () => setIsFullscreen(!!document.fullscreenElement);
        document.addEventListener("fullscreenchange", handler);
        return () => document.removeEventListener("fullscreenchange", handler);
    }, []);

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(console.error);
        } else {
            document.exitFullscreen();
        }
    };

    // ─── Render ────────────────────────────────────────────────────────────────
    return (
        <div
            className={`cs-root ${flash ? "cs-flash" : ""}`}
            style={{ background: config.bg }}
        >
            {/* Top bar */}
            <div className="cs-topbar">
                <span className={`cs-dot ${connected ? "cs-dot--on" : "cs-dot--off"}`} />
                <span className="cs-dot-label">
                    {connected ? "Live" : "Connecting…"}
                </span>
                <span className="cs-table-badge">Table {tableId}</span>
                <button
                    className="cs-fullscreen-btn"
                    onClick={toggleFullscreen}
                    title="Toggle Fullscreen"
                >
                    {isFullscreen ? "⊠" : "⛶"}
                </button>
            </div>

            {/* Main card */}
            <div className={`cs-card ${config.pulse ? "cs-card--pulse" : ""}`}>
                {/* Icon */}
                <div className={`cs-icon ${statusKey === "ORDER_READY" || statusKey === "PAYMENT_REQUEST" ? "cs-icon--bounce" : ""}`}>
                    {config.icon}
                </div>

                {/* Status label */}
                <h1 className="cs-label" style={{ color: config.accent }}>
                    {config.label}
                </h1>

                {/* Message */}
                <p className="cs-message">{config.message}</p>

                {/* Order details */}
                {orderData && orderData.order_id && (
                    <div className="cs-details">
                        {orderData.order_id && (
                            <div className="cs-detail-row">
                                <span className="cs-detail-key">Order ID</span>
                                <span className="cs-detail-val">#{orderData.order_id}</span>
                            </div>
                        )}
                        {orderData.total && (
                            <div className="cs-detail-row">
                                <span className="cs-detail-key">Total</span>
                                <span className="cs-detail-val cs-total">₹{orderData.total}</span>
                            </div>
                        )}
                        {orderData.items && orderData.items.length > 0 && (
                            <div className="cs-items">
                                {orderData.items.map((item, i) => (
                                    <span key={i} className="cs-item-chip">
                                        {item.name || item} {item.qty ? `×${item.qty}` : ""}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Divider */}
                <div className="cs-divider" />

                {/* Last update */}
                {lastUpdate && (
                    <p className="cs-update-time">Last updated at {lastUpdate}</p>
                )}
            </div>

            {/* Full screen prompt */}
            {statusKey === "WELCOME" && (
                <button className="cs-fullscreen-cta" onClick={toggleFullscreen}>
                    ⛶ Tap for Full Screen
                </button>
            )}

            {/* Restaurant branding */}
            <div className="cs-footer">Powered by Scan4Serve</div>
        </div>
    );
}
