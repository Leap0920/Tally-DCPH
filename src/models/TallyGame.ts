import mongoose, { Schema, model, models } from 'mongoose';

const TallyGameSchema = new Schema({
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
        totalQuestions: { type: Number, default: 10 },
        formats: {
            nextFormat: { type: String, default: "♪⁠┌⁠|⁠∵⁠|⁠┘⁠♪ＮＥＸＴ└⁠|⁠∵⁠|⁠┐⁠♪" },
            endFormat: { type: String, default: "♪⁠┌⁠|⁠∵⁠|⁠┘⁠♪ＥＮＤ└⁠|⁠∵⁠|⁠┐⁠♪" }
        }
    },
    questionNumber: { type: Number, default: 1 },
    participants: {
        type: Map, of: new Schema({
            scores: [Number],
            total: Number
        }, { _id: false })
    },
    questionEntries: { type: Map, of: [String] }, // Key is question number string
    questionAnswers: { type: Map, of: String },   // Key is question number string
    scoreHistory: [{
        name: String,
        points: Number,
        previousTotal: Number,
        questionNumber: Number,
        position: Number
    }],
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

const TallyGame = models.TallyGame || model('TallyGame', TallyGameSchema);

export default TallyGame;
