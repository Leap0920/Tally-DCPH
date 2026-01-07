import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import TallyGame from '@/models/TallyGame';

// GET - Fetch or create active session
export async function GET() {
    try {
        await connectDB();

        // Find active game session
        let game = await TallyGame.findOne({ isActive: true }).sort({ updatedAt: -1 });

        if (!game) {
            // Create new session if none exists
            game = await TallyGame.create({
                isActive: true,
                participants: new Map(),
                questionEntries: new Map(),
                questionAnswers: new Map(),
                scoreHistory: []
            });
        }

        // Convert Mongoose Maps to plain objects for JSON response
        const gameObj = game.toObject();
        gameObj.participants = game.participants ? Object.fromEntries(game.participants) : {};
        gameObj.questionEntries = game.questionEntries ? Object.fromEntries(game.questionEntries) : {};
        gameObj.questionAnswers = game.questionAnswers ? Object.fromEntries(game.questionAnswers) : {};

        return NextResponse.json(gameObj);
    } catch (error) {
        console.error('Error fetching game state:', error);
        return NextResponse.json({ error: 'Failed to fetch game state' }, { status: 500 });
    }
}

// POST - Update current session
export async function POST(request: NextRequest) {
    try {
        await connectDB();
        const data = await request.json();

        // Build update object
        const updateData: Record<string, unknown> = {};

        if (data.config) updateData.config = data.config;
        if (data.questionNumber !== undefined) updateData.questionNumber = data.questionNumber;
        if (data.topic !== undefined) updateData.topic = data.topic;
        if (data.participants) updateData.participants = new Map(Object.entries(data.participants));
        if (data.questionEntries) updateData.questionEntries = new Map(Object.entries(data.questionEntries));
        if (data.questionAnswers) updateData.questionAnswers = new Map(Object.entries(data.questionAnswers));
        if (data.scoreHistory) updateData.scoreHistory = data.scoreHistory;

        // Use findOneAndUpdate to avoid version conflicts
        const game = await TallyGame.findOneAndUpdate(
            { isActive: true },
            { $set: updateData },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );

        return NextResponse.json({ success: true, id: game._id });
    } catch (error) {
        console.error('Error saving game state:', error);
        return NextResponse.json({ error: 'Failed to save game state' }, { status: 500 });
    }
}

// DELETE - End current session
export async function DELETE() {
    try {
        await connectDB();

        const game = await TallyGame.findOne({ isActive: true }).sort({ updatedAt: -1 });

        if (game) {
            game.isActive = false;
            game.endedAt = new Date();
            await game.save();
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error ending session:', error);
        return NextResponse.json({ error: 'Failed to end session' }, { status: 500 });
    }
}