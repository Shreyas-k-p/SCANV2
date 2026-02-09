import React from 'react';

const BillPrint = ({ table, orders, onClose, onConfirmClear, onDelete }) => {
    const calculateTotal = () => {
        return orders.reduce((total, order) => {
            return total + (order.totalAmount || 0);
        }, 0);
    };

    const handlePrint = () => {
        window.print();
    };

    const total = calculateTotal();
    const tax = total * 0.05; // 5% tax
    const grandTotal = total + tax;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '2rem'
        }}>
            <div style={{
                background: 'white',
                borderRadius: '20px',
                maxWidth: '600px',
                width: '100%',
                maxHeight: '90vh',
                overflow: 'auto',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
            }}>
                {/* Print Content */}
                <div id="bill-content" style={{
                    padding: '2.5rem',
                    color: '#000',
                    background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)'
                }}>
                    {/* Decorative Top Border */}
                    <div style={{
                        height: '8px',
                        background: 'linear-gradient(90deg, #e94560 0%, #8b5cf6 25%, #3b82f6 50%, #10b981 75%, #f59e0b 100%)',
                        borderRadius: '4px 4px 0 0',
                        marginBottom: '1.5rem'
                    }}></div>

                    {/* Header */}
                    <div style={{
                        textAlign: 'center',
                        borderBottom: '3px double #e94560',
                        paddingBottom: '1.5rem',
                        marginBottom: '2rem',
                        background: 'linear-gradient(135deg, #fff5f7 0%, #f0f9ff 100%)',
                        padding: '1.5rem',
                        borderRadius: '12px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                    }}>
                        <div style={{
                            fontSize: '3rem',
                            marginBottom: '0.5rem'
                        }}>🍽️</div>
                        <h1 style={{
                            margin: 0,
                            fontSize: '2.5rem',
                            fontWeight: '900',
                            background: 'linear-gradient(135deg, #e94560 0%, #8b5cf6 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                            letterSpacing: '2px'
                        }}>Scan4Serve</h1>
                        <p style={{
                            margin: '0.5rem 0 0 0',
                            fontSize: '1rem',
                            color: '#6b7280',
                            fontWeight: '600',
                            letterSpacing: '1px'
                        }}>
                            ✨ Smart Restaurant Management ✨
                        </p>
                        <div style={{
                            marginTop: '1rem',
                            padding: '0.5rem 1rem',
                            background: 'linear-gradient(135deg, #e94560 0%, #8b5cf6 100%)',
                            color: 'white',
                            borderRadius: '20px',
                            display: 'inline-block',
                            fontSize: '0.85rem',
                            fontWeight: '600'
                        }}>
                            📅 {new Date().toLocaleString('en-IN', {
                                dateStyle: 'medium',
                                timeStyle: 'short'
                            })}
                        </div>
                    </div>

                    {/* Table Info */}
                    <div style={{
                        background: 'linear-gradient(135deg, #e94560 0%, #8b5cf6 100%)',
                        padding: '1.5rem',
                        borderRadius: '16px',
                        marginBottom: '2rem',
                        textAlign: 'center',
                        boxShadow: '0 4px 15px rgba(233, 69, 96, 0.3)',
                        position: 'relative',
                        overflow: 'hidden'
                    }}>
                        {/* Decorative circles */}
                        <div style={{
                            position: 'absolute',
                            top: '-20px',
                            right: '-20px',
                            width: '80px',
                            height: '80px',
                            borderRadius: '50%',
                            background: 'rgba(255, 255, 255, 0.1)',
                        }}></div>
                        <div style={{
                            position: 'absolute',
                            bottom: '-30px',
                            left: '-30px',
                            width: '100px',
                            height: '100px',
                            borderRadius: '50%',
                            background: 'rgba(255, 255, 255, 0.1)',
                        }}></div>

                        <div style={{ position: 'relative', zIndex: 1 }}>
                            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🪑</div>
                            <h2 style={{
                                margin: 0,
                                fontSize: '2rem',
                                fontWeight: '800',
                                color: 'white',
                                textShadow: '0 2px 4px rgba(0,0,0,0.2)'
                            }}>Table {table.tableNo}</h2>
                        </div>
                    </div>

                    {/* Customer Info */}
                    {orders[0]?.customerInfo && (orders[0].customerInfo.name || orders[0].customerInfo.mobile) && (
                        <div style={{
                            marginBottom: '2rem',
                            padding: '1.25rem',
                            background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
                            borderRadius: '12px',
                            border: '2px solid #3b82f6',
                            borderLeft: '6px solid #3b82f6'
                        }}>
                            <div style={{
                                fontSize: '1rem',
                                fontWeight: '700',
                                color: '#1e40af',
                                marginBottom: '0.75rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}>
                                <span style={{ fontSize: '1.2rem' }}>👤</span>
                                Customer Details
                            </div>
                            {orders[0].customerInfo.name && (
                                <p style={{
                                    margin: '0.5rem 0',
                                    fontSize: '0.95rem',
                                    color: '#1e3a8a',
                                    fontWeight: '600'
                                }}>
                                    <strong>Name:</strong> {orders[0].customerInfo.name}
                                </p>
                            )}
                            {orders[0].customerInfo.mobile && (
                                <p style={{
                                    margin: '0.5rem 0',
                                    fontSize: '0.95rem',
                                    color: '#1e3a8a',
                                    fontWeight: '600'
                                }}>
                                    <strong>Mobile:</strong> {orders[0].customerInfo.mobile}
                                </p>
                            )}
                        </div>
                    )}

                    {/* Items */}
                    <div style={{ marginBottom: '2rem' }}>
                        <h3 style={{
                            margin: '0 0 1.25rem 0',
                            fontSize: '1.4rem',
                            fontWeight: '800',
                            color: '#1f2937',
                            borderBottom: '3px solid #10b981',
                            paddingBottom: '0.0.75rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}>
                            <span style={{ fontSize: '1.5rem' }}>📋</span>
                            Order Details
                        </h3>

                        <div style={{
                            background: 'white',
                            borderRadius: '12px',
                            overflow: 'hidden',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                            border: '2px solid #e5e7eb'
                        }}>
                            <table style={{
                                width: '100%',
                                borderCollapse: 'collapse'
                            }}>
                                <thead>
                                    <tr style={{
                                        background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
                                        color: 'white'
                                    }}>
                                        <th style={{
                                            padding: '1rem 0.75rem',
                                            fontSize: '0.9rem',
                                            fontWeight: '700',
                                            textAlign: 'left',
                                            borderRight: '1px solid rgba(255,255,255,0.2)'
                                        }}>Item</th>
                                        <th style={{
                                            padding: '1rem 0.75rem',
                                            fontSize: '0.9rem',
                                            fontWeight: '700',
                                            textAlign: 'center',
                                            borderRight: '1px solid rgba(255,255,255,0.2)'
                                        }}>Qty</th>
                                        <th style={{
                                            padding: '1rem 0.75rem',
                                            fontSize: '0.9rem',
                                            fontWeight: '700',
                                            textAlign: 'right',
                                            borderRight: '1px solid rgba(255,255,255,0.2)'
                                        }}>Price</th>
                                        <th style={{
                                            padding: '1rem 0.75rem',
                                            fontSize: '0.9rem',
                                            fontWeight: '700',
                                            textAlign: 'right'
                                        }}>Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.map((order, orderIdx) =>
                                        order.items.map((item, idx) => (
                                            <tr key={`${order.id}-${idx}`} style={{
                                                borderBottom: '1px solid #e5e7eb',
                                                background: (orderIdx + idx) % 2 === 0 ? '#f9fafb' : 'white',
                                                transition: 'background 0.2s'
                                            }}>
                                                <td style={{
                                                    padding: '1rem 0.75rem',
                                                    fontSize: '0.95rem',
                                                    fontWeight: '600',
                                                    color: '#374151'
                                                }}>
                                                    <span style={{ marginRight: '0.5rem' }}>🍽️</span>
                                                    {item.name}
                                                </td>
                                                <td style={{
                                                    padding: '1rem 0.75rem',
                                                    fontSize: '0.95rem',
                                                    textAlign: 'center',
                                                    fontWeight: '700',
                                                    color: '#8b5cf6'
                                                }}>
                                                    {item.quantity}
                                                </td>
                                                <td style={{
                                                    padding: '1rem 0.75rem',
                                                    fontSize: '0.95rem',
                                                    textAlign: 'right',
                                                    color: '#6b7280'
                                                }}>
                                                    ₹{item.price}
                                                </td>
                                                <td style={{
                                                    padding: '1rem 0.75rem',
                                                    fontSize: '0.95rem',
                                                    textAlign: 'right',
                                                    fontWeight: '700',
                                                    color: '#059669'
                                                }}>
                                                    ₹{item.price * item.quantity}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Totals */}
                    <div style={{
                        background: 'linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)',
                        borderRadius: '12px',
                        padding: '1.5rem',
                        border: '2px solid #e5e7eb'
                    }}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            marginBottom: '0.75rem',
                            fontSize: '1.1rem',
                            color: '#4b5563'
                        }}>
                            <span style={{ fontWeight: '600' }}>Subtotal:</span>
                            <span style={{ fontWeight: '700', color: '#1f2937' }}>₹{total.toFixed(2)}</span>
                        </div>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            marginBottom: '1rem',
                            fontSize: '1.1rem',
                            color: '#4b5563',
                            paddingBottom: '1rem',
                            borderBottom: '2px dashed #d1d5db'
                        }}>
                            <span style={{ fontWeight: '600' }}>Tax (5%):</span>
                            <span style={{ fontWeight: '700', color: '#1f2937' }}>₹{tax.toFixed(2)}</span>
                        </div>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            padding: '1.25rem',
                            background: 'linear-gradient(135deg, #e94560 0%, #8b5cf6 100%)',
                            borderRadius: '10px',
                            fontSize: '1.5rem',
                            fontWeight: '900',
                            color: 'white',
                            boxShadow: '0 4px 12px rgba(233, 69, 96, 0.3)'
                        }}>
                            <span>GRAND TOTAL:</span>
                            <span>₹{grandTotal.toFixed(2)}</span>
                        </div>
                    </div>

                    {/* Footer */}
                    <div style={{
                        marginTop: '2.5rem',
                        paddingTop: '1.5rem',
                        borderTop: '3px double #e94560',
                        textAlign: 'center'
                    }}>
                        <div style={{
                            background: 'linear-gradient(135deg, #fff5f7 0%, #f0f9ff 100%)',
                            padding: '1.5rem',
                            borderRadius: '12px',
                            marginBottom: '1rem'
                        }}>
                            <p style={{
                                margin: '0 0 0.5rem 0',
                                fontSize: '1.2rem',
                                fontWeight: '700',
                                color: '#e94560'
                            }}>
                                ✨ Thank you for dining with us! ✨
                            </p>
                            <p style={{
                                margin: '0.5rem 0 0 0',
                                fontSize: '1rem',
                                color: '#6b7280',
                                fontWeight: '600'
                            }}>
                                Please visit again 😊
                            </p>
                        </div>

                        <div style={{
                            fontSize: '0.85rem',
                            color: '#9ca3af',
                            fontStyle: 'italic'
                        }}>
                            <p style={{ margin: '0.25rem 0' }}>Powered by Scan4Serve</p>
                            <p style={{ margin: '0.25rem 0' }}>🌐 www.scan4serve.com</p>
                        </div>
                    </div>

                    {/* Decorative Bottom Border */}
                    <div style={{
                        height: '8px',
                        background: 'linear-gradient(90deg, #e94560 0%, #8b5cf6 25%, #3b82f6 50%, #10b981 75%, #f59e0b 100%)',
                        borderRadius: '0 0 4px 4px',
                        marginTop: '1.5rem'
                    }}></div>
                </div>

                {/* Action Buttons (Hidden in print) */}
                <div className="no-print" style={{
                    padding: '1.5rem',
                    borderTop: '2px solid #eee',
                    display: 'flex',
                    gap: '1rem',
                    justifyContent: 'space-between'
                }}>
                    <button
                        onClick={() => {
                            if (window.confirm("WARNING: This will PERMANENTLY delete the order record from the database. It will disappear for everyone. Are you sure?")) {
                                onDelete();
                            }
                        }}
                        style={{
                            flex: 1,
                            padding: '1rem',
                            background: 'linear-gradient(135deg, #ef4444 0%, #f87171 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '12px',
                            fontSize: '1rem',
                            fontWeight: '700',
                            cursor: 'pointer'
                        }}
                    >
                        🗑️ Clear Record
                    </button>
                    <button
                        onClick={onClose}
                        style={{
                            flex: 1,
                            padding: '1rem',
                            background: '#6b7280',
                            color: 'white',
                            border: 'none',
                            borderRadius: '12px',
                            fontSize: '1rem',
                            fontWeight: '700',
                            cursor: 'pointer'
                        }}
                    >
                        ❌ Cancel
                    </button>
                    <button
                        onClick={handlePrint}
                        style={{
                            flex: 1,
                            padding: '1rem',
                            background: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '12px',
                            fontSize: '1rem',
                            fontWeight: '700',
                            cursor: 'pointer'
                        }}
                    >
                        🖨️ Print Bill
                    </button>
                    <button
                        onClick={onConfirmClear}
                        style={{
                            flex: 1,
                            padding: '1rem',
                            background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '12px',
                            fontSize: '1rem',
                            fontWeight: '700',
                            cursor: 'pointer'
                        }}
                    >
                        ✅ Confirm & Clear Table
                    </button>
                </div>
            </div>

            {/* Print Styles */}
            <style>{`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    #bill-content, #bill-content * {
                        visibility: visible;
                    }
                    #bill-content {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                    }
                    .no-print {
                        display: none !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default BillPrint;
