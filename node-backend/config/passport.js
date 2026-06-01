import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.js';
import dotenv from 'dotenv';

dotenv.config();

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID || 'your-client-id',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'your-client-secret',
    callbackURL: process.env.GOOGLE_CALLBACK_URL || "/api/auth/google/callback",
    proxy: true
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
        const email = profile.emails && profile.emails.length > 0 ? profile.emails[0].value : null;
        
        let user;
        if (email) {
            user = await User.findOne({ $or: [{ googleId: profile.id }, { email }] });
        } else {
            user = await User.findOne({ googleId: profile.id });
        }

        if (user) {
            // Link googleId if they signed up with email previously but now use Google
            if (!user.googleId) {
                user.googleId = profile.id;
                if (!user.name) {
                    user.name = profile.displayName || (profile.name ? profile.name.givenName : null) || (email ? email.split('@')[0] : 'Unknown User');
                }
                await user.save();
            }
            return done(null, user);
        }

        // If not, create new user
        const fallbackName = profile.displayName || (profile.name ? profile.name.givenName : null) || (email ? email.split('@')[0] : 'Unknown User');
        
        user = await User.create({
            googleId: profile.id,
            name: fallbackName,
            email: email, // Could be null if exact scopes aren't approved
        });

        return done(null, user);
    } catch (error) {
        return done(error, null);
    }
  }
));

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

export default passport;
