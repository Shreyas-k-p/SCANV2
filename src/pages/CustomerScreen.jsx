import React, { useEffect, useState, useCallback, useRef } from "react";
import { useParams } from "react-router-dom";
import { databases, APPWRITE_CONFIG, Query, client } from "../lib/appwrite";
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
    PENDING: {
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
    READY: {
        icon: "🔔",
        label: "Order Ready!",
        message: "Your order is ready — please collect it",
        bg: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
        accent: "#fff",
        pulse: true,
    },
    DELIVERED: {
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
    COMPLETED: {
        icon: "🙏",
        label: "Thank You!",
        message: "Thank you for visiting — see you again!",
        bg: "linear-gradient(135deg, #1f4037 0%, #99f2c8 100%)",
        accent: "#fff",
        pulse: false,
    },
};

// ─── Web Audio beep (no MP3 file needed, works on all devices) ─────────────
function playBeep(type = "READY") {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();

        const configs = {
            PENDING: [{ freq: 520, dur: 0.12 }, { freq: 660, dur: 0.18 }],
            PREPARING: [{ freq: 440, dur: 0.15 }],
            READY: [{ freq: 880, dur: 0.15 }, { freq: 880, dur: 0.15 }, { freq: 1100, dur: 0.25 }],
            DELIVERED: [{ freq: 660, dur: 0.2 }, { freq: 880, dur: 0.2 }],
            PAYMENT_REQUEST: [{ freq: 330, dur: 0.2 }, { freq: 330, dur: 0.2 }, { freq: 440, dur: 0.3 }],
            COMPLETED: [{ freq: 660, dur: 0.15 }, { freq: 880, dur: 0.25 }],
        };

        const tones = configs[type] || configs["READY"];
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
    const { tableNo } = useParams();
    const tableId = tableNo || "T01";

    const [statusKey, setStatusKey] = useState("WELCOME");
    const [orderData, setOrderData] = useState(null);
    const [flash, setFlash] = useState(false);
    const [connected, setConnected] = useState(false);
    const [lastUpdate, setLastUpdate] = useState(null);
    const [isFullscreen, setIsFullscreen] = useState(false);

    const config = STATUS_CONFIG[statusKey.toUpperCase()] || STATUS_CONFIG.WELCOME;
    const prevStatusRef = useRef(null);

    // ─── Flash helper ──────────────────────────────────────────────────────────
    const triggerFlash = useCallback(() => {
        setFlash(true);
        setTimeout(() => setFlash(false), 1000);
    }, []);

    // ─── Appwrite Realtime Logic ──────────────────────────────────────────────
    useEffect(() => {
        const dbId = APPWRITE_CONFIG.DATABASE_ID;
        const collectionId = APPWRITE_CONFIG.COLLECTIONS.ORDERS;

        const findActiveOrder = async () => {
            try {
                const response = await databases.listDocuments(
                    dbId,
                    collectionId,
                    [
                        Query.equal("tableNumber", String(tableId)),
                        Query.orderDesc("$createdAt"),
                        Query.limit(1)
                    ]
                );

                if (response.documents.length > 0) {
                    const order = response.documents[0];
                    // If order is old (e.g. completed more than 1 hour ago), ignore it
                    const orderDate = new Date(order.createdAt);
                    if (order.status === 'completed' && (new Date() - orderDate > 3600000)) {
                        setStatusKey("WELCOME");
                        setOrderData(null);
                    } else {
                        processOrderUpdate(order);
                    }
                }
                setConnected(true);
            } catch (err) {
                console.error("❌ Error fetching order:", err);
            }
        };

        const processOrderUpdate = (order) => {
            const status = order.status.toUpperCase();

            // Only trigger notifications if status actually changed
            if (status !== prevStatusRef.current) {
                setStatusKey(status);
                setOrderData({
                    order_id: order.$id,
                    total: order.total_amount || 0,
                    items: typeof order.items === 'string' ? JSON.parse(order.items || "[]") : (order.items || []),
                    status: order.status
                });
                setLastUpdate(new Date().toLocaleTimeString());

                if (prevStatusRef.current !== null) {
                    triggerFlash();
                    playBeep(status);
                }
                prevStatusRef.current = status;
            }
        };

        findActiveOrder();

        // Subscribe to changes in the orders collection
        const channel = `databases.${dbId}.collections.${collectionId}.documents`;
        const unsubscribe = client.subscribe(channel, (response) => {
            const order = response.payload;
            if (String(order.tableNumber) === String(tableId)) {
                console.log("🔥 Order Updated via Realtime:", order.status);
                processOrderUpdate(order);
            }
        });

        return () => {
            unsubscribe();
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
                <div className={`cs-icon ${statusKey === "READY" || statusKey === "PAYMENT_REQUEST" ? "cs-icon--bounce" : ""}`}>
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
                                <span className="cs-detail-val">#{orderData.order_id.slice(-6).toUpperCase()}</span>
                            </div>
                        )}
                        {orderData.total > 0 && (
                            <div className="cs-detail-row">
                                <span className="cs-detail-key">Total</span>
                                <span className="cs-detail-val cs-total">₹{orderData.total}</span>
                            </div>
                        )}
                        {orderData.items && orderData.items.length > 0 && (
                            <div className="cs-items">
                                {orderData.items.map((item, i) => (
                                    <span key={i} className="cs-item-chip">
                                        {item.name || item} {item.quantity ? `×${item.quantity}` : ""}
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
