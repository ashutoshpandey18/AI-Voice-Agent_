# 🚀 DEPLOYMENT GUIDE - AI Voice Restaurant Booking Agent

Complete step-by-step guide to deploy your full-stack application to production.

---

## 📦 **What We're Deploying**

- **Backend**: Node.js/Express/TypeScript → **Render** (Free tier)
- **Frontend**: React/Vite/TypeScript → **Vercel** (Free tier)
- **Database**: MongoDB Atlas (already connected)

---

## ✅ **PHASE 1: Pre-Deployment Checklist**

### 1.1 Verify Files Created ✅
- [x] `backend/.gitignore` - Protects secrets
- [x] `frontend/.gitignore` - Protects secrets
- [x] Updated CORS configuration for production

### 1.2 Commit Changes to Git

```bash
# In project root
git add .
git commit -m "Prepare for deployment: Add .gitignore and production CORS"
git push origin master
```

**⚠️ CRITICAL**: Make sure `.env` files are NOT tracked by Git!

Check with:
```bash
git status
```

You should NOT see `.env` files listed. If you do:
```bash
git rm --cached backend/.env
git rm --cached frontend/.env
git commit -m "Remove .env from Git"
```

---

## 🔧 **PHASE 2: Deploy Backend to Render**

### 2.1 Create Render Account
1. Go to https://render.com
2. Sign up with GitHub
3. Authorize Render to access your repositories

### 2.2 Create New Web Service
1. Click **"New +"** → **"Web Service"**
2. Connect your `AI-Voice-Agent_` repository
3. Configure settings:

#### **Basic Settings:**
```
Name: voice-agent-backend
Region: Choose closest to you (e.g., Ohio (US East))
Branch: master
Root Directory: backend
```

#### **Build & Start Commands:**
```
Build Command: npm install && npm run build
Start Command: npm start
```

#### **Environment:**
```
Environment: Node
Node Version: 18
```

#### **Plan:**
```
Instance Type: Free
```

### 2.3 Add Environment Variables

Click **"Environment"** tab and add these variables:

```env
NODE_ENV=production

PORT=5000

MONGO_URI=your_mongodb_atlas_connection_string_here

FRONTEND_URL=https://your-app-name.vercel.app

OPENWEATHER_API_KEY=your_openweather_api_key_here

JWT_SECRET=your_random_64_character_jwt_secret_here

JWT_EXPIRES_IN=24h

ALLOW_SEED=false

SESSION_SECRET=your-super-secret-session-key-change-this-in-production
```

