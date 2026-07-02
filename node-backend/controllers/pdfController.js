import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import { generatePDFFile } from '../services/pdfService.js';
import { generateReportJson } from '../services/openaiService.js';
import Generation from '../models/Generation.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.resolve(__dirname, '..', 'uploads');

if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

export const createPDF = async (req, res) => {
    try {
        const { prompt, topic } = req.body;
        const userPrompt = prompt || topic;
        if (!userPrompt) {
            return res.status(400).json({ success: false, message: 'Prompt or topic is required' });
        }

        // Create pending generation record
        const generation = await Generation.create({
            userId: req.user._id,
            type: 'pdf',
            title: userPrompt.slice(0, 50),
            originalPrompt: userPrompt,
            status: 'pending'
        });

        try {
            // Generate structured report JSON
            const pdfJson = await generateReportJson(userPrompt);

            // Generate PDF document
            const filename = `pdf_${generation._id}_${Date.now()}.pdf`;
            await generatePDFFile(pdfJson, uploadsDir, filename);

            // Construct download URL
            const protocol = req.protocol;
            const host = req.get('host');
            const outputUrl = `${protocol}://${host}/uploads/${filename}`;

            // Update generation details
            generation.title = pdfJson.documentTitle || generation.title;
            generation.status = 'completed';
            generation.outputUrl = outputUrl;
            generation.metadata = {
                documentType: pdfJson.documentType,
                theme: pdfJson.theme,
                sectionCount: pdfJson.sections ? pdfJson.sections.length : 0
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
        console.error('Error in createPDF:', error);
        return res.status(500).json({ success: false, message: 'Failed to generate PDF', error: error.message });
    }
};
