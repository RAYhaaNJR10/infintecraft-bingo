import { NextResponse } from 'next/server';
import { getTeams, saveTeam } from '@/lib/db';
import { generateBingoCard } from '@/lib/game-logic';

export async function POST(request: Request) {
    try {
        const { name, players } = await request.json();

        if (!name || !players || !Array.isArray(players) || players.length < 3) {
            return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
        }

        const teams = await getTeams();

        // Check for duplicate team name
        if (teams.some(t => t.name.toLowerCase() === name.toLowerCase())) {
            return NextResponse.json({ error: 'Team name already exists' }, { status: 409 });
        }

        const newTeam = {
            id: crypto.randomUUID(),
            name,
            players,
            card: generateBingoCard(),
            registeredAt: Date.now(),
        };

        await saveTeam(newTeam);

        return NextResponse.json({ success: true, teamId: newTeam.id });
    } catch (error) {
        console.error('Register error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
