import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { LogOut, Home, Menu as MenuIcon, X } from 'lucide-react';

export default function Layout({ children }) {
    const { user, logout, t } = useApp();
    const navigate = useNavigate();
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const toggleMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
    const closeMenu = () => setIsMobileMenuOpen(false);

    const handleNavigate = (path) => {
        navigate(path);
        closeMenu();
    };

    // Don't show layout details on login page
    if (location.pathname === '/') {
        return children;
    }

    return (
        <div className="dashboard-container">
            {/* Mobile Toggle Button */}
            <button
                className="mobile-menu-toggle"
                onClick={toggleMenu}
            >
                {isMobileMenuOpen ? <X size={24} /> : <MenuIcon size={24} />}
            </button>

            {/* Mobile Overlay */}
            {isMobileMenuOpen && (
                <div className="mobile-overlay" onClick={closeMenu} />
            )}

            <nav className={`sidebar ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
                <div style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{
                        display: 'inline-block',
                        padding: '0.5rem 1rem',
                        background: 'var(--gradient-accent)',
                        borderRadius: '12px',
                        boxShadow: 'var(--shadow-glow)'
                    }}>
                        <h2 style={{
                            fontSize: '1.75rem',
                            fontWeight: '800',
                            margin: 0,
                            color: '#ffffff',
                            letterSpacing: '-0.5px',
                            textShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
                        }}>
                            Scan<span style={{ opacity: 0.9 }}>4</span>Serve
                        </h2>
                    </div>
                    {/* Close button for mobile inside sidebar */}
                    <button className="sidebar-close-btn" onClick={closeMenu}>
                        <X size={20} />
                    </button>
                </div>
                <div style={{
                    height: '3px',
                    width: '60px',
                    background: 'var(--gradient-accent)',
                    borderRadius: '2px',
                    marginBottom: '2rem',
                    boxShadow: 'var(--shadow-glow)'
                }} />

                <div style={{ marginBottom: '2rem' }}>
                    <div className="glass-panel" style={{
                        padding: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        cursor: 'default',
                        background: 'var(--glass-bg)',
                        border: '2px solid var(--glass-border)'
                    }}>
                        <div style={{
                            width: '45px',
                            height: '45px',
                            borderRadius: '50%',
                            background: 'var(--gradient-accent)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 'bold',
                            fontSize: '1.1rem',
                            boxShadow: 'var(--shadow-glow)',
                            color: '#fff',
                            border: '3px solid rgba(255, 255, 255, 0.3)',
                            animation: 'pulse 2s ease-in-out infinite'
                        }}>
                            {user?.name?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{
                                fontWeight: '600',
                                fontSize: '0.9rem',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                            }}>
                                {user?.name || t('guest')}
                            </div>
                            <div style={{
                                fontSize: '0.7rem',
                                color: 'var(--text-dim)',
                                textTransform: 'capitalize',
                                marginTop: '2px'
                            }}>
                                {user?.role || t('customer')}
                            </div>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '2rem' }}>
                    <button
                        onClick={() => handleNavigate('/menu')}
                        className={`btn ${location.pathname === '/menu' ? 'btn-primary' : 'btn-secondary'}`}
                        style={{
                            justifyContent: 'flex-start',
                            padding: '0.875rem 1.25rem',
                            borderRadius: '12px',
                            transition: 'all 0.3s ease'
                        }}
                    >
                        <Home size={18} /> {t('menu')}
                    </button>

                    {user?.role === 'WAITER' && (
                        <button
                            onClick={() => handleNavigate('/waiter')}
                            className={`btn ${location.pathname === '/waiter' ? 'btn-primary' : 'btn-secondary'}`}
                            style={{
                                justifyContent: 'flex-start',
                                padding: '0.875rem 1.25rem',
                                borderRadius: '12px'
                            }}
                        >
                            👨‍🍳 {t('waiterDashboard')}
                        </button>
                    )}

                    {(user?.role === 'KITCHEN' || user?.role === 'WAITER') && (
                        <button
                            onClick={() => handleNavigate('/kitchen')}
                            className={`btn ${location.pathname === '/kitchen' ? 'btn-primary' : 'btn-secondary'}`}
                            style={{
                                justifyContent: 'flex-start',
                                padding: '0.875rem 1.25rem',
                                borderRadius: '12px'
                            }}
                        >
                            🍳 {t('kitchenDashboard')}
                        </button>
                    )}

                    {user?.role === 'MANAGER' && (
                        <button
                            onClick={() => handleNavigate('/manager')}
                            className={`btn ${location.pathname === '/manager' ? 'btn-primary' : 'btn-secondary'}`}
                            style={{
                                justifyContent: 'flex-start',
                                padding: '0.875rem 1.25rem',
                                borderRadius: '12px'
                            }}
                        >
                            👔 {t('managerDashboard')}
                        </button>
                    )}
                </div>

                <div style={{ marginTop: 'auto', paddingTop: '1.5rem', borderTop: '1px solid var(--glass-border)' }}>
                    <button
                        onClick={handleLogout}
                        className="btn btn-secondary"
                        style={{
                            width: '100%',
                            justifyContent: 'center',
                            color: 'var(--error)',
                            padding: '0.875rem',
                            borderRadius: '12px',
                            border: '1px solid rgba(231, 76, 60, 0.3)'
                        }}
                    >
                        <LogOut size={18} /> {t('logout')}
                    </button>
                </div>
            </nav>

            <main className="main-content">
                {children}
            </main>
        </div>
    );
}
