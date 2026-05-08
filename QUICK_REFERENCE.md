# 🚀 DEPLOYMENT QUICK REFERENCE CARD

## One-Page Deployment Guide

---

## 📋 3 Steps to Production

### STEP 1: Get URLs from Render (2 min)
```
1. Go to: https://dashboard.render.com
2. Find Node.js service → Copy URL
3. Find Python service → Copy URL
```

**Example:**
- Node.js: `https://infinity-node-api.onrender.com`
- Python: `https://infinity-python-api.onrender.com`

---

### STEP 2: Update Vercel Env Vars (2 min)
```
1. Go to: https://vercel.com/dashboard
2. Select project
3. Settings → Environment Variables
4. Add two variables:
```

**Variable 1:**
```
Name: VITE_NODE_API_URL
Value: https://your-node-backend.onrender.com
```

**Variable 2:**
```
Name: VITE_PYTHON_API_URL
Value: https://your-python-backend.onrender.com
```

---

### STEP 3: Deploy (1 min)
```bash
# Option A: CLI
npm i -g vercel
vercel --prod

# Option B: Git
git push origin main
```

---

## ✅ Verification Checklist

After deployment:
- [ ] Visit your Vercel domain
- [ ] Click through pages (no 404s)
- [ ] Search for a law (works?)
- [ ] Send a message (AI responds?)
- [ ] DevTools console - clean?
- [ ] Network tab - APIs from Render?

---

## 🐛 Quick Fixes

| Issue | Fix |
|-------|-----|
| Cannot GET /page | Check vercel.json exists |
| API not responding | Check env vars in Vercel |
| CORS error | Verify backend CORS config |
| Blank page | Check browser console |

---

## 📊 What Changed

**8 API files** - Now use env variables
**6 Config files** - Production-ready
**2 Backend files** - CORS configured
**6 Doc files** - Comprehensive guides

---

## 🔑 Key URLs

| Service | Production |
|---------|-----------|
| Frontend | `https://infinity-frontend.vercel.app` |
| Node API | `https://your-node-backend.onrender.com` |
| Python API | `https://your-python-backend.onrender.com` |

---

## 💾 Env Variables Needed

### Vercel Dashboard
```
VITE_NODE_API_URL=https://your-node-backend.onrender.com
VITE_PYTHON_API_URL=https://your-python-backend.onrender.com
```

### Render - Node.js
```
PORT=5000
MONGO_URI=mongodb+srv://...
JWT_SECRET=your_secret
NODE_ENV=production
```

### Render - Python
```
VITE_GEMINI_API_KEY=your_key
MONGODB_URI=mongodb+srv://...
ENVIRONMENT=production
```

---

## 📖 Full Documentation

- `QUICK_DEPLOY_GUIDE.md` - 5 min guide
- `DEPLOYMENT_GUIDE.md` - Complete walkthrough
- `DEPLOYMENT_CHECKLIST.md` - Validation steps
- `BACKEND_DEPLOYMENT.md` - Backend setup
- `PRODUCTION_CHANGES.md` - What changed
- `CHANGE_LOG.md` - Detailed changes

---

## ⏱️ Timeline

```
Step 1 → 2 min ✅
Step 2 → 2 min ✅
Step 3 → 1 min ✅
Verify → 2 min ✅
─────────────────
Total → 7 min 🎉
```

---

## ✨ You're Ready!

**Everything is fixed and configured.**

Just:
1. Get backend URLs
2. Update Vercel env vars
3. Deploy

**That's all! 🚀**

---

## 🆘 Still Have Questions?

- Quick questions? → `QUICK_DEPLOY_GUIDE.md`
- Detailed info? → `DEPLOYMENT_GUIDE.md`
- Something broken? → `DEPLOYMENT_CHECKLIST.md`
- Backend issue? → `BACKEND_DEPLOYMENT.md`

---

## ✅ Success Metrics

When deployed correctly:
- ✅ Pages load instantly
- ✅ Navigation works
- ✅ APIs respond from Render
- ✅ Chat works
- ✅ Search works
- ✅ No console errors
- ✅ No "localhost" anywhere

---

**Made on:** May 8, 2026
**Status:** Production Ready ✅
**Files Fixed:** 19
**Time to Deploy:** 7 minutes
