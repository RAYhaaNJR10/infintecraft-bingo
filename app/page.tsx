"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Lock, Trophy, PlayCircle, PlusCircle } from "lucide-react";

export default function Home() {
    const [existingTeamId, setExistingTeamId] = useState<string | null>(null);

    useEffect(() => {
        const storedTeam = localStorage.getItem('enigma_team_id');
        if (storedTeam) {
            setExistingTeamId(storedTeam);
        }
    }, []);

    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-6 text-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#0a0a0a] to-black">
            <div className="mb-8 relative group cursor-default">
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg blur opacity-25 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                <h1 className="relative font-bold text-6xl md:text-8xl bg-clip-text text-transparent bg-gradient-to-br from-white via-gray-200 to-gray-500 tracking-tighter">
                    ENIGMA
                </h1>
            </div>

            <p className="text-xl md:text-2xl text-gray-400 mb-12 max-w-xl font-light">
                The ultimate tech scavenger hunt. <br />
                <span className="text-purple-400 font-medium">Decode. Search. Win.</span>
            </p>

            <div className="flex flex-col gap-4 w-full max-w-md">

                {existingTeamId ? (
                    <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <Link href="/game" className="group relative px-8 py-5 bg-white text-black font-bold text-lg rounded-xl overflow-hidden transition-transform hover:scale-[1.02] active:scale-95 shadow-lg shadow-purple-900/20">
                            <span className="relative z-10 flex items-center justify-center gap-2">
                                <PlayCircle className="w-5 h-5 fill-black text-white" /> Continue Last Session
                            </span>
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-blue-400 opacity-0 group-hover:opacity-20 transition-opacity" />
                        </Link>

                        <Link href="/register" onClick={() => localStorage.removeItem('enigma_team_id')} className="px-8 py-3 bg-zinc-900 border border-zinc-800 text-zinc-400 font-medium text-sm rounded-xl hover:bg-zinc-800 hover:text-white transition-colors flex items-center justify-center gap-2">
                            <PlusCircle className="w-4 h-4" /> Register New Team
                        </Link>
                    </div>
                ) : (
                    <Link href="/register" className="group relative px-8 py-5 bg-white text-black font-bold text-lg rounded-xl overflow-hidden transition-transform hover:scale-105 active:scale-95 shadow-lg shadow-purple-900/20">
                        <span className="relative z-10 flex items-center justify-center gap-2">
                            Join Event <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </span>
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-blue-400 opacity-0 group-hover:opacity-20 transition-opacity" />
                    </Link>
                )}

                <div className="flex gap-4 mt-2">
                    <Link href="/leaderboard" className="flex-1 px-6 py-4 bg-white/5 border border-white/10 text-white font-semibold rounded-xl hover:bg-white/10 transition-colors flex items-center justify-center gap-2">
                        <Trophy className="w-5 h-5 text-yellow-500" /> Leaderboard
                    </Link>
                </div>
            </div>

            <div className="mt-16 pt-8 border-t border-white/5 w-full max-w-md flex justify-center">
                <Link href="/admin" className="text-xs text-gray-600 hover:text-gray-400 flex items-center gap-1">
                    <Lock className="w-3 h-3" /> Admin Access
                </Link>
            </div>
        </main>
    );
}
