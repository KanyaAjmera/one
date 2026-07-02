import path from 'path';
import fs from 'fs';
import { enhanceImagePrompt, generateDalleImage } from './openaiService.js';

const UNSPLASH_ACCESS_KEY = "Ph6HHiyDL30z6jBmbI_e3-ML76Axr9e57xTGEm8ldws";

export const generateImageFile = async (prompt, uploadDir) => {
    let title = prompt.slice(0, 30);
    let enhancedPrompt = prompt;
    let imageBuffer = null;
    let metadata = {};

    // 1. Try to enhance prompt
    try {
        const enhancedData = await enhanceImagePrompt(prompt);
        title = enhancedData.title || title;
        enhancedPrompt = enhancedData.enhancedPrompt || enhancedPrompt;
    } catch (err) {
        console.warn('[Image Service] Prompt enhancement failed:', err.message);
    }

    // 2. Try to generate via OpenAI DALL-E 3
    const openaiKey = process.env.OPENAI_API_KEY;
    const isKeyValid = openaiKey && openaiKey !== 'your_openai_api_key_here' && openaiKey !== '';

    if (isKeyValid) {
        try {
            imageBuffer = await generateDalleImage(enhancedPrompt);
            metadata = { provider: 'OpenAI DALL-E 3', size: '1024x1024', quality: 'hd' };
        } catch (err) {
            console.warn('[Image Service] DALL-E 3 generation failed, trying fallback:', err.message);
        }
    }

    // 3. Fallback: Download high-quality search result from Unsplash
    if (!imageBuffer) {
        console.log('[Image Service] Using Unsplash search as fallback...');
        try {
            const searchUrl = `https://api.unsplash.com/search/photos?page=1&per_page=5&query=${encodeURIComponent(prompt)}&client_id=${UNSPLASH_ACCESS_KEY}`;
            const searchRes = await fetch(searchUrl);
            
            if (searchRes.ok) {
                const searchData = await searchRes.json();
                if (searchData.results && searchData.results.length > 0) {
                    // Get a random result from top 5 for variability
                    const results = searchData.results;
                    const selectedPhoto = results[Math.floor(Math.random() * results.length)];
                    const downloadUrl = selectedPhoto.urls.regular;

                    const downloadRes = await fetch(downloadUrl);
                    if (downloadRes.ok) {
                        const arrayBuffer = await downloadRes.arrayBuffer();
                        imageBuffer = Buffer.from(arrayBuffer);
                        metadata = { 
                            provider: 'Unsplash Search Fallback', 
                            unsplashId: selectedPhoto.id, 
                            author: selectedPhoto.user.name 
                        };
                    } else {
                        throw new Error(`Failed to download photo from ${downloadUrl}`);
                    }
                } else {
                    throw new Error('No Unsplash search results found for: ' + prompt);
                }
            } else {
                throw new Error(`Unsplash search request failed with code ${searchRes.status}`);
            }
        } catch (err) {
            console.error('[Image Service] Unsplash fallback failed:', err.message);
        }
    }

    // 4. Ultimate Fallback: Return a solid colored SVG placeholder if everything fails
    if (!imageBuffer) {
        console.log('[Image Service] Using local SVG placeholder as ultimate fallback...');
        const randomColor = '#' + Math.floor(Math.random()*16777215).toString(16);
        const svgString = `
        <svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
            <rect width="1024" height="1024" fill="${randomColor}" />
            <text x="512" y="512" font-family="sans-serif" font-size="36" font-weight="bold" fill="#FFFFFF" text-anchor="middle">${prompt.slice(0, 50)}</text>
        </svg>
        `;
        imageBuffer = Buffer.from(svgString, 'utf-8');
        metadata = { provider: 'Local SVG Placeholder Fallback' };
    }

    // Determine extension
    // Simple check: SVG headers start with '<svg' or '<?xml'
    const isSvg = imageBuffer.toString('utf-8', 0, 100).includes('<svg');
    const extension = isSvg ? 'svg' : 'png';
    const filename = `image_${Date.now()}.${extension}`;
    const filePath = path.join(uploadDir, filename);

    // Save image to file
    await fs.promises.writeFile(filePath, imageBuffer);

    return {
        filename,
        title,
        enhancedPrompt,
        metadata,
        isSvg
    };
};
