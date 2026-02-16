import mongoose from 'mongoose';

const TaskSchema = new mongoose.Schema({
    prompt: {
        type: String,
        required: true,
        trim: true,
    },
    image: {
        type: String,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    status: {
        type: String,
        enum: ['pending', 'in_progress', 'completed'],
        default: 'pending',
    },
}, {
    timestamps: true,
});

export const TaskModel = mongoose.model('Task', TaskSchema);
