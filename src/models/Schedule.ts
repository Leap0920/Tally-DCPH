import mongoose, { Schema, model, models } from 'mongoose';

const ScheduleSchema = new Schema({
    date: { type: Date, required: true },
    startTime: { type: String, required: true }, // e.g. "7:30pm"
    endTime: { type: String, required: true }, // e.g. "8:30pm"
    topic: { type: String, required: true },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
    postingStatus: { type: String, enum: ['pending', 'done'], default: 'pending' },
    logStatus: { type: String, enum: ['pending', 'done'], default: 'pending' },
}, { timestamps: true });

const Schedule = models.Schedule || model('Schedule', ScheduleSchema);

export default Schedule;
