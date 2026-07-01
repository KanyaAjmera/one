import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { aiChat, isGeminiConfigured } from '../utils/geminiAI.js';
import { generalChat, lawsChat } from '../utils/localAI.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ── System prompts ─────────────────────────────────────────────────────────────

const SYSTEM_GENERAL = `You are Infinity AI — a knowledgeable, thorough assistant. Your answers must be:

**FORMAT RULES (always follow):**
- Use ## headers to organize sections
- Use **bold** for key terms and important facts  
- Use bullet lists (•) for enumerating items
- Use numbered lists for steps or sequences
- Use \`code blocks\` for any code, commands, or technical syntax
- Add a horizontal rule (---) between major sections

**CONTENT RULES:**
- Give COMPLETE, DETAILED answers — never cut short
- Always explain the WHY, not just the WHAT
- Include real-world examples wherever helpful
- For factual questions: include statistics, dates, key names
- For technical questions: include code examples, syntax, use cases
- For conceptual questions: explain from basics then go deeper
- End with a "## Key Takeaways" section summarizing 3-5 bullet points

**NEVER:**
- Say "I can't provide" when you actually can
- Give one-liner answers to complex questions
- Skip context or background information
- Make up facts — say "I'm not certain" if unsure`;

const SYSTEM_LAWS = `You are Infinity Laws AI — an Indian legal reference assistant.

For every query, respond in this exact format:

**[LAW]** Name of the Act (e.g., IPC, IT Act 2000, POCSO Act)
**[SECTION]** Section number and title
**[EXPLANATION]** Clear, simple explanation in 2-3 sentences
**[PUNISHMENT]** Imprisonment/fine if applicable
**[COURT]** Which court handles this

Rules:
- Cover Indian law only
- Show top 2-3 most relevant laws if multiple apply
- Use plain, non-technical language
- If query is unrelated to law, politely decline
- Always end with: "*This is educational information only — not legal advice. Consult a qualified advocate for your situation.*"`;

// ── Controller ─────────────────────────────────────────────────────────────────

export const askQuestion = async (req, res) => {
    try {
        const { message, mode = 'general' } = req.body;

        if (!message || !message.trim()) {
            return res.status(400).json({ success: false, message: 'Message is required' });
        }

        console.log(`[Chat] mode=${mode} gemini=${isGeminiConfigured()} | "${message.slice(0, 60)}"`);

        const systemPrompt = mode === 'law' ? SYSTEM_LAWS : SYSTEM_GENERAL;

        // AI cascade with hard timeout so the client never hangs
        const AI_TIMEOUT_MS = 20000;
        let response = await Promise.race([
            aiChat(systemPrompt, message),
            new Promise((resolve) => setTimeout(() => resolve(null), AI_TIMEOUT_MS)),
        ]);

        // Local engine as final fallback
        if (!response) {
            console.log('[Chat] All AI engines unavailable — using local fallback');
            response = mode === 'law' ? lawsChat(message) : generalChat(message);
        }

        return res.status(200).json({ success: true, response });

    } catch (error) {
        console.error('[Chat] Error:', error);
        res.status(500).json({ success: false, message: 'Failed to process query', error: error.message });
    }
};

export const getLaws = async (req, res) => {
    try {
        const datasetPath = path.join(__dirname, '../data/laws_dataset.json');
        const lawsData = JSON.parse(fs.readFileSync(datasetPath, 'utf8'));

        const grouped = {};
        lawsData.forEach(law => {
            const category = law.category || 'Other Offences';
            if (!grouped[category]) grouped[category] = [];
            grouped[category].push(law);
        });

        const result = Object.entries(grouped).map(([category, laws]) => ({ category, laws }));
        res.status(200).json({ success: true, data: result });
    } catch (error) {
        console.error('[Laws] Error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch laws' });
    }
};
