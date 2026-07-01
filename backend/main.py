import os
import json
import hashlib
import secrets
import datetime
from fastapi import FastAPI, HTTPException, Response, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import requests
import sys
from dotenv import load_dotenv

from config.mongodb import get_mongo_db, initialize_database
from local_ai import general_chat, laws_chat, generate_pdf_content, generate_ppt_content
from gemini_ai import gemini_chat, gemini_json, is_gemini_configured
from groq_ai import groq_chat, groq_json, is_groq_configured

# ── Load .env from parent directory ──────────────────────────────────────────
env_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".env"))
print(f"Loading .env from: {env_path}  exists={os.path.exists(env_path)}")

if os.path.exists(env_path):
    with open(env_path, "r", encoding="utf-8-sig") as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                key, value = line.split("=", 1)
                os.environ[key.strip()] = value.strip()

load_dotenv(dotenv_path=env_path, override=True)

# ── System prompts ────────────────────────────────────────────────────────────
SYSTEM_GENERAL = """You are Infinity AI — a knowledgeable, thorough assistant. Your answers must be:

**FORMAT RULES (always follow):**
- Use ## headers to organize sections
- Use **bold** for key terms and important facts
- Use bullet lists for enumerating items
- Use numbered lists for steps or sequences
- Use `code blocks` for any code, commands, or technical syntax

**CONTENT RULES:**
- Give COMPLETE, DETAILED answers — never cut short
- Always explain the WHY, not just the WHAT
- Include real-world examples wherever helpful
- For factual questions: include statistics, dates, key names
- For technical questions: include code examples, syntax, use cases
- For conceptual questions: explain from basics then go deeper
- End with a ## Key Takeaways section summarizing 3-5 bullet points

**NEVER:**
- Give one-liner answers to complex questions
- Skip context or background information
- Make up facts — say "I'm not certain" if unsure"""

SYSTEM_LAWS = """You are Infinity Laws AI — an Indian legal reference assistant.

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
- Always end with: "*This is educational information only — not legal advice. Consult a qualified advocate for your situation.*" """

# ── AI cascade: Gemini → Groq → Local ────────────────────────────────────────
def smart_chat(system_prompt: str, user_message: str, mode: str = "general") -> str:
    # 1. Try Gemini
    result = gemini_chat(system_prompt, user_message)
    if result:
        return result

    # 2. Try Groq
    result = groq_chat(system_prompt, user_message)
    if result:
        return result

    # 3. Local fallback
    print("[AI] All cloud AI unavailable — using local fallback")
    if mode == "law":
        return laws_chat(user_message)
    return general_chat(user_message)


def smart_json(system_prompt: str, user_prompt: str) -> Optional[dict]:
    result = gemini_json(system_prompt, user_prompt)
    if result:
        return result
    result = groq_json(system_prompt, user_prompt)
    if result:
        return result
    return None

# ── App setup ─────────────────────────────────────────────────────────────────
app = FastAPI(title="Infinity AI Backend", version="2.0.0")

cors_origins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://localhost:5174",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
    "https://infinity-frontend.vercel.app",
]
_frontend_url = os.getenv("FRONTEND_URL", "").strip()
if _frontend_url and _frontend_url not in cors_origins:
    cors_origins.insert(0, _frontend_url)

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    try:
        initialize_database()
    except Exception as e:
        print(f"DB init error: {e}")
    print(f"[OK] Gemini configured: {is_gemini_configured()}")
    print(f"[OK] Groq configured:   {is_groq_configured()}")


# ── Request models ────────────────────────────────────────────────────────────
class AskRequest(BaseModel):
    question: str

class ChatAskRequest(BaseModel):
    message: str
    mode: Optional[str] = "general"

class GeneratePdfRequest(BaseModel):
    topic: str

class GeneratePptRequest(BaseModel):
    topic: str

class LawsAskRequest(BaseModel):
    query: str

# Simple in-memory auth (for when Node backend is down)
_users: dict = {}  # email -> {id, name, email, password_hash}
_tokens: dict = {}  # token -> user_id

class SignupRequest(BaseModel):
    name: str
    email: str
    password: str

class LoginRequest(BaseModel):
    email: str
    password: str


