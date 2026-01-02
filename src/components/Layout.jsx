import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { LogOut, Home } from 'lucide-react';

export default function Layout({ children }) {
    const { user, logout } = useApp();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    // Don't show layout details on login page
    if (location.pathname === '/') {
        return children;
    }

    return (
        <div className="dashboard-container">
            <nav className="sidebar">
                <div style={{ marginBottom: '2.5rem' }}>
                    <div style={{
                        display: 'inline-block',
                        padding: '0.5rem 1rem',
                        background: 'var(--gradient-accent)',
                        borderRadius: '12px',
                        marginBottom: '1rem',
                        boxShadow: '0 4px 15px rgba(233, 69, 96, 0.3)'
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
                    <div style={{ 
                        height: '3px', 
                        width: '80px', 
                        background: 'var(--gradient-accent)',
                        borderRadius: '2px',
                        boxShadow: '0 2px 8px rgba(233, 69, 96, 0.4)'
                    }} />
                </div>

                <div style={{ marginBottom: '2rem' }}>
                    <div className="glass-panel" style={{ 
                        padding: '1rem', 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '12px',
                        cursor: 'default',
                        background: 'linear-gradient(135deg, rgba(233, 69, 96, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)',
                        border: '2px solid rgba(233, 69, 96, 0.2)'
                    }}>
                        <div style={{ 
                            width: '50px', 
                            height: '50px', 
                            borderRadius: '50%', 
                            background: 'var(--gradient-accent)',
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            fontWeight: 'bold',
                            fontSize: '1.2rem',
                            boxShadow: '0 4px 20px rgba(233, 69, 96, 0.4)',
                            color: '#fff',
                            border: '3px solid rgba(255, 255, 255, 0.3)',
                            animation: 'pulse 2s ease-in-out infinite'
                        }}>
                            {user?.name?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ 
                                fontWeight: '600', 
                                fontSize: '0.95rem',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                            }}>
                                {user?.name || 'Guest'}
                            </div>
                            <div style={{ 
                                fontSize: '0.75rem', 
                                color: 'var(--text-dim)',
                                textTransform: 'capitalize',
                                marginTop: '2px'
                            }}>
                                {user?.role || 'Customer'}
                            </div>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '2rem' }}>
                    <button 
                        onClick={() => navigate('/menu')} 
                        className={`btn ${location.pathname === '/menu' ? 'btn-primary' : 'btn-secondary'}`} 
                        style={{ 
                            justifyContent: 'flex-start',
                            padding: '0.875rem 1.25rem',
                            borderRadius: '12px',
                            transition: 'all 0.3s ease'
                        }}
                    >
                        <Home size={18} /> Menu
                    </button>

                    {user?.role === 'WAITER' && (
                        <button 
                            onClick={() => navigate('/waiter')} 
                            className={`btn ${location.pathname === '/waiter' ? 'btn-primary' : 'btn-secondary'}`} 
                            style={{ 
                                justifyContent: 'flex-start',
                                padding: '0.875rem 1.25rem',
                                borderRadius: '12px'
                            }}
                        >
                            👨‍🍳 Waiter Dashboard
                        </button>
                    )}

                    {(user?.role === 'KITCHEN' || user?.role === 'WAITER') && (
                        <button 
                            onClick={() => navigate('/kitchen')} 
                            className={`btn ${location.pathname === '/kitchen' ? 'btn-primary' : 'btn-secondary'}`} 
                            style={{ 
                                justifyContent: 'flex-start',
                                padding: '0.875rem 1.25rem',
                                borderRadius: '12px'
                            }}
                        >
                            🍳 Kitchen Dashboard
                        </button>
                    )}

                    {user?.role === 'MANAGER' && (
                        <button 
                            onClick={() => navigate('/manager')} 
                            className={`btn ${location.pathname === '/manager' ? 'btn-primary' : 'btn-secondary'}`} 
                            style={{ 
                                justifyContent: 'flex-start',
                                padding: '0.875rem 1.25rem',
                                borderRadius: '12px'
                            }}
                        >
                            👔 Manager Dashboard
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
                        <LogOut size={18} /> Logout
                    </button>
                </div>
            </nav>

            <main className="main-content">
                {children}
            </main>
        </div>
    );
}
