import mongoose from 'mongoose';

const generationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    type: {
        type: String,
        required: true,
        enum: ['ppt', 'pdf', 'image', 'avatar', 'test'],
    },
    title: {
        type: String,
        required: true,
    },
    originalPrompt: {
        type: String,
        required: true,
    },
    enhancedPrompt: {
        type: String,
    },
    thumbnailUrl: {
        type: String,
        default: '',
    },
    status: {
        type: String,
        required: true,
        enum: ['pending', 'completed', 'failed'],
        default: 'pending',
    },
    outputUrl: {
        type: String,
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: {},
    },
}, {
    timestamps: true,
});

const Generation = mongoose.model('Generation', generationSchema);
export default Generation;
