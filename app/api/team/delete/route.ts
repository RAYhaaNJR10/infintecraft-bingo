import { NextResponse } from 'next/server';
import { deleteTeamDoc } from '@/lib/db';

export async function POST(request: Request) {
    try {
        const { teamId } = await request.json();
        await deleteTeamDoc(teamId);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Team delete error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
