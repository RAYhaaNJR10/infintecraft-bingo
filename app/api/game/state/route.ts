import { NextResponse } from 'next/server';
import { getGameState, getTeam } from '@/lib/db';

export async function GET(request: Request) {
    // Prevent caching for real-time updates
    const headers = {
        'Cache-Control': 'no-store, max-age=0',
    };

    try {
        const gameState = await getGameState();

        // Optional: Return specific team data if teamId param is present
        const { searchParams } = new URL(request.url);
        const teamId = searchParams.get('teamId');

        let teamData = null;
        if (teamId) {
            teamData = await getTeam(teamId);
        }

        return NextResponse.json({
            gameState,
            team: teamData,
        }, { headers });
    } catch (error) {
        console.error('Game state error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
