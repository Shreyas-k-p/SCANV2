import React, { useState, useEffect } from 'react';

// Fun & Witty Robot Messages
const robotMessages = [
    "I promise I don't eat the food... I rust! 🤖",
    "My favorite number is 010101! 🔢",
    "Do you need a byte to eat? 💾",
    "I'm training to be a toaster one day! 🍞",
    "Scanning for French Fries... 🍟",
    "Beep boop! You look hungry! 😋",
    "Don't worry, I don't track your cookies! 🍪",
    "I accept payment in AA batteries! 🔋",
    "Error 404: Hunger not found. Wait, yes it is! 🍕",
    "Are you a robot too? click the box if not! ☑️",
    "My mother was a calculator! 🧮"
];

export default function LoginMascot({ focusedField, isTyping }) {
    const [eyeAnimationOffset, setEyeAnimationOffset] = useState({ x: 0, y: 0 });
    const [message, setMessage] = useState("Hi! I'm serving you today! 🤖");
    const [isBlinking, setIsBlinking] = useState(false);
    const [isCrying, setIsCrying] = useState(false);
    const [isJumping, setIsJumping] = useState(false);

    // Derived state instead of useEffect syncing
    const isHiding = !isCrying && !isTyping && focusedField === 'secret';

    // Blinking logic
    useEffect(() => {
        const blinkInterval = setInterval(() => {
            setIsBlinking(true);
            setTimeout(() => setIsBlinking(false), 150);
        }, 3500);
        return () => clearInterval(blinkInterval);
    }, []);

    // Focus and Interaction Logic - Eyes (Animations only)
    useEffect(() => {
        if (isCrying) return;

        if (isTyping) {
            // Scanning effect - wiggling offset
            const scanInterval = setInterval(() => {
                setEyeAnimationOffset(prev => ({ x: prev.x === -6 ? 6 : -6, y: 0 }));
            }, 150);
            return () => {
                clearInterval(scanInterval);
                setEyeAnimationOffset({ x: 0, y: 0 }); // Reset offset
            };
        } else {
            // Reset animation offset when not typing
            setEyeAnimationOffset({ x: 0, y: 0 });
        }
    }, [isCrying, isTyping]); // focusedField is not needed for animation trigger really

    // Random Look Aside and Jump when Idle
    useEffect(() => {
        if (focusedField || isCrying || isTyping) return;

        const activityInterval = setInterval(() => {
            const action = Math.random();

            if (action > 0.7) {
                // Look around
                const randomX = Math.floor(Math.random() * 20) - 10;
                const randomY = Math.floor(Math.random() * 10) - 5;
                setEyeAnimationOffset({ x: randomX, y: randomY });
                setTimeout(() => setEyeAnimationOffset({ x: 0, y: 0 }), 1500);

            } else if (action > 0.4) {
                // ... logic uses specialized states like isJumping
                // But if we want eye movement during jump:
                setIsJumping(true);
                setTimeout(() => setIsJumping(false), 600);

                setIsBlinking(true);
                setEyeAnimationOffset({ x: 0, y: -5 });
                setTimeout(() => {
                    setIsBlinking(false);
                    setEyeAnimationOffset({ x: 0, y: 0 });
                }, 600);
            }
            // Random message state logic
            if (Math.random() > 0.8) {
                const randomMsg = robotMessages[Math.floor(Math.random() * robotMessages.length)];
                setMessage(randomMsg);
            }

        }, 3000);

        return () => clearInterval(activityInterval);
    }, [focusedField, isCrying, isTyping]);

    const handlePoke = () => {
        setIsCrying(true);
        setMessage("Ouch! Why did you poke me?! 😭😭");

        // Stop crying after 3 seconds
        setTimeout(() => {
            setIsCrying(false);
            setMessage("Hmph! That wasn't very nice! 😤");
        }, 3000);
    };

    // Calculate display message (Derived State) & Eye Position
    let displayMessage = message;
    let baseEyeX = 0;
    let baseEyeY = 0;

    if (!isCrying) {
        if (isTyping) {
            displayMessage = "Processing input... ⚡";
        }
        else if (focusedField === 'secret') {
            displayMessage = "I won't peek! My sensors are covered! 🙈";
        }
        else if (focusedField) {
            baseEyeY = 5; // Look down
            if (focusedField === 'name') displayMessage = "Ooh, nice name! 📝";
            else if (focusedField === 'id') displayMessage = "Checking your ID... Beep! 🔢";
            else if (focusedField === 'role') displayMessage = "Pick your destiny! 👔";
        }
    }

    const eyePosition = {
        x: baseEyeX + eyeAnimationOffset.x,
        y: baseEyeY + eyeAnimationOffset.y
    };

    return (
        <div
            onClick={handlePoke}

            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                zIndex: 99, // Lower z-index as it is not an overlay anymore
                width: '100%',
                maxWidth: '200px',
                cursor: 'pointer',
                margin: '0 auto 1rem auto', // Centering logic
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
                border: isCrying ? '3px solid #ef4444' : '3px solid #38bdf8', // Red when crying
                animation: isCrying ? 'shake 0.5s ease-in-out infinite' : 'float 3s ease-in-out infinite',
                zIndex: 30,
                transformOrigin: 'bottom center'
            }}>
                <p style={{ margin: 0, color: '#0f172a', fontWeight: '800', fontSize: '0.95rem' }}>
                    {displayMessage}
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

            {/* Robot SVG */}
            <div style={{
                width: '180px',
                height: '160px',
                position: 'relative',
                filter: 'drop-shadow(0 15px 25px rgba(0,0,0,0.25))',
                animation: isCrying ? 'shake 0.5s ease-in-out infinite' : (isJumping ? 'jump 0.6s ease-in-out' : 'hover 4s ease-in-out infinite')
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
                        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                            <feGaussianBlur stdDeviation="2" result="blur" />
                            <feComposite in="SourceGraphic" in2="blur" operator="over" />
                        </filter>
                    </defs>

                    <g transform="translate(100, 90)">
                        {/* Body */}
                        <path d="M-35,20 Q-40,65 0,70 Q40,65 35,20 Z" fill="url(#bodyGradient)" stroke="#94a3b8" strokeWidth="1" />
                        <path d="M-25,50 Q0,55 25,50" fill="none" stroke="#cbd5e1" strokeWidth="2" />

                        {/* Arms - Raise when crying! */}
                        <g transform={`rotate(${isCrying ? -45 : (isHiding ? -20 : 5)}, -45, 30)`}>
                            <path d="M-40,30 Q-55,40 -45,60 Q-35,65 -30,50 Z" fill="url(#bodyGradient)" stroke="#cbd5e1" strokeWidth="1" />
                        </g>
                        <g transform={`rotate(${isCrying ? 45 : (isHiding ? 20 : -5)}, 45, 30)`}>
                            <path d="M40,30 Q55,40 45,60 Q35,65 30,50 Z" fill="url(#bodyGradient)" stroke="#cbd5e1" strokeWidth="1" />
                        </g>

                        <ellipse cx="0" cy="22" rx="30" ry="5" fill="#000" opacity="0.2" filter="url(#glow)" />

                        {/* HEAD Group */}
                        <g transform={`translate(0, ${isHiding ? 10 : 0}) rotate(${isHiding ? 10 : 0})`}>
                            <rect x="-60" y="-70" width="120" height="85" rx="35" fill="url(#bodyGradient)" stroke="#e2e8f0" strokeWidth="2" />
                            <path d="M-40,-62 Q0,-68 40,-62" fill="none" stroke="white" strokeWidth="4" opacity="0.8" strokeLinecap="round" />
                            <path d="M-60,-40 L-68,-40 Q-72,-40 -72,-25 Q-72,-10 -68,-10 L-60,-10 Z" fill="#e2e8f0" />
                            <path d="M60,-40 L68,-40 Q72,-40 72,-25 Q72,-10 68,-10 L60,-10 Z" fill="#e2e8f0" />
                            <rect x="-50" y="-55" width="100" height="60" rx="25" fill="url(#screenGradient)" stroke="#334155" strokeWidth="1" />

                            {/* FACE FEATURES */}
                            <g transform={`translate(${eyePosition.x}, ${eyePosition.y})`}>
                                {(isCrying) ? (
                                    // Crying Face
                                    <>
                                        {/* Sad Eyes */}
                                        <path d="M-30,-25 Q-20,-35 -10,-25" fill="none" stroke="#22d3ee" strokeWidth="3" strokeLinecap="round" filter="url(#glow)" />
                                        <path d="M10,-25 Q20,-35 30,-25" fill="none" stroke="#22d3ee" strokeWidth="3" strokeLinecap="round" filter="url(#glow)" />

                                        {/* Tears */}
                                        <path d="M-20,-20 Q-25,-10 -20,0 Q-15,-10 -20,-20 Z" fill="#60a5fa" opacity="0.8">
                                            <animate attributeName="d" values="M-20,-20 Q-25,-10 -20,0 Q-15,-10 -20,-20 Z; M-20,0 Q-25,10 -20,20 Q-15,10 -20,0 Z" dur="1s" repeatCount="indefinite" />
                                            <animate attributeName="opacity" values="0.8;0" dur="1s" repeatCount="indefinite" />
                                        </path>
                                        <path d="M20,-20 Q15,-10 20,0 Q25,-10 20,-20 Z" fill="#60a5fa" opacity="0.8">
                                            <animate attributeName="d" values="M20,-20 Q15,-10 20,0 Q25,-10 20,-20 Z; M20,0 Q15,10 20,20 Q25,10 20,0 Z" dur="1s" repeatCount="indefinite" begin="0.5s" />
                                            <animate attributeName="opacity" values="0.8;0" dur="1s" repeatCount="indefinite" begin="0.5s" />
                                        </path>

                                        {/* Sad Mouth (Wavvy) */}
                                        <path d="M-15,-5 Q0,5 15,-5" fill="none" stroke="#22d3ee" strokeWidth="3" strokeLinecap="round" filter="url(#glow)" />
                                    </>
                                ) : (!isHiding ? (
                                    <>
                                        {/* Happy Eyes */}
                                        <g transform="translate(-22, -35)">
                                            {isBlinking ? (
                                                <line x1="-8" y1="5" x2="8" y2="5" stroke="#22d3ee" strokeWidth="3" strokeLinecap="round" filter="url(#glow)" />
                                            ) : (
                                                <path d="M-10,5 Q0,-8 10,5" fill="#22d3ee" filter="url(#glow)" />
                                            )}
                                        </g>
                                        <g transform="translate(22, -35)">
                                            {isBlinking ? (
                                                <line x1="-8" y1="5" x2="8" y2="5" stroke="#22d3ee" strokeWidth="3" strokeLinecap="round" filter="url(#glow)" />
                                            ) : (
                                                <path d="M-10,5 Q0,-8 10,5" fill="#22d3ee" filter="url(#glow)" />
                                            )}
                                        </g>
                                        <path d="M-10,-10 Q0,-2 10,-10" fill="none" stroke="#22d3ee" strokeWidth="3" strokeLinecap="round" filter="url(#glow)" />
                                    </>
                                ) : (
                                    // Hiding Face
                                    <>
                                        <line x1="-30" y1="-30" x2="-15" y2="-30" stroke="#22d3ee" strokeWidth="3" strokeLinecap="round" filter="url(#glow)" />
                                        <line x1="15" y1="-30" x2="30" y2="-30" stroke="#22d3ee" strokeWidth="3" strokeLinecap="round" filter="url(#glow)" />
                                        <circle cx="0" cy="-15" r="5" fill="#22d3ee" filter="url(#glow)" />
                                    </>
                                ))}
                            </g>

                            {isHiding && !isCrying && (
                                <g transform="translate(0, -10)">
                                    <circle cx="-25" cy="-25" r="12" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="1" />
                                    <circle cx="25" cy="-25" r="12" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="1" />
                                </g>
                            )}
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
                @keyframes jump {
                    0% { transform: translateY(0) scale(1); }
                    50% { transform: translateY(-40px) scale(1.1); }
                    100% { transform: translateY(0) scale(1); }
                }
                @keyframes shake {
                    0%, 100% { transform: translate(0, 0) rotate(0deg); }
                    25% { transform: translate(-5px, 5px) rotate(-5deg); }
                    50% { transform: translate(0, 0) rotate(0deg); }
                    75% { transform: translate(5px, 5px) rotate(5deg); }
                }
            `}</style>
        </div>
    );
}
