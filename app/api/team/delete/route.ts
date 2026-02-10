import { NextResponse } from 'next/server';
import { getDB, saveDB } from '@/lib/db';

export async function POST(request: Request) {
    try {
        const { teamId } = await request.json();
        const db = await getDB();

        db.teams = db.teams.filter(t => t.id !== teamId);

        await saveDB(db);
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
