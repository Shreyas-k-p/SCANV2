import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { User, Utensils, Shield, Users, Lock, ChevronRight } from 'lucide-react';
import LanguageSwitcher from '../components/LanguageSwitcher';
import BrandLogo from '../components/BrandLogo';
import './Login.css';

const Login = () => {
    const navigate = useNavigate();
    const { login, t } = useApp();

    const [formData, setFormData] = useState({
        role: 'WAITER',
        id: '',
        name: '',
        secretId: ''
    });

    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const roles = [
        { id: 'WAITER', label: t('waiter'), icon: User },
        { id: 'KITCHEN', label: t('kitchen'), icon: Utensils },
        { id: 'MANAGER', label: t('manager'), icon: Shield },
        { id: 'SUB_MANAGER', label: t('subManager'), icon: Users }
    ];

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        await new Promise(resolve => setTimeout(resolve, 800));

        const { id, name, role, secretId } = formData;
        const upperId = id.toUpperCase().trim();
        const upperRole = role.toUpperCase();

        try {
            if (upperRole === 'WAITER' || upperRole === 'KITCHEN') {
                // For WAITER and KITCHEN: ID + Name (no secret required for basic validation)
                if (!upperId || !name.trim()) throw new Error("ID and Name are required");

                // Validate against Supabase
                const result = await login(upperRole, upperId, null, name.trim());

                if (!result.success) {
                    throw new Error(result.error || "Invalid credentials");
                }

                navigate(upperRole === 'WAITER' ? '/waiter' : '/kitchen');
            }
            else if (upperRole === 'MANAGER' || upperRole === 'SUB_MANAGER') {
                // For MANAGER and SUB_MANAGER: ID + Secret Code required
                if (!upperId || !secretId) throw new Error("ID and Secret Code are required");



                // Validate against Supabase
                const result = await login(upperRole, upperId, secretId);

                if (!result.success) {
                    console.error("❌ Validation failed:", result.error);
                    throw new Error(result.error || "Invalid credentials");
                }



                navigate(upperRole === 'MANAGER' ? '/manager' : '/sub-manager');
            }
        } catch (err) {
            console.error("Login error:", err);
            setError(err.message);
            setIsLoading(false);
        }
    };

    return (
        <div className="login-wrapper">
            <div className="login-card-container">
                <div className="card-corner top-left"></div>
                <div className="card-corner top-right"></div>
                <div className="card-corner bottom-left"></div>
                <div className="card-corner bottom-right"></div>

                {/* Brand Header */}
                <div className="login-brand">
                    <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'center' }}>
                        <BrandLogo size={90} />
                    </div>
                    <h1>Scan<span>4</span>Serve</h1>
                    <p>{t('smartRestaurantOS')}</p>
                </div>

                <div className="login-content">
                    <div className="form-welcome">
                        <h2>{t('welcome')}</h2>
                        <p>{t('selectRoleMessage')}</p>
                    </div>

                    <form onSubmit={handleSubmit} className="modern-form">
                        <div className="role-selector-container">
                            {roles.map((r) => {
                                const Icon = r.icon;
                                const isActive = formData.role === r.id;
                                return (
                                    <div
                                        key={r.id}
                                        className={`role-pill ${isActive ? 'active' : ''}`}
                                        onClick={() => setFormData({ ...formData, role: r.id })}
                                        title={r.label}
                                    >
                                        <Icon size={20} />
                                        <span>{r.label}</span>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="inputs-container">
                            <div className="floating-input-group">
                                <User className="input-icon" size={18} />
                                <input
                                    type="text"
                                    name="id"
                                    placeholder=" "
                                    value={formData.id}
                                    onChange={handleChange}
                                    className="floating-input"
                                />
                                <label>{t('staffId')}</label>
                            </div>


                            {(formData.role === 'WAITER' || formData.role === 'KITCHEN' || formData.role === 'SUB_MANAGER' || formData.role === 'MANAGER') && (
                                <div className="floating-input-group">
                                    <span className="input-icon" style={{ fontSize: '18px' }}>Aa</span>
                                    <input
                                        type="text"
                                        name="name"
                                        placeholder=" "
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="floating-input"
                                    />
                                    <label>{t('fullName')}</label>
                                </div>
                            )}

                            {(formData.role === 'MANAGER' || formData.role === 'SUB_MANAGER') && (
                                <div className="floating-input-group">
                                    <Lock className="input-icon" size={18} />
                                    <input
                                        type="password"
                                        name="secretId"
                                        placeholder=" "
                                        value={formData.secretId}
                                        onChange={handleChange}
                                        className="floating-input"
                                    />
                                    <label>{t('secretKey')}</label>
                                </div>
                            )}
                        </div>

                        {error && <div className="error-banner">{error}</div>}

                        <button type="submit" className="login-submit-btn" disabled={isLoading}>
                            {isLoading ? (
                                <div className="spinner-sm"></div>
                            ) : (
                                <>{t('accessDashboard')} <ChevronRight size={20} /></>
                            )}
                        </button>
                    </form>

                    <button onClick={() => navigate('/menu')} className="customer-link">
                        {t('continueAsCustomer')}
                    </button>

                    {/* Integrated Footer Tools */}
                    <div className="login-footer-tools">
                        <LanguageSwitcher />
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Login;
