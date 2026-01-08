# 🔑 ENVIRONMENT VARIABLES - COPY & PASTE

## 📦 FOR RENDER (Backend)

**Copy this entire block and paste into Render's Environment Variables section:**

```
NODE_ENV=production
PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string_here
FRONTEND_URL=https://REPLACE-WITH-YOUR-VERCEL-URL.vercel.app
OPENWEATHER_API_KEY=your_openweather_api_key_here
JWT_SECRET=your_random_64_character_jwt_secret_here
JWT_EXPIRES_IN=24h
ALLOW_SEED=false
SESSION_SECRET=your-super-secret-session-key-change-this-in-production
```

**⚠️ IMPORTANT**: After deploying frontend to Vercel, come back and update `FRONTEND_URL` with your actual Vercel URL!

---

## 🌐 FOR VERCEL (Frontend)

**Copy this entire block and paste into Vercel's Environment Variables section:**

```
VITE_API_URL=https://REPLACE-WITH-YOUR-RENDER-URL.onrender.com
VITE_APP_NAME=AI Voice Agent
VITE_APP_VERSION=1.0.0
VITE_ENABLE_ADMIN_DASHBOARD=true
VITE_ENABLE_ANALYTICS=true
VITE_DEFAULT_LOCATION=New York
```

**⚠️ IMPORTANT**: Replace `REPLACE-WITH-YOUR-RENDER-URL` with your actual Render backend URL from Step 2!

---

## 📋 INDIVIDUAL VARIABLES FOR RENDER

If Render doesn't accept bulk paste, add them one by one:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `PORT` | `5000` |
| `MONGO_URI` | `your_mongodb_atlas_connection_string_here` |
| `FRONTEND_URL` | `https://your-app.vercel.app` (update after Vercel deploy) |
| `OPENWEATHER_API_KEY` | `your_openweather_api_key_here` |
| `JWT_SECRET` | `your_random_64_character_jwt_secret_here` |
| `JWT_EXPIRES_IN` | `24h` |
| `ALLOW_SEED` | `false` |

---

## 📋 INDIVIDUAL VARIABLES FOR VERCEL

If Vercel requires one-by-one:

| Key | Value |
|-----|-------|
| `VITE_API_URL` | `https://your-backend.onrender.com` (from Render deploy) |
| `VITE_APP_NAME` | `AI Voice Agent` |
| `VITE_APP_VERSION` | `1.0.0` |
| `VITE_ENABLE_ADMIN_DASHBOARD` | `true` |
| `VITE_ENABLE_ANALYTICS` | `true` |
| `VITE_DEFAULT_LOCATION` | `New York` |

---

## 🔄 THE TWO-STEP UPDATE DANCE

Because frontend and backend need each other's URLs:

### First Deploy (Temporary Values):

1. **Deploy Backend** with `FRONTEND_URL=https://TEMP-VALUE`
2. **Get Backend URL**: `https://voice-agent-backend-xyz.onrender.com`
3. **Deploy Frontend** with `VITE_API_URL=https://voice-agent-backend-xyz.onrender.com`
4. **Get Frontend URL**: `https://my-voice-agent.vercel.app`

### Second Update (Real Values):

5. **Go back to Render** → Update `FRONTEND_URL=https://my-voice-agent.vercel.app`
6. **Render auto-redeploys** (takes 2-3 min)
7. **Done!** ✅

---

## 📝 NOTES

- **Render** environment variables are entered in their dashboard UI, not in a file
- **Vercel** environment variables are also entered in their dashboard UI
- **MongoDB Atlas** IP whitelist must allow `0.0.0.0/0` for Render to connect
- **Don't commit** `.env` files to Git (they're already gitignored)
- **Keep these values** - you'll need them for redeployment

---

## 🔐 SECURITY NOTES

These are YOUR production secrets. Keep them safe:
- ✅ JWT_SECRET is 64 random hex characters
- ✅ MongoDB password is included in connection string
- ✅ Weather API key is free tier (safe to use)
- ✅ No secrets are in Git
- ✅ CORS only allows your Vercel domain

---

**Save this file!** You'll need these values if you redeploy or troubleshoot. 🔑
