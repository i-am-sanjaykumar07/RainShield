# 🚀 Deployment Guide

## Backend Deployment on Railway

### Step 1: Create Railway Account
1. Go to [Railway.app](https://railway.app/)
2. Sign up with GitHub account
3. Authorize Railway to access your repositories

### Step 2: Create New Project
1. Click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Choose **`RainSheild`** repository
4. Select **`backend`** folder as root directory

### Step 3: Configure Environment Variables
In Railway dashboard, go to **Variables** tab and add:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string_here
JWT_SECRET=your_jwt_secret_key_min_32_chars
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
GOOGLE_CLIENT_ID=your_google_oauth_client_id
GOOGLE_CLIENT_SECRET=your_google_oauth_client_secret
NODE_ENV=production
FRONTEND_URL=https://your-frontend-url.vercel.app
```

**Note:** Copy these values from your `backend/.env` file (not committed to Git)

**Important:** Update `FRONTEND_URL` after deploying frontend!

### Step 4: Configure Build Settings
Railway should auto-detect Node.js. If not:
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Root Directory**: `backend`

### Step 5: Deploy
1. Click **"Deploy"**
2. Wait for build to complete
3. Copy your backend URL (e.g., `https://rainshield-backend.up.railway.app`)

### Step 6: Seed Database (Optional)
In Railway dashboard:
1. Go to **Settings** → **Service**
2. Click **"Run Command"**
3. Enter: `npm run seed`
4. Click **"Run"**

---

## Frontend Deployment on Vercel

### Step 1: Create Vercel Account
1. Go to [Vercel.com](https://vercel.com/)
2. Sign up with GitHub account
3. Authorize Vercel to access your repositories

### Step 2: Import Project
1. Click **"Add New..."** → **"Project"**
2. Import **`RainSheild`** repository
3. Configure project:
   - **Framework Preset**: Create React App
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`

### Step 3: Configure Environment Variables
In Vercel project settings, add these environment variables:

```env
REACT_APP_API_URL=https://your-railway-backend-url.up.railway.app/api
REACT_APP_RAZORPAY_KEY_ID=your_razorpay_key_id
REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
REACT_APP_GOOGLE_CLIENT_ID=your_google_oauth_client_id
```

**Note:** Copy these values from your `frontend/.env` file (not committed to Git)

**Important:** Replace `your-railway-backend-url` with your actual Railway backend URL!

### Step 4: Deploy
1. Click **"Deploy"**
2. Wait for build to complete (2-3 minutes)
3. Your app will be live at `https://your-app.vercel.app`

### Step 5: Update Backend CORS
1. Go back to Railway dashboard
2. Update `FRONTEND_URL` environment variable with your Vercel URL
3. Redeploy backend

---

## Post-Deployment Checklist

### ✅ Backend (Railway)
- [ ] Backend is accessible at Railway URL
- [ ] MongoDB connection is working
- [ ] Environment variables are set correctly
- [ ] CORS allows frontend domain
- [ ] Socket.io is working

### ✅ Frontend (Vercel)
- [ ] Frontend loads successfully
- [ ] Can connect to backend API
- [ ] Google OAuth works
- [ ] Razorpay payment integration works
- [ ] Maps are loading correctly
- [ ] Socket.io real-time updates work

### ✅ Testing
- [ ] User registration works
- [ ] Login works (email + Google)
- [ ] Wallet deposit works
- [ ] Umbrella selection works
- [ ] Rental tracking works
- [ ] Payment flow works end-to-end

---

## Troubleshooting

### Backend Issues

**Problem**: MongoDB connection fails
- **Solution**: Check if MongoDB Atlas allows connections from anywhere (0.0.0.0/0)
- Go to MongoDB Atlas → Network Access → Add IP Address → Allow Access from Anywhere

**Problem**: CORS errors
- **Solution**: Ensure `FRONTEND_URL` in Railway matches your Vercel URL exactly

**Problem**: Socket.io not connecting
- **Solution**: Check if Railway allows WebSocket connections (it should by default)

### Frontend Issues

**Problem**: API calls fail
- **Solution**: Verify `REACT_APP_API_URL` includes `/api` at the end
- Check browser console for exact error

**Problem**: Google OAuth fails
- **Solution**: Add Vercel domain to Google OAuth authorized domains
- Go to Google Cloud Console → Credentials → Add authorized domain

**Problem**: Maps not loading
- **Solution**: Verify Google Maps API key is valid and has Maps JavaScript API enabled

**Problem**: Razorpay fails
- **Solution**: Check if Razorpay key is for production (starts with `rzp_live_`)

---

## Custom Domain (Optional)

### For Vercel (Frontend)
1. Go to Vercel project → **Settings** → **Domains**
2. Add your custom domain
3. Update DNS records as instructed

### For Railway (Backend)
1. Go to Railway project → **Settings** → **Domains**
2. Add custom domain
3. Update DNS records
4. Update `REACT_APP_API_URL` in Vercel

---

## Monitoring & Logs

### Railway Logs
- Go to Railway dashboard → **Deployments** → Click on deployment
- View real-time logs for debugging

### Vercel Logs
- Go to Vercel dashboard → **Deployments** → Click on deployment
- View build logs and runtime logs

---

## Continuous Deployment

Both Railway and Vercel support automatic deployments:
- Push to `main` branch → Auto-deploy to production
- Create PR → Auto-deploy preview environment

---

## Cost Estimates

### Railway (Backend)
- **Free Tier**: $5 credit/month (enough for small projects)
- **Hobby Plan**: $5/month for more resources
- **Pro Plan**: $20/month for production apps

### Vercel (Frontend)
- **Hobby**: Free (perfect for personal projects)
- **Pro**: $20/month (for commercial projects)

---

## Support

If you encounter issues:
1. Check Railway/Vercel logs
2. Review this guide
3. Check GitHub Issues
4. Contact support:
   - Railway: https://railway.app/help
   - Vercel: https://vercel.com/support

---

**Deployment completed! 🎉**

Your RainShield app should now be live and accessible worldwide!
