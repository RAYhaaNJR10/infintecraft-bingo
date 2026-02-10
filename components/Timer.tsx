"use client";

import { useEffect, useState } from 'react';

interface TimerProps {
    startTime: number; // timestamp
    duration: number; // ms
    onExpire?: () => void;
}

export default function Timer({ startTime, duration, onExpire }: TimerProps) {
    const [timeLeft, setTimeLeft] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            const now = Date.now();
            const elapsed = now - startTime;
            const remaining = Math.max(0, duration - elapsed);

            setTimeLeft(remaining);

            if (remaining <= 0) {
                clearInterval(interval);
                if (onExpire) onExpire();
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [startTime, duration, onExpire]);

    const formatTime = (ms: number) => {
        const totalSeconds = Math.floor(ms / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    return (
        <div className="font-mono text-4xl md:text-6xl font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 drop-shadow-[0_0_10px_rgba(0,0,0,0.5)]">
            {formatTime(timeLeft)}
        </div>
    );
}
