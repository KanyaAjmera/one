/**
 * groqAI.js — Production AI engine using Groq (free tier, Llama 3.3 70B)
 *
 * Cascade:  Groq → Pollinations → Local fallback
 *
 * Groq free tier limits (as of 2025):
 *   llama-3.3-70b-versatile  →  6,000 req/day, 30 req/min, 32k context
 *   mixtral-8x7b-32768       →  14,400 req/day, 30 req/min, 32k context
 *
 * Get a free key at https://console.groq.com — no credit card needed.
 */

import Groq from 'groq-sdk';

const GROQ_MODEL_CHAT  = 'llama-3.3-70b-versatile';
const GROQ_MODEL_JSON  = 'llama-3.3-70b-versatile';   // supports JSON mode

function isGroqConfigured() {
    const k = process.env.GROQ_API_KEY;
    return k && k !== 'your_groq_api_key_here' && k.trim().length > 0;
}

// ── 1. Groq chat call ─────────────────────────────────────────────────────────
export async function callGroq(systemPrompt, userMessage, jsonMode = false) {
    if (!isGroqConfigured()) return null;
    try {
        const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
        const opts = {
            model: GROQ_MODEL_CHAT,
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user',   content: userMessage  },
            ],
            temperature: 0.7,
            max_tokens: 4096,
        };
        if (jsonMode) {
            opts.response_format = { type: 'json_object' };
            opts.temperature = 0.2;
        }
        const completion = await groq.chat.completions.create(opts);
        const text = completion.choices?.[0]?.message?.content?.trim();
        if (text && text.length > 0) {
            console.log(`[Groq] ✓ served (${text.length} chars)`);
            return text;
        }
        return null;
    } catch (err) {
        // Rate limit → try fallback silently
        console.warn('[Groq] failed:', err.message?.slice(0, 80));
        return null;
    }
}

// ── 2. Pollinations fallback (no key needed) ──────────────────────────────────
async function callPollinations(systemPrompt, userMessage) {
    try {
        const res = await fetch('https://text.pollinations.ai/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0' },
            body: JSON.stringify({
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user',   content: userMessage  },
                ],
            }),
            signal: AbortSignal.timeout(15000),
        });
        if (res.ok) {
            const text = (await res.text()).trim();
            if (text.length > 0) {
                console.log('[Pollinations] ✓ served');
                return text;
            }
        }
        return null;
    } catch (err) {
        console.warn('[Pollinations] failed:', err.message?.slice(0, 60));
        return null;
    }
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * General chat: Groq → Pollinations → null (caller handles local fallback)
 */
export async function aiChat(systemPrompt, userMessage) {
    return (
        await callGroq(systemPrompt, userMessage) ||
        await callPollinations(systemPrompt, userMessage) ||
        null
    );
}

/**
 * JSON generation (for PPT / PDF / avatar prompt).
 * Returns a parsed JS object, or null if all engines fail.
 */
export async function aiJsonGenerate(systemPrompt, userPrompt) {
    // 1. Try Groq with JSON mode
    let raw = await callGroq(systemPrompt, userPrompt, true);
    if (raw) {
        try { return JSON.parse(raw); } catch (_) { /* fall through */ }
    }

    // 2. Try Pollinations (no JSON mode, but usually returns valid JSON for structured prompts)
    raw = await callPollinations(systemPrompt, userPrompt);
    if (raw) {
        // Strip markdown fences if present
        let cleaned = raw.trim();
        if (cleaned.startsWith('```')) {
            cleaned = cleaned.replace(/^```[a-z]*\n?/, '').replace(/```$/, '').trim();
        }
        try { return JSON.parse(cleaned); } catch (_) { /* fall through */ }
    }

    return null;  // caller uses local template fallback
}

export { isGroqConfigured };