# ── Health ────────────────────────────────────────────────────────────────────
@app.get("/health")
async def health():
    return {
        "status": "ok",
        "gemini": is_gemini_configured(),
        "groq": is_groq_configured(),
    }


# ── Chat endpoints (mirrors Node backend for fallback) ────────────────────────

@app.post("/api/chat/ask")
async def chat_ask(req: ChatAskRequest):
    """Main AI chat endpoint — Gemini → Groq → local cascade"""
    if not req.message or not req.message.strip():
        raise HTTPException(status_code=400, detail="Message is required")

    mode = req.mode or "general"
    system_prompt = SYSTEM_LAWS if mode == "law" else SYSTEM_GENERAL

    print(f"[Chat] mode={mode} gemini={is_gemini_configured()} | \"{req.message[:60]}\"")

    response = smart_chat(system_prompt, req.message, mode)
    return {"success": True, "response": response}


@app.get("/api/chat/laws")
async def get_laws():
    """Return categorized Indian laws from dataset"""
    dataset_paths = [
        os.path.join(os.path.dirname(__file__), "..", "node-backend", "data", "laws_dataset.json"),
        os.path.join(os.path.dirname(__file__), "data", "laws_dataset.json"),
    ]
    for path in dataset_paths:
        path = os.path.abspath(path)
        if os.path.exists(path):
            try:
                with open(path, "r", encoding="utf-8") as f:
                    laws_data = json.load(f)
                grouped: dict = {}
                for law in laws_data:
                    cat = law.get("category", "Other Offences")
                    if cat not in grouped:
                        grouped[cat] = []
                    grouped[cat].append(law)
                result = [{"category": cat, "laws": laws} for cat, laws in grouped.items()]
                return {"success": True, "data": result}
            except Exception as e:
                raise HTTPException(status_code=500, detail=f"Failed to load laws: {e}")
    raise HTTPException(status_code=404, detail="laws_dataset.json not found")


# ── Auth endpoints (fallback when Node backend is down) ───────────────────────

def _hash_password(password: str) -> str:
    import hashlib
    return hashlib.sha256(password.encode()).hexdigest()

def _make_token() -> str:
    return secrets.token_hex(32)

@app.post("/api/auth/signup")
async def auth_signup(req: SignupRequest):
    if req.email in _users:
        raise HTTPException(status_code=400, detail="User already exists")
    user_id = secrets.token_hex(8)
    _users[req.email] = {
        "id": user_id,
        "name": req.name,
        "email": req.email,
        "password_hash": _hash_password(req.password),
    }
    token = _make_token()
    _tokens[token] = req.email
    return {
        "success": True,
        "token": token,
        "user": {"id": user_id, "name": req.name, "email": req.email},
    }

