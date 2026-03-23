import React from 'react';
import { CreditCard, ShieldAlert, ShoppingBag, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import './Login.css'; // Reuse some login base styles

const SubscriptionExpired = () => {
    const { logout, t } = useApp();

    return (
        <div className="login-wrapper">
            <div className="login-card-container">
                <div className="card-corner top-left"></div>
                <div className="card-corner top-right"></div>
                <div className="card-corner bottom-left"></div>
                <div className="card-corner bottom-right"></div>

                <div className="login-brand" style={{ textAlign: 'center' }}>
                    <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'center' }}>
                        <ShieldAlert size={80} color="#ff4d4d" />
                    </div>
                    <h1 style={{ color: '#ff4d4d' }}>Access Suspended</h1>
                    <p style={{ fontSize: '1.2rem', color: '#666', marginTop: '10px' }}>
                        Your Scan4Serve subscription for this restaurant has expired or is inactive.
                    </p>
                </div>

                <div className="login-content" style={{ marginTop: '20px' }}>
                    <div className="pricing-info" style={{
                        background: '#fff5f5',
                        padding: '20px',
                        borderRadius: '12px',
                        border: '1px solid #ffebeb',
                        marginBottom: '30px'
                    }}>
                        <h3 style={{ color: '#d32f2f', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <CreditCard size={20} /> Action Required
                        </h3>
                        <p style={{ marginTop: '10px', lineHeight: '1.6' }}>
                            All dashboard features, kitchen coordination, and customer ordering have been disabled until the subscription is renewed.
                        </p>
                    </div>

                    <button
                        className="login-submit-btn"
                        onClick={() => window.location.href = 'https://scan4serve.com/pricing'}
                        style={{ background: '#d32f2f' }}
                    >
                        Renew Subscription <ShoppingBag size={20} style={{ marginLeft: '10px' }} />
                    </button>

                    <button
                        className="customer-link"
                        onClick={logout}
                        style={{ marginTop: '15px' }}
                    >
                        Logout and Switch Account <ArrowRight size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SubscriptionExpired;
