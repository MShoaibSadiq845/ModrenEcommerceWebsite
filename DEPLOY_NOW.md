# 🚀 Deploy to Railway NOW - Step by Step

## Current Situation
- ✅ Railway CLI installed and logged in
- ✅ Project linked: "strong-contentment" / "ModrenEcommerceWebsite"  
- ✅ Environment variables set
- ✅ Dockerfile ready
- ❌ Build failing because Railway can't find the server directory

## 🎯 Solution: 2 Quick Options

---

## **OPTION 1: Fix via Railway Dashboard (Fastest) ⚡**

### Step 1: Open Railway Dashboard
```powershell
railway open
```
Or go to: https://railway.app/dashboard

### Step 2: Configure Service
1. Click on **"ModrenEcommerceWebsite"** service
2. Go to **"Settings"** tab
3. Find **"Root Directory"** setting
4. Set it to: **`server`** (this tells Railway your code is in the server folder)
5. Scroll to **"Build"** section
6. Verify **"Builder"** = **`Dockerfile`**
7. Verify **"Dockerfile Path"** = **`Dockerfile`**
8. Click **"Save"** at the bottom

### Step 3: Redeploy
```powershell
cd c:\Users\star\Desktop\Projects\week6\day2\server
railway up --detach
```

### Step 4: Watch Logs
```powershell
railway logs
```

**Expected:** You should see Docker build stages and "Nest application successfully started"

---

## **OPTION 2: Deploy from Project Root 📁**

### Step 1: Navigate to Project Root
```powershell
cd c:\Users\star\Desktop\Projects\week6\day2
```

### Step 2: Link Project (manually select)
```powershell
railway link
```
When prompted:
1. Select workspace: **"Bilal Sadiq's Projects"**
2. Select project: **"strong-contentment"** 
3. Press Enter

### Step 3: Configure Service for Server Directory
You still need to set Root Directory to `server` in Railway dashboard (see Option 1, Step 2)

### Step 4: Deploy
```powershell
railway up --detach
```

### Step 5: Watch Logs
```powershell
railway logs
```

---

## ⚡ **FASTEST WAY (Do This Now):**

```powershell
# 1. Open Railway dashboard
railway open

# Then in the dashboard:
# - Click "ModrenEcommerceWebsite"
# - Settings → Root Directory → Set to "server"
# - Settings → Build → Builder = "Dockerfile"
# - Save

# 2. Back in terminal, deploy:
cd c:\Users\star\Desktop\Projects\week6\day2\server
railway up --detach

# 3. Watch the magic happen:
railway logs
```

---

## 🔍 Verify It's Working

### Check Build Logs:
```powershell
railway logs --build
```

**Look for:**
```
✅ Building with Dockerfile
✅ #1 [builder 1/8] FROM node:20-alpine
✅ #7 [builder 7/8] RUN npm run build  
✅ #9 [production 1/5] FROM node:20-alpine
✅ Successfully built
```

### Check Deploy Logs:
```powershell
railway logs
```

**Look for:**
```
✅ [Nest] LOG [NestFactory] Starting Nest application...
✅ [Nest] LOG [InstanceLoader] AppModule dependencies initialized
✅ [Nest] LOG [MongooseCoreModule] dependencies initialized
✅ [Nest] LOG [NestApplication] Nest application successfully started
```

### Get Your URL:
```powershell
railway domain
```

### Test Your API:
```powershell
# Get the URL
$url = railway domain
# Test it
curl "$url/api"
```

---

## 🐛 If Still Failing

### Check these in Railway Dashboard:

1. **Settings → General:**
   - ✅ Root Directory = `server`
   
2. **Settings → Build:**
   - ✅ Builder = `Dockerfile`
   - ✅ Dockerfile Path = `Dockerfile`
   
3. **Variables:**
   - ✅ All environment variables present
   - ✅ NODE_ENV = production
   - ✅ MONGODB_URI is set

### Then:
```powershell
# Redeploy
railway up --detach

# Watch
railway logs --follow
```

---

## 📊 Expected Timeline

- Build time: ~2-4 minutes (first deploy)
- Deploy time: ~5-10 seconds  
- Total: ~5 minutes

---

## ✅ Success Indicators

### In Terminal:
```
✅ Indexed
✅ Compressed
✅ Uploaded
✅ Build Logs: https://railway.com/...
```

### In Logs:
```
✅ Successfully built
✅ Nest application successfully started
✅ Application is listening on port XXXX
```

### API Test:
```powershell
curl https://your-app.railway.app/api
# Returns: API response (not 404)
```

---

## 🎉 You're Done!

Once you see "Nest application successfully started", your app is live!

Get your URL:
```powershell
railway domain
```

Test it:
```powershell
curl https://your-app.railway.app/api/auth/login
# Should return 401 or prompt (means it's working!)
```

---

## 💡 Pro Tip

After successful deployment, enable auto-deploy:
1. Go to Railway dashboard
2. Settings → GitHub
3. Enable "Auto Deploy"
4. Now every `git push` will auto-deploy!

---

**Start with Option 1 (Railway Dashboard) - it's the fastest! 🚀**
