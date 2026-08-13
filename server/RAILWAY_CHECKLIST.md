# ✅ Railway Docker Deployment Checklist

## Pre-Deployment Checklist

### 📁 Files
- [ ] `Dockerfile` exists in server directory
- [ ] `.dockerignore` exists in server directory
- [ ] `railway.json` exists in server directory
- [ ] `dist/` is in `.gitignore`
- [ ] `node_modules/` is in `.gitignore`

### 📝 Configuration
- [ ] `tsconfig.json` has `"outDir": "./dist"`
- [ ] `tsconfig.json` has `"rootDir": "./src"`
- [ ] `package.json` has build script: `"build": "tsc -p tsconfig.json"`
- [ ] `src/main.ts` reads PORT from environment: `process.env.PORT`

### 🔐 Environment Variables (to add in Railway)
- [ ] `MONGODB_URI`
- [ ] `JWT_SECRET`
- [ ] `NODE_ENV=production`
- [ ] `CLOUDINARY_CLOUD_NAME` (if using)
- [ ] `CLOUDINARY_API_KEY` (if using)
- [ ] `CLOUDINARY_API_SECRET` (if using)

---

## Railway Configuration Checklist

### 🏗️ Build Settings
- [ ] Go to Railway → Service → **Settings**
- [ ] Under **Build**, set **Builder** = `Dockerfile`
- [ ] If server is in subdirectory, set **Root Directory** = `server`
- [ ] Save changes

### 🌍 Environment Variables
- [ ] Go to **Variables** tab
- [ ] Add all required environment variables
- [ ] Click **"Add"** for each one
- [ ] Verify they appear in the list

### 🔄 Deployment
- [ ] Click **"Redeploy"** button
- [ ] Or push a new commit to trigger auto-deploy

---

## Post-Deployment Verification

### 🔍 Build Logs
Watch for these indicators:

**✅ Success Indicators:**
```
[1/8] Building with Dockerfile
[2/8] FROM node:20-alpine
[7/8] RUN npm run build
Successfully built
```

**❌ Failure Indicators (means not using Docker):**
```
Using Nixpacks
Installing packages
Running npm install
```

### 🚀 Deploy Logs
Watch for these:

**✅ Success Indicators:**
```
[Nest] LOG [NestFactory] Starting Nest application...
[Nest] LOG [InstanceLoader] AppModule dependencies initialized
[Nest] LOG [NestApplication] Nest application successfully started
Application is listening on port XXXX
```

**❌ Failure Indicators:**
```
Error: Cannot find module '/app/dist/main.js'
Error: connect ECONNREFUSED (MongoDB connection failed)
Error: JWT_SECRET is not defined
```

### 🌐 API Testing
- [ ] Railway provides a public URL (e.g., `https://your-app.up.railway.app`)
- [ ] Test root endpoint: `curl https://your-app.up.railway.app/api`
- [ ] Test health endpoint (if you have one)
- [ ] Test a protected endpoint (should return 401 if not authenticated)

---

## Troubleshooting Checklist

### If "Still using Nixpacks":
- [ ] Check `railway.json` exists and is committed
- [ ] Check `railway.json` has `"builder": "DOCKERFILE"`
- [ ] Manually verify Builder setting in Railway Settings → Build
- [ ] Delete `nixpacks.toml` if it exists
- [ ] Trigger a fresh redeploy

### If "Cannot find module /app/dist/main.js":
- [ ] Verify Dockerfile CMD line: `CMD ["node", "dist/main.js"]`
- [ ] Check Railway is using Docker (not Nixpacks)
- [ ] Run `npm run build` locally to verify TypeScript compiles
- [ ] Check build logs for compilation errors
- [ ] Verify `tsconfig.json` paths are correct

### If "Container crashes on startup":
- [ ] Check all environment variables are set in Railway
- [ ] Verify `MONGODB_URI` is correct format
- [ ] Check deploy logs for actual error message
- [ ] Verify `PORT` is read from environment in `main.ts`
- [ ] Check database firewall allows Railway IPs

### If "Build takes forever":
- [ ] Verify `.dockerignore` is working (check build context size)
- [ ] Ensure `node_modules` is excluded
- [ ] Check Railway build logs for stuck stage
- [ ] Try triggering a fresh redeploy

---

## Final Verification

### ✅ Everything is working if:
- [ ] Build completes in 2-4 minutes (or faster with cache)
- [ ] Deploy logs show "successfully started"
- [ ] API responds to HTTP requests
- [ ] No crashes in deploy logs for 5+ minutes
- [ ] Database operations work (if tested)
- [ ] File uploads work (if using Cloudinary)

---

## 📊 Health Check

Create a simple health endpoint to verify:

```typescript
// src/app.controller.ts
@Get('/health')
healthCheck() {
  return {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
  };
}
```

Test it: `curl https://your-app.railway.app/health`

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2026-08-13T00:00:00.000Z",
  "uptime": 123.456,
  "environment": "production"
}
```

---

## 🎉 Success!

If all checks pass, your NestJS application is successfully deployed on Railway using Docker!

**Next steps:**
1. Set up monitoring
2. Configure auto-scaling (if needed)
3. Set up custom domain
4. Enable logging/error tracking
5. Set up CI/CD pipeline

---

**Last Updated:** August 2026
**Railway Builder:** Dockerfile
**Node Version:** 20 (Alpine)
**Build Type:** Multi-stage production build
