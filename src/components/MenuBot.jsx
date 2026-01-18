import React, { useState, useEffect } from 'react';

export default function MenuBot({ activeMessage, menuItems = [], t = (s) => s, jumpTrigger = 0 }) {
    const [eyePosition, setEyePosition] = useState({ x: 0, y: 0 });
    const [message, setMessage] = useState("Hungry? I'm taking notes! 📝");
    const [isBlinking, setIsBlinking] = useState(false);
    const [isDancing, setIsDancing] = useState(false);
    const [isJumping, setIsJumping] = useState(false);

    // States for interaction
    const [pokeCount, setPokeCount] = useState(0);
    const [isVisible, setIsVisible] = useState(true); // For running away
    const [isAway, setIsAway] = useState(false); // actually away

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
    }, [activeMessage, isAway]);

    // Jump logic
    useEffect(() => {
        if (jumpTrigger > 0 && !isAway) {
            setIsJumping(true);
            setTimeout(() => setIsJumping(false), 1000); // Jump duration
        }
    }, [jumpTrigger, isAway]);

    const handlePoke = () => {
        const newCount = pokeCount + 1;
        setPokeCount(newCount);

        if (newCount === 1) {
            // First touch: Run away and hide
            setMessage("Eek! Stranger danger! Running away! 🏃💨");
            setTimeout(() => {
                setIsVisible(false); // Trigger exit animation
            }, 1000); // Wait 1s so user sees message

            setIsAway(true);

            // Come back after 5 seconds
            setTimeout(() => {
                setIsVisible(true);
                setIsAway(false);
                setMessage("I'm back! Did check stock in the back. 📦");
                setEyePosition({ x: 0, y: 0 });
            }, 6000); // 1s delay + 5s wait

        } else if (newCount >= 2) {
            // Second touch: Angry leave
            setMessage("I am going on leave because of you! 😤");

            setTimeout(() => {
                // Funny follow up before disappearing
                setMessage("I don't get paid enough pixels for this harassment! Goodbye! 🛑");
            }, 1500);

            setTimeout(() => {
                setIsVisible(false);
                setIsAway(true);
            }, 3000);

            // Reset after a long time (e.g. 15s) so he's not gone forever
            setTimeout(() => {
                setIsVisible(true);
                setIsAway(false);
                setPokeCount(0); // Reset patience
                setMessage("Okay, I forgive you. But no more poking! 😠");
            }, 15000);
        }
    };

    return (
        <div
            onClick={!isAway ? handlePoke : undefined}
            style={{
                position: 'fixed',
                bottom: '20px',
                right: isVisible ? '20px' : '-300px', // Slide out to right
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                zIndex: 9999,
                pointerEvents: isAway ? 'none' : 'auto',
                width: 'auto',
                cursor: 'pointer',
                transition: 'right 0.8s ease-in-out', // Smooth run away
                filter: 'drop-shadow(0 5px 15px rgba(0,0,0,0.2))'
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

            {/* Robot SVG with Book and Pen */}
            <div style={{
                width: '180px',
                height: '160px',
                position: 'relative',
                filter: 'drop-shadow(0 15px 25px rgba(0,0,0,0.25))',
                animation: isJumping ? 'jump 0.6s ease-in-out infinite' : (isDancing ? 'dance 1s ease-in-out infinite' : 'hover 4s ease-in-out infinite'),
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
                        <g transform="translate(-45, 30) rotate(20)">
                            <path d="M0,0 Q-15,10 -5,30 Q5,35 15,15 Z" fill="url(#bodyGradient)" stroke="#cbd5e1" strokeWidth="1" />
                            {/* The Book */}
                            <rect x="-25" y="10" width="30" height="35" rx="3" fill="#3b82f6" stroke="#1e3a8a" strokeWidth="1" transform="rotate(-15)" />
                            <rect x="-22" y="13" width="22" height="28" fill="white" transform="rotate(-15)" />
                            <line x1="-20" y1="18" x2="-5" y2="18" stroke="#cbd5e1" strokeWidth="1" transform="rotate(-15)" />
                            <line x1="-20" y1="23" x2="-5" y2="23" stroke="#cbd5e1" strokeWidth="1" transform="rotate(-15)" />
                            <line x1="-20" y1="28" x2="-5" y2="28" stroke="#cbd5e1" strokeWidth="1" transform="rotate(-15)" />
                        </g>

                        {/* RIGHT ARM (Holding Pen) */}
                        <g transform="translate(45, 30) rotate(-20)">
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
                                    {isBlinking ? (
                                        <line x1="-8" y1="5" x2="8" y2="5" stroke="#10b981" strokeWidth="3" strokeLinecap="round" filter="url(#glowMenu)" />
                                    ) : (
                                        <path d="M-10,5 Q0,-8 10,5" fill="#10b981" filter="url(#glowMenu)" />
                                    )}
                                </g>
                                <g transform="translate(22, -35)">
                                    {isBlinking ? (
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
            `}</style>
        </div>
    );
}
