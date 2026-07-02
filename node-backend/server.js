import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import bodyParser from 'body-parser';
import session from 'express-session';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ── Load env FIRST — before any other imports that read process.env ──────────
const localEnvPath = path.resolve(__dirname, '.env');
const parentEnvPath = path.resolve(__dirname, '../.env');

if (fs.existsSync(localEnvPath)) {
    dotenv.config({ path: localEnvPath });
}
if (fs.existsSync(parentEnvPath)) {
    dotenv.config({ path: parentEnvPath, override: false }); // don't override local
}

// ── Now safe to import modules that read process.env ─────────────────────────
import connectDB from './config/db.js';
import passport from './config/passport.js';
import authRoutes from './routes/auth.js';
import generateRoutes from './routes/generateRoutes.js';
import gameRoutes from './routes/gameRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import pptRoutes from './routes/pptRoutes.js';
import pdfRoutes from './routes/pdfRoutes.js';
import imageRoutes from './routes/imageRoutes.js';
import avatarRoutes from './routes/avatarRoutes.js';
import generationRoutes from './routes/generationRoutes.js';
import conversationRoutes from './routes/conversationRoutes.js';
import { protect } from './middleware/authMiddleware.js';
import { createTestGeneration } from './controllers/generationController.js';

const app = express();

// Middleware
// Configure CORS — FRONTEND_URL env var supports any Vercel/custom domain
const productionOrigins = [
    'https://infinity-frontend.vercel.app',
    'https://one-3pr6.vercel.app',
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:5174',
];
if (process.env.FRONTEND_URL) {
    productionOrigins.unshift(process.env.FRONTEND_URL);
}
const corsOptions = {
    origin: process.env.NODE_ENV === 'production' ? productionOrigins : true,
    credentials: true,
};

app.use(cors(corsOptions));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Express Session Middleware
app.use(session({
    secret: process.env.JWT_SECRET || 'fallback_secret_key',
    resave: false,
    saveUninitialized: false,
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// ── Rate Limiting ──────────────────────────────────────────────────────────────

// General API limiter — all /api/* routes
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many requests, please slow down.' },
});

// Strict limiter for AI chat — prevents burning API quota
const aiChatLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 60,                   // 60 AI messages per 15 min per IP
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
        // Use JWT user ID if authenticated, else fallback to IP
        const auth = req.headers.authorization;
        if (auth && auth.startsWith('Bearer ')) {
            return auth.split(' ')[1].slice(-20); // last 20 chars of token as key
        }
        return req.ip;
    },
    message: { success: false, message: 'AI rate limit reached. Please wait a few minutes before sending more messages.' },
});

// Auth limiter — prevent brute-force login attacks
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many auth attempts, please try again later.' },
});

app.use('/api', generalLimiter);
app.use('/api/chat/ask', aiChatLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/signup', authLimiter);

// ──────────────────────────────────────────────────────────────────────────────

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/generate', generateRoutes);
app.use('/api/game', gameRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/create', pptRoutes);
app.use('/api/create', pdfRoutes);
app.use('/api/create', imageRoutes);
app.use('/api/create', avatarRoutes);
app.use('/api/generations', generationRoutes);
app.use('/api/conversations', conversationRoutes);
app.post('/api/test-generation', protect, createTestGeneration);

// Static uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check (used by Render)
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
});

// Base route
app.get('/', (req, res) => {
    res.send('API is running...');
});

const PORT = process.env.PORT || 5001;

const server = app.listen(PORT);

server.on('listening', () => {
    console.log(`Server running on port ${PORT}`);
    connectDB();
});

server.on('error', (err) => {
    console.error(`Failed to start server on port ${PORT}: ${err.message}`);
    process.exit(1);
});
