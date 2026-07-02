import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
    role: {
        type: String,
        enum: ['user', 'assistant'],
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
}, { _id: false, timestamps: false });

const conversationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    title: {
        type: String,
        default: 'New Chat',
        maxlength: 100,
    },
    mode: {
        type: String,
        enum: ['general', 'law'],
        default: 'general',
    },
    messages: {
        type: [messageSchema],
        default: [],
    },
    pinned: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true, // createdAt, updatedAt
});

// Index for fast user-scoped queries sorted by recency
conversationSchema.index({ userId: 1, updatedAt: -1 });

const Conversation = mongoose.model('Conversation', conversationSchema);
export default Conversation;
