"""
gemini_ai.py — Production AI engine using Google Gemini 2.0 Flash
Cascade: Gemini → Pollinations (free, no key) → None

Free tier: 1,500 requests/day, no credit card
Model: gemini-2.0-flash (fast + smart)
"""

import os
import json
import re
import requests

GEMINI_MODEL = "gemini-2.0-flash"
GEMINI_BASE  = "https://generativelanguage.googleapis.com/v1beta/models"
POLLINATIONS_URL = "https://text.pollinations.ai/"


def _get_key() -> str | None:
    k = os.getenv("VITE_GEMINI_API_KEY", "").strip()
    return k if k and k != "your_new_gemini_api_key_here" and len(k) > 10 else None


def _pollinations_chat(system_prompt: str, user_message: str, timeout: int = 20) -> str | None:
    """Free Pollinations fallback — no API key needed."""
    try:
        resp = requests.post(
            POLLINATIONS_URL,
            headers={"Content-Type": "application/json", "User-Agent": "Mozilla/5.0"},
            json={
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user",   "content": user_message},
                ],
            },
            timeout=timeout,
        )
        if resp.status_code == 200:
            text = resp.text.strip()
            if text:
                print(f"[Pollinations] ✓ fallback served ({len(text)} chars)")
                return text
    except Exception as e:
        print(f"[Pollinations] error: {e}")
    return None


def gemini_chat(system_prompt: str, user_message: str, timeout: int = 25) -> str | None:
    """
    Send a chat message to Gemini → Pollinations fallback.
    Returns text or None on complete failure.
    """
    key = _get_key()
    if key:
        url = f"{GEMINI_BASE}/{GEMINI_MODEL}:generateContent?key={key}"
        body = {
            "systemInstruction": {"parts": [{"text": system_prompt}]},
            "contents": [{"role": "user", "parts": [{"text": user_message}]}],
            "generationConfig": {
                "temperature": 0.7,
                "maxOutputTokens": 4096,
            },
        }
        try:
            resp = requests.post(url, json=body, timeout=timeout)
            if resp.status_code == 200:
                text = resp.json()["candidates"][0]["content"]["parts"][0]["text"].strip()
                if text:
                    print(f"[Gemini] ✓ chat served ({len(text)} chars)")
                    return text
            else:
                err = resp.json().get("error", {}).get("message", "unknown")
                print(f"[Gemini] HTTP {resp.status_code}: {err[:100]}")
        except Exception as e:
            print(f"[Gemini] chat error: {e}")

    # Pollinations fallback
    return _pollinations_chat(system_prompt, user_message)


def gemini_json(system_prompt: str, user_prompt: str, timeout: int = 30) -> dict | None:
    """
    Call Gemini expecting a JSON response.
    Returns parsed dict or None on failure.
    """
    key = _get_key()
    if key:
        url = f"{GEMINI_BASE}/{GEMINI_MODEL}:generateContent?key={key}"
        body = {
            "systemInstruction": {"parts": [{"text": system_prompt}]},
            "contents": [{"role": "user", "parts": [{"text": user_prompt}]}],
            "generationConfig": {
                "temperature": 0.2,
                "maxOutputTokens": 8192,
                "responseMimeType": "application/json",
            },
        }
        try:
            resp = requests.post(url, json=body, timeout=timeout)
            if resp.status_code == 200:
                raw = resp.json()["candidates"][0]["content"]["parts"][0]["text"].strip()
                if raw.startswith("```"):
                    raw = re.sub(r"^```[a-z]*\n?", "", raw).rstrip("`").strip()
                result = json.loads(raw)
                print(f"[Gemini] ✓ JSON served")
                return result
            else:
                err = resp.json().get("error", {}).get("message", "unknown")
                print(f"[Gemini] JSON HTTP {resp.status_code}: {err[:100]}")
        except Exception as e:
            print(f"[Gemini] JSON error: {e}")

    # Try Pollinations for JSON too
    try:
        raw = _pollinations_chat(system_prompt + "\n\nIMPORTANT: respond with valid JSON only, no markdown.", user_prompt)
        if raw:
            cleaned = re.sub(r"^```[a-z]*\n?", "", raw.strip()).rstrip("`").strip()
            return json.loads(cleaned)
    except Exception:
        pass

    return None


def is_gemini_configured() -> bool:
    return _get_key() is not None
