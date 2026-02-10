import { NextResponse } from 'next/server';
import { getTeams, saveTeam } from '@/lib/db';

export async function POST() {
    try {
        const teams = await getTeams();

        // Reset all teams
        for (const team of teams) {
            team.card = team.card.map(c => {
                const { completedAt, ...rest } = c;
                return { ...rest, completed: false };
            });
            delete team.completedAt;
            delete team.startTime;
            delete team.endTime;
            await saveTeam(team);
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Game reset error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
