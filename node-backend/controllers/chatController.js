import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const askQuestion = async (req, res) => {
    try {
        const { message, context, mode = "general" } = req.body;
        
        // 1. If mode is LAW, try the local Dataset matching engine first
        if (mode === "law") {
            // Import dynamically or at top. Since it's ES module, we should import at top.
            // But since I'm injecting this without touching top imports to avoid issues, I'll use a dynamic import.
            const { detectLawIntent, formatLawResponse } = await import('../utils/lawDetector.js');
            const matches = detectLawIntent(message);
            
            if (matches) {
                const responseText = formatLawResponse(matches);
                return res.status(200).json({
                    success: true,
                    response: responseText
                });
            }
            // If no match found, fallback to AI engine using Law Prompt
        }
        
        let SYSTEM_PROMPT = "";

        if (mode === "law") {
            SYSTEM_PROMPT = `You are the Indian Law Reference System of the Infinity AI platform.
Your task is to map the situation to relevant Indian law(s).

RESPONSE FORMAT:

[LAW]
Act name (e.g., IPC, IT Act)

[SECTION]
Section number (or "Approximate" if unsure)

[EXPLANATION]
Simple explanation

[PUNISHMENT]
General punishment (if confident)

[NOTE]
"This is not legal advice"

RULES:
* Do NOT guess exact sections if unsure
* If multiple laws apply, show top 2–3
* Use simple language`;
        } else {
            SYSTEM_PROMPT = `You are the General AI Assistant of the Infinity AI platform.
* Answer normally like an intelligent assistant
* Be accurate and structured
* Do not hallucinate
* Always prioritize correctness
* If unsure, say so
* Keep answers clean and structured`;
        }

        // 1. Web Retrieval Simulation (Scraping Mock)
        // In a fully production system, this would use a real search API or scraper.
        const webDataMock = `Recent data context: The user is interacting with the Infinity Ask platform.`;

        // Combine prompt with user message
        const fullPrompt = `${SYSTEM_PROMPT}\n\n[RETRIEVED WEB DATA]\n${webDataMock}\n\n[USER QUERY]\n${message}\n\nPlease generate your response following the rules of your mode.`;

        // 2. Connect to Free Serverless AI Engine
        try {
            const response = await fetch('https://text.pollinations.ai/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'User-Agent': 'Mozilla/5.0'
                },
                body: JSON.stringify({
                    messages: [
                        { role: 'system', content: SYSTEM_PROMPT },
                        { role: 'user', content: message }
                    ]
                }),
            });

            if (response.ok) {
                let aiText = await response.text();
                
                // Return the raw response, allowing LAW MODE to use its own bracket formats.
                return res.status(200).json({
                    success: true,
                    response: aiText
                });
            } else {
                console.log("AI API returned an error status:", response.status);
            }
        } catch (error) {
            console.log("AI API failed. Falling back to intelligent mock.");
        }

        // 3. Absolute Fallback Response (only if network completely drops)
        let answer = `You asked: "${message}".\n\n(System Note: Both local and cloud fallback models are currently unreachable. Please check your internet connection.)`;
        let explanation = "Network request to the AI engine failed.";
        let sourceBasis = "- Offline Fallback";

        const mockResponse = `[ANSWER]\n${answer}\n\n[EXPLANATION]\n${explanation}\n\n[SOURCE BASIS]\n${sourceBasis}`;

        return res.status(200).json({
            success: true,
            response: mockResponse,
        });

    } catch (error) {
        console.error('Error in chatController:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to process chat query',
            error: error.message
        });
    }
};

export const getLaws = async (req, res) => {
    try {
        const datasetPath = path.join(__dirname, '../data/laws_dataset.json');
        const lawsData = JSON.parse(fs.readFileSync(datasetPath, 'utf8'));

        const grouped = {};

        lawsData.forEach(law => {
            const category = law.category || "Other Offences";
            if (!grouped[category]) {
                grouped[category] = [];
            }
            grouped[category].push(law);
        });

        // Convert to array of objects
        const result = Object.entries(grouped)
            .map(([category, laws]) => ({ category, laws }));

        res.status(200).json({ success: true, data: result });
    } catch (error) {
        console.error("Error fetching laws:", error);
        res.status(500).json({ success: false, message: "Failed to fetch laws" });
    }
};
