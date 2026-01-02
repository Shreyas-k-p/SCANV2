import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { ChefHat, User, Shield, UtensilsCrossed } from 'lucide-react';

export default function Login() {
    const { login, validateSecretID } = useApp();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: '',
        id: '',
        role: 'CUSTOMER', // Default
        secret: ''
    });
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');

        const { id, name, role } = formData;
        const upperId = id.toUpperCase().trim();
        const upperRole = role.toUpperCase();

        // Logic Routing
        if (upperRole === 'WAITER') {
            if (!formData.secret) {
                setError('Please enter your Secret ID');
                return;
            }
            // Use the ID as entered (case-insensitive matching)
            const validated = validateSecretID('WAITER', id.trim(), formData.secret.toUpperCase().trim());
            if (!validated) {
                setError('Invalid Waiter ID or Secret ID. Please check your credentials.');
                return;
            }
            login({ name: validated.name, id: validated.id, role: 'WAITER' });
            navigate('/waiter');
        }
        else if (upperRole === 'KITCHEN') {
            if (!formData.secret) {
                setError('Please enter your Secret ID');
                return;
            }
            // Use the ID as entered (case-insensitive matching)
            const validated = validateSecretID('KITCHEN', id.trim(), formData.secret.toUpperCase().trim());
            if (!validated) {
                setError('Invalid Kitchen ID or Secret ID. Please check your credentials.');
                return;
            }
            login({ name: validated.name, id: validated.id, role: 'KITCHEN' });
            navigate('/kitchen');
        }
        else if (upperRole === 'MANAGER') {
            if (!upperId.startsWith('MANAGER')) {
                setError('Invalid Manager ID');
                return;
            }
            if (formData.secret !== '5710-5710') {
                setError('Invalid Secret ID');
                return;
            }
            try {
                login({ name, id: upperId, role: 'MANAGER' });
                navigate('/manager');
            } catch (err) {
                setError(err.message || 'Another manager is already logged in. Only one manager can use the dashboard at a time.');
            }
        }
        else {
            setError('Please select a valid role (WAITER, KITCHEN, MANAGER)');
        }
    };

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            padding: '20px',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Animated colorful background elements */}
            <div style={{
                position: 'absolute',
                top: '-50%',
                left: '-50%',
                width: '200%',
                height: '200%',
                background: 
                    'radial-gradient(circle at 20% 30%, rgba(233, 69, 96, 0.15) 0%, transparent 50%)',
                animation: 'pulse 8s ease-in-out infinite',
                zIndex: 0
            }} />
            <div style={{
                position: 'absolute',
                top: '50%',
                right: '-30%',
                width: '100%',
                height: '100%',
                background: 
                    'radial-gradient(circle at 80% 70%, rgba(139, 92, 246, 0.12) 0%, transparent 50%)',
                animation: 'pulse 10s ease-in-out infinite',
                animationDelay: '2s',
                zIndex: 0
            }} />
            <div style={{
                position: 'absolute',
                bottom: '-30%',
                left: '20%',
                width: '100%',
                height: '100%',
                background: 
                    'radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)',
                animation: 'pulse 12s ease-in-out infinite',
                animationDelay: '4s',
                zIndex: 0
            }} />
            
            <div className="glass-panel fade-in" style={{ 
                padding: '3.5rem', 
                width: '100%', 
                maxWidth: '450px', 
                textAlign: 'center',
                position: 'relative',
                zIndex: 1,
                boxShadow: 'var(--shadow-lg)',
                border: '2px solid rgba(233, 69, 96, 0.3)',
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(255, 255, 255, 0.95) 100%)'
            }}>
                <div style={{ marginBottom: '2.5rem' }}>
                    <div style={{
                        display: 'inline-block',
                        padding: '1rem 2rem',
                        background: 'var(--gradient-accent)',
                        borderRadius: '20px',
                        marginBottom: '1.5rem',
                        boxShadow: '0 8px 30px rgba(233, 69, 96, 0.4)',
                        animation: 'float 3s ease-in-out infinite'
                    }}>
                        <h1 style={{ 
                            margin: 0,
                            fontSize: '3rem', 
                            fontWeight: '800',
                            color: '#ffffff',
                            letterSpacing: '-1px',
                            textShadow: '0 2px 10px rgba(0, 0, 0, 0.2)'
                        }}>
                            Scan<span style={{ opacity: 0.9 }}>4</span>Serve
                        </h1>
                    </div>
                    <p style={{ 
                        color: 'var(--text-dim)', 
                        fontSize: '1rem',
                        marginTop: '0.5rem',
                        fontWeight: '500'
                    }}>
                        🍽️ Smart Hotel Management System
                    </p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div>
                        <label style={{ 
                            display: 'block', 
                            textAlign: 'left', 
                            marginBottom: '0.5rem', 
                            color: 'var(--text-light)',
                            fontSize: '0.9rem',
                            fontWeight: '500'
                        }}>
                            Role
                        </label>
                        <select
                            className="input-field"
                            value={formData.role}
                            onChange={e => setFormData({ ...formData, role: e.target.value })}
                            style={{ marginBottom: 0 }}
                        >
                            <option value="Select Role">Select Role</option>
                            <option value="WAITER">👨‍🍳 Waiter</option>
                            <option value="KITCHEN">🍳 Kitchen</option>
                            <option value="MANAGER">👔 Manager</option>
                        </select>
                    </div>

                    <div>
                        <label style={{ 
                            display: 'block', 
                            textAlign: 'left', 
                            marginBottom: '0.5rem', 
                            color: 'var(--text-light)',
                            fontSize: '0.9rem',
                            fontWeight: '500'
                        }}>
                            Name
                        </label>
                        <input
                            type="text"
                            placeholder="Enter your name"
                            className="input-field"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            required
                            style={{ marginBottom: 0 }}
                        />
                    </div>

                    <div>
                        <label style={{ 
                            display: 'block', 
                            textAlign: 'left', 
                            marginBottom: '0.5rem', 
                            color: 'var(--text-light)',
                            fontSize: '0.9rem',
                            fontWeight: '500'
                        }}>
                            {formData.role === 'WAITER' || formData.role === 'KITCHEN' ? 'Your ID' : 'ID'}
                        </label>
                        <input
                            type="text"
                            placeholder={
                                formData.role === 'MANAGER' 
                                    ? "ID (e.g. MANAGER01)" 
                                    : formData.role === 'WAITER' 
                                    ? "Enter your Waiter ID (e.g. WAITER-1234567890)" 
                                    : formData.role === 'KITCHEN'
                                    ? "Enter your Kitchen ID (e.g. KITCHEN-1234567890)"
                                    : "ID"
                            }
                            className="input-field"
                            value={formData.id}
                            onChange={e => setFormData({ ...formData, id: e.target.value })}
                            required
                            style={{ marginBottom: 0 }}
                        />
                        {(formData.role === 'WAITER' || formData.role === 'KITCHEN') && (
                            <p style={{ 
                                marginTop: '0.5rem', 
                                fontSize: '0.8rem', 
                                color: 'var(--text-dim)',
                                fontStyle: 'italic'
                            }}>
                                Get your ID and Secret ID from the Manager
                            </p>
                        )}
                    </div>

                    {(formData.role === 'MANAGER' || formData.role === 'WAITER' || formData.role === 'KITCHEN') && (
                        <div>
                            <label style={{ 
                                display: 'block', 
                                textAlign: 'left', 
                                marginBottom: '0.5rem', 
                                color: 'var(--text-light)',
                                fontSize: '0.9rem',
                                fontWeight: '500'
                            }}>
                                Secret ID
                            </label>
                            <input
                                type="password"
                                placeholder={formData.role === 'MANAGER' ? "Enter secret ID" : "Enter your Secret ID"}
                                className="input-field"
                                value={formData.secret || ''}
                                onChange={e => setFormData({ ...formData, secret: e.target.value })}
                                required
                                style={{ marginBottom: 0 }}
                            />
                            {(formData.role === 'WAITER' || formData.role === 'KITCHEN') && (
                                <p style={{ 
                                    marginTop: '0.5rem', 
                                    fontSize: '0.8rem', 
                                    color: 'var(--text-dim)',
                                    fontStyle: 'italic'
                                }}>
                                    Get your Secret ID from the Manager
                                </p>
                            )}
                        </div>
                    )}

                    {error && (
                        <div className="badge badge-error" style={{ 
                            marginTop: '0.5rem',
                            animation: 'shake 0.5s ease-in-out'
                        }}>
                            {error}
                        </div>
                    )}

                    <button 
                        type="submit" 
                        className="btn btn-primary" 
                        style={{ 
                            justifyContent: 'center',
                            marginTop: '1rem',
                            padding: '1rem',
                            fontSize: '1rem',
                            fontWeight: '600'
                        }}
                    >
                        Login
                    </button>
                </form>

                <div style={{ 
                    marginTop: '2.5rem', 
                    borderTop: '1px solid var(--glass-border)', 
                    paddingTop: '1.5rem' 
                }}>
                    <p style={{ 
                        marginBottom: '1rem', 
                        color: 'var(--text-dim)',
                        fontSize: '0.9rem'
                    }}>
                        Just browsing? Check out our menu
                    </p>
                    <button 
                        onClick={() => navigate('/menu')} 
                        className="btn btn-secondary" 
                        style={{ 
                            width: '100%', 
                            justifyContent: 'center', 
                            gap: '10px',
                            padding: '0.875rem'
                        }}
                    >
                        <UtensilsCrossed size={18} />
                        View Menu
                    </button>
                </div>
            </div>
            
            <style>{`
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-10px); }
                    75% { transform: translateX(10px); }
                }
            `}</style>
        </div>
    );
}
