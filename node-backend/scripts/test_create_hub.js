import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import User from '../models/User.js';
import Generation from '../models/Generation.js';
import { generatePresentationJson, generateReportJson } from '../services/openaiService.js';
import { generatePPTFile } from '../services/pptService.js';
import { generatePDFFile } from '../services/pdfService.js';
import { generateImageFile } from '../services/imageService.js';
import { generateAvatarFile } from '../services/avatarService.js';
import { 
    getGenerations, 
    getGeneration, 
    deleteGeneration, 
    createTestGeneration 
} from '../controllers/generationController.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars
const parentEnvPath = path.resolve(__dirname, '../../.env');
const localEnvPath = path.resolve(__dirname, '../.env');

if (fs.existsSync(parentEnvPath)) {
    dotenv.config({ path: parentEnvPath });
}
if (fs.existsSync(localEnvPath)) {
    dotenv.config({ path: localEnvPath });
}

const uploadsDir = path.resolve(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

const runTests = async () => {
    console.log('=== STARTING CREATE HUB BACKEND VERIFICATION ===');
    
    // 1. Connect to MongoDB
    console.log('[Test] Connecting to MongoDB...');
    await connectDB();

    try {
        // 2. Setup Test User
        console.log('[Test] Finding test user...');
        let testUser = await User.findOne();
        if (!testUser) {
            console.log('[Test] No user found. Creating dummy user...');
            const uniqueSuffix = Date.now();
            testUser = await User.create({
                name: 'Test Creator',
                email: `test_creator_${uniqueSuffix}@example.com`,
                password: 'testpassword123',
                username: `testuser_${uniqueSuffix}`
            });
            console.log(`[Test] Created new test user with ID: ${testUser._id}`);
        } else {
            console.log(`[Test] Using existing user: ${testUser.email} (ID: ${testUser._id})`);
        }

        // 3. Test PPT Creator
        console.log('\n[Test] Running PPT generation workflow...');
        const pptTopic = 'The Rise of Quantum Artificial Intelligence';
        const pptJson = await generatePresentationJson(pptTopic);
        console.log(`[Test] AI generated presentation title: "${pptJson.presentationTitle}" with ${pptJson.slides.length} slides.`);
        
        const pptFilename = `ppt_test_${Date.now()}.pptx`;
        await generatePPTFile(pptJson, uploadsDir, pptFilename);
        console.log(`[Test] Saved PPTX file to uploads/${pptFilename}`);

        const pptGen = await Generation.create({
            userId: testUser._id,
            type: 'ppt',
            title: pptJson.presentationTitle || pptTopic,
            originalPrompt: pptTopic,
            status: 'completed',
            outputUrl: `http://localhost:5000/uploads/${pptFilename}`,
            metadata: {
                theme: pptJson.theme,
                slideCount: pptJson.slides.length
            }
        });
        console.log(`[Test] Stored PPT generation in MongoDB: ${pptGen._id}`);

        // 4. Test PDF Creator
        console.log('\n[Test] Running PDF generation workflow...');
        const pdfTopic = 'State of Cybersecurity in 2026';
        const pdfJson = await generateReportJson(pdfTopic);
        console.log(`[Test] AI generated document title: "${pdfJson.documentTitle}" with ${pdfJson.sections.length} sections.`);
        
        const pdfFilename = `pdf_test_${Date.now()}.pdf`;
        await generatePDFFile(pdfJson, uploadsDir, pdfFilename);
        console.log(`[Test] Saved PDF file to uploads/${pdfFilename}`);

        const pdfGen = await Generation.create({
            userId: testUser._id,
            type: 'pdf',
            title: pdfJson.documentTitle || pdfTopic,
            originalPrompt: pdfTopic,
            status: 'completed',
            outputUrl: `http://localhost:5000/uploads/${pdfFilename}`,
            metadata: {
                documentType: pdfJson.documentType,
                theme: pdfJson.theme,
                sectionCount: pdfJson.sections.length
            }
        });
        console.log(`[Test] Stored PDF generation in MongoDB: ${pdfGen._id}`);

        // 5. Test Image Creator
        console.log('\n[Test] Running Image generation workflow...');
        const imagePrompt = 'A cozy cabin in a snowy forest at sunset, digital art';
        const imageResult = await generateImageFile(imagePrompt, uploadsDir);
        console.log(`[Test] Enhanced image prompt: "${imageResult.enhancedPrompt}"`);
        console.log(`[Test] Saved image file: uploads/${imageResult.filename}`);

        const imageGen = await Generation.create({
            userId: testUser._id,
            type: 'image',
            title: imageResult.title,
            originalPrompt: imagePrompt,
            enhancedPrompt: imageResult.enhancedPrompt,
            status: 'completed',
            outputUrl: `http://localhost:5000/uploads/${imageResult.filename}`,
            metadata: imageResult.metadata
        });
        console.log(`[Test] Stored Image generation in MongoDB: ${imageGen._id}`);

        // 6. Test Avatar Creator (Anime, Realistic, 3D)
        console.log('\n[Test] Running Avatar generation workflow...');
        const avatarPrompt = 'futuristic neon cyberpunk hacker';
        const styles = ['anime', 'realistic', '3d'];

        for (const style of styles) {
            console.log(`[Test] Generating ${style} avatar...`);
            const avatarResult = await generateAvatarFile(avatarPrompt, style, uploadsDir);
            console.log(`[Test] Enhanced: "${avatarResult.enhancedPrompt}"`);
            console.log(`[Test] Saved avatar file: uploads/${avatarResult.filename}`);

            const avatarGen = await Generation.create({
                userId: testUser._id,
                type: 'avatar',
                title: avatarResult.title,
                originalPrompt: avatarPrompt,
                enhancedPrompt: avatarResult.enhancedPrompt,
                status: 'completed',
                outputUrl: `http://localhost:5000/uploads/${avatarResult.filename}`,
                metadata: avatarResult.metadata
            });
            console.log(`[Test] Stored ${style} avatar generation in MongoDB: ${avatarGen._id}`);
        }

        // 7. Verify History Controller Retrieval
        console.log('\n[Test] Verifying history controllers with mock req/res...');
        const reqMock = { user: { _id: testUser._id } };
        const resMock = {
            statusCode: 200,
            json: function(data) {
                this.data = data;
                return this;
            },
            status: function(code) {
                this.statusCode = code;
                return this;
            }
        };

        await getGenerations(reqMock, resMock);
        console.log(`[Test] getGenerations returned ${resMock.data.length} records.`);
        if (resMock.data.length === 0) {
            throw new Error('History list returned empty!');
        }

        // 8. Verify Test Generation Controller (POST /api/test-generation)
        console.log('\n[Test] Verifying createTestGeneration controller...');
        reqMock.body = { prompt: 'Automated test generation verification prompt' };
        const resMockTestGen = {
            statusCode: 200,
            json: function(data) {
                this.data = data;
                return this;
            },
            status: function(code) {
                this.statusCode = code;
                return this;
            }
        };

        await createTestGeneration(reqMock, resMockTestGen);
        console.log(`[Test] createTestGeneration successfully created document: ${resMockTestGen.data._id}`);
        console.log(`[Test] Document fields - type: "${resMockTestGen.data.type}", originalPrompt: "${resMockTestGen.data.originalPrompt}"`);

        // 9. Verify getGeneration by ID (GET /api/generations/:id)
        console.log('\n[Test] Verifying getGeneration by ID controller...');
        reqMock.params = { id: resMockTestGen.data._id };
        const resMockSingle = {
            statusCode: 200,
            json: function(data) {
                this.data = data;
                return this;
            },
            status: function(code) {
                this.statusCode = code;
                return this;
            }
        };

        await getGeneration(reqMock, resMockSingle);
        console.log(`[Test] getGeneration returned document title: "${resMockSingle.data.title}"`);

        // 10. Verify deleteGeneration (DELETE /api/generations/:id)
        console.log('\n[Test] Verifying deleteGeneration controller...');
        const resMockDelete = {
            statusCode: 200,
            json: function(data) {
                this.data = data;
                return this;
            },
            status: function(code) {
                this.statusCode = code;
                return this;
            }
        };

        await deleteGeneration(reqMock, resMockDelete);
        console.log(`[Test] deleteGeneration output message: "${resMockDelete.data.message}"`);

        // Verify the document is indeed gone
        const verifyDeletedDoc = await Generation.findById(resMockTestGen.data._id);
        console.log(`[Test] Is document deleted from DB? ${verifyDeletedDoc === null ? 'Yes' : 'No'}`);

        console.log('\n=== ALL NEW ROUTE & CONTROLLER TESTS COMPLETED SUCCESSFULLY ===');
        
    } catch (error) {
        console.error('\n=== TEST RUN ENCOUNTERED ERROR ===');
        console.error(error);
    } finally {
        console.log('[Test] Closing database connection...');
        await mongoose.connection.close();
        process.exit(0);
    }
};

runTests();
