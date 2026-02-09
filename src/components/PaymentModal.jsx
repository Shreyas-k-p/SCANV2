import React from 'react';

const PaymentModal = ({ table, totalAmount, onClose, onPaymentInitiated }) => {
    const UPI_ID = "shreyas5710kp-1@okicicic";
    const MERCHANT_NAME = "Scan4Serve Restaurant";

    const handleUPIPayment = () => {
        // Create UPI payment URL
        const upiUrl = `upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(MERCHANT_NAME)}&am=${totalAmount.toFixed(2)}&cu=INR&tn=${encodeURIComponent(`Payment for Table ${table.tableNo}`)}`;

        // Try to open UPI app
        window.location.href = upiUrl;

        // Notify that payment was initiated
        onPaymentInitiated();
    };

    const handleGooglePay = () => {
        // Google Pay UPI URL
        const gpayUrl = `gpay://upi/pay?pa=${UPI_ID}&pn=${encodeURIComponent(MERCHANT_NAME)}&am=${totalAmount.toFixed(2)}&cu=INR&tn=${encodeURIComponent(`Payment for Table ${table.tableNo}`)}`;

        window.location.href = gpayUrl;
        onPaymentInitiated();
    };

    const handlePhonePe = () => {
        // PhonePe UPI URL
        const phonepeUrl = `phonepe://pay?pa=${UPI_ID}&pn=${encodeURIComponent(MERCHANT_NAME)}&am=${totalAmount.toFixed(2)}&cu=INR&tn=${encodeURIComponent(`Payment for Table ${table.tableNo}`)}`;

        window.location.href = phonepeUrl;
        onPaymentInitiated();
    };

    const handlePaytm = () => {
        // Paytm UPI URL
        const paytmUrl = `paytmmp://pay?pa=${UPI_ID}&pn=${encodeURIComponent(MERCHANT_NAME)}&am=${totalAmount.toFixed(2)}&cu=INR&tn=${encodeURIComponent(`Payment for Table ${table.tableNo}`)}`;

        window.location.href = paytmUrl;
        onPaymentInitiated();
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            padding: '1.5rem',
            backdropFilter: 'blur(8px)'
        }}>
            <div style={{
                background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                borderRadius: '24px',
                maxWidth: '500px',
                width: '100%',
                boxShadow: '0 25px 80px rgba(0, 0, 0, 0.4)',
                overflow: 'hidden',
                animation: 'slideUp 0.3s ease-out'
            }}>
                {/* Decorative Top Border */}
                <div style={{
                    height: '8px',
                    background: 'linear-gradient(90deg, #e94560 0%, #8b5cf6 25%, #3b82f6 50%, #10b981 75%, #f59e0b 100%)'
                }}></div>

                {/* Header */}
                <div style={{
                    padding: '2rem',
                    textAlign: 'center',
                    background: 'linear-gradient(135deg, #fff5f7 0%, #f0f9ff 100%)',
                    borderBottom: '2px solid #e5e7eb'
                }}>
                    <div style={{ fontSize: '3.5rem', marginBottom: '0.5rem' }}>💳</div>
                    <h2 style={{
                        margin: 0,
                        fontSize: '1.8rem',
                        fontWeight: '800',
                        background: 'linear-gradient(135deg, #e94560 0%, #8b5cf6 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text'
                    }}>Complete Payment</h2>
                    <p style={{
                        margin: '0.5rem 0 0 0',
                        color: '#6b7280',
                        fontSize: '0.95rem',
                        fontWeight: '600'
                    }}>Table {table.tableNo}</p>
                </div>

                {/* Amount Section */}
                <div style={{
                    padding: '2rem',
                    textAlign: 'center',
                    background: 'linear-gradient(135deg, #e94560 0%, #8b5cf6 100%)',
                    color: 'white'
                }}>
                    <p style={{
                        margin: '0 0 0.5rem 0',
                        fontSize: '0.9rem',
                        fontWeight: '600',
                        opacity: 0.9
                    }}>Total Amount</p>
                    <div style={{
                        fontSize: '3rem',
                        fontWeight: '900',
                        textShadow: '0 2px 8px rgba(0,0,0,0.2)'
                    }}>₹{totalAmount.toFixed(2)}</div>
                </div>

                {/* Payment Methods */}
                <div style={{ padding: '2rem' }}>
                    <h3 style={{
                        margin: '0 0 1.5rem 0',
                        fontSize: '1.1rem',
                        fontWeight: '700',
                        color: '#1f2937',
                        textAlign: 'center'
                    }}>Choose Payment Method</h3>

                    <div style={{
                        display: 'grid',
                        gap: '1rem'
                    }}>
                        {/* Google Pay */}
                        <button
                            onClick={handleGooglePay}
                            style={{
                                padding: '1.25rem',
                                background: 'linear-gradient(135deg, #4285F4 0%, #34A853 100%)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '16px',
                                fontSize: '1.1rem',
                                fontWeight: '700',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.75rem',
                                boxShadow: '0 4px 12px rgba(66, 133, 244, 0.3)',
                                transition: 'transform 0.2s, box-shadow 0.2s'
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 6px 20px rgba(66, 133, 244, 0.4)';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(66, 133, 244, 0.3)';
                            }}
                        >
                            <span style={{ fontSize: '1.5rem' }}>📱</span>
                            Google Pay
                        </button>

                        {/* PhonePe */}
                        <button
                            onClick={handlePhonePe}
                            style={{
                                padding: '1.25rem',
                                background: 'linear-gradient(135deg, #5f259f 0%, #3e1c6e 100%)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '16px',
                                fontSize: '1.1rem',
                                fontWeight: '700',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.75rem',
                                boxShadow: '0 4px 12px rgba(95, 37, 159, 0.3)',
                                transition: 'transform 0.2s, box-shadow 0.2s'
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 6px 20px rgba(95, 37, 159, 0.4)';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(95, 37, 159, 0.3)';
                            }}
                        >
                            <span style={{ fontSize: '1.5rem' }}>📲</span>
                            PhonePe
                        </button>

                        {/* Paytm */}
                        <button
                            onClick={handlePaytm}
                            style={{
                                padding: '1.25rem',
                                background: 'linear-gradient(135deg, #00BAF2 0%, #0099CC 100%)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '16px',
                                fontSize: '1.1rem',
                                fontWeight: '700',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.75rem',
                                boxShadow: '0 4px 12px rgba(0, 186, 242, 0.3)',
                                transition: 'transform 0.2s, box-shadow 0.2s'
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 186, 242, 0.4)';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 186, 242, 0.3)';
                            }}
                        >
                            <span style={{ fontSize: '1.5rem' }}>💰</span>
                            Paytm
                        </button>

                        {/* Other UPI Apps */}
                        <button
                            onClick={handleUPIPayment}
                            style={{
                                padding: '1.25rem',
                                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '16px',
                                fontSize: '1.1rem',
                                fontWeight: '700',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.75rem',
                                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                                transition: 'transform 0.2s, box-shadow 0.2s'
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 6px 20px rgba(16, 185, 129, 0.4)';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)';
                            }}
                        >
                            <span style={{ fontSize: '1.5rem' }}>🏦</span>
                            Other UPI Apps
                        </button>
                    </div>

                    {/* UPI ID Display */}
                    <div style={{
                        marginTop: '1.5rem',
                        padding: '1rem',
                        background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
                        borderRadius: '12px',
                        border: '2px solid #3b82f6',
                        textAlign: 'center'
                    }}>
                        <p style={{
                            margin: '0 0 0.5rem 0',
                            fontSize: '0.85rem',
                            color: '#6b7280',
                            fontWeight: '600'
                        }}>UPI ID</p>
                        <p style={{
                            margin: 0,
                            fontSize: '0.95rem',
                            fontWeight: '700',
                            color: '#1e40af',
                            fontFamily: 'monospace'
                        }}>{UPI_ID}</p>
                    </div>

                    {/* Cancel Button */}
                    <button
                        onClick={onClose}
                        style={{
                            marginTop: '1.5rem',
                            width: '100%',
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
                </div>

                {/* Decorative Bottom Border */}
                <div style={{
                    height: '8px',
                    background: 'linear-gradient(90deg, #e94560 0%, #8b5cf6 25%, #3b82f6 50%, #10b981 75%, #f59e0b 100%)'
                }}></div>
            </div>

            {/* Animation */}
            <style>{`
                @keyframes slideUp {
                    from {
                        opacity: 0;
                        transform: translateY(30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>
        </div>
    );
};

export default PaymentModal;
