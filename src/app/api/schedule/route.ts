import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Schedule from '@/models/Schedule';
import { getServerSession } from 'next-auth';

export async function GET() {
    try {
        await dbConnect();
        const schedules = await Schedule.find({}).populate('assignedTo', 'name profileImage').sort({ date: 1 });
        return NextResponse.json(schedules);
    } catch (error) {
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await getServerSession();
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        await dbConnect();
        const data = await request.json();

        // Simple create or update based on date/time if needed, but for now just create
        const schedule = await Schedule.create(data);
        return NextResponse.json(schedule);
    } catch (error) {
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}
