import React from 'react';
import { useApp } from '../context/AppContext';
import { extractGradientContent } from '../utils/gradientUtils';

import LanguageSwitcher from '../components/LanguageSwitcher';

export default function WaiterDashboard() {
    const { tables, orders, updateOrderStatus, updateTableStatus, t, user } = useApp();

    const getTableOrders = (tableNo) => orders.filter(o => String(o.tableNo) === String(tableNo) && o.status !== 'completed');

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
            await updateOrderStatus(orderId, 'completed');
        }
    };

    const handleBillTable = async (table) => {
        if (confirm(`Generate bill for Table ${table.tableNo}? This will lock the table for customers.`)) {
            await updateTableStatus(table.docId, 'billed');
        }
    };

    const handleClearTable = async (table) => {
        if (confirm(`Clear Table ${table.tableNo} and make it available?`)) {
            await updateTableStatus(table.docId, 'active');
        }
    };

    return (
        <div style={{ padding: '2rem' }}>
            <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '1rem',
                padding: '0.75rem 1.5rem',
                background: 'var(--gradient-accent)',
                borderRadius: '16px',
                marginBottom: '2rem',
                boxShadow: 'var(--shadow-glow)'
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
            </div>
            <div style={{ float: 'right' }}>
                <LanguageSwitcher />
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
                            className=""
                            style={{
                                padding: '1.5rem',
                                border: hasOrders ? `3px solid` : '2px solid var(--border-color)',
                                borderImage: hasOrders ? `linear-gradient(135deg, ${extractGradientContent(tableColor)}) 1` : 'none',
                                background: hasOrders
                                    ? `linear-gradient(135deg, ${extractGradientContent(tableColor)}15, var(--card-bg))`
                                    : 'var(--glass-bg)',
                                position: 'relative',
                                overflow: 'visible',
                                backdropFilter: 'blur(15px) saturate(180%)',
                                WebkitBackdropFilter: 'blur(15px) saturate(180%)',
                                boxShadow: 'var(--shadow-md)',
                                borderRadius: '20px'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
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
                                {hasOrders && tableObj.status !== 'billed' && (
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

                            {hasOrders ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {tableOrders.map(order => (
                                        <div
                                            key={order.id}
                                            style={{
                                                background: 'linear-gradient(135deg, rgba(233, 69, 96, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)',
                                                padding: '1rem',
                                                borderRadius: '12px',
                                                border: '2px solid var(--accent-light)',
                                                transition: 'all 0.3s ease'
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
                                                    className="btn "
                                                    style={{
                                                        width: '100%',
                                                        padding: '0.75rem',
                                                        marginTop: '0.75rem',
                                                        fontSize: '1rem',
                                                        fontWeight: '700',
                                                        background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: '12px'
                                                    }}
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
                                    fontSize: '1.1rem'
                                }}>
                                    {tableObj.status === 'billed' ? '💰 Payment Pending' : '🪑 Table Available'}
                                </div>
                            )}

                            {/* Table Actions */}
                            <div style={{ marginTop: '1.5rem', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                {tableObj.status !== 'billed' && hasOrders && (
                                    <button
                                        className="btn"
                                        style={{
                                            flex: 1,
                                            background: 'var(--accent)',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '12px',
                                            padding: '10px',
                                            fontWeight: '700'
                                        }}
                                        onClick={() => handleBillTable(tableObj)}
                                    >
                                        🧾 Bill
                                    </button>
                                )}
                                {tableObj.status === 'billed' && (
                                    <button
                                        className="btn"
                                        style={{
                                            flex: 1,
                                            background: '#10b981', // Green for cleared/paid
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '12px',
                                            padding: '10px',
                                            fontWeight: '700'
                                        }}
                                        onClick={() => handleClearTable(tableObj)}
                                    >
                                        ✅ Paid & Clear
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div >
    );
}

function BadgeStatus({ status }) {
    const color = status === 'pending' ? 'badge-warning' : status === 'ready' ? 'badge-success' : 'badge-error';
    return <span className={`badge ${color}`}>{status.toUpperCase()}</span>;
}
