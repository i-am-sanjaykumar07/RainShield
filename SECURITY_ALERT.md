# 🔐 Security Alert - Action Required

## ⚠️ GitHub Detected Secrets in Your Repository

GitHub's secret scanning found exposed credentials. I've fixed the code, but you need to **rotate these credentials immediately**.

---

## 🚨 Exposed Secrets (Now Fixed in Code)

### 1. Google Maps API Key
- **Location**: `frontend/public/index.html`
- **Status**: ✅ Removed from code
- **Action Required**: Rotate the key

### 2. MongoDB Atlas URI
- **Location**: `backend/testSeed.js`
- **Status**: ✅ Removed from code
- **Action Required**: Change password

---

## 🔧 What I Fixed

### ✅ Removed Hardcoded Secrets
1. **Google Maps API**: Now loaded dynamically via environment variable
2. **MongoDB URI**: Now uses environment variable in testSeed.js

### ✅ Created Dynamic Loader
- New file: `frontend/src/utils/loadGoogleMaps.js`
- Loads Google Maps API securely from environment variable
- No more hardcoded API keys in HTML

---

## 🔄 Required Actions - Do This NOW!

### Step 1: Rotate Google Maps API Key (5 minutes)

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/
   - Navigate to: APIs & Services → Credentials

2. **Create New API Key**
   - Click "Create Credentials" → "API Key"
   - Copy the new key
   - Click "Restrict Key"
   - Set Application restrictions: "HTTP referrers"
   - Add your domains:
     - `localhost:3000/*` (for development)
     - `your-vercel-domain.vercel.app/*` (for production)
   - Set API restrictions: "Maps JavaScript API"
   - Save

3. **Delete Old API Key**
   - Find the old key: `AIzaSyDeZP1fgOTHd21-N0vB5ByiWf33MbwKKqk`
   - Click the trash icon to delete it
   - Confirm deletion

4. **Update Your Environment Files**
   - Update `frontend/.env`:
     ```
     REACT_APP_GOOGLE_MAPS_API_KEY=your_new_api_key_here
     ```
   - Update `DEPLOYMENT_CREDENTIALS.md` with new key
   - If already deployed on Vercel, update the environment variable there

---

### Step 2: Change MongoDB Password (5 minutes)

1. **Go to MongoDB Atlas**
   - Visit: https://cloud.mongodb.com/
   - Sign in to your account

2. **Change Database User Password**
   - Click "Database Access" in left sidebar
   - Find user: `sanjay_URS` or `palisettysanjaykumar_db_user`
   - Click "Edit"
   - Click "Edit Password"
   - Generate a new strong password (use "Autogenerate Secure Password")
   - Copy the new password
   - Click "Update User"

3. **Update Connection String**
   - Go to "Database" → Click "Connect"
   - Choose "Connect your application"
   - Copy the new connection string
   - Replace `<password>` with your new password

4. **Update Your Environment Files**
   - Update `backend/.env`:
     ```
     MONGODB_URI=mongodb+srv://username:NEW_PASSWORD@cluster.mongodb.net/demo?retryWrites=true&w=majority
     ```
   - Replace `username` with your MongoDB username
   - Replace `NEW_PASSWORD` with your new password
   - Replace `cluster` with your cluster name
   - Update `DEPLOYMENT_CREDENTIALS.md` with new URI
   - If already deployed on Railway, update the environment variable there

---

### Step 3: Clean Git History (10 minutes)

The secrets are still in your Git history. We need to remove them:

#### Option A: Use BFG Repo-Cleaner (Recommended)

1. **Download BFG**
   - Visit: https://rtyley.github.io/bfg-repo-cleaner/
   - Download `bfg.jar`

2. **Create a file with secrets to remove**
   Create `secrets.txt`:
   ```
   AIzaSyDeZP1fgOTHd21-N0vB5ByiWf33MbwKKqk
   StPcfumQIOvDAEtS
   s6GPdmOMYxs8AJlR
   ```

3. **Run BFG**
   ```bash
   cd D:\CODING\RainSheild
   java -jar bfg.jar --replace-text secrets.txt
   git reflog expire --expire=now --all
   git gc --prune=now --aggressive
   ```

4. **Force push**
   ```bash
   git push origin main --force
   ```

#### Option B: Delete and Recreate Repository (Easier)

1. **Create a new empty repository on GitHub**
   - Name it: `RainShield-Clean` (or similar)

2. **Remove old remote and add new one**
   ```bash
   cd D:\CODING\RainSheild
   git remote remove origin
   git remote add origin https://github.com/i-am-sanjaykumar07/RainShield-Clean.git
   ```

3. **Push to new repository**
   ```bash
   git push -u origin main
   ```

4. **Delete old repository**
   - Go to: https://github.com/i-am-sanjaykumar07/RainSheild/settings
   - Scroll to "Danger Zone"
   - Click "Delete this repository"
   - Follow the prompts

---

### Step 4: Dismiss GitHub Alerts (2 minutes)

After rotating credentials:

1. **Go to GitHub Repository**
   - Visit: https://github.com/i-am-sanjaykumar07/RainSheild/security

2. **Review Each Alert**
   - Click on each secret alert
   - Click "Dismiss alert"
   - Select reason: "Revoked"
   - Add comment: "Credential rotated and removed from code"
   - Click "Dismiss alert"

---

## 🛡️ Prevention - Never Commit Secrets Again

### ✅ What's Already Protected

1. **`.gitignore` files** - Prevent `.env` files from being committed
2. **Environment variables** - All secrets now use env vars
3. **Dynamic loading** - Google Maps loaded at runtime

### 🔍 Before Every Commit

Run this command to check for secrets:
```bash
git diff --cached
```

Look for:
- API keys
- Passwords
- Connection strings
- Tokens
- Any string that looks like a credential

### 🚫 Never Commit These

- `.env` files
- API keys in code
- Database passwords
- OAuth secrets
- Private keys
- Access tokens

---

## ✅ Verification Checklist

After completing all steps:

- [ ] New Google Maps API key created
- [ ] Old Google Maps API key deleted
- [ ] MongoDB password changed
- [ ] All `.env` files updated with new credentials
- [ ] `DEPLOYMENT_CREDENTIALS.md` updated
- [ ] If deployed: Railway environment variables updated
- [ ] If deployed: Vercel environment variables updated
- [ ] Git history cleaned (Option A or B)
- [ ] GitHub security alerts dismissed
- [ ] Tested app with new credentials

---

## 🧪 Test After Rotation

1. **Test Locally**
   ```bash
   cd backend
   npm start
   
   # In another terminal
   cd frontend
   npm start
   ```
   - Try logging in
   - Check if maps load
   - Test database connection

2. **Test Production** (if deployed)
   - Visit your Vercel URL
   - Check if everything works
   - Monitor Railway logs for errors

---

## 📚 Learn More

- [GitHub Secret Scanning](https://docs.github.com/en/code-security/secret-scanning)
- [Best Practices for API Keys](https://cloud.google.com/docs/authentication/api-keys)
- [MongoDB Security Checklist](https://www.mongodb.com/docs/manual/administration/security-checklist/)

---

## 🆘 Need Help?

If you encounter issues:
1. Check Railway/Vercel logs
2. Verify environment variables are correct
3. Make sure no trailing spaces in credentials
4. Test each service individually

---

**⚠️ IMPORTANT**: Do not skip credential rotation! Exposed secrets can be used by anyone who has access to your GitHub repository history.

**Act now to secure your application!** 🔒
