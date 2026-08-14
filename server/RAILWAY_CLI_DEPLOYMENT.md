# 🚂 Railway CLI Deployment Guide

## 📦 Step-by-Step Railway CLI Deployment

---

## 1️⃣ Install Railway CLI

### Windows (PowerShell):
```powershell
# Using npm (recommended)
npm install -g @railway/cli

# Or using Scoop
scoop install railway
```

### Verify installation:
```bash
railway --version
```

---

## 2️⃣ Login to Railway

```bash
railway login
```

This will:
- Open your browser
- Ask you to authorize the CLI
- Save your authentication token

**Expected output:**
```
🚝 Logging in...
✔ Logged in as your-email@example.com
```

---

## 3️⃣ Navigate to Server Directory

```bash
cd c:\Users\star\Desktop\Projects\week6\day2\server
```

---

## 4️⃣ Initialize Railway Project

### Option A: Link to Existing Project (if you already created one)
```bash
railway link
```
Then select your project from the list.

### Option B: Create New Project
```bash
railway init
```
- Enter project name (e.g., "nestjs-shop-backend")
- Select your team (or personal account)

**Expected output:**
```
✔ Project created: nestjs-shop-backend
✔ Environment: production
```

---

## 5️⃣ Set Environment Variables

```bash
# Set MongoDB URI
railway variables set MONGODB_URI="mongodb+srv://username:password@cluster.mongodb.net/dbname"

# Set JWT Secret
railway variables set JWT_SECRET="your-super-secret-jwt-key-here"

# Set Node Environment
railway variables set NODE_ENV="production"

# If using Cloudinary
railway variables set CLOUDINARY_CLOUD_NAME="your_cloud_name"
railway variables set CLOUDINARY_API_KEY="your_api_key"
railway variables set CLOUDINARY_API_SECRET="your_api_secret"
```

**Verify variables:**
```bash
railway variables
```

---

## 6️⃣ Deploy to Railway

```bash
railway up
```

This command will:
1. ✅ Detect your `Dockerfile`
2. ✅ Build the Docker image
3. ✅ Push to Railway
4. ✅ Deploy to production

**Expected output:**
```
Building...
✔ Build successful
✔ Deployment successful
✔ Available at: https://your-app.up.railway.app
```

---

## 7️⃣ Watch Logs (Real-time)

```bash
railway logs
```

**You should see:**
```
[Nest] LOG [NestFactory] Starting Nest application...
[Nest] LOG [InstanceLoader] AppModule dependencies initialized
[Nest] LOG [MongooseCoreModule] dependencies initialized
[Nest] LOG [NestApplication] Nest application successfully started
```

Press `Ctrl+C` to exit logs.

---

## 8️⃣ Get Your Application URL

```bash
railway domain
```

**Output:**
```
https://your-app.up.railway.app
```

---

## 9️⃣ Test Your Deployment

```bash
# Test API endpoint
curl https://your-app.up.railway.app/api

# Or open in browser
railway open
```

---

## 🔄 Useful Railway CLI Commands

### View Project Status:
```bash
railway status
```

### View All Services:
```bash
railway service
```

### View Environment Variables:
```bash
railway variables
```

### View Recent Deployments:
```bash
railway deployments
```

### Redeploy:
```bash
railway up --detach
```

### Run Commands in Railway Environment:
```bash
railway run node dist/main.js
```

### Shell into Deployed Container:
```bash
railway shell
```

### Open Railway Dashboard:
```bash
railway open
```

### Disconnect from Project:
```bash
railway unlink
```

---

## 🐛 Troubleshooting

### Issue: "railway: command not found"
**Solution:**
```bash
# Reinstall
npm install -g @railway/cli

# Or add to PATH manually (Windows)
# The CLI is usually installed at:
# C:\Users\YourUsername\AppData\Roaming\npm\railway.cmd
```

### Issue: "Not logged in"
**Solution:**
```bash
railway login
```

### Issue: "No project linked"
**Solution:**
```bash
railway link
# Or
railway init
```

### Issue: Build fails
**Solution:**
1. Check logs: `railway logs --build`
2. Verify Dockerfile exists: `ls Dockerfile`
3. Verify railway.json forces Docker: `cat railway.json`
4. Try local Docker build: `docker build .`

