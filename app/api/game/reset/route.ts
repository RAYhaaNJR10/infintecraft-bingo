import { NextResponse } from 'next/server';
import { getDB, saveDB } from '@/lib/db';
import { generateBingoCard } from '@/lib/game-logic';

export async function POST() {
    try {
        const db = await getDB();

        // Reset all teams logic
        db.teams = db.teams.map(team => ({
            ...team,
            card: team.card.map(c => ({ ...c, completed: false })),
            completedAt: undefined,
            startTime: undefined,
            endTime: undefined
        }));

        await saveDB(db);

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
