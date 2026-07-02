# Avatar System - Quick Start Checklist

## ✅ Pre-Launch Checklist

### Step 1: Install Dependencies

```bash
# Backend
cd backend
pip install -r requirements.txt

# Frontend
npm install
```

### Step 2: Configure API Keys

Edit `.env` file:

```env
# Choose at least ONE of these services:

# Option A: OpenAI DALL-E 3 (RECOMMENDED - Best Quality)
OPENAI_API_KEY=sk-proj-your-key-here

# Option B: Hugging Face (Good Alternative)
HUGGINGFACE_API_KEY=hf_your-token-here

# Option C: Gemini (Built-in, Fallback SVG)
# Already configured - no additional setup needed
```

### Step 3: Verify Environment

```bash
# Test Python environment
python -c "from openai import OpenAI; print('OpenAI OK')"
python -c "import fastapi; print('FastAPI OK')"

# Test Node environment
node -v  # Should be 16+
npm -v   # Should be 8+
```

### Step 4: Start Services

**Terminal 1 - Python Backend:**

```bash
cd backend
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Expected output:

```
INFO:     Started server process
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Application startup complete
```

**Terminal 2 - Frontend Dev Server:**

```bash
npm run dev
```

Expected output:

```
VITE v7.2.4  ready in 500 ms
➜  Local:   http://localhost:5173/
```

### Step 5: Test the System

1. Navigate to `http://localhost:5173/avatar-creator`
2. Enter prompt: "Apple"
3. Select style: "Anime"
4. Click "Generate Avatar"
5. Wait 20-30 seconds (first generation is slower)
6. Verify avatar displays and enhanced prompt shows
7. Click "Download Avatar"

---

## 🚀 Production Deployment

### Backend - Vercel/Railway

```bash
# Environment variables needed:
VITE_PYTHON_API_URL=https://your-backend.com
OPENAI_API_KEY=sk-proj-...
HUGGINGFACE_API_KEY=hf_...
MONGODB_URI=mongodb+srv://...
```

### Frontend - Vercel

```bash
npm run build
vercel deploy
```

### Environment Variables - Production

```env
# Backend
NODE_ENV=production
BACKEND_PORT=8000

# APIs
OPENAI_API_KEY=sk-proj-...
HUGGINGFACE_API_KEY=hf_...

# Database
MONGODB_URI=mongodb+srv://...

# CORS
FRONTEND_URL=https://your-frontend.vercel.app
```

---

## 🔧 Quick Troubleshooting

### Problem: "ModuleNotFoundError: No module named 'openai'"

**Solution:**

```bash
cd backend
pip install openai pillow
```

### Problem: "TypeError: OpenAI() missing 1 required positional argument"

**Solution:**
Ensure `.env` has `OPENAI_API_KEY` set. Check:

```bash
python -c "import os; from dotenv import load_dotenv; load_dotenv(); print('Key:', os.getenv('OPENAI_API_KEY')[:10])"
```

### Problem: "CORS error - origin not allowed"

**Solution:**
Verify `.env` has correct URLs:

```env
VITE_PYTHON_API_URL=http://127.0.0.1:8000
VITE_NODE_API_URL=http://127.0.0.1:5000
```

### Problem: "Avatar generation takes >60 seconds"

**Solution:**

1. First request loads model (20-30s) - this is normal
2. Add `HUGGINGFACE_API_KEY` to enable faster fallback
3. Check internet connection for API calls

### Problem: "Generated avatar is blank/SVG instead of PNG"

**Solution:**

1. Add valid `OPENAI_API_KEY` or `HUGGINGFACE_API_KEY`
2. Without image APIs, system falls back to SVG (still valid)
3. SVG avatars are scalable and downloadable

---

## 📊 Monitoring

### Check Backend Health

```bash
curl http://127.0.0.1:8000/health
```

Expected response:

```json
{
  "status": "ok",
  "api_key_loaded": true
}
```

### Check Prompt Enhancement

```bash
curl "http://127.0.0.1:8000/api/enhance_avatar_prompt?prompt=Apple&style=anime"
```

Expected response:

```json
{
  "title": "Anime Apple Avatar",
  "style": "anime",
  "enhancedPrompt": "...",
  "negativePrompt": "..."
}
```

### Check Image Generation

