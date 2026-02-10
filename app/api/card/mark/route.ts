import { NextResponse } from 'next/server';
import { getDB, saveDB } from '@/lib/db';

export async function POST(request: Request) {
    try {
        const { teamId, cellId } = await request.json();
        const db = await getDB();

        const teamIndex = db.teams.findIndex(t => t.id === teamId);
        if (teamIndex === -1) {
            return NextResponse.json({ error: 'Team not found' }, { status: 404 });
        }

        const team = db.teams[teamIndex];
        if (!team.startTime) {
            return NextResponse.json({ error: 'Game not started for this team' }, { status: 400 });
        }

        const cell = team.card.find(c => c.id === cellId);

        if (cell) {
            if (!cell.completed) {
                cell.completed = true;
                // Store RELATIVE time or ABSOLUTE? Absolute is safer.
                cell.completedAt = Date.now();
            } else {
                cell.completed = false;
                cell.completedAt = undefined;
            }

            // Check for Bingo (All 9)
            const allCompleted = team.card.every(c => c.completed);

            if (allCompleted && !team.completedAt) {
                team.completedAt = Date.now();
                team.endTime = Date.now();
            } else if (!allCompleted && team.completedAt) {
                team.completedAt = undefined;
                team.endTime = undefined;
            }

            await saveDB(db);
            return NextResponse.json({ success: true, card: team.card, completed: !!team.completedAt });
        }

        return NextResponse.json({ error: 'Cell not found' }, { status: 404 });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
