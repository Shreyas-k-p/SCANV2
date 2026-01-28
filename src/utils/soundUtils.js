// Simple notification sound using Web Audio API

let audioCtx = null;

const getAudioContext = () => {
    if (!audioCtx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) {
            audioCtx = new AudioContext();
        }
    }
    // Resume if suspended (browsers auto-suspend contexts created without gesture)
    if (audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume().catch(e => console.error("Audio resume failed", e));
    }
    return audioCtx;
};

// Helper to play a chord
const playChord = (frequencies, type = 'sine', duration = 0.5, volume = 1.0) => {
    try {
        const ctx = getAudioContext();
        if (!ctx) return;

        const now = ctx.currentTime;

        // Master gain for volume control
        const masterGain = ctx.createGain();
        masterGain.gain.setValueAtTime(volume, now);
        masterGain.connect(ctx.destination);

        frequencies.forEach(freq => {
            const oscillator = ctx.createOscillator();
            const oscGain = ctx.createGain();

            oscillator.type = type;
            oscillator.frequency.value = freq;

            oscillator.connect(oscGain);
            oscGain.connect(masterGain);

            // Envelope for the chord
            oscGain.gain.setValueAtTime(0, now);
            oscGain.gain.linearRampToValueAtTime(0.3, now + 0.05); // Attack
            oscGain.gain.exponentialRampToValueAtTime(0.01, now + duration); // Decay

            oscillator.start(now);
            oscillator.stop(now + duration);
        });

    } catch (e) {
        console.error("Audio play failed", e);
    }
};

// WAITER NOTIFICATION: Pleasant major chord (C Major)
export const playNotificationSound = () => {
    // C5, E5, G5 (C Major Triad) - Higher pitch for visibility
    const chord = [523.25, 659.25, 783.99];
    playChord(chord, 'triangle', 1.5, 0.8); // Triangle wave for a "chime" like sound, Volume 0.8
};

// KITCHEN NOTIFICATION: Urgent repetitive chord (Ringtone style)
export const playUrgentNotificationSound = () => {
    try {
        const ctx = getAudioContext();
        if (!ctx) return;

        const playRing = (startTime) => {
            const frequencies = [523.25, 659.25, 783.99, 1046.50]; // C Major 7
            const duration = 0.4;

            const masterGain = ctx.createGain();
            masterGain.gain.setValueAtTime(0.8, startTime); // High volume
            masterGain.connect(ctx.destination);

            frequencies.forEach(freq => {
                const osc = ctx.createOscillator();
                const noteGain = ctx.createGain();

                osc.type = 'square'; // Square wave for "digital/phone" sound
                osc.frequency.value = freq;

                osc.connect(noteGain);
                noteGain.connect(masterGain);

                noteGain.gain.setValueAtTime(0, startTime);
                noteGain.gain.linearRampToValueAtTime(0.2, startTime + 0.05);
                noteGain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

                osc.start(startTime);
                osc.stop(startTime + duration);
            });
        };

        // Ring pattern: Ring... Ring...
        const now = ctx.currentTime;
        playRing(now);
        playRing(now + 0.5);
        playRing(now + 2.0); // Repeat for urgency
        playRing(now + 2.5);

    } catch (e) {
        console.error("Audio play failed", e);
    }
};
