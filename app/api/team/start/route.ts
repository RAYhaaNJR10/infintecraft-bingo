import { NextResponse } from 'next/server';
import { getDB, saveDB } from '@/lib/db';

export async function POST(request: Request) {
    try {
        const { teamId } = await request.json();
        const db = await getDB();

        const team = db.teams.find(t => t.id === teamId);
        if (!team) return NextResponse.json({ error: 'Team not found' }, { status: 404 });

        if (!team.startTime) {
            team.startTime = Date.now();
            await saveDB(db);
        }

        return NextResponse.json({ success: true, startTime: team.startTime });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
