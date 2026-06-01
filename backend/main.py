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

# Configure CORS based on environment
import os as os_module
is_production = os_module.getenv("ENVIRONMENT", "development") == "production"

cors_origins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
]

if is_production:
    cors_origins.extend([
        "https://infinity-frontend.vercel.app",
        "https://your-vercel-domain.vercel.app",
    ])

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
        return {"answer": f"Offline Mode: Gemini API Key is missing.\n\nYou asked: '{req.question}'\n\nPlease add VITE_GEMINI_API_KEY to your .env file to enable the AI!"}
    try:
        model = genai.GenerativeModel('gemini-2.5-flash')
        response = model.generate_content(req.question)
        return {"answer": response.text}
    except Exception as e:
        return {"answer": f"Offline Mode: Failed to connect to Gemini.\n\nYou asked: '{req.question}'\n\nError details: {str(e)}"}

@app.post("/api/generate_pdf")
async def generate_pdf_content(req: GeneratePdfRequest):
    system_prompt = """You are an expert Presentation Architect, Report Writer, Research Analyst, Business Consultant, and Technical Documentation Specialist.

Your job is to convert natural language prompts into complete professional presentations and documents.

Automatically determine:
- Structure
- Sections
- Flow
- Visual hierarchy
- Content organization

Generate professional, concise, high-quality content.
Use logical progression.
Avoid unnecessary filler.
Generate presentation-ready and publication-ready output."""

    format_instruction = """
Return ONLY a valid JSON object matching the following structure:
{
  "documentTitle": "Title of the Document",
  "documentType": "One of: Research Paper, Project Report, Assignment, Whitepaper, Business Report, Study Notes, Technical Documentation",
  "theme": "Modern Blue, Forest Green, Dark Mode Minimalist, Warm Terracotta, or Vibrant Sunset",
  "executiveSummary": "A concise executive summary paragraph.",
  "tableOfContents": [
     "Section Title 1",
     "Section Title 2"
  ],
  "sections": [
    {
      "sectionTitle": "Section Title",
      "subsections": [
        {
          "subsectionTitle": "Subsection Title",
          "paragraphs": [
            "Detailed paragraph content block...",
            "Another detailed paragraph..."
          ],
          "table": {
            "headers": ["Header A", "Header B"],
            "rows": [
              ["Value A1", "Value B1"],
              ["Value A2", "Value B2"]
            ]
          },
          "chart": {
            "type": "bar",
            "data": [
              {"label": "Label A", "value": 30},
              {"label": "Label B", "value": 70}
            ]
          }
        }
      ]
    }
  ],
  "references": [
    "Reference item 1",
    "Reference item 2"
  ]
}
Note: Leave the "table" or "chart" object null or empty if not appropriate for the subsection content. Do not include markdown codeblocks around the JSON.
"""

    prompt = f"Create a structured publication-ready document about: '{req.topic}' matching the document types requested.\n\n{format_instruction}"

    openai_key = os.getenv("OPENAI_API_KEY")
    response_text = ""
    
    if openai_key:
        print("[AI] Using OpenAI to generate document content...")
        try:
            headers = {
                "Authorization": f"Bearer {openai_key}",
                "Content-Type": "application/json"
            }
            payload = {
                "model": "gpt-4o",
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": prompt}
                ],
                "response_format": {"type": "json_object"}
            }
            res = requests.post("https://api.openai.com/v1/chat/completions", headers=headers, json=payload)
            if res.status_code == 200:
                response_text = res.json()["choices"][0]["message"]["content"]
            else:
                print(f"[WARN] OpenAI returned error: {res.text}. Falling back to Gemini...")
        except Exception as e:
            print(f"[WARN] OpenAI error: {e}. Falling back to Gemini...")
            
    if not response_text:
        print("[AI] Using Gemini to generate document content...")
        if not api_key:
            raise HTTPException(status_code=500, detail="Gemini API key not configured and no OpenAI API key found")
        try:
            model = genai.GenerativeModel('gemini-2.5-flash', system_instruction=system_prompt)
            response = model.generate_content(prompt)
            response_text = response.text.strip()
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Gemini API failure: {str(e)}")

    try:
        # Clean response text in case it wrapped JSON
        if response_text.startswith("```json"):
            response_text = response_text[7:]
        if response_text.startswith("```"):
            response_text = response_text[3:]
        if response_text.endswith("```"):
            response_text = response_text[:-3]
        response_text = response_text.strip()
        
        parsed = json.loads(response_text)
        return parsed
    except Exception as e:
        print(f"[ERROR] Failed to parse generated JSON: {e}\nRaw content:\n{response_text}")
        raise HTTPException(status_code=500, detail=f"Invalid JSON returned by AI model: {str(e)}")

