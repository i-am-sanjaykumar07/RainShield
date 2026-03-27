# 🚨 URGENT: Security Fix Required

## ⚡ Quick Action (Do This First - 10 Minutes)

I've removed the hardcoded secrets from your code, but you need to **rotate the credentials immediately** because they're still in Git history.

---

## 🔴 Step 1: Rotate Google Maps API Key (5 min)

### Quick Steps:
1. Go to: https://console.cloud.google.com/apis/credentials
2. Click "Create Credentials" → "API Key"
3. Copy the NEW key
4. Delete the OLD key: `AIzaSyDeZP1fgOTHd21-N0vB5ByiWf33MbwKKqk`
5. Update `frontend/.env`:
   ```
   REACT_APP_GOOGLE_MAPS_API_KEY=your_new_key_here
   ```

---

## 🔴 Step 2: Change MongoDB Password (5 min)

### Quick Steps:
1. Go to: https://cloud.mongodb.com/
2. Click "Database Access"
3. Edit your user → "Edit Password"
4. Generate new password → Copy it
5. Update `backend/.env`:
   ```
   MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_NEW_PASSWORD@YOUR_CLUSTER.mongodb.net/YOUR_DATABASE?retryWrites=true&w=majority
   ```

---

## 🔴 Step 3: Update Deployed Apps (if applicable)

### If you already deployed:

**Railway (Backend):**
1. Go to Railway dashboard
2. Click your project → Variables
3. Update `MONGODB_URI` with new connection string
4. Redeploy

**Vercel (Frontend):**
1. Go to Vercel dashboard
2. Click your project → Settings → Environment Variables
3. Update `REACT_APP_GOOGLE_MAPS_API_KEY` with new key
4. Redeploy

---

## ✅ What I Already Fixed

✅ Removed Google Maps API key from `index.html`
✅ Removed MongoDB URI from `testSeed.js`
✅ Created dynamic Google Maps loader
✅ Updated code to use environment variables only
✅ Pushed fixes to GitHub

---

## 📋 After Rotating Credentials

1. Test your app locally to make sure it works
2. Read `SECURITY_ALERT.md` for detailed instructions
3. Consider cleaning Git history (see `SECURITY_ALERT.md`)
4. Dismiss GitHub security alerts after rotation

---

## 🆘 Why This Matters

Anyone with access to your GitHub repository can:
- ❌ Use your Google Maps API (costs you money)
- ❌ Access your MongoDB database (steal/delete data)
- ❌ Impersonate your application

**Rotate credentials NOW to prevent unauthorized access!**

---

## ✅ Quick Verification

After rotating, test:
```bash
# Backend
cd backend
npm start
# Should connect to MongoDB successfully

# Frontend
cd frontend
npm start
# Maps should load correctly
```

---

**Need detailed instructions?** Read `SECURITY_ALERT.md`

**Questions?** Check the troubleshooting section in `SECURITY_ALERT.md`
