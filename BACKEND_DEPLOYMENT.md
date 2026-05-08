# Backend Deployment Configuration - Render

## Node.js Backend Setup (Render)

### Environment Variables to Add in Render:

```
PORT=5000
MONGO_URI=mongodb+srv://infinity:kanya2006@cluster0.hyevahh.mongodb.net/?appName=Cluster0
JWT_SECRET=supersecretjwtkey_for_antigravity_dev
GOOGLE_CLIENT_ID=955597672817-iffgjjjdmjc0mcclrhqclep0tpi5kigb.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
NODE_ENV=production
```

### Render Build Configuration:

- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`
- **Node Version**: 18.x or higher

### CORS Configuration:

The backend is configured to accept requests from:
- Production: `https://infinity-frontend.vercel.app`
- Development: `http://localhost:3000`, `http://localhost:5173`

Update in `node-backend/server.js` if you have a custom domain.

---

## Python Backend Setup (Render)

### Environment Variables to Add in Render:

```
VITE_GEMINI_API_KEY=your_gemini_api_key_here
MONGODB_URI=mongodb+srv://infinity:kanya2006@cluster0.hyevahh.mongodb.net/?appName=Cluster0
DATABASE_NAME=lawsask_db
BACKEND_HOST=0.0.0.0
BACKEND_PORT=8000
ENVIRONMENT=production
```

### Render Build Configuration:

- **Build Command**: `pip install -r backend/requirements.txt`
- **Start Command**: `gunicorn --workers=4 --bind 0.0.0.0:8000 'backend.main:app'`
- **Python Version**: 3.10 or higher

**Note**: Make sure `gunicorn` is in your `requirements.txt`

### CORS Configuration:

The backend is configured to accept requests from:
- Production: `https://infinity-frontend.vercel.app`
- Development: `http://localhost:3000`, `http://localhost:5173`

Update in `backend/main.py` if you have a custom domain.

---

## MongoDB Configuration

### Connection String:
```
mongodb+srv://infinity:kanya2006@cluster0.hyevahh.mongodb.net/?appName=Cluster0
```

### Collections:
- `users` - User data
- `chat_history` - Chat conversations
- `scores` - Game scores
- `laws` - Indian law database
- `best_scores` - Leaderboard

### Indexes:
- `laws` collection: Text index on keywords for search

---

## API URLs (Production)

| Service | URL |
|---------|-----|
| Frontend | https://infinity-frontend.vercel.app |
| Node.js Backend | https://your-node-backend.onrender.com |
| Python Backend | https://your-python-backend.onrender.com |

---

## Health Checks

### Node.js Backend:
```bash
curl https://your-node-backend.onrender.com/api/health
```
Expected: `{"status":"ok"}`

### Python Backend:
```bash
curl https://your-python-backend.onrender.com/health
```
Expected: `{"status":"ok","api_key_loaded":true}`

---

## Debugging Commands

### View Render Logs:
```bash
# Node.js backend logs
# Python backend logs
```
Check in Render Dashboard → Logs

### Test API Endpoint:
```bash
# Test Node.js API
curl -X POST https://your-node-backend.onrender.com/api/chat/ask \
  -H "Content-Type: application/json" \
  -d '{"message":"hello"}'

# Test Python API
curl https://your-python-backend.onrender.com/health
```

---

## Common Issues

### Issue: "Cannot connect to MongoDB"
- Verify connection string
- Check IP whitelist on MongoDB Atlas
- Ensure MONGODB_URI is set in Render

### Issue: "API Key not configured"
- Verify VITE_GEMINI_API_KEY in Render
- Check for extra spaces or quotes

### Issue: "CORS error"
- Update backend CORS to include Vercel URL
- Verify Vercel URL format

### Issue: "Build fails"
- Check requirements.txt for Python
- Check package.json for Node.js
- View Render logs for detailed errors

---

## Monitoring

### Recommended Tools:
1. **Render Dashboard** - Monitor uptime, logs
2. **Vercel Dashboard** - Monitor deployments, analytics
3. **MongoDB Atlas Dashboard** - Monitor database performance
4. **BetterStack/Uptime Robot** - Monitor API availability

### Key Metrics to Monitor:
- API response times
- Error rates
- Database query performance
- Memory/CPU usage
- Request count

---

## Maintenance

### Regular Tasks:
- [ ] Check logs for errors
- [ ] Monitor API response times
- [ ] Verify database connectivity
- [ ] Update dependencies monthly
- [ ] Review error tracking

### Security:
- [ ] Never commit .env files
- [ ] Rotate JWT secrets periodically
- [ ] Monitor for suspicious activity
- [ ] Keep dependencies updated

---

## Quick Reference

### Start Backend Locally:
```bash
# Node.js
cd node-backend
npm install
npm run dev

# Python
cd backend
pip install -r requirements.txt
python main.py
```

### View Render Dashboard:
- https://dashboard.render.com

### View Vercel Dashboard:
- https://vercel.com/dashboard

### Get Backend URLs:
- Check Render service details page for deployment URL
- Copy and update in Vercel environment variables
