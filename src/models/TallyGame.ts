import mongoose, { Schema, model, models } from 'mongoose';

const TallyGameSchema = new Schema({
    title: { type: String, default: 'Quiz Session' },
    topic: { type: String, default: '' },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    config: {
        firstQuestion: {
            autoPoints: { type: Boolean, default: true },
            pointValue: { type: Number, default: 4 }
        },
        middleQuestions: {
            firstPlace: { type: Number, default: 4 },
            secondPlace: { type: Number, default: 2 },
            thirdPlace: { type: Number, default: 2 },
            otherPlace: { type: Number, default: 1 }
        },
        lastQuestion: {
            autoPoints: { type: Boolean, default: false },
            pointValue: { type: Number, default: 4 }
        },
        totalQuestions: { type: Number, default: 20 },
        formats: {
            nextFormat: { type: String, default: "♪⁠┌⁠|⁠∵⁠|⁠┘⁠♪ＮＥＸＴ└⁠|⁠∵⁠|⁠┐⁠♪" },
            endFormat: { type: String, default: "♪⁠┌⁠|⁠∵⁠|⁠┘⁠♪ＥＮＤ└⁠|⁠∵⁠|⁠┐⁠♪" }
        }
    },
    questionNumber: { type: Number, default: 1 },
    participants: {
        type: Map, of: new Schema({
            scores: [Number],
            total: { type: Number, default: 0 }
        }, { _id: false })
    },
    questionEntries: { type: Map, of: [String] },
    questionAnswers: { type: Map, of: String },
    scoreHistory: [{
        name: String,
        points: Number,
        previousTotal: Number,
        questionNumber: Number,
        position: Number
    }],
    isActive: { type: Boolean, default: true },
    endedAt: { type: Date, default: null }
}, { timestamps: true });

const TallyGame = models.TallyGame || model('TallyGame', TallyGameSchema);

export default TallyGame;
