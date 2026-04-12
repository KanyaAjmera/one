import { generatePDFPath } from '../utils/pdfGenerator.js';
import { generatePPTPath } from '../utils/pptGenerator.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, '..', 'uploads');

// Ensure uploads directory exists
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

export const generatePDF = async (req, res) => {
    try {
        const { title, content, sections } = req.body;
        
        // Basic validation
        if (!title && !content && (!sections || sections.length === 0)) {
            return res.status(400).json({ success: false, message: 'Please provide title, content, or sections.' });
        }

        const filename = `document_${Date.now()}.pdf`;
        await generatePDFPath(req.body, uploadsDir, filename);

        // Construct public URL
        const protocol = req.protocol;
        const host = req.get('host');
        const fileUrl = `${protocol}://${host}/uploads/${filename}`;

        res.status(200).json({
            success: true,
            fileUrl
        });

    } catch (error) {
        console.error('Error in generatePDF:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while generating PDF',
            error: error.message
        });
    }
};

export const generatePPT = async (req, res) => {
    try {
        const { title, slides } = req.body;
        
        // Basic validation
        if (!title && (!slides || slides.length === 0)) {
            return res.status(400).json({ success: false, message: 'Please provide a title or slides.' });
        }

        const filename = `presentation_${Date.now()}.pptx`;
        await generatePPTPath(req.body, uploadsDir, filename);

        // Construct public URL
        const protocol = req.protocol;
        const host = req.get('host');
        const fileUrl = `${protocol}://${host}/uploads/${filename}`;

        res.status(200).json({
            success: true,
            fileUrl
        });

    } catch (error) {
        console.error('Error in generatePPT:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while generating PPT',
            error: error.message
        });
    }
};
