"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Users, CheckCircle, Clock, Trash2, RotateCcw, Home, PlayCircle, Edit2, X, Eye, Lock, ShieldCheck, Loader2 } from "lucide-react";

type Team = {
    id: string;
    name: string;
    players: string[];
    completedAt?: number;
    startTime?: number;
    endTime?: number;
    registeredAt: number;
};

export default function AdminPage() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [passwordInput, setPasswordInput] = useState("");
    const [authError, setAuthError] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [verifying, setVerifying] = useState(false);

    const [teams, setTeams] = useState<Team[]>([]);
    const [showResetConfirm, setShowResetConfirm] = useState(false);
    const [editingTeam, setEditingTeam] = useState<Team | null>(null);
    const [viewingTeam, setViewingTeam] = useState<Team | null>(null);

    const [newName, setNewName] = useState("");

    // Check sessionStorage on mount
    useEffect(() => {
        const stored = sessionStorage.getItem("enigma_admin_auth");
        if (stored === "true") {
            setIsAuthenticated(true);
        }
        setIsLoading(false);
    }, []);

    const fetchState = async () => {
        try {
            const res = await fetch('/api/teams');
            const data = await res.json();
            setTeams(data.teams || []);
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        if (!isAuthenticated) return;
        fetchState();
        const interval = setInterval(fetchState, 3000);
        return () => clearInterval(interval);
    }, [isAuthenticated]);

    const handleLogin = async () => {
        if (!passwordInput.trim() || verifying) return;
        setVerifying(true);
        setAuthError(false);
        try {
            const res = await fetch('/api/admin/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password: passwordInput }),
            });
            const data = await res.json();
            if (data.success) {
                setIsAuthenticated(true);
                sessionStorage.setItem("enigma_admin_auth", "true");
            } else {
                setAuthError(true);
                setPasswordInput("");
            }
        } catch {
            setAuthError(true);
        } finally {
            setVerifying(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") handleLogin();
    };

    // Don't render anything while checking session
    if (isLoading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            </div>
        );
    }

    // Password gate
    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center p-6">
                <div className="w-full max-w-sm">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600/20 to-pink-600/20 border border-purple-500/20 mb-4">
                            <Lock className="w-8 h-8 text-purple-400" />
                        </div>
                        <h1 className="text-2xl font-bold text-white mb-1">Admin Access</h1>
                        <p className="text-sm text-zinc-500">Enter the admin password to continue</p>
                    </div>

                    <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 backdrop-blur-sm">
                        <input
                            type="password"
                            value={passwordInput}
                            onChange={(e) => { setPasswordInput(e.target.value); setAuthError(false); }}
                            onKeyDown={handleKeyDown}
                            placeholder="Password"
                            autoFocus
                            className="w-full bg-black border border-zinc-700 p-3 rounded-lg text-white mb-3 focus:ring-2 focus:ring-purple-500 outline-none placeholder:text-zinc-600 text-center tracking-widest"
                        />

                        {authError && (
                            <p className="text-red-400 text-xs text-center mb-3 animate-in fade-in slide-in-from-top-1 duration-200">
                                Incorrect password. Try again.
                            </p>
                        )}

                        <button
                            onClick={handleLogin}
                            disabled={verifying}
                            className="w-full py-3 bg-white text-black font-bold rounded-lg hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {verifying ? (
                                <><Loader2 className="w-4 h-4 animate-spin" /> Verifying...</>
                            ) : (
                                <><ShieldCheck className="w-4 h-4" /> Unlock</>
                            )}
                        </button>
                    </div>

                    <div className="text-center mt-6">
                        <Link href="/" className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors">
                            ← Back to Home
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    const handleReset = async () => {
        await fetch('/api/game/reset', { method: 'POST' });
        setTeams(ts => ts.map(t => ({ ...t, completedAt: undefined, startTime: undefined, endTime: undefined })));
        setShowResetConfirm(false);
    };

    const deleteTeam = async (id: string) => {
        if (!confirm("Delete this team permanently?")) return;
        await fetch('/api/team/delete', {
            method: 'POST',
            body: JSON.stringify({ teamId: id })
        });
        fetchState();
    };

    const updateTeamName = async () => {
        if (!editingTeam) return;
        await fetch('/api/team/update', {
            method: 'POST',
            body: JSON.stringify({ teamId: editingTeam.id, name: newName })
        });
        setEditingTeam(null);
        fetchState();
    };

    return (
        <div className="min-h-screen bg-black text-white p-6 relative">
            <header className="max-w-6xl mx-auto flex justify-between items-center mb-10 border-b border-white/10 pb-6">
                <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                <div className="flex gap-4">
                    <div className="flex items-center gap-2 bg-zinc-900 px-4 py-2 rounded-lg">
                        <Users className="w-4 h-4 text-gray-400" />
                        <span className="font-mono font-bold text-xl">{teams.length}</span>
                        <span className="text-xs text-gray-500 uppercase">Teams</span>
                    </div>

                    <div className="flex gap-2">
                        <Link
                            href="/"
                            className="bg-white text-black hover:bg-zinc-200 px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-colors text-sm"
                        >
                            <Home className="w-4 h-4" /> BACK TO HOME
                        </Link>

                        <button
                            onClick={() => setShowResetConfirm(true)}
                            className="bg-red-900/50 hover:bg-red-900 text-red-200 border border-red-800 px-4 py-2 rounded-lg font-bold transition-colors text-sm flex items-center gap-2"
                        >
                            <RotateCcw className="w-4 h-4" /> RESET ALL
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {teams.map((team) => {
                        const isPlaying = team.startTime && !team.endTime && !team.completedAt;

                        return (
                            <div key={team.id} className={`p-4 rounded-xl border relative group ${team.completedAt ? 'bg-green-900/10 border-green-500/30' : isPlaying ? 'bg-blue-900/10 border-blue-500/30' : 'bg-zinc-900 border-zinc-800'}`}>

                                {/* Actions (visible on hover) */}
                                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => setViewingTeam(team)} className="p-1.5 hover:bg-white/10 rounded text-zinc-400 hover:text-white" title="View Members">
                                        <Eye className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => { setEditingTeam(team); setNewName(team.name); }} className="p-1.5 hover:bg-white/10 rounded text-zinc-400 hover:text-blue-400" title="Edit Name">
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => deleteTeam(team.id)} className="p-1.5 hover:bg-red-900/50 rounded text-zinc-400 hover:text-red-500" title="Delete Team">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>

                                <div className="flex justify-between items-start mb-2 pr-20">
                                    <h3 className="font-bold text-lg truncate mr-2" title={team.name}>{team.name}</h3>
                                    {team.completedAt ? (
                                        <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
                                    ) : isPlaying ? (
                                        <PlayCircle className="w-5 h-5 text-blue-500 animate-pulse shrink-0" />
                                    ) : (
                                        <span className="w-2 h-2 rounded-full bg-zinc-600 mt-2 shrink-0"></span>
                                    )}
                                </div>

                                <div className="text-xs text-zinc-500 font-mono mb-2">
                                    ID: {team.id.slice(0, 8)}...
                                </div>

                                <div className="flex gap-2 text-xs">
                                    <div className="bg-white/5 px-2 py-1 rounded text-zinc-400">
                                        {team.players.length} Members
                                    </div>
                                    {team.completedAt && (
                                        <div className="bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-1 rounded">
                                            {((team.completedAt - (team.startTime || 0)) / 1000 / 60).toFixed(1)}m
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </main>

            {/* View Members Modal */}
            {viewingTeam && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-zinc-900 border border-zinc-700 p-6 rounded-2xl max-w-sm w-full animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-white">{viewingTeam.name}</h3>
                            <button onClick={() => setViewingTeam(null)} className="text-zinc-500 hover:text-white"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="space-y-2 mb-6">
                            {viewingTeam.players.map((player, idx) => (
                                <div key={idx} className="flex items-center gap-3 p-3 bg-black/40 rounded-lg">
                                    <div className="w-8 h-8 rounded-full bg-purple-900/50 flex items-center justify-center text-purple-400 font-bold text-xs">{idx + 1}</div>
                                    <span className="text-zinc-200">{player}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {editingTeam && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-zinc-900 border border-zinc-700 p-6 rounded-2xl max-w-sm w-full animate-in zoom-in-95 duration-200">
                        <h3 className="text-xl font-bold text-white mb-4">Edit Team Name</h3>
                        <input
                            type="text"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            className="w-full bg-black border border-zinc-700 p-3 rounded-lg text-white mb-4 focus:ring-2 focus:ring-purple-500 outline-none"
                        />
                        <div className="flex gap-3 justify-end">
                            <button onClick={() => setEditingTeam(null)} className="px-4 py-2 text-zinc-400 hover:text-white">Cancel</button>
                            <button onClick={updateTeamName} className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-500">Save</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Reset Confirm Modal */}
            {showResetConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-zinc-900 border border-zinc-700 p-6 rounded-2xl max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-200">
                        <h3 className="text-xl font-bold text-white mb-2">Reset All Progress?</h3>
                        <p className="text-zinc-400 mb-6">ALL timers and progress will be wiped.</p>
                        <div className="flex gap-3 justify-end">
                            <button onClick={() => setShowResetConfirm(false)} className="px-4 py-2 text-zinc-300">Cancel</button>
                            <button onClick={handleReset} className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg font-bold">Yes, Reset</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
