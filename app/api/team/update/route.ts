import { NextResponse } from 'next/server';
import { getDB, saveDB } from '@/lib/db';

export async function POST(request: Request) {
    try {
        const { teamId, name } = await request.json();
        const db = await getDB();

        const team = db.teams.find(t => t.id === teamId);
        if (!team) return NextResponse.json({ error: 'Team not found' }, { status: 404 });

        if (name) team.name = name;

        await saveDB(db);
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
