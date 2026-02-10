import { NextResponse } from 'next/server';
import { getTeam, saveTeam } from '@/lib/db';

export async function POST(request: Request) {
    try {
        const { teamId } = await request.json();
        const team = await getTeam(teamId);

        if (!team) return NextResponse.json({ error: 'Team not found' }, { status: 404 });

        // End the attempt
        // If they haven't finished, this marks it as over (e.g., gave up)
        if (!team.endTime && !team.completedAt) {
            team.endTime = Date.now();
            await saveTeam(team);
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Team end error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
