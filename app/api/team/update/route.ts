import { NextResponse } from 'next/server';
import { getTeam, saveTeam } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    try {
        const { teamId, name } = await request.json();
        const team = await getTeam(teamId);

        if (!team) return NextResponse.json({ error: 'Team not found' }, { status: 404 });

        if (name) team.name = name;

        await saveTeam(team);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Team update error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
