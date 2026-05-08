# Infinity Project - Production Deployment Guide

## Overview
This guide covers deploying the Infinity application to production using:
- **Frontend**: Vercel (React + Vite)
- **Node.js Backend**: Render
- **Python Backend**: Render
- **Database**: MongoDB Atlas

---

## STEP 1: Prepare Backend URLs

### Node.js Backend (Render)
1. Deploy to Render if not already done
2. Get your Node.js backend URL: `https://your-node-backend.onrender.com`
3. Example: `https://infinity-node-api.onrender.com`

### Python Backend (Render)  
1. Deploy to Render if not already done
2. Get your Python backend URL: `https://your-python-backend.onrender.com`
3. Example: `https://infinity-python-api.onrender.com`

### Frontend (Vercel)
1. Your Vercel domain will be: `https://infinity-frontend.vercel.app`
2. Or custom domain if configured

---

## STEP 2: Update Environment Variables in Vercel

### In Vercel Dashboard:

1. Go to **Settings → Environment Variables**

2. Add these production environment variables:

```
VITE_NODE_API_URL = https://your-node-backend.onrender.com
VITE_PYTHON_API_URL = https://your-python-backend.onrender.com
```

3. **Deployment Settings**:
   - Framework: Vite (React)
   - Build Command: `npm --prefix frontend run build` or `cd frontend && npm run build`
   - Output Directory: `frontend/dist`
   - Root Directory: `.` (or leave blank)

---

## STEP 3: Verify Configuration Files

### ✅ Routing (vercel.json)
- **Location**: `frontend/vercel.json` and root `vercel.json`
- **Purpose**: Fixes React Router refresh and direct route access
- **Status**: ✅ Already created

### ✅ Vite Configuration (vite.config.ts)
- **Location**: `frontend/vite.config.ts`
- **Changes**: Removed dev-only proxy
- **Status**: ✅ Already updated

### ✅ Environment Variables (.env.production)
- **Location**: `.env.production` in project root
- **Contents**:
```
VITE_NODE_API_URL=https://infinity-node-backend.onrender.com
VITE_PYTHON_API_URL=https://infinity-python-backend.onrender.com
```
- **Status**: ✅ Already configured

---

## STEP 4: Verify Frontend API Calls

All frontend API calls have been updated to use environment variables:

### Updated Files:
- ✅ `frontend/src/utils/api.ts` - Uses `NODE_API_URL`
- ✅ `frontend/src/pages/SearchPage.tsx` - Uses `NODE_API_URL`
- ✅ `frontend/src/pages/AskPage.tsx` - Uses `NODE_API_URL`
- ✅ `frontend/src/pages/AiLawsPage.tsx` - Uses `NODE_API_URL`
- ✅ `frontend/src/pages/ProfilePage.tsx` - Uses `NODE_API_URL`
- ✅ `frontend/src/pages/LawsPage.tsx` - Uses `NODE_API_URL`
- ✅ `frontend/src/pages/PptCreator.tsx` - Uses `VITE_PYTHON_API_URL`
- ✅ `frontend/src/pages/PdfCreator.tsx` - Uses `VITE_PYTHON_API_URL`

**No localhost references remain in production code.**

---

## STEP 5: Configure Backend CORS

### Node.js Backend (node-backend/server.js)

CORS is configured to allow:
```javascript
- Production: https://infinity-frontend.vercel.app
- Development: http://localhost:3000, http://localhost:5173
```

Update the origins list if you have a custom Vercel domain:
```javascript
const corsOptions = {
    origin: process.env.NODE_ENV === 'production' 
        ? [
            'https://your-vercel-domain.vercel.app',
            'http://localhost:3000',
            'http://localhost:5173'
          ]
        : true,
    credentials: true,
};
```

### Python Backend (backend/main.py)

CORS is configured to allow:
```python
- Production: https://infinity-frontend.vercel.app
- Development: http://localhost:3000, http://localhost:5173
```

Update the origins list if needed:
```python
cors_origins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "https://your-vercel-domain.vercel.app",
]
```

---

## STEP 6: Deploy to Vercel

### Option A: Using Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Option B: GitHub Integration
1. Connect your GitHub repo to Vercel
2. Push changes to main branch
3. Vercel auto-deploys

---

## STEP 7: Test Production Deployment

### Critical Tests:

1. **Frontend Access**
   - [ ] Visit your Vercel URL
   - [ ] Verify first page loads
   - [ ] Check browser console for no errors

