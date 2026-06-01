import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))
api_key = os.getenv("VITE_GEMINI_API_KEY")

if not api_key:
    print("No API key found")
else:
    genai.configure(api_key=api_key)
    print("Available models:")
    for m in genai.list_models():
        if "generateContent" in m.supported_generation_methods:
            print(m.name)
