# ✅ Deployment Checklist

Follow these steps in order:

## 📦 Step 1: Deploy Backend on Railway (15 minutes)

### 1.1 Create Railway Account
- [ ] Go to https://railway.app/
- [ ] Click "Login" → "Login with GitHub"
- [ ] Authorize Railway

### 1.2 Create New Project
- [ ] Click "New Project"
- [ ] Select "Deploy from GitHub repo"
- [ ] Choose "RainSheild" repository
- [ ] Railway will auto-detect the backend

### 1.3 Configure Root Directory
- [ ] Click on the service
- [ ] Go to "Settings" tab
- [ ] Scroll to "Root Directory"
- [ ] Set to: `backend`
- [ ] Click "Update"

### 1.4 Add Environment Variables
- [ ] Go to "Variables" tab
- [ ] Click "New Variable"
- [ ] Copy ALL variables from `DEPLOYMENT_CREDENTIALS.md` (Railway section)
- [ ] Paste them one by one OR use "Raw Editor" to paste all at once
- [ ] **IMPORTANT**: Leave `FRONTEND_URL` as placeholder for now

### 1.5 Deploy
- [ ] Railway will auto-deploy
- [ ] Wait 2-3 minutes for build to complete
- [ ] Check "Deployments" tab for status
- [ ] Once deployed, click "Settings" → "Networking"
- [ ] Copy your Railway URL (e.g., `https://rainshield-production.up.railway.app`)
- [ ] **SAVE THIS URL** - you'll need it for frontend!

### 1.6 Test Backend
- [ ] Open: `https://your-railway-url.up.railway.app/api/umbrellas`
- [ ] You should see JSON data (empty array or umbrellas)
- [ ] If you see data, backend is working! ✅

---

## 🎨 Step 2: Deploy Frontend on Vercel (10 minutes)

### 2.1 Create Vercel Account
- [ ] Go to https://vercel.com/
- [ ] Click "Sign Up" → "Continue with GitHub"
- [ ] Authorize Vercel

### 2.2 Import Project
- [ ] Click "Add New..." → "Project"
- [ ] Find and import "RainSheild" repository
- [ ] Click "Import"

### 2.3 Configure Project
- [ ] Framework Preset: **Create React App** (auto-detected)
- [ ] Root Directory: Click "Edit" → Select `frontend` → Click "Continue"
- [ ] Build Command: `npm run build` (default)
- [ ] Output Directory: `build` (default)

### 2.4 Add Environment Variables
- [ ] Click "Environment Variables" section
- [ ] Copy variables from `DEPLOYMENT_CREDENTIALS.md` (Vercel section)
- [ ] **IMPORTANT**: Replace `your-railway-url` with your actual Railway URL from Step 1.5
- [ ] Example: `REACT_APP_API_URL=https://rainshield-production.up.railway.app/api`
- [ ] Add all 4 variables

### 2.5 Deploy
- [ ] Click "Deploy"
- [ ] Wait 2-3 minutes for build
- [ ] Once deployed, click "Visit" to see your app
- [ ] Copy your Vercel URL (e.g., `https://rain-sheild.vercel.app`)

---

## 🔗 Step 3: Connect Frontend & Backend (5 minutes)

### 3.1 Update Backend CORS
- [ ] Go back to Railway dashboard
- [ ] Click on your backend service
- [ ] Go to "Variables" tab
- [ ] Find `FRONTEND_URL` variable
- [ ] Update it with your Vercel URL (e.g., `https://rain-sheild.vercel.app`)
- [ ] **NO trailing slash!**
- [ ] Click "Update"

### 3.2 Redeploy Backend
- [ ] Railway will auto-redeploy
- [ ] Wait 1-2 minutes
- [ ] Check "Deployments" tab for completion

---

## 🧪 Step 4: Test Your App (10 minutes)

### 4.1 Basic Tests
- [ ] Visit your Vercel URL
- [ ] App loads without errors
- [ ] Splash screen appears
- [ ] Login page loads

### 4.2 Authentication Test
- [ ] Try registering a new account
- [ ] Email: `test@example.com`
- [ ] Password: `password123`
- [ ] Should redirect to dashboard

### 4.3 Wallet Test
- [ ] Click "Wallet" in navbar
- [ ] Try adding ₹300
- [ ] Razorpay popup should appear
- [ ] Use test card: 4111 1111 1111 1111
- [ ] Any future date, any CVV
- [ ] Should show success + cashback

### 4.4 Umbrella Test
- [ ] Click "Umbrellas" in navbar
- [ ] Map should load with umbrella markers
- [ ] Try selecting an umbrella
- [ ] Should be able to rent it

### 4.5 Real-time Test
- [ ] Open app in two browser tabs
- [ ] Make a transaction in one tab
- [ ] Should see live update notification in other tab

---

## 🎉 Step 5: Optional - Seed Database

If you want sample data:

### 5.1 Via Railway Dashboard
- [ ] Go to Railway dashboard
- [ ] Click on backend service
- [ ] Go to "Settings" tab
- [ ] Scroll to "Service"
- [ ] Click "Run Command"
- [ ] Enter: `npm run seed`
- [ ] Click "Run"
- [ ] Wait for completion

### 5.2 Test Credentials
After seeding, you can login with:
- Email: `student1@cu.edu.in`
- Password: `password123`

---

## 🐛 Troubleshooting

### Backend not deploying?
- Check Railway logs: Dashboard → Deployments → Click deployment → View logs
- Common issue: Missing environment variables

### Frontend not loading?
- Check Vercel logs: Dashboard → Deployments → Click deployment → View logs
- Common issue: Wrong `REACT_APP_API_URL`

### CORS errors?
- Make sure `FRONTEND_URL` in Railway matches Vercel URL exactly
- No trailing slash!

### API calls failing?
- Check browser console (F12)
- Verify `REACT_APP_API_URL` ends with `/api`
- Test backend directly: `https://your-railway-url/api/umbrellas`

### Google OAuth not working?
- Go to Google Cloud Console
- Add your Vercel domain to authorized domains
- Credentials → OAuth 2.0 Client IDs → Edit → Add domain

---

## 📝 Save These URLs

After deployment, save these for future reference:

```
Frontend URL: https://_____________________.vercel.app
Backend URL:  https://_____________________.up.railway.app
GitHub Repo:  https://github.com/i-am-sanjaykumar07/RainSheild
```

---

## 🎊 Congratulations!

Your RainShield app is now live and accessible worldwide! 🌍

Share your app URL with friends and start renting umbrellas! ☂️

---

**Need help?** Check `DEPLOYMENT.md` for detailed troubleshooting guide.
