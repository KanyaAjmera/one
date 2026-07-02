"""
groq_ai.py — Production AI engine for the Python backend.

Cascade: Groq (llama-3.3-70b) → local fallback
Free tier: 6,000 req/day at console.groq.com
"""

import os
import json
import re
import requests

GROQ_MODEL = "llama-3.3-70b-versatile"
GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"


def _groq_key() -> str | None:
    k = os.getenv("GROQ_API_KEY", "")
    return k if k and k != "your_groq_api_key_here" else None


def groq_chat(system_prompt: str, user_message: str, timeout: int = 20) -> str | None:
    """
    Call Groq for a chat response.
    Returns text string or None on failure.
    """
    key = _groq_key()
    if not key:
        return None
    try:
        resp = requests.post(
            GROQ_API_URL,
            headers={"Authorization": f"Bearer {key}", "Content-Type": "application/json"},
            json={
                "model": GROQ_MODEL,
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user",   "content": user_message},
                ],
                "temperature": 0.7,
                "max_tokens": 4096,
            },
            timeout=timeout,
        )
        if resp.status_code == 200:
            text = resp.json()["choices"][0]["message"]["content"].strip()
            if text:
                print(f"[Groq] ✓ served ({len(text)} chars)")
                return text
        else:
            print(f"[Groq] HTTP {resp.status_code}: {resp.text[:100]}")
    except Exception as e:
        print(f"[Groq] error: {e}")
    return None


def groq_json(system_prompt: str, user_prompt: str, timeout: int = 30) -> dict | None:
    """
    Call Groq expecting a JSON response.
    Returns parsed dict or None on failure.
    """
    key = _groq_key()
    if not key:
        return None
    try:
        resp = requests.post(
            GROQ_API_URL,
            headers={"Authorization": f"Bearer {key}", "Content-Type": "application/json"},
            json={
                "model": GROQ_MODEL,
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user",   "content": user_prompt},
                ],
                "temperature": 0.2,
                "max_tokens": 8000,
                "response_format": {"type": "json_object"},
            },
            timeout=timeout,
        )
        if resp.status_code == 200:
            raw = resp.json()["choices"][0]["message"]["content"].strip()
            # Strip markdown fences if present
            if raw.startswith("```"):
                raw = re.sub(r'^```[a-z]*\n?', '', raw).rstrip('`').strip()
            result = json.loads(raw)
            print(f"[Groq] ✓ JSON served")
            return result
        else:
            print(f"[Groq] JSON HTTP {resp.status_code}: {resp.text[:100]}")
    except Exception as e:
        print(f"[Groq] JSON error: {e}")
    return None


def is_groq_configured() -> bool:
    return _groq_key() is not None
