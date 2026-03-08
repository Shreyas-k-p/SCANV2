import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { extractGradientContent } from '../utils/gradientUtils';
import { publishMQTT } from '../services/mqttService';
import './WaiterDashboard.css';

import LanguageSwitcher from '../components/LanguageSwitcher';
import BillPrint from '../components/BillPrint';

export default function WaiterDashboard() {
    const { tables, orders, updateOrderStatus, updateTableStatus, clearTableCall, t, user, deleteOrder, fetchData } = useApp();
    const readyOrdersCount = orders.filter(o => o.status === 'ready').length;
    const prevReadyCountRef = useRef(0);

    // Count ready orders and Table Calls for notifications
    useEffect(() => {
        const readyCount = orders.filter(o => o.status === 'ready').length;
        const callingCount = tables.filter(t => t.isCalling).length;

        // Trigger notification if ready orders increased
        if (readyCount > prevReadyCountRef.current && readyCount > 0) {
            if ('vibrate' in navigator) navigator.vibrate([200, 100, 200]);
        }

        // Trigger notification for Table Calls
        if (callingCount > 0) {
            // Play notification sound
            try {
                const ctx = new (window.AudioContext || window.webkitAudioContext)();
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.frequency.value = 440;
                gain.gain.setValueAtTime(0.1, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1);
                osc.start();
                osc.stop(ctx.currentTime + 1);
            } catch (e) { }
        }

        prevReadyCountRef.current = readyCount;
    }, [orders, tables]);

    const [showBillPrint, setShowBillPrint] = useState(false);
    const [selectedTable, setSelectedTable] = useState(null);
    const [billedOrders, setBilledOrders] = useState([]);

    const getTableOrders = (tableNo) => orders.filter(o => String(o.tableNo) === String(tableNo) && o.status !== 'completed' && o.status !== 'cancelled');

    const tableColors = [
        'linear-gradient(135deg, #e94560 0%, #ff5c7a 100%)',
        'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)',
        'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)',
        'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
        'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
        'linear-gradient(135deg, #ec4899 0%, #f472b6 100%)',
        'linear-gradient(135deg, #f97316 0%, #fb923c 100%)'
    ];

    const handleServeOrder = async (orderId) => {
        if (confirm("Confirm this order has been served?")) {
            await updateOrderStatus(orderId, 'served');

            const order = orders.find(o => o.id === orderId);
            if (order) {
                publishMQTT(`restaurant/snmimt/table/${order.tableNo}`, {
                    type: "ORDER_SERVED",
                    table_id: String(order.tableNo),
                    order_id: order.id
                });
            }
        }
    };

    const handleBillTable = async (table) => {
        if (confirm(`Generate bill for Table ${table.tableNo}? This will lock the table for customers.`)) {
            const tableOrders = getTableOrders(table.tableNo);
            const totalAmount = tableOrders.reduce((sum, o) => sum + o.totalAmount, 0);

            // Capture the current session orders BEFORE marking them completed
            setBilledOrders(tableOrders);

            // Mark orders as completed so they disappear from the active view
            await Promise.all(tableOrders.map(o => updateOrderStatus(o.id, 'completed')));

            publishMQTT(`restaurant/snmimt/table/${table.tableNo}`, {
                type: "PAYMENT_REQUEST",
                table_id: String(table.tableNo),
                total: totalAmount
            });

            // Refresh UI
            fetchData();

            // Automatically open print modal
            setSelectedTable(table);
            setShowBillPrint(true);
        }
    };

    const handleClearTable = (table) => {
        // Capture only the current active orders for this table
        const tableOrders = getTableOrders(table.tableNo);
        setBilledOrders(tableOrders);
        // Show bill print dialog
        setSelectedTable(table);
        setShowBillPrint(true);
    };

    const handleConfirmClear = async () => {
        if (selectedTable) {
            // Mark all orders as completed
            const tableOrders = getTableOrders(selectedTable.tableNo);
            for (const order of tableOrders) {
                await updateOrderStatus(order.id, 'completed');
                // Small delay to prevent rate limiting
                await new Promise(r => setTimeout(r, 200));
            }
            // Clear the table - Set to 'available'
            await updateTableStatus(selectedTable.docId, 'available');

            publishMQTT(`restaurant/snmimt/table/${selectedTable.tableNo}`, {
                type: "THANK_YOU",
                table_id: String(selectedTable.tableNo)
            });

            // Force clear/resync after mass updates
            fetchData();

            setShowBillPrint(false);
            setSelectedTable(null);
        }
    };

    const handleDeleteRecord = async () => {
        if (selectedTable) {
            const tableOrders = getTableOrders(selectedTable.tableNo);
            // Delete all orders for this table
            for (const order of tableOrders) {
                await deleteOrder(order.id);
                // Small delay to prevent rate limiting
                await new Promise(r => setTimeout(r, 200));
            }
            // Reset table to active
            await updateTableStatus(selectedTable.docId, 'available');

            // Force clear/resync after mass updates
            fetchData();

            setShowBillPrint(false);
            setSelectedTable(null);
        }
    };

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
                        👨‍🍳 {t('waiter')} {t('dashboard')}
                    </h1>
                    {readyOrdersCount > 0 && (
                        <div style={{
                            position: 'absolute',
                            top: '-10px',
                            right: '-10px',
                            background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
                            color: 'white',
                            borderRadius: '50%',
                            width: '50px',
                            height: '50px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: '800',
                            fontSize: '1.2rem',
                            boxShadow: '0 4px 15px rgba(16, 185, 129, 0.5)',
                            animation: 'pulse 2s ease-in-out infinite',
                            border: '3px solid white'
                        }}>
                            {readyOrdersCount}
                        </div>
                    )}
                </div>
                <div style={{ float: 'right' }}>
                    <LanguageSwitcher />
                </div>
            </div>
            <div className="card-grid" style={{ marginTop: '20px', gap: '1.5rem' }}>
                {tables.map((tableObj, idx) => {
                    const tableNo = tableObj.tableNo;
                    const tableOrders = getTableOrders(tableNo);
                    const hasOrders = tableOrders.length > 0;
                    const tableColor = tableColors[idx % tableColors.length];

                    return (
                        <div
                            key={tableObj.docId || idx}
                            className={tableObj.isCalling ? 'calling-flash' : ''}
                            style={{
                                padding: '1.5rem',
                                border: (hasOrders || tableObj.isCalling) ? `3px solid` : '2px solid var(--border-color)',
                                borderImage: (hasOrders || tableObj.isCalling) ? `linear-gradient(135deg, ${extractGradientContent(tableObj.isCalling ? '#ff0000' : tableColor)}) 1` : 'none',
                                background: tableObj.isCalling
                                    ? 'linear-gradient(135deg, rgba(255, 0, 0, 0.1), var(--card-bg))'
                                    : hasOrders
                                        ? `linear-gradient(135deg, ${extractGradientContent(tableColor)}15, var(--card-bg))`
                                        : 'var(--glass-bg)',
                                position: 'relative',
                                overflow: 'visible',
                                backdropFilter: 'blur(15px) saturate(180%)',
                                WebkitBackdropFilter: 'blur(15px) saturate(180%)',
                                boxShadow: tableObj.isCalling ? '0 0 30px rgba(255, 0, 0, 0.4)' : 'var(--shadow-md)',
                                borderRadius: '20px',
                                transition: 'all 0.3s ease',
                                cursor: 'default'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-4px)';
                                e.currentTarget.style.boxShadow = '0 20px 50px rgba(0,0,0,0.28)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = 'var(--shadow-md)';
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
                                        width: '50px',
                                        height: '50px',
                                        borderRadius: '12px',
                                        background: tableColor,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'white',
                                        fontWeight: '800',
                                        fontSize: '1.25rem',
                                        boxShadow: `0 4px 15px ${extractGradientContent(tableColor)}40`
                                    }}>
                                        {tableNo}
                                    </div>
                                    <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700' }}>
                                        Table {tableNo}
                                    </h2>
                                </div>
                                {tableObj.isCalling && (
                                    <span style={{
                                        background: '#ff0000',
                                        color: 'white',
                                        padding: '4px 12px',
                                        borderRadius: '20px',
                                        fontWeight: '800',
                                        fontSize: '0.8rem',
                                        animation: 'pulse 1s infinite'
                                    }}>
                                        🚨 CALLING
                                    </span>
                                )}
                                {!tableObj.isCalling && hasOrders && tableObj.status !== 'billed' && (
                                    <span className="badge badge-warning" style={{ animation: 'pulse 2s ease-in-out infinite' }}>
                                        🔔 Active
                                    </span>
                                )}
                                {tableObj.status === 'billed' && (
                                    <span className="badge" style={{ background: 'var(--accent)', color: 'white' }}>
                                        💰 Billed
                                    </span>
                                )}
                            </div>

                            {hasOrders && tableObj.status !== 'billed' ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {tableOrders.map(order => (
                                        <div
                                            key={order.id}
                                            style={{
                                                background: order.status === 'ready'
                                                    ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(52, 211, 153, 0.15) 100%)'
                                                    : 'linear-gradient(135deg, rgba(233, 69, 96, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)',
                                                padding: '1rem',
                                                borderRadius: '12px',
                                                border: order.status === 'ready'
                                                    ? '3px solid #10b981'
                                                    : '2px solid var(--accent-light)',
                                                transition: 'all 0.3s ease',
                                                boxShadow: order.status === 'ready'
                                                    ? '0 0 20px rgba(16, 185, 129, 0.4)'
                                                    : 'none',
                                                animation: order.status === 'ready'
                                                    ? 'pulse 2s ease-in-out infinite'
                                                    : 'none'
                                            }}
                                        >
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                                                <span style={{
                                                    fontWeight: '700',
                                                    fontSize: '1rem',
                                                    color: 'var(--accent)'
                                                }}>
                                                    Order #{order.id.slice(-4)}
                                                </span>
                                                <BadgeStatus status={order.status} />
                                            </div>
                                            <ul style={{
                                                margin: '0.5rem 0',
                                                paddingLeft: '20px',
                                                color: 'var(--text-light)',
                                                listStyle: 'none'
                                            }}>
                                                {order.items.map((it, idx) => (
                                                    <li key={idx} style={{
                                                        marginBottom: '0.5rem',
                                                        padding: '0.5rem',
                                                        background: 'var(--glass-bg)',
                                                        borderRadius: '8px',
                                                        fontSize: '0.9rem',
                                                        fontWeight: '500',
                                                        color: 'var(--text-light)'
                                                    }}>
                                                        🍽️ {it.name} x{it.quantity}
                                                    </li>
                                                ))}
                                            </ul>
                                            {order.status === 'ready' && (
                                                <button
                                                    className="btn-serve"
                                                    style={{ width: '100%', marginTop: '0.75rem', justifyContent: 'center' }}
                                                    onClick={() => handleServeOrder(order.id)}
                                                >
                                                    ✅ {t('markServed')}
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div style={{
                                    textAlign: 'center',
                                    padding: '2rem 1rem',
                                    color: 'var(--text-dim)',
                                    fontStyle: 'italic',
                                    fontSize: '1.1rem',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '1rem'
                                }}>
                                    {tableObj.status === 'billed' ? (
                                        <>
                                            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--accent)' }}>
                                                💰 Payment Pending
                                            </div>
                                            <button
                                                className="btn"
                                                onClick={() => {
                                                    setSelectedTable(tableObj);
                                                    setShowBillPrint(true);
                                                }}
                                                style={{
                                                    background: 'var(--card-bg)',
                                                    border: '2px solid var(--accent)',
                                                    color: 'var(--text-light)',
                                                    padding: '0.5rem 1rem',
                                                    borderRadius: '8px',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.5rem',
                                                    marginTop: '0.5rem'
                                                }}
                                            >
                                                📄 Show/Print Bill
                                            </button>
                                        </>
                                    ) : (
                                        '🪑 Table Available'
                                    )}
                                </div>
                            )}

                            {/* Table Actions */}
                            <div style={{ marginTop: '1.5rem', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                {tableObj.isCalling && (
                                    <button
                                        className="btn"
                                        style={{
                                            flex: 1,
                                            background: 'linear-gradient(135deg, #ff0000, #cc0000)',
                                            color: 'white',
                                            fontWeight: '800',
                                            padding: '0.8rem',
                                            borderRadius: '12px',
                                            border: 'none',
                                            cursor: 'pointer'
                                        }}
                                        onClick={() => clearTableCall(tableObj.docId)}
                                    >
                                        ✋ Close Call
                                    </button>
                                )}
                                {hasOrders && (
                                    <>
                                        <button
                                            className="btn-bill"
                                            style={{ flex: 1, justifyContent: 'center' }}
                                            onClick={() => handleBillTable(tableObj)}
                                        >
                                            🧾 Bill
                                        </button>
                                        <button
                                            className="btn-serve"
                                            style={{ flex: 1, justifyContent: 'center' }}
                                            onClick={() => handleClearTable(tableObj)}
                                        >
                                            ✅ Paid & Clear
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            <style>{`
                .calling-flash {
                    animation: flash 1s infinite alternate;
                }
                @keyframes flash {
                    from { border-color: #ff0000; box-shadow: 0 0 10px rgba(255, 0, 0, 0.2); }
                    to { border-color: #ff5555; box-shadow: 0 0 30px rgba(255, 0, 0, 0.6); }
                }
            `}</style>

            {/* Bill Print Modal */}
            {showBillPrint && selectedTable && (
                <BillPrint
                    table={selectedTable}
                    orders={billedOrders}
                    onClose={() => {
                        setShowBillPrint(false);
                        setSelectedTable(null);
                        setBilledOrders([]);
                    }}
                    onConfirmClear={handleConfirmClear}
                    onDelete={handleDeleteRecord}
                />
            )}
        </div>
    );
}

function BadgeStatus({ status }) {
    const color = status === 'pending' ? 'badge-warning' : status === 'ready' ? 'badge-success' : 'badge-error';
    return <span className={`badge ${color}`}>{status.toUpperCase()}</span>;
}
