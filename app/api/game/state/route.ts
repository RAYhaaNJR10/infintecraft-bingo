import { NextResponse } from 'next/server';
import { getDB } from '@/lib/db';

export async function GET(request: Request) {
    // Prevent caching for real-time updates
    const headers = {
        'Cache-Control': 'no-store, max-age=0',
    };

    try {
        const db = await getDB();

        // Optional: Return specific team data if teamId param is present
        const { searchParams } = new URL(request.url);
        const teamId = searchParams.get('teamId');

        let teamData = null;
        if (teamId) {
            teamData = db.teams.find(t => t.id === teamId);
        }

        return NextResponse.json({
            gameState: db.gameState,
            team: teamData, // Will be null if not found or not requested
        }, { headers });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
