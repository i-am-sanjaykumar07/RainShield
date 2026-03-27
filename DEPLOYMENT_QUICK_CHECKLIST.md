# ✅ Deployment Quick Checklist

Print this and check off as you go!

---

## 🔴 PART 1: Railway Backend (15 min)

### Setup Railway
- [ ] Go to https://railway.app/
- [ ] Login with GitHub
- [ ] Authorize Railway

### Create Project
- [ ] Click "New Project"
- [ ] Select "Deploy from GitHub repo"
- [ ] Choose "RainSheild" repository

### Configure Backend
- [ ] Click on service → Settings
- [ ] Set Root Directory: `backend`
- [ ] Click Update

### Add Environment Variables
- [ ] Go to Variables tab
- [ ] Click "Raw Editor"
- [ ] Copy from `DEPLOYMENT_CREDENTIALS.md`
- [ ] Paste all variables
- [ ] Leave `FRONTEND_URL` as placeholder
- [ ] Click "Update Variables"

### Get Backend URL
- [ ] Wait for deployment (2-3 min)
- [ ] Go to Settings → Networking
- [ ] Click "Generate Domain"
- [ ] Copy URL: `https://______________.up.railway.app`
- [ ] Test: Open `https://your-url/api/umbrellas`
- [ ] Should see `[]` or JSON data ✅

---

## 🔵 PART 2: Vercel Frontend (10 min)

### Setup Vercel
- [ ] Go to https://vercel.com/
- [ ] Sign up with GitHub
- [ ] Authorize Vercel

### Import Project
- [ ] Click "Add New..." → "Project"
- [ ] Find "RainSheild"
- [ ] Click "Import"

### Configure Frontend
- [ ] Framework: Create React App (auto-detected)
- [ ] Root Directory: Click Edit → Select `frontend`
- [ ] Click "Continue"

### Add Environment Variables
- [ ] Expand "Environment Variables"
- [ ] Add Variable 1:
  - Name: `REACT_APP_API_URL`
  - Value: `https://YOUR-RAILWAY-URL.up.railway.app/api`
  - ⚠️ Replace with your Railway URL!
  - ⚠️ Must end with `/api`
- [ ] Add Variable 2:
  - Name: `REACT_APP_RAZORPAY_KEY_ID`
  - Value: (from DEPLOYMENT_CREDENTIALS.md)
- [ ] Add Variable 3:
  - Name: `REACT_APP_GOOGLE_MAPS_API_KEY`
  - Value: (from DEPLOYMENT_CREDENTIALS.md)
- [ ] Add Variable 4:
  - Name: `REACT_APP_GOOGLE_CLIENT_ID`
  - Value: (from DEPLOYMENT_CREDENTIALS.md)

### Deploy Frontend
- [ ] Click "Deploy"
- [ ] Wait for build (2-3 min)
- [ ] Copy URL: `https://______________.vercel.app`
- [ ] Click "Visit" to test

---

## 🟢 PART 3: Connect Them (5 min)

### Update Backend CORS
- [ ] Go back to Railway dashboard
- [ ] Click on backend service
- [ ] Go to Variables tab
- [ ] Find `FRONTEND_URL`
- [ ] Click Edit
- [ ] Replace with your Vercel URL
- [ ] Example: `https://rain-sheild.vercel.app`
- [ ] ⚠️ NO trailing slash!
- [ ] Click "Update"
- [ ] Wait for redeploy (1-2 min)

---

## 🧪 PART 4: Test Everything (10 min)

### Basic Tests
- [ ] Visit your Vercel URL
- [ ] App loads without errors
- [ ] Splash screen appears
- [ ] Login page loads

### Authentication
- [ ] Register new account
- [ ] Email: `test@example.com`
- [ ] Password: `password123`
- [ ] Should redirect to dashboard

### Wallet
- [ ] Click "Wallet"
- [ ] Add ₹300
- [ ] Razorpay popup appears
- [ ] Test card: `4111 1111 1111 1111`
- [ ] Should show ₹400 (with cashback)

### Umbrellas
- [ ] Click "Umbrellas"
- [ ] Map loads with markers
- [ ] Can select umbrellas
- [ ] Can rent umbrella

### Rental
- [ ] Active rental shows
- [ ] Timer is running
- [ ] Can pay & unlock
- [ ] Can drop off

---

## 📝 Save Your URLs

```
Frontend: https://_________________________________.vercel.app
Backend:  https://_________________________________.up.railway.app
```

---

## 🎉 Done!

If all checkboxes are checked, your app is live! 🚀

---

## ❌ If Something Failed

Check `STEP_BY_STEP_DEPLOYMENT.md` for:
- Detailed instructions
- Troubleshooting section
- Common error solutions

---

**Total Time: ~30 minutes**

**Need help?** Read the full guide in `STEP_BY_STEP_DEPLOYMENT.md`
