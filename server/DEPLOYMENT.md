# Server Deployment Guide

## ✅ Fixed Issues

### Problem
The container was failing with:
```
Error: Cannot find module '/app/dist/src/main.js'
code: 'MODULE_NOT_FOUND'
```

### Root Causes & Solutions

1. **Module System Mismatch** ✅ FIXED
   - Removed `"type": "module"` from `package.json`
   - TypeScript compiles to CommonJS (as per `tsconfig.json`)

2. **Incorrect File Path** ✅ FIXED
   - Changed from: `dist/src/main.js`
   - Changed to: `dist/main.js`
   - The TypeScript config has `rootDir: "./src"` and `outDir: "./dist"`, which puts compiled files directly in `dist/`, NOT `dist/src/`

## Build Process

### Local Build
```bash
npm install
npm run build
node dist/main.js
```

### Development
```bash
npm run start:dev
```

## Deployment Configuration

### Files Created/Updated

1. **`package.json`**
   - Removed `"type": "module"`
   - Updated start scripts to use correct path: `dist/main.js`

2. **`railway.json`**
   - Build command: `npm install && npm run build`
   - Start command: `node dist/main.js`

3. **`nixpacks.toml`** (NEW)
   - Explicit build instructions for Nixpacks
   - Ensures proper Node.js version
   - Separates install, build, and start phases

4. **`.npmrc`** (NEW)
   - npm configuration for deployment

## Verification

✅ TypeScript compiles without errors
✅ Output directory structure:
```
dist/
├── main.js
├── main.d.ts
├── app.module.js
├── auth/
├── products/
├── orders/
└── ...
```

✅ Server starts successfully with `node dist/main.js`
✅ All NestJS modules load correctly
✅ All API routes are registered

## Environment Variables Required

Make sure these are set in your deployment environment:
- `MONGODB_URI`
- `JWT_SECRET`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `PORT` (optional, defaults to 5000)

## Deployment Steps

1. **Commit all changes**:
   ```bash
   git add .
   git commit -m "fix: correct build output path and module system"
   git push
   ```

2. **Railway will automatically**:
   - Run `npm install`
   - Run `npm run build` (compiles TypeScript)
   - Start with `node dist/main.js`

3. **Verify deployment**:
   - Check Railway logs for successful startup
   - Test API endpoint: `https://your-app.railway.app/api/auth/login`

## Troubleshooting

### If build fails
- Check Railway build logs
- Verify all dependencies are in `dependencies` (not `devDependencies`)
- Ensure TypeScript and build tools are available

### If startup fails
- Verify environment variables are set
- Check MongoDB connection string
- Review Railway startup logs

## Success Indicators

When deployment is successful, you should see in logs:
```
[Nest] LOG [NestFactory] Starting Nest application...
[Nest] LOG [InstanceLoader] AppModule dependencies initialized
[Nest] LOG [MongooseCoreModule] dependencies initialized
[Nest] LOG [NestApplication] Nest application successfully started
```

## Next Steps After Successful Deployment

1. Test all API endpoints
2. Verify database connection
3. Test file upload (Cloudinary)
4. Verify WebSocket gateway (notifications)
5. Test authentication flows
