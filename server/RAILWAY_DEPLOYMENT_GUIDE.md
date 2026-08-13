# 🚂 Railway Deployment Guide for NestJS Application

## 📋 Overview

This guide ensures Railway uses your **Dockerfile** (not Nixpacks) to build and deploy your NestJS application successfully.

---

## ✅ Files Created/Updated

### 1. **Dockerfile** ✨ NEW/UPDATED
Multi-stage production-ready Dockerfile that:
- ✅ Uses Node.js 20 Alpine (lightweight)
- ✅ Installs build dependencies for native modules (bcrypt)
- ✅ Builds TypeScript in Stage 1
- ✅ Creates production-only image in Stage 2
- ✅ Runs as non-root user (security best practice)
- ✅ Uses dumb-init for proper signal handling
- ✅ Correctly outputs to `dist/main.js`

### 2. **.dockerignore** ✨ NEW
Prevents copying unnecessary files to Docker context:
- ✅ Excludes `node_modules` (installed fresh in container)
- ✅ Excludes `dist` (built fresh in container)
- ✅ Excludes `.env` files (use Railway environment variables)
- ✅ Excludes IDE, git, and test files
- ✅ Reduces build context size significantly

### 3. **railway.json** ✨ UPDATED
Forces Railway to use Docker builder:
```json
{
  "build": {
    "builder": "DOCKERFILE",
    "dockerfilePath": "Dockerfile"
  }
}
```

---

## 🚀 Step-by-Step Railway Deployment Instructions

### **Step 1: Verify Local Setup**

Before deploying, test the Docker build locally:

```bash
# Navigate to server directory
cd server

# Build the Docker image
docker build -t nestjs-app .

# Run the container (test locally)
docker run -p 3000:3000 \
  -e MONGODB_URI="your_mongodb_uri" \
  -e JWT_SECRET="your_jwt_secret" \
  nestjs-app
```

If this works locally, it will work on Railway! ✅

---

### **Step 2: Prepare Your Repository**

Make sure these files exist in your `server/` directory:

```
server/
├── Dockerfile          ✅ (Created)
├── .dockerignore       ✅ (Created)
├── railway.json        ✅ (Updated)
├── package.json
├── tsconfig.json
├── nest-cli.json
└── src/
    └── main.ts
```

**Important:** Make sure `dist/` is in `.gitignore`:
```bash
# Check .gitignore contains:
node_modules
dist
.env
```

---

### **Step 3: Commit and Push Changes**

```bash
# Add all files
git add .

# Commit with clear message
git commit -m "feat: add production Dockerfile for Railway deployment"

# Push to your repository
git push origin main
```

---

### **Step 4: Configure Railway Project**

#### **Option A: New Deployment**