### Issue: Deployment succeeds but app crashes
**Solution:**
1. Check logs: `railway logs`
2. Verify environment variables: `railway variables`
3. Check MongoDB connection string
4. Verify all required env vars are set

---

## 🎯 Complete Deployment Workflow

Here's the full sequence from start to finish:

```bash
# 1. Navigate to server directory
cd c:\Users\star\Desktop\Projects\week6\day2\server

# 2. Make sure you're logged in
railway login

# 3. Initialize or link project
railway init  # or railway link

# 4. Set all environment variables
railway variables set MONGODB_URI="mongodb+srv://..."
railway variables set JWT_SECRET="your-secret"
railway variables set NODE_ENV="production"

# 5. Deploy
railway up

# 6. Watch logs
railway logs

# 7. Get URL
railway domain

# 8. Test
curl https://your-app.up.railway.app/api
```

---

## 🔐 Environment Variables Checklist

Make sure these are set:

```bash
# Check current variables
railway variables

# Required:
✅ MONGODB_URI
✅ JWT_SECRET
✅ NODE_ENV=production

# Optional (if using file uploads):
⚪ CLOUDINARY_CLOUD_NAME
⚪ CLOUDINARY_API_KEY
⚪ CLOUDINARY_API_SECRET
```

---

## 📊 Verify Deployment Success

### 1. Check Build Logs:
```bash
railway logs --build
```
**Look for:**
- `Building with Dockerfile`
- `#1 [builder 1/8] FROM node:20-alpine`
- `Successfully built`

### 2. Check Deploy Logs:
```bash
railway logs
```
**Look for:**
- `[Nest] LOG [NestFactory] Starting Nest application...`
- `[Nest] LOG [NestApplication] Nest application successfully started`

### 3. Test API:
```bash
railway run curl http://localhost:$PORT/api
```

---

## 🚀 Advanced CLI Usage

### Deploy with Custom Environment:
```bash
railway up --environment staging
```

### Deploy with Service Name:
```bash
railway up --service backend
```

### View Build Logs Only:
```bash
railway logs --build
```

### Follow Logs (Live):
```bash
railway logs --follow
```

### Delete Deployment:
```bash
railway down
```

### Set Multiple Variables at Once:
```bash
railway variables set \
  MONGODB_URI="mongodb+srv://..." \
  JWT_SECRET="your-secret" \
  NODE_ENV="production"
```

---

## 🔄 Continuous Deployment

### Auto-deploy on Git Push:

1. **Link to GitHub:**
```bash
railway link
```

2. **Select repository:**
Choose your GitHub repository from the list

3. **Configure auto-deploy:**
Railway will automatically detect pushes to your main branch

4. **Push to deploy:**
```bash
git push origin main
```

Railway will automatically:
- Detect the push
- Build using your Dockerfile
- Deploy to production

---

## 📦 Railway Project Structure

After initialization, you'll see:

```
server/
├── .railway/
│   └── config.json       # Railway CLI config (git-ignored)
├── Dockerfile            # Used for deployment
├── .dockerignore         # Excludes files from build
├── railway.json          # Railway configuration
└── ...
```

**Never commit `.railway/` to git** (it contains project IDs)

---

## ✅ Success Indicators

Your deployment is successful when:

```bash
# Command
railway logs

# Output shows:
✅ [Nest] LOG [NestFactory] Starting Nest application...
✅ [Nest] LOG [InstanceLoader] AppModule dependencies initialized
✅ [Nest] LOG [NestApplication] Nest application successfully started
✅ Application is listening on port 3000

# And your API responds:
curl https://your-app.railway.app/api
# HTTP 200 OK
```

---

## 🎉 You're Deployed!

Your NestJS application is now live on Railway using the CLI!

**Next Steps:**
1. Set up custom domain: `railway domain add yourdomain.com`
2. Configure monitoring
3. Set up staging environment
4. Enable auto-deploy from GitHub

---

## 📞 Need Help?

- Railway CLI docs: https://docs.railway.app/develop/cli
- Railway Discord: https://discord.gg/railway
- Railway Status: https://status.railway.app

---

**Happy deploying! 🚀**
