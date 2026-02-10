import { NextResponse } from 'next/server';
import { getTeam, saveTeam } from '@/lib/db';

export async function POST(request: Request) {
    try {
        const { teamId, cellId } = await request.json();
        const team = await getTeam(teamId);

        if (!team) {
            return NextResponse.json({ error: 'Team not found' }, { status: 404 });
        }

        if (!team.startTime) {
            return NextResponse.json({ error: 'Game not started for this team' }, { status: 400 });
        }

        const cell = team.card.find(c => c.id === cellId);

        if (cell) {
            if (!cell.completed) {
                cell.completed = true;
                cell.completedAt = Date.now();
            } else {
                cell.completed = false;
                delete cell.completedAt;
            }

            // Check for Bingo (All 9)
            const allCompleted = team.card.every(c => c.completed);

            if (allCompleted && !team.completedAt) {
                team.completedAt = Date.now();
                team.endTime = Date.now();
            } else if (!allCompleted && team.completedAt) {
                delete team.completedAt;
                delete team.endTime;
            }

            await saveTeam(team);
            return NextResponse.json({ success: true, card: team.card, completed: !!team.completedAt });
        }

        return NextResponse.json({ error: 'Cell not found' }, { status: 404 });
    } catch (error) {
        console.error('Card mark error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
