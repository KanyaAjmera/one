import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.js';

// Strategy is registered lazily on first use so env vars are fully loaded
function ensureStrategy() {
    if (passport._strategies['google']) return;

    const callbackURL = process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5001/api/auth/google/callback';
    console.log(`[Passport] Registering Google strategy — callback: ${callbackURL}`);

    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID || '',
        clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
        callbackURL,
        proxy: true,
    },
    async (accessToken, refreshToken, profile, done) => {
        try {
            const email = profile.emails?.[0]?.value ?? null;

            let user = email
                ? await User.findOne({ $or: [{ googleId: profile.id }, { email }] })
                : await User.findOne({ googleId: profile.id });

            if (user) {
                if (!user.googleId) {
                    user.googleId = profile.id;
                    if (!user.name) user.name = profile.displayName || email?.split('@')[0] || 'User';
                    await user.save();
                }
                return done(null, user);
            }

            user = await User.create({
                googleId: profile.id,
                name: profile.displayName || email?.split('@')[0] || 'User',
                email,
            });
            return done(null, user);
        } catch (err) {
            return done(err, null);
        }
    }));
}

passport.serializeUser((user, done) => done(null, user.id));

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});

export { ensureStrategy };
export default passport;
