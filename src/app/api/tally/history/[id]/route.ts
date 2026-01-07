import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import TallyGame from '@/models/TallyGame';

// GET - Fetch specific session detail
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();
        const { id } = await params;

        const session = await TallyGame.findById(id);

        if (!session) {
            return NextResponse.json({ error: 'Session not found' }, { status: 404 });
        }

        // Convert Mongoose Maps to plain objects
        const sessionObj = session.toObject();
        sessionObj.participants = session.participants ? Object.fromEntries(session.participants) : {};
        sessionObj.questionEntries = session.questionEntries ? Object.fromEntries(session.questionEntries) : {};
        sessionObj.questionAnswers = session.questionAnswers ? Object.fromEntries(session.questionAnswers) : {};

        return NextResponse.json(sessionObj);
    } catch (error) {
        console.error('Error fetching session:', error);
        return NextResponse.json({ error: 'Failed to fetch session' }, { status: 500 });
    }
}
