# 🚀 QUICK DEPLOYMENT REFERENCE

## ⚡ TL;DR - 5 Minute Deploy

### Step 1: Push to Git
```bash
git add .
git commit -m "Deploy"
git push origin master
```

### Step 2: Deploy Backend (Render)
1. render.com → New Web Service
2. Connect repo → Select `AI-Voice-Agent_`
3. Root Directory: `backend`
4. Build: `npm install && npm run build`
5. Start: `npm start`
6. Add environment variables (see below)

### Step 3: Deploy Frontend (Vercel)
1. vercel.com → Import Project
2. Connect repo → Select `AI-Voice-Agent_`
3. Root Directory: `frontend`
4. Framework: Vite
5. Add environment variables (see below)

### Step 4: Connect
1. Copy Vercel URL
2. Update Render `FRONTEND_URL` variable
3. Test!

---

## 📋 Environment Variables Cheat Sheet

### Backend (Render)
```
NODE_ENV=production
PORT=5000
MONGO_URI=mongodb+srv://ashutoshpandey23june2005_db_user:PRMZKWiiZNGqIotR@aivoiceagent.iaidsbf.mongodb.net/?retryWrites=true&w=majority&appName=AIVoiceAgent
FRONTEND_URL=https://YOUR-VERCEL-URL.vercel.app
OPENWEATHER_API_KEY=ad06f3345ac341f255f9c899667f61e7
JWT_SECRET=a8f3e9c2b7d1f4e6a9c3b8d2f7e1a4c9b6d3f8e2a7c1b9d4f6e3a8c2b7d1f5e9
JWT_EXPIRES_IN=24h
ALLOW_SEED=false
```

### Frontend (Vercel)
```
VITE_API_URL=https://YOUR-RENDER-URL.onrender.com
VITE_APP_NAME=AI Voice Agent
VITE_APP_VERSION=1.0.0
VITE_ENABLE_ADMIN_DASHBOARD=true
```

---

## ✅ Testing Checklist

- [ ] Backend health: `https://YOUR-RENDER-URL.onrender.com/health`
- [ ] Frontend loads: `https://YOUR-VERCEL-URL.vercel.app`
- [ ] Admin login works: `/admin/login`
- [ ] Voice booking works
- [ ] Dashboard shows data

---

## 🐛 Quick Fixes

**CORS Error?** → Update FRONTEND_URL in Render, redeploy

**500 Error?** → Check Render logs, verify MONGO_URI

**Admin won't login?** → Check JWT_SECRET is set

**Slow first load?** → Normal for Render free tier (cold start)

---

See full guide: DEPLOYMENT_GUIDE.md
