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
        <div style={{ position: 'relative', display: 'inline-block' }}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button
                    onClick={toggleTheme}
                    title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
                    style={{
                        background: 'var(--glass-bg)',
                        border: '1px solid var(--glass-border)',
                        borderRadius: '50%',
                        width: '40px',
                        height: '40px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.2rem',
                        transition: 'all 0.3s ease',
                        color: 'var(--text-light)',
                        marginRight: '12px',
                        boxShadow: 'var(--shadow-sm)'
                    }}
                    onMouseEnter={e => {
                        e.currentTarget.style.transform = 'scale(1.1)';
                        e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                    }}
                    onMouseLeave={e => {
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                    }}
                >
                    {theme === 'light' ? '🌙' : '☀️'}
                </button>
                {languages.map(lang => (
                    <button
                        key={lang.code}
                        onClick={() => setLanguage(lang.code)}
                        title={lang.label}
                        style={{
                            background: language === lang.code
                                ? 'var(--gradient-accent)'
                                : 'rgba(255, 255, 255, 0.2)',
                            border: language === lang.code
                                ? 'none'
                                : '1px solid var(--glass-border)',
                            borderRadius: '50%',
                            width: '40px',
                            height: '40px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.2rem',
                            transition: 'all 0.3s ease',
                            color: language === lang.code ? 'white' : 'inherit',
                            boxShadow: language === lang.code
                                ? '0 4px 15px rgba(0,0,0,0.2)'
                                : 'none',
                            transform: language === lang.code ? 'scale(1.1)' : 'scale(1)'
                        }}
                    >
                        {lang.flag}
                    </button>
                ))}
            </div>
        </div>
    );
}
