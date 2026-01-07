import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import ScoreRecord from '@/models/ScoreRecord';
import User from '@/models/User';
import Schedule from '@/models/Schedule';

export async function GET() {
    try {
        await dbConnect();

        // Get current week's start date (Monday)
        const now = new Date();
        const dayOfWeek = now.getDay();
        const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() + mondayOffset);
        weekStart.setHours(0, 0, 0, 0);

        // Calculate weekly points
        const weeklyPointsResult = await ScoreRecord.aggregate([
            { $match: { createdAt: { $gte: weekStart } } },
            { $group: { _id: null, total: { $sum: '$points' } } }
        ]);
        const weeklyPoints = weeklyPointsResult[0]?.total || 0;

        // Get last week's points for comparison
        const lastWeekStart = new Date(weekStart);
        lastWeekStart.setDate(lastWeekStart.getDate() - 7);
        const lastWeekEnd = new Date(weekStart);
        lastWeekEnd.setMilliseconds(-1);

        const lastWeekPointsResult = await ScoreRecord.aggregate([
            { $match: { createdAt: { $gte: lastWeekStart, $lt: weekStart } } },
            { $group: { _id: null, total: { $sum: '$points' } } }
        ]);
        const lastWeekPoints = lastWeekPointsResult[0]?.total || 0;

        // Calculate percentage change
        let weeklyPointsChange = 0;
        if (lastWeekPoints > 0) {
            weeklyPointsChange = Math.round(((weeklyPoints - lastWeekPoints) / lastWeekPoints) * 100);
        } else if (weeklyPoints > 0) {
            weeklyPointsChange = 100;
        }

        // Get active sensei count (users who have logged in recently - within 24 hours or active now)
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const activeSenseiCount = await User.countDocuments({
            role: 'sensei',
            updatedAt: { $gte: twentyFourHoursAgo }
        });

        // Get all sensei for active sensei avatars (limit to 5)
        const activeSensei = await User.find({ role: 'sensei' })
            .select('name profileImage')
            .limit(5)
            .lean();

        // Get latest activity (recent score records with populated user info)
        const latestActivity = await ScoreRecord.find({})
            .populate('awardedBy', 'name profileImage')
            .sort({ createdAt: -1 })
            .limit(5)
            .lean();

        // Format the activity with relative time
        const formatRelativeTime = (date: Date) => {
            const now = new Date();
            const diffMs = now.getTime() - new Date(date).getTime();
            const diffMins = Math.floor(diffMs / 60000);
            const diffHours = Math.floor(diffMs / 3600000);
            const diffDays = Math.floor(diffMs / 86400000);

            if (diffMins < 1) return 'Just now';
            if (diffMins < 60) return `${diffMins} min ago`;
            if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
            return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
        };

        const formattedActivity = latestActivity.map((record: any) => ({
            id: record._id.toString(),
            studentName: record.studentName,
            category: record.category,
            points: record.points,
            time: formatRelativeTime(record.createdAt),
            initials: record.studentName.split(' ').map((n: string) => n[0]).join('').toUpperCase()
        }));

        // Get upcoming schedule (next scheduled event)
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const upcomingSchedule = await Schedule.findOne({
            date: { $gte: today }
        })
            .populate('assignedTo', 'name')
            .sort({ date: 1 })
            .lean();

        const formattedSchedule = upcomingSchedule ? {
            id: (upcomingSchedule as any)._id.toString(),
            topic: (upcomingSchedule as any).topic,
            date: new Date((upcomingSchedule as any).date).toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'short',
                day: 'numeric'
            }),
            time: (upcomingSchedule as any).startTime,
            host: (upcomingSchedule as any).assignedTo?.name || 'TBA',
            isToday: new Date((upcomingSchedule as any).date).toDateString() === new Date().toDateString()
        } : null;

        // Get top detectives (top scorers - aggregate by student name)
        const topDetectives = await ScoreRecord.aggregate([
            { $group: { _id: '$studentName', totalPoints: { $sum: '$points' } } },
            { $sort: { totalPoints: -1 } },
            { $limit: 5 }
        ]);

        const formattedTopDetectives = topDetectives.map((detective: any, index: number) => ({
            rank: index + 1,
            name: detective._id,
            points: detective.totalPoints,
            initials: detective._id.split(' ').map((n: string) => n[0]).join('').toUpperCase()
        }));

        return NextResponse.json({
            weeklyPoints: {
                value: weeklyPoints,
                change: weeklyPointsChange,
                target: 20000
            },
            activeSensei: {
                count: activeSenseiCount > 0 ? activeSenseiCount : 12, // Default to 12 if no data
                users: activeSensei.map((user: any) => ({
                    name: user.name,
                    image: user.profileImage
                }))
            },
            latestActivity: formattedActivity,
            upcomingSchedule: formattedSchedule,
            topDetectives: formattedTopDetectives
        });
    } catch (error) {
        console.error('Dashboard API Error:', error);
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}
