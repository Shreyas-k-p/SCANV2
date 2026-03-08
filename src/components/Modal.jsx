import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

/**
 * Professional Portal-based Modal
 * - Renders at document.body level to avoid stacking context issues
 * - Integrated scroll lock
 * - Animated overlay and content
 */
export default function Modal({ isOpen, onClose, children, maxWidth = "550px" }) {
    // Scroll Lock
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
        return () => { document.body.style.overflow = 'auto'; };
    }, [isOpen]);

    // Handle ESC key
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    if (!isOpen) return null;

    return createPortal(
        <div
            style={{
                position: 'fixed',
                inset: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                backdropFilter: 'blur(4px)',
                zIndex: 9999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '1rem',
                animation: 'fadeIn 0.2s ease-out'
            }}
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div
                className="glass-modal-content"
                style={{
                    width: '100%',
                    maxWidth: maxWidth,
                    padding: '0',
                    overflowX: 'hidden',
                    overflowY: 'auto',
                    maxHeight: '90vh',
                    borderRadius: '28px',
                    position: 'relative',
                    boxShadow: '0 25px 60px rgba(0,0,0,0.6)',
                    animation: 'slideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
                }}
            >
                {children}
            </div>

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes slideUp {
                    from { transform: translateY(30px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
            `}</style>
        </div>,
        document.body
    );
}
