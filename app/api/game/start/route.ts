import { NextResponse } from 'next/server';
import { getDB, saveDB } from '@/lib/db';

export async function POST() {
    try {
        const db = await getDB();

        if (db.gameState.isStarted) {
            return NextResponse.json({ error: 'Game already started' }, { status: 400 });
        }

        db.gameState.isStarted = true;
        db.gameState.startTime = Date.now();

        await saveDB(db);

        return NextResponse.json({ success: true, startTime: db.gameState.startTime });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