@app.post("/api/auth/login")
async def auth_login(req: LoginRequest):
    user = _users.get(req.email)
    if not user or user["password_hash"] != _hash_password(req.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = _make_token()
    _tokens[token] = req.email
    return {
        "success": True,
        "token": token,
        "user": {"id": user["id"], "name": user["name"], "email": user["email"]},
    }

@app.get("/api/auth/profile")
async def auth_profile(authorization: Optional[str] = None):
    # Accept token from Authorization header
    raise HTTPException(status_code=501, detail="Use Node backend for full auth")

@app.get("/api/game/stats")
async def game_stats():
    # Stub — actual stats are in Node backend with MongoDB
    return {"success": True, "data": {"currentStreak": 0, "totalGamesPlayed": 0, "lastPlayedDate": ""}}


# ── Legacy /api/ask endpoint ──────────────────────────────────────────────────

@app.post("/api/ask")
async def ask_question(req: AskRequest):
    answer = smart_chat(SYSTEM_GENERAL, req.question, "general")
    return {"answer": answer}


# ── Laws AI (POST) ────────────────────────────────────────────────────────────

@app.post("/api/lawsask")
async def lawsask(req: LawsAskRequest):
    response = smart_chat(SYSTEM_LAWS, req.query, "law")
    return {"response": response}


# ── PDF / PPT generation ──────────────────────────────────────────────────────

_PDF_SYSTEM = '''Return ONLY a valid JSON object matching this structure (no markdown fences):
{
  "documentTitle": "string",
  "documentType": "Research Paper | Project Report | Whitepaper | Business Report | Technical Documentation",
  "theme": "Modern Blue | Forest Green | Dark Mode Minimalist | Warm Terracotta | Vibrant Sunset",
  "executiveSummary": "string",
  "tableOfContents": ["string"],
  "sections": [
    {
      "sectionTitle": "string",
      "subsections": [
        {
          "subsectionTitle": "string",
          "paragraphs": ["string"],
          "table": {"headers": ["string"], "rows": [["string"]]} ,
          "chart": {"type": "bar|line|pie", "data": [{"label": "string", "value": 0}]}
        }
      ]
    }
  ],
  "references": ["string"]
}'''

_PPT_SYSTEM = '''Return ONLY a valid JSON object matching this structure (no markdown fences):
{
  "presentationTitle": "string",
  "theme": "Modern Blue | Forest Green | Dark Mode Minimalist | Warm Terracotta | Vibrant Sunset",
  "slides": [
    {
      "slideNumber": 1,
      "type": "Title Slide | Content Slide | Two Column | Image Left | Comparison | Timeline | Chart Slide | Conclusion Slide",
      "title": "string",
      "subtitle": "string",
      "content": ["string"],
      "speakerNotes": "string",
      "imagePrompt": "string",
      "chartType": "bar | line | pie | doughnut | "
    }
  ]
}
Generate 10-12 slides.'''


@app.post("/api/generate_pdf")
async def generate_pdf_endpoint(req: GeneratePdfRequest):
    # Try AI-enhanced content first
    ai_result = smart_json(_PDF_SYSTEM, f"Generate a comprehensive PDF document about: {req.topic}")
    if ai_result:
        return ai_result
    # Fall back to local template
    return generate_pdf_content(req.topic)


@app.post("/api/generate_ppt")
async def generate_ppt_endpoint(req: GeneratePptRequest):
    ai_result = smart_json(_PPT_SYSTEM, f"Generate a comprehensive presentation about: {req.topic}")
    if ai_result:
        return ai_result
    return generate_ppt_content(req.topic)


# ── Avatar generation ─────────────────────────────────────────────────────────

def enhance_prompt_ai(description: str, style: str) -> dict:
    title = f"{style.capitalize()} {description} Avatar"
    global_reqs = "centered composition, head and shoulders framing, premium profile picture quality, sharp facial details, balanced lighting, clean background, high resolution, professional quality"

    if style == "anime":
        enhanced = f"A centered anime character profile picture of {description}, masterpiece anime artwork, modern anime aesthetic, detailed expressive eyes, vibrant colors, detailed hair, polished illustration, cinematic lighting, {global_reqs}"
        negative = "blurry, low quality, bad anatomy, distorted face, extra limbs, watermark, text, cropped face"
    elif style == "realistic":
        enhanced = f"A centered realistic portrait avatar of {description}, ultra realistic portrait, DSLR quality photography, cinematic lighting, realistic skin texture, natural color grading, shallow depth of field, {global_reqs}"
        negative = "blurry, low quality, distorted face, bad proportions, extra limbs, watermark, text"
    else:
        enhanced = f"A centered 3D render avatar of {description}, Pixar-quality rendering, AAA game character quality, realistic materials, global illumination, studio lighting, {global_reqs}"
        negative = "low poly, blurry, bad topology, poor textures, distorted face, extra limbs, watermark, text"

    return {"title": title, "style": style, "enhancedPrompt": enhanced, "negativePrompt": negative}


def generate_programmatic_svg(prompt: str, style: str) -> bytes:
    h = hashlib.md5(prompt.encode("utf-8")).hexdigest()
    val1 = int(h[0:4], 16)
    val2 = int(h[4:8], 16)
    val3 = int(h[8:12], 16)

    palettes = [
        {"primary": "#8B5CF6", "secondary": "#EC4899", "accent": "#FBBF24", "bgStart": "#2E1065", "bgEnd": "#0F052D"},
        {"primary": "#3B82F6", "secondary": "#1D4ED8", "accent": "#60A5FA", "bgStart": "#1E3A8A", "bgEnd": "#0F172A"},
        {"primary": "#06B6D4", "secondary": "#3B82F6", "accent": "#10B981", "bgStart": "#083344", "bgEnd": "#021520"},
        {"primary": "#10B981", "secondary": "#84CC16", "accent": "#F59E0B", "bgStart": "#064E3B", "bgEnd": "#022C22"},
        {"primary": "#F97316", "secondary": "#EF4444", "accent": "#FBBF24", "bgStart": "#431407", "bgEnd": "#0C0402"},
        {"primary": "#F59E0B", "secondary": "#D97706", "accent": "#FCD34D", "bgStart": "#3C2005", "bgEnd": "#0F0800"},
        {"primary": "#EC4899", "secondary": "#F43F5E", "accent": "#A855F7", "bgStart": "#500724", "bgEnd": "#1C000B"},
        {"primary": "#64748B", "secondary": "#1E293B", "accent": "#EF4444", "bgStart": "#0F172A", "bgEnd": "#020617"},
        {"primary": "#EF4444", "secondary": "#B91C1C", "accent": "#3B82F6", "bgStart": "#450A0A", "bgEnd": "#150202"},
        {"primary": "#6366F1", "secondary": "#A855F7", "accent": "#F43F5E", "bgStart": "#1E1B4B", "bgEnd": "#090514"},
    ]

    words = set(prompt.lower().split())
    is_dev = any(w in words for w in ["dev", "developer", "code", "coder", "tech", "engineer"])
    is_cyber = any(w in words for w in ["cyber", "space", "robot", "futuristic", "sci"])
    is_nature = any(w in words for w in ["nature", "forest", "elf", "green", "tree"])
    is_magic = any(w in words for w in ["wizard", "magic", "witch", "star", "sorcerer"])
    is_warrior = any(w in words for w in ["ninja", "warrior", "samurai", "shadow", "sword"])

    if is_dev:
        pidx = val1 % 3  # cyan/blue tones
    elif is_cyber:
        pidx = (val1 % 4) + 1
    elif is_nature:
        pidx = 3
    elif is_magic:
        pidx = (val1 % 2)  # purple/indigo
    elif is_warrior:
        pidx = 7
    else:
        pidx = val1 % len(palettes)

    p = palettes[pidx]
    pr, sec, acc = p["primary"], p["secondary"], p["accent"]
    bg_s, bg_e = p["bgStart"], p["bgEnd"]

    decorations_list = ["tech_grid", "stars", "geometric", "digital_rain", "target"]
    dec = decorations_list[val2 % len(decorations_list)]

    if dec == "tech_grid":
        decor = f'<g opacity="0.08"><path d="M 0,100 L 1024,100 M 0,200 L 1024,200 M 0,300 L 1024,300 M 0,600 L 1024,600 M 0,800 L 1024,800" stroke="#FFF" stroke-width="2"/><path d="M 100,0 L 100,1024 M 300,0 L 300,1024 M 700,0 L 700,1024 M 900,0 L 900,1024" stroke="#FFF" stroke-width="2"/></g>'
    elif dec == "stars":
        decor = f'<circle cx="200" cy="180" r="4" fill="{acc}" opacity="0.7"/><circle cx="800" cy="150" r="6" fill="{acc}" opacity="0.5"/><circle cx="150" cy="700" r="3" fill="#FFF" opacity="0.4"/><circle cx="880" cy="780" r="5" fill="#FFF" opacity="0.3"/>'
    elif dec == "geometric":
        decor = f'<circle cx="512" cy="512" r="440" stroke="#FFF" stroke-width="1.5" fill="none" opacity="0.1"/><circle cx="512" cy="512" r="380" stroke="{pr}" stroke-width="4" stroke-dasharray="20,10" fill="none" opacity="0.2"/>'
    elif dec == "digital_rain":
        decor = f'<g fill="{acc}" opacity="0.2" font-family="monospace" font-size="18"><text x="100" y="150">0</text><text x="100" y="178">1</text><text x="800" y="120">1</text><text x="800" y="148">0</text><text x="900" y="300">1</text></g>'
    else:
        decor = f'<path d="M80,80 L120,80 M80,80 L80,120" stroke="#FFF" stroke-width="3" fill="none" opacity="0.3"/><path d="M944,80 L904,80 M944,80 L944,120" stroke="#FFF" stroke-width="3" fill="none" opacity="0.3"/>'

    syms = ["code", "gear", "shield", "crown", "star", "globe", "heart", "flame"]
    sym = syms[val3 % len(syms)]

    body_base = f'<path d="M280,820 C280,680 370,640 512,640 C654,640 744,680 744,820 Z" fill="url(#primaryGrad)"/><circle cx="512" cy="450" r="130" fill="url(#secondaryGrad)"/>'

    if sym == "code":
        subject = f'{body_base}<text x="290" y="540" font-family="monospace" font-size="120" font-weight="bold" fill="{acc}" opacity="0.2">&lt;</text><text x="720" y="540" font-family="monospace" font-size="120" font-weight="bold" fill="{acc}" opacity="0.2">&gt;</text>'
    elif sym == "gear":
        subject = f'{body_base}<g transform="translate(512,450)" fill="{acc}"><circle cx="0" cy="0" r="50"/><circle cx="0" cy="0" r="20" fill="url(#secondaryGrad)"/><rect x="-12" y="-60" width="24" height="120" rx="4"/><rect x="-60" y="-12" width="120" height="24" rx="4"/></g>'
    elif sym == "shield":
        subject = f'{body_base}<path d="M452,380 L572,380 L572,430 Q572,490 512,510 Q452,490 452,430 Z" fill="{acc}" opacity="0.9"/>'
    elif sym == "crown":
        subject = f'{body_base}<polygon points="412,380 442,430 512,370 582,430 612,380 592,450 432,450" fill="{acc}"/><circle cx="512" cy="370" r="6" fill="#FFF"/>'
    elif sym == "globe":
        subject = f'{body_base}<circle cx="512" cy="450" r="65" stroke="{acc}" stroke-width="3" fill="none" opacity="0.9"/><ellipse cx="512" cy="450" rx="65" ry="22" stroke="{acc}" stroke-width="2" fill="none" opacity="0.9"/><ellipse cx="512" cy="450" rx="22" ry="65" stroke="{acc}" stroke-width="2" fill="none" opacity="0.9"/>'
    elif sym == "heart":
        subject = f'{body_base}<path d="M512,490 C512,490 442,440 442,390 C442,350 472,330 512,370 C552,330 582,350 582,390 C582,440 512,490 512,490 Z" fill="{acc}"/>'
    elif sym == "flame":
        subject = f'{body_base}<path d="M512,360 C552,400 552,440 512,510 C472,440 472,400 512,360 Z" fill="{acc}"/><path d="M512,390 C537,420 537,445 512,490 C487,445 487,420 512,390 Z" fill="#F59E0B"/>'
    else:
        subject = f'{body_base}<polygon points="512,300 532,360 592,360 545,395 562,455 512,420 462,455 479,395 432,360 492,360" fill="{acc}" opacity="0.8"/>'

    svg = f"""<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="bgGrad" cx="50%" cy="50%" r="70%">
      <stop offset="0%" stop-color="{bg_s}"/>
      <stop offset="100%" stop-color="{bg_e}"/>
    </radialGradient>
    <linearGradient id="primaryGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="{pr}"/>
      <stop offset="100%" stop-color="{sec}"/>
    </linearGradient>
    <linearGradient id="secondaryGrad" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="{sec}" stop-opacity="0.8"/>
      <stop offset="100%" stop-color="{acc}" stop-opacity="0.9"/>
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="15" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
  </defs>
  <rect width="1024" height="1024" fill="url(#bgGrad)"/>
  {decor}
  {subject}
  <rect x="20" y="20" width="984" height="984" rx="20" stroke="{pr}" stroke-width="4" stroke-opacity="0.2" fill="none"/>
</svg>"""
    return svg.encode("utf-8")


@app.get("/api/generate_avatar")
async def generate_avatar(prompt: str, style: str = "realistic"):
    try:
        enhanced = enhance_prompt_ai(prompt, style)
        svg_bytes = generate_programmatic_svg(enhanced["enhancedPrompt"], style)
        return Response(content=svg_bytes, media_type="image/svg+xml")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
