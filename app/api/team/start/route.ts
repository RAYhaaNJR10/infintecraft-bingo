import { NextResponse } from 'next/server';
import { getTeam, saveTeam } from '@/lib/db';

export async function POST(request: Request) {
    try {
        const { teamId } = await request.json();
        const team = await getTeam(teamId);

        if (!team) return NextResponse.json({ error: 'Team not found' }, { status: 404 });

        if (!team.startTime) {
            team.startTime = Date.now();
            await saveTeam(team);
        }

        return NextResponse.json({ success: true, startTime: team.startTime });
    } catch (error) {
        console.error('Team start error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