```bash
curl "http://127.0.0.1:8000/api/generate_avatar?prompt=Apple&style=anime" > avatar.png
```

### Monitor Backend Logs

```bash
# Watch for errors
tail -f backend.log | grep ERROR
```

---

## 🎨 Testing Different Prompts

### Test Suite

| Prompt               | Style     | Expected Output             |
| -------------------- | --------- | --------------------------- |
| "Apple"              | Anime     | Vibrant red apple character |
| "Software Developer" | Realistic | Professional programmer     |
| "Cyber Warrior"      | 3D        | Futuristic game character   |
| "Teacher"            | Anime     | Educational, approachable   |
| "CEO"                | Realistic | Business professional       |
| "Fantasy Elf"        | 3D        | Medieval fantasy character  |

### Performance Metrics

- **First generation**: 20-30 seconds (DALL-E) or 10-15s (other)
- **Subsequent generations**: 15-20 seconds
- **Fallback (SVG)**: 10-15 seconds
- **API response time**: <1 second for enhancement

---

## 🔑 API Key Management

### Getting Keys

**OpenAI:**

1. Visit https://platform.openai.com/api-keys
2. Create new secret key
3. Copy to `.env` as `OPENAI_API_KEY`
4. Ensure account has $5+ credit

**Hugging Face:**

1. Visit https://huggingface.co/settings/tokens
2. Create new token (read access)
3. Copy to `.env` as `HUGGINGFACE_API_KEY`

**Gemini:**

1. Already configured
2. Using existing `VITE_GEMINI_API_KEY`
3. Free tier (limited requests)

### Rotating Keys

1. Generate new key on service platform
2. Update `.env`
3. Restart backend service
4. Old key can be revoked immediately

---

## 📦 Dependency Summary

### Backend (`backend/requirements.txt`)

```
fastapi              - Web framework
uvicorn              - ASGI server
openai               - DALL-E API client
google-generativeai  - Gemini API
requests             - HTTP client
pillow               - Image processing
pymongo              - Database
dotenv               - Environment config
```

### Frontend (`package.json`)

```
react                - UI framework
framer-motion        - Animations
lucide-react         - Icons
tailwindcss          - Styling
vite                 - Build tool
```

---

## 🚨 Common Issues & Solutions

| Issue         | Cause           | Solution                             |
| ------------- | --------------- | ------------------------------------ |
| Timeout       | Slow API        | Add HUGGINGFACE_API_KEY for fallback |
| Blank image   | Missing API key | Add OPENAI_API_KEY to .env           |
| CORS error    | Wrong URL       | Check VITE_PYTHON_API_URL            |
| Port conflict | Already in use  | `lsof -i :8000` and kill process     |
| Module error  | Missing deps    | `pip install -r requirements.txt`    |
| SVG output    | API failure     | Check logs, verify API keys          |

---

## 💡 Tips & Best Practices

### For Best Results

1. **Be specific**: "Software developer working on AI" > "Coder"
2. **Include context**: "CEO in modern office" > "CEO"
3. **Describe appearance**: "Young person with blue hair" > "Young person"
4. **Test each style**: Same prompt may work better in different styles

### API Usage Optimization

1. Use DALL-E for showcase avatars
2. Use Hugging Face for quick tests
3. Cache successful generations
4. Batch process during off-peak hours

### Production Best Practices

1. Monitor API usage and costs
2. Set rate limits for users
3. Cache popular avatars
4. Use CDN for avatar delivery
5. Implement usage analytics

---

## 📞 Support

### Debug Mode

Enable verbose logging:

```python
# In backend/main.py
import logging
logging.basicConfig(level=logging.DEBUG)
```

### Check Logs

```bash
# Backend logs
grep "AVATAR\|ERROR" uvicorn.log

# Frontend logs
# Check browser console (F12)
```

### Verify Setup

```bash
# Test all components
python -c "from openai import OpenAI; from fastapi import FastAPI; print('✓ Backend OK')"
npm list react framer-motion lucide-react | grep -q "" && echo "✓ Frontend OK"
```

---

## Next Steps

1. ✅ Install dependencies
2. ✅ Set API keys in `.env`
3. ✅ Start backend & frontend
4. ✅ Test avatar generation
5. ✅ Download and verify output
6. ✅ Deploy to production

**You're ready to launch the Avatar System!** 🚀
