/**
 * geminiAI.js — Production AI engine using Google Gemini
 *
 * Model: gemini-2.0-flash (fast, smart, free tier: 1,500 req/day)
 * Cascade: Gemini → Groq → Pollinations → Local fallback
 *
 * Key format: AQ.Ab8... (new Google format, works the same as AIzaSy...)
 */

import { callGroq } from './groqAI.js';

const GEMINI_MODEL = 'gemini-2.0-flash';
const GEMINI_BASE  = 'https://generativelanguage.googleapis.com/v1beta/models';

function getKey() {
    const k = process.env.VITE_GEMINI_API_KEY;
    return (k && k !== 'your_new_gemini_api_key_here' && k.trim().length > 10) ? k.trim() : null;
}

// ── Core Gemini call ──────────────────────────────────────────────────────────
async function callGemini(systemPrompt, userMessage, jsonMode = false) {
    const key = getKey();
    if (!key) { console.log('[Gemini] No key configured'); return null; }

    try {
        const url = `${GEMINI_BASE}/${GEMINI_MODEL}:generateContent?key=${key}`;
        const body = {
            systemInstruction: { parts: [{ text: systemPrompt }] },
            contents: [{ role: 'user', parts: [{ text: userMessage }] }],
            generationConfig: {
                temperature: jsonMode ? 0.2 : 0.7,
                maxOutputTokens: jsonMode ? 8192 : 4096,
                ...(jsonMode && { responseMimeType: 'application/json' }),
            },
        };

        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
            signal: AbortSignal.timeout(10000),
        });

        if (res.ok) {
            const data = await res.json();
            const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
            if (text && text.length > 0) {
                console.log(`[Gemini] ✓ served (${text.length} chars)`);
                return text;
            }
        } else {
            const err = await res.json().catch(() => ({}));
            const msg = err?.error?.message?.slice(0, 100) || res.status;
            console.warn(`[Gemini] HTTP ${res.status}: ${msg}`);
            // Quota/auth errors won't recover on retry — skip slow fallbacks in cascade
            if (res.status === 429 || res.status === 403 || res.status === 401) {
                return '__GEMINI_SKIP__';
            }
        }
    } catch (err) {
        console.warn('[Gemini] request failed:', err.message?.slice(0, 80));
    }
    return null;
}

// ── Pollinations fallback ─────────────────────────────────────────────────────
async function callPollinations(systemPrompt, userMessage) {
    // Try multiple Pollinations endpoints for reliability
    const endpoints = [
        {
            url: 'https://text.pollinations.ai/',
            body: {
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user',   content: userMessage  },
                ],
                model: 'openai',
                seed: 42,
            },
        },
        {
            url: 'https://text.pollinations.ai/',
            body: {
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user',   content: userMessage  },
                ],
                model: 'mistral',
            },
        },
    ];

    for (const ep of endpoints) {
        try {
            const res = await fetch(ep.url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0' },
                body: JSON.stringify(ep.body),
                signal: AbortSignal.timeout(8000),
            });
            if (res.ok) {
                const text = (await res.text()).trim();
                if (text.length > 10) {
                    console.log(`[Pollinations] ✓ fallback served (${text.length} chars)`);
                    return text;
                }
            }
        } catch (err) {
            console.warn('[Pollinations] endpoint failed:', err.message?.slice(0, 60));
        }
    }
    return null;
}

// ── Public API ────────────────────────────────────────────────────────────────

/** Chat: Gemini → Groq → Pollinations → null (caller handles local fallback) */
export async function aiChat(systemPrompt, userMessage) {
    const gemini = await callGemini(systemPrompt, userMessage, false);
    if (gemini && gemini !== '__GEMINI_SKIP__') return gemini;

    const groq = await callGroq(systemPrompt, userMessage, false);
    if (groq) return groq;

    return await callPollinations(systemPrompt, userMessage) || null;
}

/**
 * JSON generation for structured content (PDF, PPT, avatar prompt).
 * Returns parsed JS object or null.
 */
export async function aiJsonGenerate(systemPrompt, userPrompt) {
    // 1. Try Gemini with JSON mode
    let raw = await callGemini(systemPrompt, userPrompt, true);
    if (raw) {
        try { return JSON.parse(raw); } catch (_) { /* fall through */ }
    }

    // 2. Try Pollinations (plain text, parse manually)
    raw = await callPollinations(systemPrompt, userPrompt);
    if (raw) {
        let cleaned = raw.trim().replace(/^```[a-z]*\n?/, '').replace(/```$/, '').trim();
        try { return JSON.parse(cleaned); } catch (_) { /* fall through */ }
    }

    return null; // caller uses local template
}

export const isGeminiConfigured = () => !!getKey();
