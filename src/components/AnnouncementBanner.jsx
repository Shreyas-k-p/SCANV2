import React from 'react';
import { Megaphone, X, Info, AlertTriangle, CheckCircle } from 'lucide-react';
import './AnnouncementBanner.css';

const AnnouncementBanner = ({ announcement, onClose }) => {
    if (!announcement) return null;

    const icons = {
        info: <Info size={20} />,
        warning: <AlertTriangle size={20} />,
        success: <CheckCircle size={20} />
    };

    return (
        <div className={`announcement-banner ${announcement.type || 'info'}`}>
            <div className="banner-icon">
                {icons[announcement.type] || icons.info}
            </div>
            <div className="banner-content">
                <div className="banner-title">{announcement.title}</div>
                <div className="banner-body">{announcement.content}</div>
                <div className="banner-date">
                    {new Date(announcement.created_at).toLocaleDateString()}
                </div>
            </div>
            {onClose && (
                <button className="banner-close" onClick={onClose}>
                    <X size={18} />
                </button>
            )}
        </div>
    );
};

export default AnnouncementBanner;
