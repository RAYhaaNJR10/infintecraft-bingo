"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Trophy, Medal, Clock, Home, Search, ChevronDown, ChevronUp } from "lucide-react";

type Card = {
    id: string;
    label: string;
    completed: boolean;
    completedAt?: number;
};

type Team = {
    id: string;
    name: string;
    startTime?: number;
    endTime?: number;
    completedAt?: number;
    card: Card[];
};

export default function Leaderboard() {
    const [teams, setTeams] = useState<Team[]>([]);
    const [expandedTeamId, setExpandedTeamId] = useState<string | null>(null);

    useEffect(() => {
        const fetchTeams = async () => {
            const res = await fetch('/api/teams');
            const data = await res.json();
            // Sort: Completed fast > Found Most > In Progress
            const sorted = (data.teams as Team[]).sort((a, b) => {
                // 1. Most words found
                const aCount = a.card.filter(c => c.completed).length;
                const bCount = b.card.filter(c => c.completed).length;
                if (bCount !== aCount) return bCount - aCount;

                // 2. If same count, check time taken (if both finished or both have same count)
                // Lower time is better
                const aTime = (a.endTime || Date.now()) - (a.startTime || Date.now());
                const bTime = (b.endTime || Date.now()) - (b.startTime || Date.now());
                return aTime - bTime;
            });
            setTeams(sorted);
        };

        fetchTeams();
        const interval = setInterval(fetchTeams, 5000);
        return () => clearInterval(interval);
    }, []);

    const getRankIcon = (index: number) => {
        switch (index) {
            case 0: return <Trophy className="w-6 h-6 text-yellow-500" />;
            case 1: return <Medal className="w-6 h-6 text-gray-400" />;
            case 2: return <Medal className="w-6 h-6 text-amber-700" />;
            default: return <span className="text-zinc-500 font-mono font-bold">#{index + 1}</span>;
        }
    };

    const formatTime = (ms: number) => {
        if (!ms || ms < 0) return "--:--";
        const totalSeconds = Math.floor(ms / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    return (
        <div className="min-h-screen bg-black text-white p-6 flex flex-col items-center">
            <div className="w-full max-w-4xl flex justify-between items-center mb-8">
                <h1 className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-yellow-200 via-yellow-500 to-amber-700">
                    LEADERBOARD
                </h1>
                <Link href="/" className="bg-white/10 hover:bg-white/20 p-3 rounded-full transition-colors">
                    <Home className="w-6 h-6 text-white" />
                </Link>
            </div>

            <div className="w-full max-w-4xl bg-zinc-900/50 rounded-2xl border border-white/5 overflow-hidden">
                <div className="grid grid-cols-12 gap-2 p-4 bg-white/5 text-xs text-zinc-400 font-bold uppercase tracking-wider">
                    <div className="col-span-1 text-center">Rank</div>
                    <div className="col-span-4 pl-2">Team</div>
                    <div className="col-span-2 text-center">Words</div>
                    <div className="col-span-3 text-center">Total Time</div>
                    <div className="col-span-2 text-center">Avg Time</div>
                </div>

                <div className="divide-y divide-white/5">
                    {teams.map((team, idx) => {
                        const wordsFound = team.card.filter(c => c.completed).length;
                        const startTime = team.startTime || 0;
                        const endTime = team.endTime || (team.completedAt ? team.completedAt : Date.now());
                        const duration = team.startTime ? endTime - startTime : 0;
                        const avgTime = wordsFound > 0 && team.startTime ? duration / wordsFound : 0;
                        const isExpanded = expandedTeamId === team.id;

                        return (
                            <div key={team.id} className="transition-colors hover:bg-white/5 flex flex-col">
                                <div
                                    className="grid grid-cols-12 gap-2 p-4 items-center cursor-pointer"
                                    onClick={() => setExpandedTeamId(isExpanded ? null : team.id)}
                                >
                                    <div className="col-span-1 flex justify-center">{getRankIcon(idx)}</div>
                                    <div className="col-span-4 pl-2">
                                        <div className="font-bold text-lg text-white truncate">{team.name}</div>
                                        <div className="text-xs text-zinc-500 flex items-center gap-1">
                                            {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                            {isExpanded ? "Hide Details" : "View Details"}
                                        </div>
                                    </div>
                                    <div className="col-span-2 text-center font-mono text-xl text-purple-400 font-bold">
                                        {wordsFound}<span className="text-zinc-600 text-sm">/9</span>
                                    </div>
                                    <div className="col-span-3 text-center font-mono text-zinc-300">
                                        {team.startTime ? formatTime(duration) : "Not Started"}
                                    </div>
                                    <div className="col-span-2 text-center font-mono text-zinc-500 text-sm">
                                        {wordsFound > 0 ? formatTime(avgTime) : "-"}
                                    </div>
                                </div>

                                {/* Detailed View */}
                                {isExpanded && (
                                    <div className="bg-black/30 p-4 border-t border-white/5 animate-in slide-in-from-top-2">
                                        <h4 className="text-xs font-bold text-zinc-500 uppercase mb-3">Time per Word Detected</h4>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                            {team.card.filter(c => c.completed).map((card) => {
                                                const foundAt = card.completedAt ? card.completedAt - startTime : 0;
                                                return (
                                                    <div key={card.id} className="flex justify-between items-center bg-zinc-800/50 p-2 rounded text-sm">
                                                        <span className="text-zinc-300 truncate mr-2">{card.label}</span>
                                                        <span className="font-mono text-green-400">{formatTime(foundAt)}</span>
                                                    </div>
                                                );
                                            })}
                                            {wordsFound === 0 && <div className="text-zinc-600 italic">No words found yet.</div>}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {teams.length === 0 && (
                    <div className="p-12 text-center text-zinc-500">No teams registered yet.</div>
                )}
            </div>
        </div>
    );
}
