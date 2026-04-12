import PptxGenJS from 'pptxgenjs';
import path from 'path';

/**
 * Generates a PPT file from the given data and saves it to the uploads folder.
 * @param {Object} data - The data for the PPT (title, slides).
 * @param {string} uploadDir - The absolute path to the uploads directory.
 * @param {string} filename - The filename to save the PPT as.
 * @returns {Promise<string>} A promise that resolves to the filepath of the generated PPT.
 */
export const generatePPTPath = async (data, uploadDir, filename) => {
    try {
        const { title, slides } = data;
        const pres = new PptxGenJS();
        
        // Define slide layout
        pres.layout = 'LAYOUT_16x9';

        // Presentation Title Slide (if title provided)
        if (title) {
            const titleSlide = pres.addSlide();
            titleSlide.addText(title, {
                x: 0,
                y: '40%',
                w: '100%',
                align: 'center',
                fontSize: 44,
                bold: true,
                color: '363636'
            });
        }

        // Add format sections or slides
        if (slides && Array.isArray(slides)) {
            slides.forEach(slideData => {
                const slide = pres.addSlide();
                
                // Add heading
                if (slideData.heading) {
                    slide.addText(slideData.heading, {
                        x: 0.5,
                        y: 0.5,
                        w: '80%',
                        h: 1,
                        fontSize: 32,
                        bold: true,
                        color: '003366' // Theme color
                    });
                }
                
                // Add bullet points
                if (slideData.points && Array.isArray(slideData.points)) {
                    const bullets = slideData.points.map(pt => ({ text: pt, options: { bullet: true } }));
                    slide.addText(bullets, {
                        x: 1.0,
                        y: 2.0,
                        w: '80%',
                        h: '60%',
                        fontSize: 20,
                        color: '363636',
                        valign: 'top'
                    });
                }
            });
        }

        const filePath = path.join(uploadDir, filename);

        // Save file
        await pres.writeFile({ fileName: filePath });
        return filePath;
    } catch (error) {
        throw error;
    }
};
