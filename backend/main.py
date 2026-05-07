import os
import json
from fastapi import FastAPI, HTTPException, Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import google.generativeai as genai
import requests
import io
import sys
from rapidfuzz import fuzz
from dotenv import load_dotenv
from config.mongodb import get_mongo_db, initialize_database

# Load .env from parent directory with absolute path
env_path = os.path.join(os.path.dirname(__file__), "..", ".env")
env_path = os.path.abspath(env_path)
print(f"Loading .env from: {env_path}")
print(f"File exists: {os.path.exists(env_path)}")

# Manual parsing of .env file
if os.path.exists(env_path):
    with open(env_path, 'r', encoding='utf-8-sig') as f:  # utf-8-sig removes BOM
        for line in f:
            line = line.strip()
            if line and not line.startswith('#') and '=' in line:
                key, value = line.split('=', 1)
                os.environ[key.strip()] = value.strip()
                print(f"Loaded {key.strip()}")
else:
    print("WARNING: .env file not found!")

load_dotenv(dotenv_path=env_path, override=True)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    try:
        initialize_database()
    except Exception as e:
        print(f"Error initializing database: {e}")

api_key = os.getenv("VITE_GEMINI_API_KEY")
print(f"API Key loaded: {api_key[:20] if api_key else 'NOT FOUND'}...")
if api_key:
    genai.configure(api_key=api_key)
    print(f"[OK] Gemini API configured successfully")
else:
    print("[WARN] Gemini API key not loaded - check .env file")

class AskRequest(BaseModel):
    question: str

class GeneratePdfRequest(BaseModel):
    topic: str

class GeneratePptRequest(BaseModel):
    topic: str

class LawsAskRequest(BaseModel):
    query: str

@app.get("/health")
async def health():
    return {"status": "ok", "api_key_loaded": bool(api_key)}

@app.post("/api/ask")
async def ask_question(req: AskRequest):
    if not api_key:
        raise HTTPException(status_code=500, detail="Gemini API key not configured")
    try:
        model = genai.GenerativeModel('gemini-2.0-flash')
        response = model.generate_content(req.question)
        return {"answer": response.text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/generate_pdf")
async def generate_pdf_content(req: GeneratePdfRequest):
    if not api_key:
        raise HTTPException(status_code=500, detail="Gemini API key not configured")
    prompt = f"Write a detailed, structured, and comprehensive article about '{req.topic}'. Include an introduction, several main sections, and a conclusion. Format the response beautifully so it can be printed into a PDF."
    try:
        model = genai.GenerativeModel('gemini-2.0-flash')
        response = model.generate_content(prompt)
        return {"content": response.text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/generate_ppt")
async def generate_ppt_content(req: GeneratePptRequest):
    if not api_key:
        raise HTTPException(status_code=500, detail="Gemini API key not configured")
    
    prompt = f"""
Create an outline for a presentation about '{req.topic}'.
Output ONLY valid JSON containing an array of slides. Each slide object should have a "title" string and "bullets" array of strings. Do not include markdown codeblocks around the JSON.
Example format:
[
  {{"title": "Introduction", "bullets": ["Point 1", "Point 2"]}},
  {{"title": "Details", "bullets": ["A detail", "Another detail"]}}
]
"""
    try:
        model = genai.GenerativeModel('gemini-2.0-flash')
        response = model.generate_content(prompt)
        
        text = response.text.strip()
        if text.startswith("```json"):
            text = text[7:]
        if text.startswith("```"):
            text = text[3:]
        if text.endswith("```"):
            text = text[:-3]
        text = text.strip()
        
        slides = json.loads(text)
        return {"slides": slides}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def enhance_input(text: str) -> str:
    return f"{text}, professional avatar, centered face"

def build_avatar_prompt(user_input: str, style: str) -> str:
    enhanced_input = enhance_input(user_input)
    base = f"A centered profile avatar of {enhanced_input}, symmetrical face, clean background, sharp focus"

    if style == "anime":
        base += ", anime style, vibrant colors, studio lighting"
    elif style == "realistic":
        base += ", ultra realistic, DSLR, 85mm lens, natural skin tones"
    elif style == "3d":
        base += ", 3D render, octane render, soft lighting"

    return base

def generate_avatar_image(prompt: str) -> bytes:
    API_URL = "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-3.5-large"
    hf_token = os.getenv("HUGGINGFACE_API_KEY")
    if not hf_token:
        raise Exception("Hugging Face API key not configured")
    
    API_URL_SD2 = "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-2"
    HEADERS = {"Authorization": f"Bearer {hf_token}"}
    negative = "blurry, low quality, distorted face, bad anatomy"
    
    payload = {
        "inputs": prompt,
        "parameters": {
            "negative_prompt": negative
        }
    }
    response = requests.post(API_URL_SD2, headers=HEADERS, json=payload)
    if response.status_code != 200:
        raise Exception(f"API Error: {response.text}")
    
    return response.content

@app.get("/api/generate_avatar")
async def generate_avatar(prompt: str, style: str = "realistic"):
    try:
        final_prompt = build_avatar_prompt(prompt, style)
        image_bytes = generate_avatar_image(final_prompt)
        return Response(content=image_bytes, media_type="image/png")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/lawsask")
async def lawsask(req: LawsAskRequest):
    query = req.query.lower()
    
    legal_keywords = [
        "law", "crime", "ipc", "fraud", "murder", "rape", "theft", "hack", "cyber", "drugs", "police", "illegal", "punishment", "section", "act", "court"
    ]
    
    if not any(k in query for k in legal_keywords):
        return {"response": "This chatbot only answers Indian law and crime related queries."}
        
    db = get_mongo_db()
    laws = list(db["laws"].find({}, {"_id": 0}))
    
    if not laws:
        return {"response": "No laws available in database."}

    matches = []
    
    for law in laws:
        search_str = f"{law.get('title', '')} {law.get('description', '')} {law.get('law', '')} {' '.join(law.get('keywords', []))}"
        score = fuzz.token_set_ratio(query, search_str)
        if score > 30:
            matches.append({"law": law, "score": score})
            
    if matches:
        matches = sorted(matches, key=lambda x: x["score"], reverse=True)
        top_matches = matches[:5]
        
        response_text = ""
        for i, match in enumerate(top_matches):
            law = match["law"]
            punishment_type = ", ".join(law.get("punishment", {}).get("type", []))
            duration = law.get("punishment", {}).get("duration", "")
            punishment_str = f"{punishment_type}"
            if duration:
                punishment_str += f"\n{duration}"
                
            response_text += f"[LAW]: {law.get('law', '')}\n[SECTION]: {law.get('section', '')}\n\n[DESCRIPTION]:\n{law.get('description', '')}\n\n[PUNISHMENT]:\n{punishment_str}"
            if i < len(top_matches) - 1:
                response_text += "\n\n" + "-"*40 + "\n\n"
                
        response_text += "\n\n[NOTE]:\nThis is not legal advice."
        return {"response": response_text}
    else:
        return {"response": "Could not find an exact law match for your query, but this is a legal topic. Please try with more specific terms."}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
