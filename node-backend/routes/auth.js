import express from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import { signup, login, getProfile } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { ensureStrategy } from '../config/passport.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.get('/profile', protect, getProfile);

// Google OAuth — call ensureStrategy() so it registers with the correct callback URL
router.get('/google', (req, res, next) => {
    ensureStrategy();
    passport.authenticate('google', {
        scope: ['profile', 'email'],
        prompt: 'select_account',
    })(req, res, next);
});

router.get('/google/callback',
    (req, res, next) => {
        ensureStrategy();
        next();
    },
    passport.authenticate('google', {
        session: false,
        failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/?error=auth_failed`,
    }),
    (req, res) => {
        const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        res.redirect(`${frontendUrl}/auth-success?token=${token}`);
    }
);

export default router;
