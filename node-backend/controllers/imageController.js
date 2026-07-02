import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import { generateImageFile } from '../services/imageService.js';
import Generation from '../models/Generation.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.resolve(__dirname, '..', 'uploads');

if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

export const createImage = async (req, res) => {
    try {
        const { prompt } = req.body;
        if (!prompt) {
            return res.status(400).json({ success: false, message: 'Prompt is required' });
        }

        // Create pending generation record
        const generation = await Generation.create({
            userId: req.user._id,
            type: 'image',
            title: prompt.slice(0, 50),
            originalPrompt: prompt,
            status: 'pending'
        });

        try {
            // Generate and save the image
            const { filename, title, enhancedPrompt, metadata } = await generateImageFile(prompt, uploadsDir);

            // Construct download URL
            const protocol = req.protocol;
            const host = req.get('host');
            const outputUrl = `${protocol}://${host}/uploads/${filename}`;

            // Update generation details
            generation.title = title || generation.title;
            generation.enhancedPrompt = enhancedPrompt;
            generation.status = 'completed';
            generation.outputUrl = outputUrl;
            generation.metadata = metadata;
            await generation.save();

            return res.status(201).json({
                success: true,
                data: generation
            });
        } catch (genError) {
            generation.status = 'failed';
            generation.metadata = { error: genError.message };
            await generation.save();
            throw genError;
        }
    } catch (error) {
        console.error('Error in createImage:', error);
        return res.status(500).json({ success: false, message: 'Failed to generate image', error: error.message });
    }
};
