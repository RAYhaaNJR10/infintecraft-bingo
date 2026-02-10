import { NextResponse } from 'next/server';
import { getDB } from '@/lib/db';

export async function GET() {
    try {
        const db = await getDB();
        // Sort by completion time (if completed), then by registration time
        const sortedTeams = [...db.teams].sort((a, b) => {
            if (a.completedAt && b.completedAt) return a.completedAt - b.completedAt;
            if (a.completedAt) return -1;
            if (b.completedAt) return 1;
            return 0; // Keep original order if not completed
        });

        return NextResponse.json({ teams: sortedTeams });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
