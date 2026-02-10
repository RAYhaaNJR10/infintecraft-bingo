"use client";

import { useState } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import confetti from 'canvas-confetti';

type CardCell = {
    id: string;
    label: string;
    completed: boolean;
};

interface BingoGridProps {
    card: CardCell[];
    teamId: string;
    onMark: (cellId: string) => Promise<boolean>; // Returns true if bingo achieved
    disabled?: boolean;
}

export default function BingoGrid({ card, teamId, onMark, disabled }: BingoGridProps) {
    // Optimistic UI state
    const [localCard, setLocalCard] = useState(card);

    const handleClick = async (cellId: string) => {
        if (disabled) return;

        // Optimistic update
        setLocalCard(prev => prev.map(c => c.id === cellId ? { ...c, completed: !c.completed } : c));

        try {
            const isBingo = await onMark(cellId);
            if (isBingo) {
                confetti({
                    particleCount: 100,
                    spread: 70,
                    origin: { y: 0.6 }
                });
            }
        } catch (e) {
            // Revert on error
            setLocalCard(card);
            console.error("Failed to mark card", e);
        }
    };

    return (
        <div className="grid grid-cols-3 gap-3 w-full max-w-md mx-auto p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
            {localCard.map((cell) => (
                <button
                    key={cell.id}
                    onClick={() => handleClick(cell.id)}
                    disabled={disabled}
                    className={twMerge(
                        "aspect-square flex items-center justify-center p-2 text-sm md:text-base font-bold text-center rounded-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-95",
                        cell.completed
                            ? "bg-green-500 text-black shadow-[0_0_15px_rgba(34,197,94,0.5)] border-green-400"
                            : "bg-gray-800/80 text-gray-300 hover:bg-gray-700 hover:text-white border border-white/5",
                        disabled && "opacity-50 cursor-not-allowed hover:scale-100"
                    )}
                >
                    {cell.label}
                </button>
            ))}
        </div>
    );
}
