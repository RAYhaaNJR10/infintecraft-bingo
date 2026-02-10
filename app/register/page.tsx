"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { User, Users, ArrowRight, Loader2 } from "lucide-react";

export default function Register() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [formData, setFormData] = useState({
        name: "",
        players: ["", "", ""] // Start with 3 players
    });

    const handlePlayerChange = (index: number, value: string) => {
        const newPlayers = [...formData.players];
        newPlayers[index] = value;
        setFormData({ ...formData, players: newPlayers });
    };

    const addPlayer = () => {
        if (formData.players.length < 5) {
            setFormData({ ...formData, players: [...formData.players, ""] });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const validPlayers = formData.players.filter(p => p.trim() !== "");
            if (validPlayers.length < 3) {
                throw new Error("Minimum 3 players required");
            }

            const res = await fetch('/api/register', {
                method: 'POST',
                body: JSON.stringify({
                    name: formData.name,
                    players: validPlayers
                })
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.error || "Registration failed");

            // Save team ID to local storage for persistence
            localStorage.setItem('enigma_team_id', data.teamId);
            router.push(`/game`);

        } catch (err: any) {
            setError(err.message);
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-black">
            <div className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl p-8 shadow-2xl">
                <div className="mb-8 text-center">
                    <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500 mb-2">Team Registration</h2>
                    <p className="text-zinc-400">Assemble your squad (3-5 members)</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-300 ml-1">Team Name</label>
                        <div className="relative">
                            <Users className="absolute left-3 top-3 w-5 h-5 text-zinc-500" />
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full bg-black/50 border border-zinc-700 rounded-xl p-3 pl-10 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                                placeholder="e.g. The Codebreakers"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="text-sm font-medium text-zinc-300 ml-1">Members</label>
                        {formData.players.map((player, idx) => (
                            <div key={idx} className="relative">
                                <User className="absolute left-3 top-3 w-5 h-5 text-zinc-600" />
                                <input
                                    type="text"
                                    value={player}
                                    onChange={(e) => handlePlayerChange(idx, e.target.value)}
                                    className="w-full bg-black/30 border border-zinc-800 rounded-lg p-3 pl-10 text-zinc-200 focus:outline-none focus:border-zinc-600 transition-all"
                                    placeholder={`Player ${idx + 1}`}
                                    required={idx < 3}
                                />
                            </div>
                        ))}

                        {formData.players.length < 5 && (
                            <button type="button" onClick={addPlayer} className="text-xs text-purple-400 hover:text-purple-300 font-medium px-1">
                                + Add another member
                            </button>
                        )}
                    </div>

                    {error && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg text-center">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-white text-black font-bold py-4 rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Enter Setup <ArrowRight className="w-5 h-5" /></>}
                    </button>
                </form>
            </div>
        </div>
    );
}
