# 🚀 Vercel Setup Instructions

## Step 1: Update Environment Variables in Vercel

### Option A: Via Vercel Dashboard (Easiest) 👈 RECOMMENDED

1. **Go to Vercel Dashboard:**
   - Visit: https://vercel.com/dashboard
   - Or run: `vercel open` in terminal

2. **Select Your Project:**
   - Click on: **createecommercesoketio**

3. **Navigate to Settings:**
   - Click **"Settings"** tab
   - Click **"Environment Variables"** in left sidebar

4. **Add/Update These Variables:**

   **Variable 1:**
   ```
   Name: NEXT_PUBLIC_API_URL
   Value: https://modrenecommercewebsite-production-420c.up.railway.app/api
   ```
   ✅ Check: Production, Preview, Development

   **Variable 2:**
   ```
   Name: NEXT_PUBLIC_SOCKET_URL
   Value: https://modrenecommercewebsite-production-420c.up.railway.app
   ```
   ✅ Check: Production, Preview, Development

   **Variable 3:**
   ```
   Name: NEXT_PUBLIC_BUILDER_API_KEY
   Value: cfafc23d05d54541bbe4d5d72561b98f
   ```
   ✅ Check: Production, Preview, Development

5. **Save:**
   - Click **"Save"** for each variable

---

### Option B: Via Vercel CLI (Alternative)

```powershell
# Navigate to client directory
cd c:\Users\star\Desktop\Projects\week6\day2\client

# Login to Vercel (if not already)
vercel login

# Link to your project
vercel link

# Add environment variables
vercel env add NEXT_PUBLIC_API_URL production
# When prompted, paste: https://modrenecommercewebsite-production-420c.up.railway.app/api

vercel env add NEXT_PUBLIC_SOCKET_URL production
# When prompted, paste: https://modrenecommercewebsite-production-420c.up.railway.app

vercel env add NEXT_PUBLIC_BUILDER_API_KEY production
# When prompted, paste: cfafc23d05d54541bbe4d5d72561b98f
```

---

## Step 2: Redeploy Your Frontend

### Option A: Git Push (Triggers Auto-Deploy)

```powershell
cd c:\Users\star\Desktop\Projects\week6\day2\client

# Stage changes
git add .

# Commit
git commit -m "feat: update production environment variables"

# Push (triggers auto-deploy)
git push
```

Vercel will automatically:
- Detect the push
- Build your Next.js app with new environment variables
- Deploy to production

---

### Option B: Manual Deploy via Vercel Dashboard

1. Go to: https://vercel.com/dashboard
2. Select project: **createecommercesoketio**
3. Go to **"Deployments"** tab
4. Click **"Redeploy"** on the latest deployment
5. Select **"Use existing Build Cache"** or rebuild fresh
6. Click **"Redeploy"**

---

### Option C: Deploy via Vercel CLI

```powershell
cd c:\Users\star\Desktop\Projects\week6\day2\client

# Deploy to production
vercel --prod
```

---

## Step 3: Verify Deployment

### Wait for Build to Complete:
- Go to Vercel dashboard
- Watch the deployment progress
- Wait for ✅ **"Ready"** status

### Test Your Frontend:
```powershell
# Open in browser
Start-Process "https://createecommercesoketio.vercel.app"
```

### Check Browser Console:
1. Open Developer Tools (F12)
2. Go to **Console** tab
3. Look for errors
4. Should NOT see:
   - ❌ CORS errors
   - ❌ Failed to fetch errors
   - ❌ WebSocket connection errors

### Test Full Flow:
1. ✅ Register new account
2. ✅ Login
3. ✅ Browse products
4. ✅ Add to cart
5. ✅ Checkout
6. ✅ Receive notifications (WebSocket)

---

## 🔍 Troubleshooting

### Issue: Environment variables not applied
**Solution:**
- Make sure you selected **"Production"** when adding variables
- Redeploy after adding variables
- Clear build cache and redeploy

### Issue: CORS errors in browser console
**Solution:**
1. Check Railway backend logs: `railway logs`
2. Verify CLIENT_URL in Railway: `railway variables`
3. Should be: `https://createecommercesoketio.vercel.app`
4. If wrong, update: `railway variables set CLIENT_URL="https://createecommercesoketio.vercel.app"`
5. Redeploy backend: `railway up --detach`

### Issue: API calls failing (404 or network error)
**Solution:**
1. Check `NEXT_PUBLIC_API_URL` in Vercel
2. Should end with `/api`
3. Test backend: `curl https://modrenecommercewebsite-production-420c.up.railway.app/api`
4. Should return response (not 404)

### Issue: WebSocket not connecting
**Solution:**
1. Check `NEXT_PUBLIC_SOCKET_URL` in Vercel
2. Should NOT have `/api` at the end
3. Check Railway logs for WebSocket errors
4. Verify Railway is listening on `0.0.0.0` (already configured)

---

## ✅ Success Indicators

### Vercel Build Logs:
```
✅ Installing dependencies...
✅ Building application...
✅ Uploading build outputs...
✅ Deployment Ready
```

### Browser Console (No Errors):
```
✅ Connected to Socket.io server
✅ User authenticated
✅ Products loaded
```

### Network Tab (Successful API Calls):
```
✅ GET /api/products - 200 OK
✅ POST /api/auth/login - 200 OK
✅ WebSocket connection established
```

---

## 📊 Environment Variables Summary

| Variable | Value | Purpose |
|----------|-------|---------|
| `NEXT_PUBLIC_API_URL` | `https://modrenecommercewebsite-production-420c.up.railway.app/api` | Backend REST API |
| `NEXT_PUBLIC_SOCKET_URL` | `https://modrenecommercewebsite-production-420c.up.railway.app` | WebSocket connection |
| `NEXT_PUBLIC_BUILDER_API_KEY` | `cfafc23d05d54541bbe4d5d72561b98f` | Builder.io CMS |

---

## 🎯 Quick Commands

### Check Vercel Deployment Status:
```powershell
vercel ls
```

### View Latest Deployment Logs:
```powershell
vercel logs
```

### Open Vercel Dashboard:
```powershell
vercel open
```

### Deploy to Production:
```powershell
vercel --prod
```

---

## 🎉 You're Done!

After completing these steps:
- ✅ Frontend (Vercel) connected to Backend (Railway)
- ✅ WebSocket notifications working
- ✅ CORS properly configured
- ✅ All API calls working
- ✅ Full production deployment complete!

**Test your live app:** https://createecommercesoketio.vercel.app

---

**Happy Deploying! 🚀**