**⚠️ IMPORTANT**:
- Replace `https://your-app-name.vercel.app` with your actual Vercel URL (we'll get this in Phase 3)
- Keep all other values as shown above

### 2.4 Deploy Backend
1. Click **"Create Web Service"**
2. Wait for deployment (3-5 minutes)
3. You'll get a URL like: `https://voice-agent-backend.onrender.com`

### 2.5 Test Backend Deployment

Open in browser:
```
https://voice-agent-backend.onrender.com/health
```

You should see:
```json
{
  "status": "healthy",
  "timestamp": "2026-01-08T...",
  "uptime": 123.45,
  "environment": "production"
}
```

✅ **Backend deployed successfully!**

---

## 🌐 **PHASE 3: Deploy Frontend to Vercel**

### 3.1 Create Vercel Account
1. Go to https://vercel.com
2. Sign up with GitHub
3. Authorize Vercel to access your repositories

### 3.2 Import Project
1. Click **"Add New..."** → **"Project"**
2. Import your `AI-Voice-Agent_` repository
3. Configure settings:

#### **Project Settings:**
```
Framework Preset: Vite
Root Directory: frontend
```

#### **Build Settings:**
```
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

### 3.3 Add Environment Variables

Click **"Environment Variables"** and add:

```env
VITE_API_URL=https://voice-agent-backend.onrender.com

VITE_APP_NAME=AI Voice Agent

VITE_APP_VERSION=1.0.0

VITE_ENABLE_ADMIN_DASHBOARD=true

VITE_ENABLE_ANALYTICS=true

VITE_DEFAULT_LOCATION=New York
```

**⚠️ REPLACE**: `https://voice-agent-backend.onrender.com` with YOUR actual Render URL from Phase 2

### 3.4 Deploy Frontend
1. Click **"Deploy"**
2. Wait for deployment (2-3 minutes)
3. You'll get a URL like: `https://ai-voice-agent.vercel.app`

✅ **Frontend deployed successfully!**

---

## 🔗 **PHASE 4: Connect Everything**

### 4.1 Update Backend CORS with Vercel URL

1. Go back to Render dashboard
2. Open your `voice-agent-backend` service
3. Go to **"Environment"** tab
4. Update `FRONTEND_URL` variable:

```
FRONTEND_URL=https://ai-voice-agent.vercel.app
```

Replace with YOUR actual Vercel URL

5. Click **"Save Changes"**
6. Render will automatically redeploy (takes 2-3 minutes)

### 4.2 Update MongoDB Atlas IP Whitelist

1. Go to MongoDB Atlas dashboard: https://cloud.mongodb.com
2. Click on your cluster: `AIVoiceAgent`
3. Click **"Network Access"** in left sidebar
4. Click **"Add IP Address"**
5. Click **"Allow Access from Anywhere"** (for now)
   - IP Address: `0.0.0.0/0`
   - Comment: "Render deployment access"
6. Click **"Confirm"**

**🔒 Security Note**: For production, you should whitelist only Render's IP ranges. For now, this works.

---

## 🧪 **PHASE 5: Test Your Deployment**

### 5.1 Test Backend Health
```
https://voice-agent-backend.onrender.com/health
```

Should return healthy status ✅

### 5.2 Test Frontend Loading
```
https://ai-voice-agent.vercel.app
```

Should load voice agent page ✅

### 5.3 Test Admin Login

1. Go to: `https://ai-voice-agent.vercel.app/admin/login`
2. Login with:
   - Email: `admin@restaurant.com`
   - Password: `admin123`
3. Should redirect to dashboard ✅

### 5.4 Test Voice Booking (IMPORTANT!)

1. Go to main page: `https://ai-voice-agent.vercel.app`
2. Click microphone button
3. Say: "I want to book a table"
4. Follow conversation
5. Check if booking saves ✅

### 5.5 Test Admin Dashboard

1. Login to admin
2. Go to: `https://ai-voice-agent.vercel.app/admin/bookings`
3. Should see your test booking ✅

---

## 🎯 **YOUR DEPLOYMENT URLS**

Once deployed, update this section with your actual URLs:

```
Frontend (User App): https://ai-voice-agent.vercel.app
Admin Dashboard: https://ai-voice-agent.vercel.app/admin
Backend API: https://voice-agent-backend.onrender.com
Health Check: https://voice-agent-backend.onrender.com/health
```

---

## 🐛 **Common Issues & Fixes**

### Issue 1: CORS Error in Browser Console

**Error**: `Access to fetch at '...' from origin '...' has been blocked by CORS`

**Fix**:
1. Check `FRONTEND_URL` environment variable in Render
2. Make sure it matches your Vercel URL EXACTLY (no trailing slash)
3. Redeploy backend after changing

### Issue 2: 500 Error from Backend

**Error**: API calls return 500 Internal Server Error

**Fix**:
1. Check Render logs: Dashboard → Your Service → Logs
2. Look for MongoDB connection errors
3. Verify `MONGO_URI` is correct in Render environment variables
4. Make sure MongoDB Atlas allows `0.0.0.0/0` IP

### Issue 3: Environment Variables Not Working

**Error**: Backend can't read environment variables

**Fix**:
1. In Render, environment variables must be added BEFORE first deployment
2. If you add variables after deployment, click **"Manual Deploy"** → **"Deploy latest commit"**
3. Check spelling carefully (case-sensitive!)

### Issue 4: Admin Login Returns 401

**Error**: Cannot login to admin dashboard

**Fix**:
1. Check if `JWT_SECRET` is set in Render environment variables
2. Make sure MongoDB has admin user seeded
3. Check Render logs for authentication errors

### Issue 5: Render Service Sleeping (Free Tier)

**Behavior**: First request takes 30-60 seconds

**This is normal**: Render free tier spins down after 15 minutes of inactivity. First request wakes it up.

**Solutions**:
- Upgrade to paid tier ($7/month for always-on)
- Use a cron service to ping your health endpoint every 10 minutes
- Accept the delay (it's free!)

---

## 📊 **Monitoring Your Deployment**

### Backend Logs (Render)
```
Render Dashboard → Your Service → Logs
```

### Frontend Logs (Vercel)
```
Vercel Dashboard → Your Project → Deployments → View Function Logs
```

### Database Monitoring (MongoDB Atlas)
```
Atlas Dashboard → Metrics → Real-time
```

---

## 🔐 **Security Checklist**

- [x] `.env` files NOT in Git
- [x] Secrets in environment variables
- [x] CORS configured for production URLs only
- [x] MongoDB Atlas IP whitelist configured
- [x] JWT secrets are strong random strings
- [x] HTTPS enabled (automatic on Vercel/Render)

---

## 🚀 **Post-Deployment Next Steps**

### 1. Set Up Custom Domain (Optional)
**Vercel**:
- Domains tab → Add domain → Follow DNS instructions

**Render**:
- Settings → Custom Domains → Add domain

### 2. Enable Vercel Analytics (Free)
1. Vercel Dashboard → Analytics
2. Enable Analytics
3. Track page views and performance

### 3. Set Up Error Monitoring
Consider adding:
- Sentry (error tracking)
- LogRocket (session replay)
- New Relic (APM)

### 4. Create Backup Strategy
**MongoDB Atlas** has automatic backups, but you should also:
- Export bookings weekly (use admin export feature)
- Store exports in Google Drive or AWS S3

### 5. Monitor Uptime
Use a service like:
- UptimeRobot (free, pings every 5 minutes)
- Better Uptime (paid, more features)

---

## 📝 **Deployment Completed!**

Your app is now live! Share these URLs:

- **Users**: https://ai-voice-agent.vercel.app
- **Admin**: https://ai-voice-agent.vercel.app/admin

---

## 🆘 **Need Help?**

If you encounter issues:

1. Check Render logs first
2. Check Vercel deployment logs
3. Check browser console (F12)
4. Verify environment variables are correct
5. Test backend health endpoint directly

**Remember**: First deploy takes longest. Future deploys are faster!

---

**Deployed by**: Ashutosh Pandey
**Deployment Date**: January 8, 2026
**Status**: ✅ Production Ready
