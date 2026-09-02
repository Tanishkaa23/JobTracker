import mongoose from 'mongoose';
import { CLOSED_STATUSES, STALE_THRESHOLD_MS } from '../constants/constants.js';

const applicationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    companyName: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['applied', 'interviewing', 'offered', 'rejected'],
        default: 'applied',
        required: true
    },
    appliedDate: {
        type: Date,
        default: Date.now,
        required: true
    },
    source: { type: String },
    recruiterEmail: {
        type: String,
        match: [/^\S+@\S+\.\S+$/, "Please enter a valid recruiter email address"]
    },
    jobUrl: { type: String },
    salary: { type: Number },
    notes: { type: String },
    interviewDate: { type: Date },
    lastReminderSentAt: { type: Date, default: null },
    lastWeeklyReportSentAt: { type: Date, default: null }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

applicationSchema.virtual('isStale').get(function () {
    const isClosed = CLOSED_STATUSES.includes(this.status);
    const lastTouched = this.updatedAt ?? this.createdAt;
    return !isClosed && (Date.now() - lastTouched.getTime() > STALE_THRESHOLD_MS);
});

const applicationModel = mongoose.model('Applications', applicationSchema);
export default applicationModel;
