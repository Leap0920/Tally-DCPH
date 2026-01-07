import mongoose, { Schema, model, models } from 'mongoose';

const ScoreRecordSchema = new Schema({
    studentName: { type: String, required: true }, // Storing name directly for simplicity or ref to Student if strict
    points: { type: Number, required: true },
    category: { type: String, required: true },
    date: { type: Date, default: Date.now },
    awardedBy: { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

const ScoreRecord = models.ScoreRecord || model('ScoreRecord', ScoreRecordSchema);

export default ScoreRecord;
