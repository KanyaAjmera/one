import mongoose from 'mongoose';

const bestScoreSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    game: {
        type: String,
        required: true,
        trim: true,
    },
    bestScore: {
        type: Number,
        required: true,
    },
}, {
    timestamps: true,
});

// Ensure only one BestScore document per user per game
bestScoreSchema.index({ userId: 1, game: 1 }, { unique: true });

const BestScore = mongoose.model('BestScore', bestScoreSchema);
export default BestScore;
