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
MONGO_URI=your_mongodb_atlas_connection_string_here
FRONTEND_URL=https://YOUR-VERCEL-URL.vercel.app
OPENWEATHER_API_KEY=your_openweather_api_key_here
JWT_SECRET=your_random_64_character_jwt_secret_here
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
