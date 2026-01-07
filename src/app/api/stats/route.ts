import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import ScoreRecord from '@/models/ScoreRecord';

export async function GET(request: Request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(request.url);
        const period = searchParams.get('period') || 'week'; // week, month, year, all

        let dateFilter = {};
        const now = new Date();

        if (period === 'week') {
            const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
            dateFilter = { date: { $gte: startOfWeek } };
        } else if (period === 'month') {
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            dateFilter = { date: { $gte: startOfMonth } };
        } else if (period === 'year') {
            const startOfYear = new Date(now.getFullYear(), 0, 1);
            dateFilter = { date: { $gte: startOfYear } };
        }

        const leaderboard = await ScoreRecord.aggregate([
            { $match: dateFilter },
            {
                $group: {
                    _id: '$studentName',
                    totalPoints: { $sum: '$points' },
                    activities: { $count: {} }
                }
            },
            { $sort: { totalPoints: -1 } },
            { $limit: 20 }
        ]);

        return NextResponse.json(leaderboard);
    } catch (error) {
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}
