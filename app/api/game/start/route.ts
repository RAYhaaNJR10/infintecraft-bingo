import { NextResponse } from 'next/server';
import { getGameState, saveGameState } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST() {
    try {
        const gameState = await getGameState();

        if (gameState.isStarted) {
            return NextResponse.json({ error: 'Game already started' }, { status: 400 });
        }

        gameState.isStarted = true;
        gameState.startTime = Date.now();

        await saveGameState(gameState);

        return NextResponse.json({ success: true, startTime: gameState.startTime });
    } catch (error) {
        console.error('Game start error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
