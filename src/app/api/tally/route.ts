import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import ScoreRecord from '@/models/ScoreRecord';
import { getServerSession } from 'next-auth';

export async function GET() {
    try {
        await dbConnect();
        const records = await ScoreRecord.find({}).populate('awardedBy', 'name').sort({ createdAt: -1 }).limit(50);
        return NextResponse.json(records);
    } catch (error) {
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await getServerSession() as any;
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        await dbConnect();
        const data = await request.json();

        const record = await ScoreRecord.create({
            ...data,
            awardedBy: session.user.id
        });

        return NextResponse.json(record);
    } catch (error) {
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}
