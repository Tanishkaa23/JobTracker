import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema({
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    companyName:{
        type: String,
        required: true
    },
    role:{
        type: String,
        required: true
    },
    status:{
        type: String,
        enum: ['applied', 'interviewing', 'offered', 'rejected'],
        default: 'applied',
        required: true
    },
    appliedDate:{
        type: Date,
        default: Date.now,
        required: true
    },
    source:{
        type: String,
    },
    jobUrl:{
        type: String,
    },
    salary:{
        type: Number,
    },
    notes:{
        type: String,
    },
    interviewDate:{
        type: Date,
    },
    isStale:{
        type: Boolean,
        default: false
    }

},{timestamps: true});

const applicationModel = mongoose.model('Applications', applicationSchema);
export default applicationModel;