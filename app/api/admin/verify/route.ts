import { NextResponse } from 'next/server';
import { getAdminPassword } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    try {
        const { password } = await req.json();

        if (!password || typeof password !== 'string') {
            return NextResponse.json({ success: false, error: 'Password required' }, { status: 400 });
        }

        const adminPassword = await getAdminPassword();
        const success = password === adminPassword;

        return NextResponse.json({ success });
    } catch (error) {
        console.error('Admin verify error:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}
