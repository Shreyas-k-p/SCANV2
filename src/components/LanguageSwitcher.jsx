import React from 'react';
import { useApp } from '../context/AppContext';

export default function LanguageSwitcher() {
    const { language, setLanguage, theme, toggleTheme } = useApp();

    const languages = [
        { code: 'en', label: 'English', flag: '🇬🇧' },
        { code: 'hi', label: 'हिंदी', flag: '🇮🇳' },
        { code: 'es', label: 'Español', flag: '🇪🇸' },
        { code: 'fr', label: 'Français', flag: '🇫🇷' },
        { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
        { code: 'zh', label: '中文', flag: '🇨🇳' },
        { code: 'ja', label: '日本語', flag: '🇯🇵' },
        { code: 'ar', label: 'العربية', flag: '🇸🇦' }
    ];

    return (
        <div className="language-switcher-container">
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
                <button
                    onClick={toggleTheme}
                    title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
                    className="theme-toggle-btn"
                    style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '50%',
                        width: '36px',
                        height: '36px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.2rem',
                        transition: 'all 0.2s ease',
                        color: 'var(--text-main)',
                        boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                    }}
                >
                    {theme === 'light' ? '🌙' : '☀️'}
                </button>
                {languages.map(lang => (
                    <button
                        key={lang.code}
                        onClick={() => setLanguage(lang.code)}
                        title={lang.label}
                        className={`lang-btn ${language === lang.code ? 'active' : ''}`}
                        style={{
                            background: language === lang.code
                                ? 'var(--primary, #4f46e5)'
                                : 'rgba(255, 255, 255, 0.05)',
                            border: language === lang.code
                                ? `1px solid var(--primary, #4f46e5)`
                                : '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '12px',
                            padding: '6px 10px',
                            minWidth: '36px',
                            height: '36px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.2rem',
                            transition: 'all 0.2s ease',
                            color: 'white',
                            opacity: language === lang.code ? 1 : 0.7,
                            transform: language === lang.code ? 'scale(1.05)' : 'scale(1)',
                            boxShadow: language === lang.code ? '0 4px 12px rgba(79, 70, 229, 0.3)' : 'none'
                        }}
                    >
                        {lang.flag}
                    </button>
                ))}
            </div>
        </div>
    );
}
