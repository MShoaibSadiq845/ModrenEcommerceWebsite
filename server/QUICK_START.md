# 🚀 Quick Start - Railway Deployment

## ⚡ TL;DR - Deploy in 3 Steps

### 1️⃣ Commit the new files
```bash
git add Dockerfile .dockerignore railway.json
git commit -m "feat: add production Dockerfile"
git push
```

### 2️⃣ Configure Railway (CRITICAL!)
Go to Railway → Your Service → **Settings**:

1. **Build Section:**
   - Set **Builder** to: `Dockerfile`
   - Set **Root Directory** to: `server` (if your code is in a server folder)
   
2. **Variables Section:**
   Add these environment variables:
   ```
   MONGODB_URI=mongodb+srv://...
   JWT_SECRET=your-secret-here
   NODE_ENV=production
   ```

### 3️⃣ Redeploy
- Click **"Redeploy"** or push another commit
- Watch the logs - should show Docker build stages
- Wait for: `"Nest application successfully started"`

---

## ✅ What Was Fixed

| Issue | Solution |
|-------|----------|
| ❌ Railway uses Nixpacks | ✅ Created `railway.json` forcing Docker builder |
| ❌ `dist/` folder missing | ✅ Multi-stage Dockerfile builds TypeScript properly |
| ❌ Module not found error | ✅ Correct path: `dist/main.js` (not `dist/src/main.js`) |
| ❌ Large image size | ✅ Multi-stage build + Alpine = ~150MB (not ~1GB) |
| ❌ Security concerns | ✅ Non-root user + minimal Alpine image |

---

## 🔍 How to Verify It's Using Docker

### In Railway Build Logs, you should see:
```
✅ Building with Dockerfile
✅ #1 [builder 1/8] FROM node:20-alpine
✅ #2 [builder 2/8] WORKDIR /app
✅ #7 [builder 7/8] RUN npm run build
✅ #9 [production 1/5] FROM node:20-alpine
✅ Successfully built
```

### You should NOT see:
```
❌ Using Nixpacks
❌ Installing packages with npm
❌ Running npm install
```

---

## 🐛 If Deployment Still Fails

### Problem: Still using Nixpacks
**Solution:**
1. Delete `nixpacks.toml` (if exists)
2. Go to Railway Settings → Build
3. Manually change Builder from "Nixpacks" to "Dockerfile"
4. Save and redeploy

### Problem: "Cannot find module /app/dist/main.js"
**Check these in order:**
1. Is `railway.json` committed? (`git status`)
2. Is Builder set to "Dockerfile" in Railway settings?
3. Do build logs show Docker stages (#1, #2, etc.)?
4. Does TypeScript compile locally? (`npm run build`)

### Problem: Build succeeds but crashes on start
**Check:**
1. Environment variables in Railway (especially `MONGODB_URI`)
2. Deploy logs for actual error message
3. MongoDB connection string format

---

## 📂 File Structure (Server Directory)

```
server/
├── Dockerfile              ← NEW: Multi-stage production build
├── .dockerignore           ← NEW: Excludes node_modules, dist, .env
├── railway.json            ← UPDATED: Forces Docker builder
├── package.json           
├── tsconfig.json          
├── nest-cli.json          
├── src/
│   └── main.ts            
└── [node_modules/]         ← Excluded from Docker (built fresh)
└── [dist/]                 ← Excluded from Docker (built fresh)
```

---

## 🎯 Expected Results

### ✅ Successful Build:
- Build time: ~2-4 minutes (first time), ~30s (cached)
- Final image size: ~150-200MB
- Build logs show Docker stages

### ✅ Successful Deploy:
- App starts in ~5-10 seconds
- Logs show: "Nest application successfully started"
- API responds: `https://your-app.railway.app/api`
- Health check passes

---

## 🔗 Important Railway URLs

- **Dashboard:** https://railway.app/dashboard
- **Docs:** https://docs.railway.app/deploy/dockerfiles
- **Status:** https://status.railway.app

---

## 💡 Pro Tips

1. **Watch the logs live** - Railway dashboard → Deployments → Click latest → View logs
2. **Set up health checks** - Add `/health` endpoint in your NestJS app
3. **Enable auto-redeploy** - Automatically deploy on git push
4. **Use Railway CLI** for testing: `railway run npm run start:dev`

---

## 📞 Need Help?

If stuck, check:
1. Railway build logs (exact error message)
2. Railway deploy logs (startup errors)
3. This guide's troubleshooting section
4. `RAILWAY_DEPLOYMENT_GUIDE.md` (detailed guide)

---

**🎉 That's it! Your NestJS app should now deploy successfully with Docker on Railway.**