1. Go to [Railway.app](https://railway.app)
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Choose your repository
5. Railway will automatically detect the **Dockerfile**

#### **Option B: Existing Project**

1. Go to your Railway project dashboard
2. Click on your service
3. Go to **Settings** → **Build**
4. Verify **Builder** is set to **"Dockerfile"**
5. If not, change it from **"Nixpacks"** to **"Dockerfile"**
6. Click **"Save"**

---

### **Step 5: Set Root Directory (If Needed)**

If your server is in a subdirectory (like `server/`):

1. Go to **Settings** → **General**
2. Set **Root Directory** to `server`
3. Click **"Save"**

Railway will now look for `Dockerfile` inside the `server/` directory.

---

### **Step 6: Configure Environment Variables**

Click on **Variables** and add:

```env
# Required
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/dbname
JWT_SECRET=your-super-secret-jwt-key-here

# Cloudinary (if using file uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Optional (Railway provides PORT automatically)
PORT=${{PORT}}
NODE_ENV=production
```

**Note:** Railway automatically provides the `PORT` variable. Your NestJS app should read it:

```typescript
// src/main.ts
const port = process.env.PORT || 5000;
await app.listen(port);
```

---

### **Step 7: Deploy! 🎉**

Railway will automatically:

1. ✅ Detect the `Dockerfile`
2. ✅ Build Stage 1 (install deps + build TypeScript)
3. ✅ Build Stage 2 (production image)
4. ✅ Run `node dist/main.js`
5. ✅ Assign a public URL

**Watch the build logs:**
- Click on your deployment
- Go to **"Deployments"**
- Click on the latest deployment
- Watch **"Build Logs"** and **"Deploy Logs"**

---

## 🔍 Troubleshooting

### ❌ Problem: Railway still uses Nixpacks

**Solution:**
1. Delete `nixpacks.toml` if it exists
2. Ensure `railway.json` has:
   ```json
   {
     "build": {
       "builder": "DOCKERFILE"
     }
   }
   ```
3. Trigger a redeploy

---

### ❌ Problem: "Cannot find module '/app/dist/main.js'"

**Root Causes:**
1. **Dockerfile is not being used** → Force Docker builder in `railway.json`
2. **Build stage failed silently** → Check build logs for TypeScript errors
3. **Wrong path in CMD** → Verify it's `CMD ["node", "dist/main.js"]` (not `dist/src/main.js`)

**Solution:**
1. Check Railway build logs for errors
2. Verify TypeScript compiles locally: `npm run build`
3. Check `dist/` directory contains `main.js`
4. Ensure `tsconfig.json` has:
   ```json
   {
     "compilerOptions": {
       "outDir": "./dist",
       "rootDir": "./src"
     }
   }
   ```

---

### ❌ Problem: Build takes too long or fails

**Solution:**
1. Check `.dockerignore` is working (shouldn't copy `node_modules`)
2. Verify native modules build successfully
3. Try building locally first: `docker build .`

---

### ❌ Problem: Container crashes on startup

**Check these:**
1. ✅ Environment variables are set (especially `MONGODB_URI`)
2. ✅ MongoDB connection string is correct
3. ✅ Port is read from environment: `process.env.PORT`
4. ✅ Check Railway deploy logs for error messages

---

## 📊 Verify Successful Deployment

### Expected Build Output:
```
#1 [builder 1/8] FROM docker.io/library/node:20-alpine
#2 [builder 2/8] WORKDIR /app
#3 [builder 3/8] COPY package*.json ./
#4 [builder 4/8] RUN npm ci
#5 [builder 5/8] COPY tsconfig*.json ./
#6 [builder 6/8] COPY src ./src
#7 [builder 7/8] RUN npm run build
#8 [builder 8/8] RUN npm prune --production
#9 [production 1/5] FROM docker.io/library/node:20-alpine
#10 [production 2/5] COPY --from=builder /app/node_modules ./node_modules
#11 [production 3/5] COPY --from=builder /app/dist ./dist
✅ Successfully built
```

### Expected Deploy Logs:
```
[Nest] LOG [NestFactory] Starting Nest application...
[Nest] LOG [InstanceLoader] AppModule dependencies initialized
[Nest] LOG [InstanceLoader] MongooseCoreModule dependencies initialized
[Nest] LOG [RoutesResolver] AuthController {/api/auth}
[Nest] LOG [RoutesResolver] UsersController {/api/users}
[Nest] LOG [RoutesResolver] ProductsController {/api/products}
[Nest] LOG [NestApplication] Nest application successfully started
✅ Application is listening on port 3000
```

### Test Your API:
```bash
# Replace with your Railway URL
curl https://your-app.up.railway.app/api/auth/login

# Should return 401 or prompt for credentials (not 404)
```

---

## 🎯 Best Practices Implemented

✅ **Multi-stage build** - Smaller final image (~150MB vs ~1GB)
✅ **Layer caching** - Faster rebuilds (only rebuilds changed layers)
✅ **Non-root user** - Security best practice
✅ **Production dependencies only** - Smaller image, faster startup
✅ **Signal handling** - Graceful shutdowns with dumb-init
✅ **Alpine Linux** - Minimal attack surface
✅ **Optimized .dockerignore** - Faster builds, smaller context

---

## 🔄 Redeployment

### Manual Redeploy:
1. Go to Railway dashboard
2. Click your service
3. Click **"Redeploy"**

### Automatic Redeploy (on git push):
Railway automatically redeploys when you push to your connected branch.

---

## 📝 Additional Resources

- [Railway Dockerfile Docs](https://docs.railway.app/deploy/dockerfiles)
- [NestJS Deployment Docs](https://docs.nestjs.com/deployment)
- [Docker Multi-stage Builds](https://docs.docker.com/build/building/multi-stage/)

---

## ✅ Success Checklist

Before going to production, verify:

- [ ] Dockerfile builds successfully locally
- [ ] `.dockerignore` excludes `node_modules` and `dist`
- [ ] `railway.json` forces Docker builder
- [ ] All environment variables are set in Railway
- [ ] TypeScript compiles without errors (`npm run build`)
- [ ] Database connection string is correct
- [ ] Application starts and responds to health checks
- [ ] API endpoints return expected responses
- [ ] WebSocket connections work (if applicable)

---

**🎉 Your NestJS application should now deploy successfully on Railway using Docker!**

If you encounter any issues not covered here, check the Railway deploy logs for specific error messages.
