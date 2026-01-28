import React, { useState, useEffect } from 'react';

// Random idle messages about food/menu
const idleMessages = [
    "I love the smell of digital pixels in the morning! 🍳",
    "Make sure to check the specials! 🌟",
    "I'd recommend the Dosa, if I could eat! 🥞",
    "Is it lunch time yet? 🕛",
    "Loading deliciousness... 100% 🍲",
    "Don't click me, click the food! 🍱",
    "My sensors detect an empty stomach! 📉",
    "Scan4Serve: Now with 50% more robot! 🤖"
];

export default function MenuBot({ activeMessage, menuItems = [], t = (s) => s, jumpTrigger = 0, positionMode = 'bottom', isAlwaysDancing = false, customStyle = {} }) {
    const [eyePosition, setEyePosition] = useState({ x: 0, y: 0 });
    const [message, setMessage] = useState("Hungry? I'm taking notes! 📝");
    const [isBlinking, setIsBlinking] = useState(false);
    const [isDancing, setIsDancing] = useState(false);
    const [isJumping, setIsJumping] = useState(false);
    const [isSpinning, setIsSpinning] = useState(false); // New state for return animation

    // States for interaction
    // const [pokeCount, setPokeCount] = useState(0); // Unused
    const isVisible = true; // Always visible as setter was unused
    const isAway = false; // Always present as setter was unused
    const [pose, setPose] = useState('normal'); // normal, coverEyes, salute

    // Detect return from top to bottom
    const [prevPositionMode, setPrevPositionMode] = useState(positionMode);

    useEffect(() => {
        if (prevPositionMode === 'top' && positionMode === 'bottom') {
            setIsSpinning(true);
            setTimeout(() => setIsSpinning(false), 1000);
        }
        setPrevPositionMode(positionMode);
    }, [positionMode, prevPositionMode]);

    // Blinking logic
    useEffect(() => {
        const blinkInterval = setInterval(() => {
            setIsBlinking(true);
            setTimeout(() => setIsBlinking(false), 150);
        }, 3500);
        return () => clearInterval(blinkInterval);
    }, []);

    // Message update logic
    useEffect(() => {
        if (!isAway && activeMessage) {
            setMessage(activeMessage);
            setEyePosition({ x: 0, y: -2 }); // Look up/excited
        } else if (!isAway) {
            // If no active message from parent and not away, revert to idle chatter occasionally
            const idleInterval = setInterval(() => {
                if (Math.random() > 0.6) {
                    let msg = "";
                    // 50% chance to recommend specific item if available
                    if (menuItems && menuItems.length > 0 && Math.random() > 0.5) {
                        const availableItems = menuItems.filter(i => i.available);
                        if (availableItems.length > 0) {
                            const randomItem = availableItems[Math.floor(Math.random() * availableItems.length)];
                            const phrases = [
                                `You have to try the ${t(randomItem.name)}! 😋`,
                                `My data says ${t(randomItem.name)} is popular! 📊`,
                                `I'd order ${t(randomItem.name)} if I had a mouth! 🤖`,
                                `Chef recommends: ${t(randomItem.name)}! 👨‍🍳`,
                                `${t(randomItem.name)} looks amazing today! ✨`
                            ];
                            msg = phrases[Math.floor(Math.random() * phrases.length)];
                        }
                    }

                    if (!msg) {
                        msg = idleMessages[Math.floor(Math.random() * idleMessages.length)];
                    }

                    setMessage(msg);
                    setEyePosition({ x: 0, y: 0 });
                    // Dance when happy!
                    if (Math.random() > 0.7) {
                        setIsDancing(true);
                        setTimeout(() => setIsDancing(false), 2000);
                    }
                }
            }, 5000);
            return () => clearInterval(idleInterval);
        }
    }, [activeMessage, isAway, menuItems, t]);

    // Jump logic
    const [horizontalOffset, setHorizontalOffset] = useState(0);

    useEffect(() => {
        if (jumpTrigger > 0 && !isAway) {
            // Only jump if not at top/custom position logic? 
            // Or allow jump anywhere. Assuming jump is fine anywhere.
            setIsJumping(true);

            // Move randomly left or right when triggered
            const randomOffset = Math.floor(Math.random() * 60) - 30; // -30px to 30px
            setHorizontalOffset(prev => prev + randomOffset);

            setTimeout(() => setIsJumping(false), 1000); // Jump duration
        }
    }, [jumpTrigger, isAway]);

    // Query Logic
    const [showQueries, setShowQueries] = useState(false);

    const handlePoke = () => {
        if (!showQueries) {
            setShowQueries(true);
            setMessage("How can I help you today? 🤖");
        } else {
            setShowQueries(false);
            setMessage("Okay! I'll be here if you need me.");
        }

        // Simple bounce interaction
        setIsJumping(true);
        setTimeout(() => setIsJumping(false), 500);
    };

    const handleQuerySelect = (queryType) => {
        setEyePosition({ x: 0, y: -2 }); // Excited look

        if (queryType === 'login') {
            setMessage("Select a role and enter your ID! 🔑");
            setPose('normal');
            setIsDancing(true);
        } else if (queryType === 'secret') {
            setMessage("I won't look! Enter your secret key safely! 🙈");
            setPose('coverEyes');
        } else if (queryType === 'boss') {
            setMessage("At your service, Manager! 🫡");
            setPose('salute');
        } else if (queryType === 'name') {
            setMessage("I'm ScanBot v1.0! Nice to meet you! 👋");
            setPose('normal');
            setIsDancing(true);
        }

        // Reset state after delay
        setTimeout(() => {
            setShowQueries(false);
            setPose('normal');
            setIsDancing(false);
        }, 4000);
    };

    return (
        <div
            onClick={!isAway ? handlePoke : undefined}
            style={{
                position: 'fixed',
                bottom: positionMode === 'top' ? '85vh' : '20px', // Move based on mode
                right: isVisible ? '20px' : '-300px', // Slide out to right
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                zIndex: 9999,
                pointerEvents: isAway ? 'none' : 'auto',
                width: 'auto',
                cursor: 'pointer',
                transition: 'right 0.8s ease-in-out, transform 0.8s ease-in-out, bottom 0.8s cubic-bezier(0.68, -0.55, 0.27, 1.55)', // Bouncy transitions
                transform: `translateX(${horizontalOffset}px)`,
                filter: 'drop-shadow(0 5px 15px rgba(0,0,0,0.2))',
                ...customStyle
            }}>
            {/* Speech Bubble */}
            <div className="speech-bubble" style={{
                background: 'white',
                padding: '12px 24px',
                borderRadius: '20px',
                marginBottom: '15px',
                boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
                position: 'relative',
                minWidth: '180px',
                textAlign: 'center',
                border: '3px solid #10b981', // Green/Emerald accent
                animation: 'float 3s ease-in-out infinite',
                zIndex: 30,
                transformOrigin: 'bottom center',
                opacity: isVisible ? 1 : 0,
                transition: 'opacity 0.3s'
            }}>
                <p style={{ margin: 0, color: '#0f172a', fontWeight: '800', fontSize: '0.95rem' }}>
                    {message}
                </p>
                <div style={{
                    position: 'absolute',
                    bottom: '-8px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 0,
                    height: 0,
                    borderLeft: '10px solid transparent',
                    borderRight: '10px solid transparent',
                    borderTop: '10px solid white'
                }} />
            </div>

            {/* Interactive Queries Menu */}
            {showQueries && (
                <div style={{
                    position: 'absolute',
                    top: '-70px',
                    display: 'flex',
                    gap: '12px',
                    justifyContent: 'center',
                    width: '320px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    zIndex: 40
                }}>
                    {[
                        { id: 'secret', icon: '🙈', label: 'Secret ID' },
                        { id: 'name', icon: '🤖', label: 'Name' },
                        { id: 'boss', icon: '🫡', label: 'Manager' },
                        { id: 'login', icon: '🔑', label: 'Login' }
                    ].map(q => (
                        <button
                            key={q.id}
                            onClick={(e) => {
                                e.stopPropagation();
                                handleQuerySelect(q.id);
                            }}
                            style={{
                                background: 'white',
                                border: '2px solid transparent',
                                backgroundImage: 'linear-gradient(white, white), linear-gradient(135deg, #6366f1, #ec4899)',
                                backgroundOrigin: 'border-box',
                                backgroundClip: 'padding-box, border-box',
                                borderRadius: '50%',
                                width: '45px',
                                height: '45px',
                                boxShadow: '0 4px 12px rgba(99, 102, 241, 0.25)',
                                cursor: 'pointer',
                                fontSize: '1.4rem',
                                transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                            title={q.label}
                            onMouseEnter={e => {
                                e.currentTarget.style.transform = 'translateY(-5px) scale(1.1)';
                                e.currentTarget.style.boxShadow = '0 8px 20px rgba(99, 102, 241, 0.4)';
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(99, 102, 241, 0.25)';
                            }}
                        >
                            {q.icon}
                        </button>
                    ))}
                </div>
            )}

            {/* Robot SVG with Book and Pen */}
            <div style={{
                width: '180px',
                height: '160px',
                position: 'relative',
                filter: 'drop-shadow(0 15px 25px rgba(0,0,0,0.25))',
                animation: isSpinning ? 'spinJump 1s ease-in-out' :
                    (isJumping ? 'jump 0.6s ease-in-out infinite' :
                        (showQueries ? 'hover 2s ease-in-out infinite' : // Listen when menu open
                            ((isDancing || isAlwaysDancing) && pose === 'normal' ? 'dance 1s ease-in-out infinite' : 'hover 4s ease-in-out infinite'))),
                transition: 'animation 0.3s'
            }}>
                <svg viewBox="0 0 200 180" width="100%" height="100%">
                    <defs>
                        <linearGradient id="bodyGradient" x1="50%" y1="0%" x2="50%" y2="100%">
                            <stop offset="0%" stopColor="#ffffff" />
                            <stop offset="20%" stopColor="#f1f5f9" />
                            <stop offset="100%" stopColor="#cbd5e1" />
                        </linearGradient>
                        <linearGradient id="screenGradient" x1="50%" y1="0%" x2="50%" y2="100%">
                            <stop offset="0%" stopColor="#1e293b" />
                            <stop offset="100%" stopColor="#0f172a" />
                        </linearGradient>
                        <filter id="glowMenu" x="-20%" y="-20%" width="140%" height="140%">
                            <feGaussianBlur stdDeviation="2" result="blur" />
                            <feComposite in="SourceGraphic" in2="blur" operator="over" />
                        </filter>
                    </defs>

                    <g transform="translate(100, 90)">
                        {/* Body */}
                        <path d="M-35,20 Q-40,65 0,70 Q40,65 35,20 Z" fill="url(#bodyGradient)" stroke="#94a3b8" strokeWidth="1" />
                        <path d="M-25,50 Q0,55 25,50" fill="none" stroke="#cbd5e1" strokeWidth="2" />

                        {/* LEFT ARM (Holding Book) */}
                        <g
                            style={{ transition: 'transform 0.5s ease-back-in-out' }}
                            transform={pose === 'coverEyes' ? "translate(-25, -20) rotate(140)" : (pose === 'salute' ? "translate(-45, 30) rotate(20)" : "translate(-45, 30) rotate(20)")}
                        >
                            <path d="M0,0 Q-15,10 -5,30 Q5,35 15,15 Z" fill="url(#bodyGradient)" stroke="#cbd5e1" strokeWidth="1" />
                            {/* The Book */}
                            <rect x="-25" y="10" width="30" height="35" rx="3" fill="#3b82f6" stroke="#1e3a8a" strokeWidth="1" transform="rotate(-15)" />
                            <rect x="-22" y="13" width="22" height="28" fill="white" transform="rotate(-15)" />
                            <line x1="-20" y1="18" x2="-5" y2="18" stroke="#cbd5e1" strokeWidth="1" transform="rotate(-15)" />
                            <line x1="-20" y1="23" x2="-5" y2="23" stroke="#cbd5e1" strokeWidth="1" transform="rotate(-15)" />
                            <line x1="-20" y1="28" x2="-5" y2="28" stroke="#cbd5e1" strokeWidth="1" transform="rotate(-15)" />
                        </g>

                        {/* RIGHT ARM (Holding Pen) */}
                        <g
                            style={{ transition: 'transform 0.5s ease-back-in-out' }}
                            transform={pose === 'coverEyes' ? "translate(25, -20) rotate(-140)" : (pose === 'salute' ? "translate(35, -35) rotate(-130)" : "translate(45, 30) rotate(-20)")}
                        >
                            <path d="M0,0 Q15,10 5,30 Q-5,35 -15,15 Z" fill="url(#bodyGradient)" stroke="#cbd5e1" strokeWidth="1" />
                            {/* The Pen */}
                            <path d="M5,20 L15,5 L18,8 L8,23 Z" fill="#ef4444" stroke="#991b1b" strokeWidth="1" />
                            <path d="M8,23 L5,26 L6,27 L9,24 Z" fill="#333" /> {/* Pen Tip */}
                        </g>

                        <ellipse cx="0" cy="22" rx="30" ry="5" fill="#000" opacity="0.2" filter="url(#glowMenu)" />

                        {/* HEAD Group */}
                        <g transform={`translate(0, 0)`}>
                            <rect x="-60" y="-70" width="120" height="85" rx="35" fill="url(#bodyGradient)" stroke="#e2e8f0" strokeWidth="2" />
                            <path d="M-40,-62 Q0,-68 40,-62" fill="none" stroke="white" strokeWidth="4" opacity="0.8" strokeLinecap="round" />
                            <path d="M-60,-40 L-68,-40 Q-72,-40 -72,-25 Q-72,-10 -68,-10 L-60,-10 Z" fill="#e2e8f0" />
                            <path d="M60,-40 L68,-40 Q72,-40 72,-25 Q72,-10 68,-10 L60,-10 Z" fill="#e2e8f0" />
                            <rect x="-50" y="-55" width="100" height="60" rx="25" fill="url(#screenGradient)" stroke="#334155" strokeWidth="1" />

                            {/* FACE FEATURES */}
                            <g transform={`translate(${eyePosition.x}, ${eyePosition.y})`}>
                                {/* Classic Happy Green Eyes */}
                                <g transform="translate(-22, -35)">
                                    {isBlinking || pose === 'coverEyes' ? (
                                        <line x1="-8" y1="5" x2="8" y2="5" stroke="#10b981" strokeWidth="3" strokeLinecap="round" filter="url(#glowMenu)" />
                                    ) : (
                                        <path d="M-10,5 Q0,-8 10,5" fill="#10b981" filter="url(#glowMenu)" />
                                    )}
                                </g>
                                <g transform="translate(22, -35)">
                                    {isBlinking || pose === 'coverEyes' ? (
                                        <line x1="-8" y1="5" x2="8" y2="5" stroke="#10b981" strokeWidth="3" strokeLinecap="round" filter="url(#glowMenu)" />
                                    ) : (
                                        <path d="M-10,5 Q0,-8 10,5" fill="#10b981" filter="url(#glowMenu)" />
                                    )}
                                </g>
                                <path d="M-10,-10 Q0,-2 10,-10" fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" filter="url(#glowMenu)" />
                            </g>
                        </g>
                    </g>
                </svg>
            </div>

            <style>{`
                @keyframes hover {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-12px); }
                }
                @keyframes float {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-5px); }
                }
                @keyframes dance {
                    0% { transform: rotate(0deg) translateY(0); }
                    25% { transform: rotate(-10deg) translateY(-10px); }
                    50% { transform: rotate(10deg) translateY(-5px); }
                    75% { transform: rotate(-5deg) translateY(-8px); }
                    100% { transform: rotate(0deg) translateY(0); }
                }
                @keyframes jump {
                    0% { transform: translateY(0) scale(1); }
                    50% { transform: translateY(-40px) scale(1.1); }
                    100% { transform: translateY(0) scale(1); }
                }
                @keyframes spinJump {
                    0% { transform: translateY(0) rotate(0deg) scale(1); }
                    30% { transform: translateY(-50px) rotate(180deg) scale(0.8); }
                    60% { transform: translateY(-20px) rotate(360deg) scale(1.1); }
                    100% { transform: translateY(0) rotate(360deg) scale(1); }
                }
            `}</style>
        </div>
    );
}
