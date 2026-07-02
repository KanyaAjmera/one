import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import { generatePPTFile } from '../services/pptService.js';
import { generatePresentationJson } from '../services/openaiService.js';
import Generation from '../models/Generation.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.resolve(__dirname, '..', 'uploads');

if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

export const createPPT = async (req, res) => {
    try {
        const { prompt, topic } = req.body;
        const userPrompt = prompt || topic;
        if (!userPrompt) {
            return res.status(400).json({ success: false, message: 'Prompt or topic is required' });
        }

        // Create pending generation record
        const generation = await Generation.create({
            userId: req.user._id,
            type: 'ppt',
            title: userPrompt.slice(0, 50),
            originalPrompt: userPrompt,
            status: 'pending'
        });

        try {
            // Generate presentation content structure
            const pptJson = await generatePresentationJson(userPrompt);

            // Generate PPTX file
            const filename = `ppt_${generation._id}_${Date.now()}.pptx`;
            await generatePPTFile(pptJson, uploadsDir, filename);

            // Construct download URL
            const protocol = req.protocol;
            const host = req.get('host');
            const outputUrl = `${protocol}://${host}/uploads/${filename}`;

            // Update generation details
            generation.title = pptJson.presentationTitle || generation.title;
            generation.status = 'completed';
            generation.outputUrl = outputUrl;
            generation.metadata = {
                theme: pptJson.theme,
                slideCount: pptJson.slides ? pptJson.slides.length : 0
            };
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
        console.error('Error in createPPT:', error);
        return res.status(500).json({ success: false, message: 'Failed to generate PPT', error: error.message });
    }
};
