import { NextResponse } from 'next/server';
import { getTeams } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const teams = await getTeams();
        // Sort by completion time (if completed), then by registration time
        const sortedTeams = [...teams].sort((a, b) => {
            if (a.completedAt && b.completedAt) return a.completedAt - b.completedAt;
            if (a.completedAt) return -1;
            if (b.completedAt) return 1;
            return 0; // Keep original order if not completed
        });

        return NextResponse.json({ teams: sortedTeams });
    } catch (error) {
        console.error('Teams fetch error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
