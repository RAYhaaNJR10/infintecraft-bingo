import { NextResponse } from 'next/server';
import { getDB, saveDB } from '@/lib/db';
import { generateBingoCard } from '@/lib/game-logic';

export async function POST(request: Request) {
    try {
        const { name, players } = await request.json();

        if (!name || !players || !Array.isArray(players) || players.length < 3) {
            return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
        }

        const db = await getDB();

        // Check for duplicate team name
        if (db.teams.some(t => t.name.toLowerCase() === name.toLowerCase())) {
            return NextResponse.json({ error: 'Team name already exists' }, { status: 409 });
        }

        const newTeam = {
            id: crypto.randomUUID(),
            name,
            players,
            card: generateBingoCard(),
            registeredAt: Date.now(),
        };

        db.teams.push(newTeam);
        await saveDB(db);

        return NextResponse.json({ success: true, teamId: newTeam.id });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
