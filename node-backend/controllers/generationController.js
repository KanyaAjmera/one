import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import Generation from '../models/Generation.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.resolve(__dirname, '..', 'uploads');

// GET /api/generations
export const getGenerations = async (req, res) => {
    try {
        const generations = await Generation.find({ userId: req.user._id })
            .sort({ createdAt: -1 });

        return res.status(200).json(generations);
    } catch (error) {
        console.error('Error in getGenerations:', error);
        return res.status(500).json({ success: false, message: 'Failed to fetch generation history', error: error.message });
    }
};

// GET /api/generations/:id
export const getGeneration = async (req, res) => {
    try {
        const { id } = req.params;
        const generation = await Generation.findOne({ _id: id, userId: req.user._id });

        if (!generation) {
            return res.status(404).json({ success: false, message: 'Generation not found or unauthorized' });
        }

        return res.status(200).json(generation);
    } catch (error) {
        console.error('Error in getGeneration:', error);
        return res.status(500).json({ success: false, message: 'Failed to fetch generation', error: error.message });
    }
};

// DELETE /api/generations/:id
export const deleteGeneration = async (req, res) => {
    try {
        const { id } = req.params;
        const generation = await Generation.findOne({ _id: id, userId: req.user._id });

        if (!generation) {
            return res.status(404).json({ success: false, message: 'Generation not found or unauthorized' });
        }

        // Delete physical file if outputUrl exists
        if (generation.outputUrl) {
            try {
                const urlParts = generation.outputUrl.split('/uploads/');
                if (urlParts.length > 1) {
                    const filename = urlParts[1];
                    const filePath = path.join(uploadsDir, filename);
                    if (fs.existsSync(filePath)) {
                        fs.unlinkSync(filePath);
                        console.log(`[Generation Controller] Successfully deleted file: ${filePath}`);
                    }
                }
            } catch (fileErr) {
                console.warn('[Generation Controller] Failed to delete file:', fileErr.message);
            }
        }

        await Generation.deleteOne({ _id: id });

        return res.status(200).json({
            success: true,
            message: 'Generation and associated files deleted successfully'
        });
    } catch (error) {
        console.error('Error in deleteGeneration:', error);
        return res.status(500).json({ success: false, message: 'Failed to delete generation', error: error.message });
    }
};

// POST /api/test-generation
export const createTestGeneration = async (req, res) => {
    try {
        const { prompt } = req.body;
        if (!prompt) {
            return res.status(400).json({ success: false, message: 'Prompt is required' });
        }

        const testGen = await Generation.create({
            userId: req.user._id,
            type: 'test',
            title: 'Test Generation',
            originalPrompt: prompt,
            status: 'completed',
            thumbnailUrl: '',
            outputUrl: ''
        });

        return res.status(201).json(testGen);
    } catch (error) {
        console.error('Error in createTestGeneration:', error);
        return res.status(500).json({ success: false, message: 'Failed to create test generation', error: error.message });
    }
};
