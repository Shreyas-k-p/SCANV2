import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { User, Utensils, Shield, Users, Lock, ChevronRight, ScanLine } from 'lucide-react';
import LoginMascot from '../components/LoginMascot';
import './Login.css';

const Login = () => {
    const navigate = useNavigate();
    const { login } = useApp();

    const [formData, setFormData] = useState({
        role: 'WAITER',
        id: '',
        name: '',
        secretId: ''
    });

    const [error, setError] = useState('');
    const [focusedField, setFocusedField] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const roles = [
        { id: 'WAITER', label: 'Waiter', icon: User },
        { id: 'KITCHEN', label: 'Kitchen', icon: Utensils },
        { id: 'MANAGER', label: 'Manager', icon: Shield },
        { id: 'SUB_MANAGER', label: 'Sub Manager', icon: Users }
    ];

    // Secret IDs for demo/security
    const SECRET_IDS = {
        'MANAGER': 'MGR2024',
        'sub_manager': 'SUB2024', // keeping lowercase check for legacy compatibility
        'SUB_MANAGER': 'SUB2024'
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleFocus = (field) => {
        setFocusedField(field);
    };

    const handleBlur = () => {
        setFocusedField(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        // Simulate network delay for "app-like" feel
        await new Promise(resolve => setTimeout(resolve, 800));

        const { id, name, role, secretId } = formData;
        const upperId = id.toUpperCase().trim();
        const upperRole = role.toUpperCase();

        try {
            if (upperRole === 'WAITER') {
                if (!upperId || !name.trim()) throw new Error("ID and Name are required");
                const profilePhoto = `https://ui-avatars.com/api/?name=${name}&background=random`;
                login({ name, id: upperId, role: 'WAITER', profilePhoto });
                navigate('/waiter');
            }
            else if (upperRole === 'MANAGER') {
                if (!upperId || !secretId) throw new Error("ID and Secret ID are required");
                if (secretId !== SECRET_IDS['MANAGER']) throw new Error("Invalid Secret ID");
                login({ name: 'Manager', id: upperId, role: 'MANAGER' });
                navigate('/manager');
            }
            else if (upperRole === 'KITCHEN') {
                if (!upperId || !secretId) throw new Error("ID and Secret Code are required");
                // Simplified check for kitchen for now, or add specific secret
                login({ name: 'Kitchen Staff', id: upperId, role: 'KITCHEN' });
                navigate('/kitchen');
            }
            else if (upperRole === 'SUB_MANAGER') {
                if (!upperId || !secretId) throw new Error("ID and Secret ID are required");
                if (secretId !== SECRET_IDS['SUB_MANAGER']) throw new Error("Invalid Secret ID");
                login({ name, id: upperId, role: 'SUB_MANAGER' });
                navigate('/sub-manager');
            }
        } catch (err) {
            setError(err.message);
            setIsLoading(false);
        }
    };

    return (
        <div className="login-container">
            {/* Left Side - Brand & Aesthetic */}
            <div className="login-left">
                <div className="brand-badge">
                    <ScanLine size={20} color="#FF2E63" />
                    <span>Restaurant OS v2.0</span>
                </div>

                <div className="brand-showcase">
                    <h1 className="brand-title">Scan<span>4</span>Serve</h1>
                    <p className="brand-tagline">
                        Next-generation restaurant management. <br />
                        Seamless ordering, instant delivery.
                    </p>
                </div>
            </div>

            {/* Right Side - Functional Form */}
            <div className="login-right">
                <div className="mobile-brand-header">
                    <ScanLine size={32} color="#FF2E63" />
                    <h1>Scan<span>4</span>Serve</h1>
                </div>
                <div className="login-form-container">
                    <div className="form-header">
                        <LoginMascot focusedField={focusedField} />
                        <h2>Welcome Back</h2>
                        <p>Select your role to continue</p>
                    </div>

                    <form onSubmit={handleSubmit} className="modern-form">

                        {/* Role Selection */}
                        <div className="role-grid">
                            {roles.map((r) => {
                                const Icon = r.icon;
                                const isActive = formData.role === r.id;
                                return (
                                    <div
                                        key={r.id}
                                        className={`role-card ${isActive ? 'active' : ''}`}
                                        onClick={() => setFormData({ ...formData, role: r.id })}
                                    >
                                        <Icon className="role-icon" />
                                        <span className="role-label">{r.label}</span>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Input Fields */}
                        <div className="input-group">
                            <label>Staff ID</label>
                            <input
                                type="text"
                                name="id"
                                placeholder="Enter your ID"
                                value={formData.id}
                                onChange={handleChange}
                                onFocus={() => handleFocus('id')}
                                onBlur={handleBlur}
                                className="styled-input"
                            />
                        </div>

                        {(formData.role === 'WAITER' || formData.role === 'SUB_MANAGER') && (
                            <div className="input-group">
                                <label>Full Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    placeholder="Enter your name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    onFocus={() => handleFocus('name')}
                                    onBlur={handleBlur}
                                    className="styled-input"
                                />
                            </div>
                        )}

                        {formData.role !== 'WAITER' && (
                            <div className="input-group">
                                <label>Secret Access Key</label>
                                <div className="password-input-wrapper">
                                    <input
                                        type="password"
                                        name="secretId"
                                        placeholder="••••••••"
                                        value={formData.secretId}
                                        onChange={handleChange}
                                        onFocus={() => handleFocus('password')}
                                        onBlur={handleBlur}
                                        className="styled-input"
                                    />
                                    <Lock className="input-icon-right" size={18} />
                                </div>
                            </div>
                        )}

                        {error && <div className="error-message">{error}</div>}

                        <button type="submit" className="login-btn" disabled={isLoading}>
                            {isLoading ? 'Authenticating...' : (
                                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                    Login Access <ChevronRight size={18} />
                                </span>
                            )}
                        </button>

                        <div className="guest-btn-container">
                            <div className="guest-btn-wrapper">
                                <button type="button" onClick={() => navigate('/menu')} className="guest-link">
                                    Continue as Customer
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;
