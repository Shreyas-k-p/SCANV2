import React from 'react';
import { Utensils } from 'lucide-react';

const BrandLogo = ({ size = 60 }) => {
    return (
        <div className="brand-logo-container" style={{ width: size, height: size }}>

            {/* Glow Effect Background */}
            <div className="logo-glow"></div>

            {/* Frame Corners */}
            <div className="corner top-left"></div>
            <div className="corner top-right"></div>
            <div className="corner bottom-left"></div>
            <div className="corner bottom-right"></div>

            {/* Animated Scan Line */}
            <div className="scan-line"></div>

            {/* Central Icon */}
            <div className="logo-icon">
                <Utensils
                    size={size * 0.55}
                    color="white"
                    strokeWidth={2.5}
                />
            </div>

            <style>{`
                .brand-logo-container {
                    position: relative;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 8px;
                }

                .logo-glow {
                    position: absolute;
                    inset: 0;
                    background: rgba(6, 182, 212, 0.1);
                    filter: blur(20px);
                    border-radius: 50%;
                    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
                }

                .corner {
                    position: absolute;
                    width: 25%;
                    height: 25%;
                    border-color: #22d3ee;
                    border-style: solid;
                    border-width: 0;
                    box-shadow: 0 0 10px rgba(34, 211, 238, 0.5);
                }

                .top-left {
                    top: 0; left: 0;
                    border-top-width: 3px;
                    border-left-width: 3px;
                    border-top-left-radius: 8px;
                }

                .top-right {
                    top: 0; right: 0;
                    border-top-width: 3px;
                    border-right-width: 3px;
                    border-top-right-radius: 8px;
                }

                .bottom-left {
                    bottom: 0; left: 0;
                    border-bottom-width: 3px;
                    border-left-width: 3px;
                    border-bottom-left-radius: 8px;
                }

                .bottom-right {
                    bottom: 0; right: 0;
                    border-bottom-width: 3px;
                    border-right-width: 3px;
                    border-bottom-right-radius: 8px;
                }

                .scan-line {
                    position: absolute;
                    left: 0; right: 0;
                    height: 2px;
                    background: linear-gradient(90deg, transparent, #22d3ee, transparent);
                    box-shadow: 0 0 15px #22d3ee;
                    z-index: 20;
                    animation: scan 3s cubic-bezier(0.4, 0, 0.2, 1) infinite;
                }

                .logo-icon {
                    position: relative;
                    z-index: 10;
                    filter: drop-shadow(0 0 15px rgba(6, 182, 212, 0.8));
                    transition: transform 0.3s ease;
                }
                
                .brand-logo-container:hover .logo-icon {
                    transform: scale(1.1);
                }

                @keyframes scan {
                    0% { top: 10%; opacity: 0; }
                    15% { opacity: 1; }
                    85% { opacity: 1; }
                    100% { top: 90%; opacity: 0; }
                }

                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: .5; }
                }
            `}</style>
        </div>
    );
};

export default BrandLogo;
