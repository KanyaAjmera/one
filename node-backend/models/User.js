import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
   name: {
  type: String,
  unique: true,
  sparse: true
},
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/, 'Please provide a valid email'],
    },
    password: {
        type: String,
        required: function() { return !this.googleId; },
        minlength: [6, 'Password must be at least 6 characters'],
    },
    googleId: {
        type: String,
        unique: true,
        sparse: true,
    },
    currentStreak: {
        type: Number,
        default: 0,
    },
    lastPlayedDate: {
        type: String,
        default: null,
    },
    totalGamesPlayed: {
        type: Number,
        default: 0,
    },
}, {
    timestamps: true, // Automatically adds createdAt and updatedAt
});

// Remove password from JSON responses
userSchema.set('toJSON', {
    transform: function (doc, ret) {
        delete ret.password;
        return ret;
    }
});

const User = mongoose.model('User', userSchema);
export default User;
