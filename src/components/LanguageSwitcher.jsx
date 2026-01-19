import React from 'react';
import { useApp } from '../context/AppContext';
import { Globe } from 'lucide-react';

export default function LanguageSwitcher() {
    const { language, setLanguage, theme, toggleTheme } = useApp();

    const languages = [
        { code: 'en', label: 'English' },
        { code: 'hi', label: 'हिंदी (Hindi)' },
        { code: 'es', label: 'Español (Spanish)' },
        { code: 'fr', label: 'Français (French)' },
        { code: 'de', label: 'Deutsch (German)' },
        { code: 'zh', label: '中文 (Chinese)' },
        { code: 'ja', label: '日本語 (Japanese)' },
        { code: 'ar', label: 'العربية (Arabic)' }
    ];

    return (
        <div className="language-switcher-container">
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <button
                    onClick={toggleTheme}
                    title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
                    className="theme-toggle-btn"
                    style={{
                        background: 'var(--card-bg)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '12px',
                        width: '42px',
                        height: '42px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.2rem',
                        transition: 'all 0.2s ease',
                        color: 'var(--text-light)',
                        boxShadow: 'var(--shadow-sm)'
                    }}
                >
                    {theme === 'light' ? '🌙' : '☀️'}
                </button>

                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <div style={{
                        position: 'absolute',
                        left: '12px',
                        pointerEvents: 'none',
                        color: 'var(--text-dim)',
                        display: 'flex',
                        alignItems: 'center'
                    }}>
                        <Globe size={16} />
                    </div>
                    <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        style={{
                            appearance: 'none',
                            background: 'var(--card-bg)',
                            color: 'var(--text-light)',
                            border: '1px solid var(--border-color)',
                            borderRadius: '12px',
                            padding: '0.6rem 2.5rem 0.6rem 2.5rem',
                            fontSize: '0.95rem',
                            fontWeight: '500',
                            cursor: 'pointer',
                            outline: 'none',
                            minWidth: '140px',
                            boxShadow: 'var(--shadow-sm)',
                            fontFamily: 'inherit'
                        }}
                    >
                        {languages.map(lang => (
                            <option key={lang.code} value={lang.code} style={{ background: 'var(--card-bg)', color: 'var(--text-light)' }}>
                                {lang.label}
                            </option>
                        ))}
                    </select>
                    <div style={{
                        position: 'absolute',
                        right: '12px',
                        pointerEvents: 'none',
                        color: 'var(--text-dim)',
                        fontSize: '0.8rem'
                    }}>
                        ▼
                    </div>
                </div>
            </div>
        </div>
    );
}