@app.post("/api/generate_ppt")
async def generate_ppt_content(req: GeneratePptRequest):
    system_prompt = """You are a professional presentation architect similar to Gamma.

Your task is to transform a user prompt into a complete presentation.

Generate presentation-ready content.

Requirements:
- Clear slide hierarchy
- Professional structure
- Concise bullet points
- Maximum 5 bullets per slide
- Maximum 15 words per bullet
- Logical flow
- Include charts when appropriate
- Include image recommendations
- Include speaker notes

Return valid JSON only."""

    format_instruction = """
Return ONLY a valid JSON object matching the following structure:
{
  "presentationTitle": "Title of the presentation",
  "theme": "Modern Blue, Forest Green, Dark Mode Minimalist, Warm Terracotta, or Vibrant Sunset",
  "slides": [
    {
      "slideNumber": 1,
      "type": "One of: 'Title Slide', 'Content Slide', 'Two Column', 'Image Left', 'Image Right', 'Comparison', 'Timeline', 'Chart Slide', 'Conclusion Slide'",
      "title": "Slide Title",
      "subtitle": "Optional slide subtitle or category",
      "content": ["Up to 5 concise bullet points"],
      "speakerNotes": "Speaker notes for this slide",
      "imagePrompt": "Detailed visual/image description for this slide",
      "chartType": "One of: 'bar', 'line', 'pie', 'doughnut', or empty string"
    }
  ]
}
Do not include any other markdown text, formatting, or wraps like ```json.
"""

    prompt = f"Create a structured presentation about: '{req.topic}' using the layout styles requested.\n\n{format_instruction}"

    openai_key = os.getenv("OPENAI_API_KEY")
    response_text = ""
    
    if openai_key:
        print("[AI] Using OpenAI to generate presentation content...")
        try:
            headers = {
                "Authorization": f"Bearer {openai_key}",
                "Content-Type": "application/json"
            }
            payload = {
                "model": "gpt-4o",
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": prompt}
                ],
                "response_format": {"type": "json_object"}
            }
            res = requests.post("https://api.openai.com/v1/chat/completions", headers=headers, json=payload)
            if res.status_code == 200:
                response_text = res.json()["choices"][0]["message"]["content"]
            else:
                print(f"[WARN] OpenAI returned error: {res.text}. Falling back to Gemini...")
        except Exception as e:
            print(f"[WARN] OpenAI error: {e}. Falling back to Gemini...")
            
    if not response_text:
        print("[AI] Using Gemini to generate presentation content...")
        if not api_key:
            raise HTTPException(status_code=500, detail="Gemini API key not configured and no OpenAI API key found")
        try:
            model = genai.GenerativeModel('gemini-2.5-flash', system_instruction=system_prompt)
            response = model.generate_content(prompt)
            response_text = response.text.strip()
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Gemini API failure: {str(e)}")

    try:
        # Clean response text in case it wrapped JSON
        if response_text.startswith("```json"):
            response_text = response_text[7:]
        if response_text.startswith("```"):
            response_text = response_text[3:]
        if response_text.endswith("```"):
            response_text = response_text[:-3]
        response_text = response_text.strip()
        
        parsed = json.loads(response_text)
        return parsed
    except Exception as e:
        print(f"[ERROR] Failed to parse generated JSON: {e}\nRaw content:\n{response_text}")
        raise HTTPException(status_code=500, detail=f"Invalid JSON returned by AI model: {str(e)}")

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
    
    db = get_mongo_db()
    laws = list(db["laws"].find({}, {"_id": 0}))
    
    context_text = ""
    if laws:
        matches = []
        for law in laws:
            search_str = f"{law.get('title', '')} {law.get('description', '')} {law.get('law', '')} {' '.join(law.get('keywords', []))}"
            # Use both token_set_ratio and partial_ratio for better matching
            score1 = fuzz.token_set_ratio(query, search_str)
            score2 = fuzz.partial_ratio(query, search_str)
            score = max(score1, score2)
            
            if score > 25:
                matches.append({"law": law, "score": score})
                
        if matches:
            matches = sorted(matches, key=lambda x: x["score"], reverse=True)
            top_matches = matches[:8] # Top 8 most relevant matches
            
            for match in top_matches:
                law = match["law"]
                punishment = law.get("punishment", {})
                
                # Handle varying punishment formats safely
                p_type = punishment.get("type", [])
                if isinstance(p_type, list):
                    punishment_type = ", ".join(p_type)
                else:
                    punishment_type = str(p_type)
                    
                duration = punishment.get("duration", "")
                punishment_str = f"{punishment_type} {duration}".strip()
                    
                context_text += f"- Law/Section: {law.get('law', '')} {law.get('section', '')}\n  Description: {law.get('description', '')}\n  Punishment: {punishment_str}\n\n"

    if not api_key:
        return {"response": "AI is currently offline (Gemini API key is missing). Please configure your API key to get smart legal answers."}
        
    try:
        model = genai.GenerativeModel('gemini-2.5-flash')
        
        prompt = f"""You are 'LawsAsk', an AI Indian legal assistant.

User's Query: "{req.query}"

Here is the most relevant data retrieved from the Indian law database based on the user's query:
{context_text if context_text else "(No exact database matches found. Please rely on your general knowledge of Indian Law to answer.)"}

Instructions:
1. Answer the user's query clearly, professionally, and in an easy-to-understand way.
2. Focus on using the provided database information if it is relevant. Cite the specific Law/Section.
3. If the user's query is not related to law, crimes, or justice, politely decline to answer.
4. Format your response cleanly (use bullet points or bold text where it helps readability).
5. Always end your response with a short disclaimer indicating you are an AI and providing this information for educational purposes, not as formal legal advice.
"""
        response = model.generate_content(prompt)
        return {"response": response.text}
    except Exception as e:
        # Fallback to plain text if API fails
        if context_text:
             return {"response": f"[AI Error: {str(e)}]\n\nHere are the raw database results instead:\n{context_text}"}
        return {"response": f"Error connecting to AI and no laws matched: {str(e)}"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