2. **Navigation**
   - [ ] Navigate to Ask Page
   - [ ] Navigate to Laws Page
   - [ ] Navigate to Chatbot Page
   - [ ] Use browser back/forward buttons
   - [ ] Direct URL access (no errors)

3. **API Calls**
   - [ ] Login/Signup works
   - [ ] Search works
   - [ ] Chat works
   - [ ] Laws display
   - [ ] PDF generation works
   - [ ] PPT generation works

4. **Network Requests**
   - [ ] Open DevTools → Network tab
   - [ ] Verify API requests go to Render backends
   - [ ] Check for CORS errors
   - [ ] Verify response status codes (200, 201, etc.)

5. **Error Handling**
   - [ ] Test with backend down
   - [ ] Verify error messages display
   - [ ] No blank pages or crashes

---

## STEP 8: Environment Variables Reference

### Frontend (.env.production)
```
VITE_NODE_API_URL=https://your-node-backend.onrender.com
VITE_PYTHON_API_URL=https://your-python-backend.onrender.com
```

### Node.js Backend (.env)
```
PORT=5000
MONGO_URI=mongodb+srv://infinity:kanya2006@cluster0.hyevahh.mongodb.net/?appName=Cluster0
JWT_SECRET=supersecretjwtkey_for_antigravity_dev
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
NODE_ENV=production
```

### Python Backend (.env)
```
VITE_GEMINI_API_KEY=your_gemini_api_key
MONGODB_URI=mongodb+srv://infinity:kanya2006@cluster0.hyevahh.mongodb.net/?appName=Cluster0
DATABASE_NAME=lawsask_db
BACKEND_HOST=0.0.0.0
BACKEND_PORT=8000
ENVIRONMENT=production
```

---

## STEP 9: Troubleshooting

### Issue: "Cannot GET /page"
**Cause**: React Router not configured for single-page application
**Fix**: Verify `vercel.json` rewrites are in place

### Issue: "Failed to connect to API"
**Cause**: Localhost URLs still hardcoded
**Fix**: 
- Check all imports use `NODE_API_URL` and `VITE_PYTHON_API_URL`
- Verify .env.production is set correctly in Vercel

### Issue: CORS error in browser console
**Cause**: Backend CORS not configured for Vercel domain
**Fix**: Update backend CORS origins to include your Vercel URL

### Issue: 502 Bad Gateway from Render
**Cause**: Backend not running or not responding
**Fix**: 
- Check Render dashboard
- Verify environment variables in Render
- Check backend logs

### Issue: Images/Static Assets Not Loading
**Cause**: Incorrect path configuration
**Fix**: Ensure all static files in `public/` folder

---

## STEP 10: Post-Deployment Checklist

- [ ] Vercel frontend deployed successfully
- [ ] No localhost references in production
- [ ] All environment variables set in Vercel
- [ ] Backend CORS configured for Vercel domain
- [ ] All API endpoints responding correctly
- [ ] Authentication working
- [ ] Chat functionality working
- [ ] Laws search working
- [ ] PDF/PPT generation working
- [ ] Error messages displaying properly
- [ ] No console errors in DevTools

---

## API Endpoints Reference

### Node.js Backend APIs
```
POST   /api/auth/signup
POST   /api/auth/login
GET    /api/auth/profile
GET    /api/auth/google
GET    /api/chat/ask
GET    /api/chat/laws
POST   /api/game/submit
GET    /api/game/stats
POST   /api/generate/pdf
POST   /api/generate/ppt
```

### Python Backend APIs
```
GET    /health
POST   /api/ask
POST   /api/lawsask
POST   /api/generate_pdf
POST   /api/generate_ppt
GET    /api/generate_avatar
```

---

## Support & Debugging

### Enable Debug Mode
Set `import.meta.env.DEV` checks in components to log API calls:

```typescript
if (import.meta.env.DEV) {
  console.log('API URL:', import.meta.env.VITE_NODE_API_URL);
}
```

### Check Network Requests
1. Open DevTools (F12)
2. Go to Network tab
3. Perform an action
4. Check the request URL and response

### Verify Environment Variables
In your frontend code:
```typescript
console.log('Node API:', import.meta.env.VITE_NODE_API_URL);
console.log('Python API:', import.meta.env.VITE_PYTHON_API_URL);
```

---

## Next Steps

1. Get your Render backend URLs
2. Update Vercel environment variables
3. Deploy using Vercel CLI or GitHub integration
4. Run the production checklist
5. Monitor logs for any issues

**You're ready for production! 🚀**
