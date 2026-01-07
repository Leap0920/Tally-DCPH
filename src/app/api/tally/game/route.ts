import { NextRequest, NextResponse } from 'next/server';

// In-memory storage for demo purposes
// In production, you'd use a database
let gameState = {
    config: {
        firstQuestion: { autoPoints: true, pointValue: 4 },
        middleQuestions: { firstPlace: 4, secondPlace: 2, thirdPlace: 2, otherPlace: 1 },
        lastQuestion: { autoPoints: false, pointValue: 4 },
        totalQuestions: 10,
        formats: { 
            nextFormat: "♪⁠┌⁠|⁠∵⁠|⁠┘⁠♪ＮＥＸＴ└⁠|⁠∵⁠|⁠┐⁠♪", 
            endFormat: "♪⁠┌⁠|⁠∵⁠|⁠┘⁠♪ＥＮＤ└⁠|⁠∵⁠|⁠┐⁠♪" 
        }
    },
    questionNumber: 1,
    participants: {},
    questionEntries: {},
    questionTopics: {},
    questionAnswers: {},
    scoreHistory: []
};

export async function GET() {
    try {
        return NextResponse.json(gameState);
    } catch (error) {
        console.error('Error fetching game state:', error);
        return NextResponse.json({ error: 'Failed to fetch game state' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const data = await request.json();
        
        // Update the game state
        gameState = {
            ...gameState,
            ...data
        };
        
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error saving game state:', error);
        return NextResponse.json({ error: 'Failed to save game state' }, { status: 500 });
    }
}