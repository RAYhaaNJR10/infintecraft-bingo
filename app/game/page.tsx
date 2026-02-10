"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import BingoGrid from "@/components/BingoGrid";
import Timer from "@/components/Timer";
import { Loader2, Trophy, Sparkles, LogOut, Home, Play, Flag } from "lucide-react";
import confetti from 'canvas-confetti';

type GameState = {
    duration: number;
};

type TeamData = {
    id: string;
    name: string;
    card: any[];
    completedAt?: number;
    startTime?: number;
    endTime?: number;
};

const LINES = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Cols
    [0, 4, 8], [2, 4, 6]             // Diagonals
];

export default function GamePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [team, setTeam] = useState<TeamData | null>(null);
    const [gameState, setGameState] = useState<GameState | null>(null);

    const [showExitConfirm, setShowExitConfirm] = useState(false);
    const [showEndAttemptConfirm, setShowEndAttemptConfirm] = useState(false);
    const [showLineMessage, setShowLineMessage] = useState(false);
    const [lastLineCount, setLastLineCount] = useState(0);

    useEffect(() => {
        const teamId = localStorage.getItem('enigma_team_id');
        if (!teamId) {
            router.push('/register');
            return;
        }

        const fetchData = async () => {
            try {
                const res = await fetch(`/api/game/state?teamId=${teamId}`);
                const data = await res.json();

                if (data.team) {
                    setTeam(data.team);

                    // Check lines
                    if (data.team.card) {
                        const completedIndices = new Set(
                            data.team.card
                                .map((c: any, i: number) => c.completed ? i : -1)
                                .filter((i: number) => i !== -1)
                        );

                        let linesFound = 0;
                        LINES.forEach(line => {
                            if (line.every(idx => completedIndices.has(idx))) linesFound++;
                        });

                        if (linesFound > lastLineCount) {
                            setShowLineMessage(true);
                            setTimeout(() => setShowLineMessage(false), 3000);
                            confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
                            setLastLineCount(linesFound);
                        } else if (linesFound < lastLineCount) {
                            setLastLineCount(linesFound);
                        }
                    }
                } else {
                    localStorage.removeItem('enigma_team_id');
                    router.push('/register');
                }

                setGameState(data.gameState);
                setLoading(false);
            } catch (e) {
                console.error("Poll error", e);
            }
        };

        fetchData();
        const interval = setInterval(fetchData, 2000);
        return () => clearInterval(interval);
    }, [router, lastLineCount]);

    const handleStart = async () => {
        if (!team) return;
        await fetch('/api/team/start', {
            method: 'POST',
            body: JSON.stringify({ teamId: team.id })
        });
        // Refetch immediately handled by poll or next effect, 
        // but let's force update local state for snappiness if wanted, 
        // or just wait for poll (safe).
    };

    const handleEndAttempt = async () => {
        if (!team) return;
        await fetch('/api/team/end', {
            method: 'POST',
            body: JSON.stringify({ teamId: team.id })
        });
        setShowEndAttemptConfirm(false);
    };

    const handleMark = async (cellId: string) => {
        if (!team) return false;
        const res = await fetch('/api/card/mark', {
            method: 'POST',
            body: JSON.stringify({ teamId: team.id, cellId })
        });
        const data = await res.json();
        return data.success ? data.completed : false;
    };

    const handleExit = () => {
        router.push('/');
    };

    if (loading || !gameState || !team) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black text-white">
                <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
            </div>
        );
    }

    // PRE-START (Instructions / Start Button)
    if (!team.startTime) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-black bg-[url('/grid.svg')]">
                <div className="p-8 rounded-2xl bg-zinc-900/50 border border-zinc-800 backdrop-blur-md max-w-lg w-full relative">
                    <button
                        onClick={() => setShowExitConfirm(true)}
                        className="absolute top-4 right-4 text-zinc-500 hover:text-white"
                    >
                        <LogOut className="w-5 h-5" />
                    </button>

                    <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600 mb-4">
                        {team.name}
                    </h1>

                    <div className="text-zinc-300 text-lg mb-8 space-y-4">
                        <p>Currently waiting in the lobby.</p>
                        <p className="text-sm text-zinc-500">
                            When you are ready to begin your 12-minute attempt, press the button below.
                            The timer will start immediately for your team.
                        </p>
                    </div>

                    <button
                        onClick={handleStart}
                        className="w-full group relative px-8 py-4 bg-white text-black font-bold text-lg rounded-xl overflow-hidden transition-transform hover:scale-[1.02] active:scale-95 shadow-[0_0_20px_rgba(168,85,247,0.4)]"
                    >
                        <span className="relative z-10 flex items-center justify-center gap-2">
                            <Play className="w-5 h-5 fill-black" /> START ATTEMPT
                        </span>
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-blue-400 opacity-0 group-hover:opacity-20 transition-opacity" />
                    </button>
                </div>
                {/* Exit Modal */}
                {showExitConfirm && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                        <div className="bg-zinc-900 border border-zinc-700 p-6 rounded-2xl max-w-sm w-full">
                            <h3 className="text-xl font-bold text-white mb-2">Leave Lobby?</h3>
                            <div className="flex gap-3 justify-end mt-4">
                                <button onClick={() => setShowExitConfirm(false)} className="px-4 py-2 text-zinc-300">Cancel</button>
                                <button onClick={handleExit} className="px-4 py-2 bg-red-600 text-white rounded-lg font-bold">Exit</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // ACTIVE GAME
    const isExpired = team.startTime && (Date.now() - team.startTime > gameState.duration);
    const isEnded = team.endTime || team.completedAt || isExpired;

    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center p-4">

            {showLineMessage && !team.completedAt && (
                <div className="fixed top-24 z-50 animate-in slide-in-from-top-4 fade-in duration-300 pointer-events-none">
                    <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-bold px-6 py-3 rounded-full shadow-lg flex items-center gap-2">
                        <Sparkles className="w-5 h-5" /> LINE COMPLETED!
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="w-full max-w-4xl flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
                <div className="flex items-center gap-2 bg-zinc-900/80 px-4 py-2 rounded-full border border-white/5">
                    <span className="text-zinc-400 text-sm uppercase tracking-wider">Team</span>
                    <span className="font-bold text-lg text-purple-400">{team.name}</span>
                </div>

                {!isEnded && team.startTime && (
                    <Timer startTime={team.startTime} duration={gameState.duration} onExpire={() => { }} />
                )}
                {isExpired && !team.completedAt && <div className="text-red-500 font-bold text-2xl">TIME UP</div>}

                {!isEnded && (
                    <button
                        onClick={() => setShowEndAttemptConfirm(true)}
                        className="absolute md:relative top-4 right-4 md:top-auto md:right-auto text-red-500/50 hover:text-red-500 p-2 font-bold text-xs flex items-center gap-1 border border-red-900/30 rounded-lg hover:bg-red-900/10 transition-colors"
                    >
                        <Flag className="w-4 h-4" /> END ATTEMPT
                    </button>
                )}
            </div>

            <div className="relative w-full max-w-md">
                {team.completedAt ? (
                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/60 backdrop-blur-sm rounded-xl">
                        <div className="text-center animate-in zoom-in duration-300 p-6">
                            <Trophy className="w-20 h-20 text-yellow-400 mx-auto mb-4 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]" />
                            <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-br from-yellow-300 to-yellow-600 mb-6">
                                BINGO!
                            </h2>
                            <button
                                onClick={handleExit}
                                className="bg-white text-black font-bold px-8 py-3 rounded-full hover:scale-105 transition-transform flex items-center gap-2 mx-auto"
                            >
                                <Home className="w-4 h-4" /> Back to Home
                            </button>
                        </div>
                    </div>
                ) : isEnded ? (
                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/80 backdrop-blur-sm rounded-xl">
                        <div className="text-center animate-in zoom-in duration-300 p-6">
                            <h2 className="text-3xl font-bold text-red-500 mb-2">ATTEMPT ENDED</h2>
                            <p className="text-zinc-400 mb-6">Better luck next time!</p>
                            <button
                                onClick={handleExit}
                                className="bg-zinc-800 text-white font-bold px-8 py-3 rounded-full hover:bg-zinc-700 transition-colors flex items-center gap-2 mx-auto"
                            >
                                <Home className="w-4 h-4" /> Back to Home
                            </button>
                        </div>
                    </div>
                ) : null}

                <BingoGrid
                    card={team.card}
                    teamId={team.id}
                    onMark={handleMark}
                    disabled={!!isEnded}
                />
            </div>

            {/* End Attempt Confirmation */}
            {showEndAttemptConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-zinc-900 border border-zinc-700 p-6 rounded-2xl max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-200">
                        <h3 className="text-xl font-bold text-white mb-2">End This Attempt?</h3>
                        <p className="text-zinc-400 mb-6">
                            This will stop your timer and lock your card. You cannot undo this.
                        </p>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setShowEndAttemptConfirm(false)}
                                className="px-4 py-2 rounded-lg text-zinc-300 hover:text-white font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleEndAttempt}
                                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg font-bold shadow-lg shadow-red-900/20"
                            >
                                Yes, End It
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
