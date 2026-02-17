import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { extractGradientContent } from '../utils/gradientUtils';
import { publishMQTT } from '../services/mqttService';

import LanguageSwitcher from '../components/LanguageSwitcher';

export default function KitchenDashboard() {
    const { orders, updateOrderStatus, menuItems, updateMenuItemStatus, t, user } = useApp();
    const [activeTab, setActiveTab] = useState('orders'); // orders | menu
    const [newOrdersCount, setNewOrdersCount] = useState(0);

    const activeOrders = orders.filter(o => o.status !== 'completed').sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    const pendingOrders = orders.filter(o => o.status === 'pending');

    // Notification for new orders
    useEffect(() => {
        const count = pendingOrders.length;

        // Trigger notification if count increased (new order arrived)
        if (count > newOrdersCount && count > 0) {
            // Play notification sound
            try {
                const audioContext = new (window.AudioContext || window.webkitAudioContext)();

                // Create urgent notification sound (higher pitch, faster)
                const oscillator1 = audioContext.createOscillator();
                const oscillator2 = audioContext.createOscillator();
                const gainNode = audioContext.createGain();

                oscillator1.connect(gainNode);
                oscillator2.connect(gainNode);
                gainNode.connect(audioContext.destination);

                // Urgent alarm sound (higher frequencies)
                oscillator1.frequency.value = 800; // High pitch
                oscillator2.frequency.value = 1000; // Even higher
                oscillator1.type = 'square'; // Sharp sound
                oscillator2.type = 'square';

                gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

                oscillator1.start(audioContext.currentTime);
                oscillator2.start(audioContext.currentTime);
                oscillator1.stop(audioContext.currentTime + 0.5);
                oscillator2.stop(audioContext.currentTime + 0.5);


            } catch (error) {
                console.error("Error playing notification sound:", error);
            }

            // Vibrate if supported
            if ('vibrate' in navigator) {
                // Urgent vibration pattern: long-short-long
                navigator.vibrate([400, 100, 400, 100, 400]);
            }


        }

        setNewOrdersCount(count);
    }, [orders]);

    return (
        <div style={{ padding: '2rem' }}>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '2rem',
                flexWrap: 'wrap',
                gap: '1rem'
            }}>
                <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '1rem',
                    padding: '0.75rem 1.5rem',
                    background: 'var(--gradient-accent)',
                    borderRadius: '16px',
                    boxShadow: 'var(--shadow-glow)',
                    position: 'relative'
                }}>
                    {user?.profilePhoto && (
                        <img
                            src={user.profilePhoto}
                            alt="Profile"
                            style={{
                                width: '60px',
                                height: '60px',
                                borderRadius: '50%',
                                objectFit: 'cover',
                                border: '3px solid white',
                                boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
                            }}
                        />
                    )}
                    <h1 style={{
                        margin: 0,
                        fontSize: '2.5rem',
                        fontWeight: '800',
                        color: '#ffffff',
                        letterSpacing: '-1px',
                        textShadow: '0 2px 10px rgba(0, 0, 0, 0.2)'
                    }}>
                        🍳 {t('kitchen')} {t('dashboard')}
                    </h1>
                    {/* New Orders Badge */}
                    {newOrdersCount > 0 && (
                        <div style={{
                            position: 'absolute',
                            top: '-10px',
                            right: '-10px',
                            background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
                            color: 'white',
                            borderRadius: '50%',
                            width: '45px',
                            height: '45px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.2rem',
                            fontWeight: '900',
                            boxShadow: '0 4px 15px rgba(245, 158, 11, 0.6)',
                            border: '3px solid white',
                            animation: 'pulse 2s ease-in-out infinite'
                        }}>
                            {newOrdersCount}
                        </div>
                    )}
                </div>
                <div style={{ float: 'right' }}>
                    <LanguageSwitcher />
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                        className={`btn ${activeTab === 'orders' ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setActiveTab('orders')}
                        style={{
                            borderRadius: '12px',
                            background: activeTab === 'orders'
                                ? 'var(--gradient-accent)'
                                : 'var(--card-bg)',
                            color: activeTab === 'orders' ? 'white' : 'var(--text-light)'
                        }}
                    >
                        📋 {t('activeOrders')}
                    </button>
                    <button
                        className={`btn ${activeTab === 'menu' ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setActiveTab('menu')}
                        style={{
                            borderRadius: '12px',
                            background: activeTab === 'menu'
                                ? 'var(--gradient-accent)'
                                : 'var(--card-bg)',
                            color: activeTab === 'menu' ? 'white' : 'var(--text-light)'
                        }}
                    >
                        🍽️ {t('manageMenu')}
                    </button>
                </div>
            </div>

            {activeTab === 'orders' ? (
                <div className="card-grid">
                    {activeOrders.length === 0 ? (
                        <div style={{
                            gridColumn: '1 / -1',
                            textAlign: 'center',
                            padding: '4rem 2rem',
                            color: 'var(--text-dim)'
                        }}>
                            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🍽️</div>
                            <p style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>{t('noOrders')}</p>
                            <p>All caught up! 🎉</p>
                        </div>
                    ) : (
                        activeOrders.map((order, idx) => {
                            const colors = [
                                'linear-gradient(135deg, #e94560 0%, #ff5c7a 100%)',
                                'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)',
                                'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)',
                                'linear-gradient(135deg, #10b981 0%, #34d399 100%)'
                            ];
                            const orderColor = colors[idx % colors.length];

                            return (
                                <div
                                    key={order.id}
                                    className="glass-panel"
                                    style={{
                                        padding: '1.5rem',
                                        borderLeft: `5px solid`,
                                        borderImage: `${orderColor} 1`,
                                        background: `linear-gradient(135deg, ${extractGradientContent(orderColor)}10, var(--card-bg))`,
                                        position: 'relative',
                                        animation: `fadeInUp 0.5s ease-out ${idx * 0.1}s both`
                                    }}
                                >
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        marginBottom: '1rem',
                                        paddingBottom: '1rem',
                                        borderBottom: '2px solid var(--accent-light)'
                                    }}>
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.75rem'
                                        }}>
                                            <div style={{
                                                width: '45px',
                                                height: '45px',
                                                borderRadius: '12px',
                                                background: orderColor,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: 'white',
                                                fontWeight: '800',
                                                fontSize: '1.1rem',
                                                boxShadow: `0 4px 15px ${extractGradientContent(orderColor)}40`
                                            }}>
                                                {order.tableNo}
                                            </div>
                                            <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700' }}>
                                                Table {order.tableNo}
                                            </h3>
                                        </div>
                                        <span style={{
                                            fontSize: '0.85rem',
                                            color: 'var(--text-dim)',
                                            fontWeight: '500'
                                        }}>
                                            {new Date(order.timestamp).toLocaleTimeString()}
                                        </span>
                                    </div>
                                    {order.customerInfo?.instructions && (
                                        <div style={{
                                            background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
                                            padding: '0.75rem 1rem',
                                            borderRadius: '10px',
                                            marginBottom: '1rem',
                                            fontSize: '0.9rem',
                                            color: '#fff',
                                            fontWeight: '600',
                                            boxShadow: '0 2px 10px rgba(245, 158, 11, 0.3)'
                                        }}>
                                            ⚠️ NOTE: {order.customerInfo.instructions}
                                        </div>
                                    )}
                                    <div style={{ marginBottom: '1.25rem' }}>
                                        {order.items.map((item, itemIdx) => (
                                            <div
                                                key={itemIdx}
                                                style={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    margin: '0.75rem 0',
                                                    padding: '0.75rem',
                                                    background: 'linear-gradient(135deg, rgba(233, 69, 96, 0.08) 0%, rgba(139, 92, 246, 0.08) 100%)',
                                                    borderRadius: '10px',
                                                    border: '1px solid var(--accent-light)'
                                                }}
                                            >
                                                <span style={{ fontWeight: '600', fontSize: '0.95rem' }}>
                                                    🍽️ {item.quantity}x {item.name}
                                                </span>
                                                {item.notes && (
                                                    <span style={{
                                                        color: 'var(--accent)',
                                                        fontSize: '0.8rem',
                                                        fontStyle: 'italic'
                                                    }}>
                                                        ({item.notes})
                                                    </span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    {['pending', 'preparing'].includes(order.status) ? (
                                        <button
                                            className="btn btn-primary"
                                            style={{
                                                width: '100%',
                                                padding: '0.875rem',
                                                fontSize: '1rem',
                                                fontWeight: '700'
                                            }}
                                            onClick={async () => {
                                                await updateOrderStatus(order.id, 'ready');
                                                publishMQTT({
                                                    type: "ORDER_READY",
                                                    table_id: order.tableNo,
                                                    order_id: order.id
                                                });
                                            }}
                                        >
                                            ✅ {t('markReady')}
                                        </button>
                                    ) : (
                                        <button
                                            className="btn btn-secondary"
                                            style={{
                                                width: '100%',
                                                background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
                                                color: 'white',
                                                border: 'none'
                                            }}
                                            disabled
                                        >
                                            ✓ Ready & Notified
                                        </button>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            ) : (
                <div className="card-grid">
                    {menuItems.map((item, idx) => (
                        <div
                            key={item.id}
                            className="glass-panel"
                            style={{
                                padding: '1.25rem',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                opacity: item.available ? 1 : 0.7,
                                background: item.available
                                    ? `linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, var(--card-bg) 100%)`
                                    : `linear-gradient(135deg, rgba(239, 68, 68, 0.05) 0%, var(--card-bg) 100%)`,
                                border: item.available
                                    ? '2px solid rgba(16, 185, 129, 0.2)'
                                    : '2px solid rgba(239, 68, 68, 0.2)',
                                animation: `fadeInUp 0.5s ease-out ${idx * 0.05}s both`
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flex: 1 }}>
                                <img
                                    src={item.image}
                                    style={{
                                        width: '70px',
                                        height: '70px',
                                        borderRadius: '12px',
                                        objectFit: 'cover',
                                        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
                                        border: '2px solid var(--accent-light)'
                                    }}
                                />
                                <div>
                                    <h4 style={{ margin: 0, marginBottom: '0.25rem', fontSize: '1.1rem', fontWeight: '700' }}>
                                        {item.name}
                                    </h4>
                                    <p style={{
                                        margin: 0,
                                        fontSize: '0.95rem',
                                        fontWeight: '600',
                                        background: 'var(--gradient-accent)',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                        backgroundClip: 'text'
                                    }}>
                                        ₹{item.price}
                                    </p>
                                </div>
                            </div>
                            <button
                                className={`btn ${item.available ? 'badge-error' : 'badge-success'}`}
                                onClick={() => updateMenuItemStatus(item.id, !item.available)}
                                style={{
                                    padding: '0.75rem 1.5rem',
                                    borderRadius: '12px',
                                    fontWeight: '700',
                                    fontSize: '0.9rem',
                                    whiteSpace: 'nowrap'
                                }}
                            >
                                {item.available ? `❌ ${t('soldOut')}` : `✅ ${t('available')}`}
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
