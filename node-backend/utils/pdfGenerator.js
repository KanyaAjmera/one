import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

/**
 * Generates a PDF file from the given data and saves it to the uploads folder.
 * @param {Object} data - The data for the PDF (title, content, sections).
 * @param {string} uploadDir - The absolute path to the uploads directory.
 * @param {string} filename - The filename to save the PDF as.
 * @returns {Promise<string>} A promise that resolves to the filepath of the generated PDF.
 */
export const generatePDFPath = (data, uploadDir, filename) => {
    return new Promise((resolve, reject) => {
        try {
            const { title, content, sections } = data;
            const doc = new PDFDocument({ margin: 50 });
            const filePath = path.join(uploadDir, filename);

            const writeStream = fs.createWriteStream(filePath);
            doc.pipe(writeStream);

            // Add Title
            if (title) {
                doc.fontSize(24).font('Helvetica-Bold').text(title, { align: 'center' });
                doc.moveDown();
            }

            // Add Main Content
            if (content) {
                doc.fontSize(12).font('Helvetica').text(content, { align: 'left' });
                doc.moveDown();
            }

            // Add Sections
            if (sections && Array.isArray(sections)) {
                sections.forEach(section => {
                    if (section.heading) {
                        doc.fontSize(16).font('Helvetica-Bold').text(section.heading);
                        doc.moveDown(0.5);
                    }
                    if (section.text) {
                        doc.fontSize(12).font('Helvetica').text(section.text, { align: 'left' });
                        doc.moveDown();
                    }
                });
            }

            doc.end();

            writeStream.on('finish', () => {
                resolve(filePath);
            });

            writeStream.on('error', (err) => {
                reject(err);
            });
        } catch (error) {
            reject(error);
        }
    });
};
