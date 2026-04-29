import User from '../models/User.js';
import Score from '../models/Score.js';
import BestScore from '../models/BestScore.js';

/**
 * @desc   Submit a new game score (calculates streaks and updates records)
 * @route  POST /api/game/submit
 * @access Private
 */
export const submitScore = async (req, res) => {
    try {
        const { game, score } = req.body;
        const userId = req.user._id;

        if (!game || score === undefined) {
            return res.status(400).json({ success: false, message: 'Game name and score are required' });
        }

        // 1. Save Recent Score
        const newScore = await Score.create({
            userId,
            game,
            score
        });

        // 2. Update/Save Best Score
        let bestRecord = await BestScore.findOne({ userId, game });
        if (bestRecord) {
            if (score > bestRecord.bestScore) {
                bestRecord.bestScore = score;
                await bestRecord.save();
            }
        } else {
            bestRecord = await BestScore.create({
                userId,
                game,
                bestScore: score
            });
        }

        // 3. Update User Streak & Total Games
        const user = await User.findById(userId);
        if (user) {
            user.totalGamesPlayed += 1;

            const today = new Date().toISOString().split('T')[0]; // "YYYY-MM-DD"
            
            if (user.lastPlayedDate !== today) {
                if (!user.lastPlayedDate) {
                    user.currentStreak = 1;
                } else {
                    const lastDate = new Date(user.lastPlayedDate);
                    const currentDate = new Date(today);
                    
                    // Difference in days (roughly)
                    const diffTime = Math.abs(currentDate - lastDate);
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
                    
                    if (diffDays === 1) {
                        user.currentStreak += 1; // Played next day
                    } else if (diffDays > 1) {
                        user.currentStreak = 1; // Gap larger than 1 day, reset
                    }
                }
                user.lastPlayedDate = today;
            }
            await user.save();
        }

        res.status(201).json({
            success: true,
            data: {
                recentScore: newScore,
                bestScore: bestRecord.bestScore,
                currentStreak: user.currentStreak,
                totalGamesPlayed: user.totalGamesPlayed
            }
        });
    } catch (error) {
        console.error('Error submitting score:', error);
        res.status(500).json({ success: false, message: 'Failed to submit score' });
    }
};

/**
 * @desc   Get recent scores for logged-in user
 * @route  GET /api/game/recent
 * @access Private
 */
export const getRecentScores = async (req, res) => {
    try {
        const { game } = req.query;
        const query = { userId: req.user._id };
        
        if (game) query.game = game;

        const recentScores = await Score.find(query)
            .sort({ createdAt: -1 })
            .limit(10);
            
        res.status(200).json({ success: true, data: recentScores });
    } catch (error) {
        console.error('Error fetching recent scores:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch recent scores' });
    }
};

/**
 * @desc   Get best scores for logged-in user
 * @route  GET /api/game/best
 * @access Private
 */
export const getBestScores = async (req, res) => {
    try {
        const { game } = req.query;
        const query = { userId: req.user._id };
        
        if (game) query.game = game;

        const bestScores = await BestScore.find(query);
            
        res.status(200).json({ success: true, data: bestScores });
    } catch (error) {
        console.error('Error fetching best scores:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch best scores' });
    }
};

/**
 * @desc   Get user gaming stats (streak, total games)
 * @route  GET /api/game/stats
 * @access Private
 */
export const getUserStats = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('currentStreak lastPlayedDate totalGamesPlayed');
        res.status(200).json({ success: true, data: user });
    } catch (error) {
        console.error('Error fetching user stats:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch user stats' });
    }
};
