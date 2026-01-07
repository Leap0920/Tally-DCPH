import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import TallyGame from '@/models/TallyGame';

// GET - Fetch all session history (inactive sessions)
export async function GET() {
    try {
        await connectDB();

        const sessions = await TallyGame.find({ isActive: false })
            .sort({ endedAt: -1 })
            .select('topic questionNumber participants createdAt endedAt config')
            .limit(50);

        // Process sessions to get summary data
        const history = sessions.map(session => {
            const participants = session.participants ? Object.fromEntries(session.participants) : {};
            const participantList = Object.entries(participants)
                .map(([name, data]: [string, any]) => ({
                    name,
                    total: data.total || 0
                }))
                .sort((a, b) => b.total - a.total);

            return {
                _id: session._id,
                topic: session.topic || 'Quiz Session',
                totalQuestions: session.questionNumber || 0,
                participantCount: Object.keys(participants).length,
                winner: participantList[0]?.name || 'N/A',
                winnerScore: participantList[0]?.total || 0,
                createdAt: session.createdAt,
                endedAt: session.endedAt
            };
        });

        return NextResponse.json(history);
    } catch (error) {
        console.error('Error fetching session history:', error);
        return NextResponse.json({ error: 'Failed to fetch session history' }, { status: 500 });
    }
}
