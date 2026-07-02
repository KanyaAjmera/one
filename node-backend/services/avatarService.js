import path from 'path';
import fs from 'fs';
import {
    enhanceAvatarPrompt,
    generateDalleImage,
    generateProgrammaticSvg
} from './openaiService.js';

export const generateAvatarFile = async (prompt, style, uploadDir) => {
    let title = `${style.charAt(0).toUpperCase() + style.slice(1)} ${prompt} Avatar`;
    let enhancedPrompt = prompt;
    let negativePrompt = "";
    let imageBuffer = null;
    let isSvg = false;
    let provider = "";

    // 1. Enhance prompt locally (no API needed)
    try {
        const enhancedData = await enhanceAvatarPrompt(prompt, style);
        title = enhancedData.title || title;
        enhancedPrompt = enhancedData.enhancedPrompt || enhancedPrompt;
        negativePrompt = enhancedData.negativePrompt || "";
    } catch (err) {
        console.warn('[Avatar Service] Prompt enhancement failed:', err.message);
    }

    // 2. Try OpenAI DALL-E 3 if key is configured (optional premium upgrade)
    const openaiKey = process.env.OPENAI_API_KEY;
    const isOpenAiValid = openaiKey && openaiKey !== 'your_openai_api_key_here' && openaiKey !== '';

    if (isOpenAiValid) {
        try {
            console.log('[Avatar Service] Attempting DALL-E 3...');
            let dallePrompt = enhancedPrompt;
            if (negativePrompt) dallePrompt += `\n\nDo NOT include: ${negativePrompt}`;
            imageBuffer = await generateDalleImage(dallePrompt);
            provider = "OpenAI DALL-E 3";
            isSvg = false;
        } catch (err) {
            console.warn('[Avatar Service] DALL-E 3 failed:', err.message);
        }
    }

    // 3. Programmatic SVG — always works, zero API dependency
    if (!imageBuffer) {
        console.log('[Avatar Service] Generating programmatic SVG (local)...');
        imageBuffer = generateProgrammaticSvg(enhancedPrompt, style);
        provider = "Programmatic SVG";
        isSvg = true;
    }

    const extension = isSvg ? 'svg' : 'png';
    const filename = `avatar_${Date.now()}.${extension}`;
    const filePath = path.join(uploadDir, filename);
    await fs.promises.writeFile(filePath, imageBuffer);

    return { filename, title, enhancedPrompt, negativePrompt, isSvg, metadata: { provider, style, isSvg } };
};
