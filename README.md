# 🌂 RainShield - Umbrella Rental System

A modern, full-stack umbrella rental platform designed for Chandigarh University campus. Built with React, Node.js, MongoDB, and integrated with Razorpay for payments.

![RainShield](frontend/public/umbrellalogo.png)

## ✨ Features

- 🔐 **Authentication**: Email/Password + Google OAuth
- 💰 **Wallet System**: Deposits, withdrawals, cashback rewards
- 🗺️ **Live Tracking**: Real-time umbrella location with Leaflet maps
- ☂️ **Multi-Rental**: Rent multiple umbrellas simultaneously
- 💳 **Payment Integration**: Razorpay for seamless transactions
- 📱 **PWA Support**: Install as mobile app
- 🔔 **Real-time Updates**: Socket.io for live notifications
- 🎨 **Modern UI**: Tailwind CSS with custom design system

## 🏗️ Tech Stack

### Frontend
- React 18
- React Router v6
- Tailwind CSS
- React Leaflet (Maps)
- Socket.io Client
- Axios
- Google OAuth

### Backend
- Node.js + Express
- MongoDB + Mongoose
- JWT Authentication
- Razorpay SDK
- Socket.io
- bcryptjs

## 📋 Prerequisites

- Node.js (v18+)
- MongoDB Atlas account
- Razorpay account
- Google OAuth credentials
- Google Maps API key

## 🚀 Installation

### 1. Clone the repository
```bash
git clone https://github.com/i-am-sanjaykumar07/RainSheild.git
cd RainSheild
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create `backend/.env` file:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key_min_32_chars
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
GOOGLE_CLIENT_ID=your_google_oauth_client_id
GOOGLE_CLIENT_SECRET=your_google_oauth_client_secret
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

Seed the database:
```bash
npm run seed
```

Start backend server:
```bash
npm start
# or for development
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install
```

Create `frontend/.env` file:
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_RAZORPAY_KEY_ID=your_razorpay_key_id
REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
REACT_APP_GOOGLE_CLIENT_ID=your_google_oauth_client_id
```

Start frontend:
```bash
npm start
```

Visit `http://localhost:3000`

## 💡 Usage

### Test Credentials
After seeding the database, use:
- **Email**: `student1@cu.edu.in`
- **Password**: `password123`

### Pricing
- ₹7 per hour
- ₹70 per day (capped)
- ₹100 refundable deposit
- ₹100 cashback on first deposit ≥ ₹300

## 📁 Project Structure

```
RainSheild/
├── backend/
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Umbrella.js
│   │   ├── Rental.js
│   │   └── Transaction.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── umbrellas.js
│   │   ├── rentals.js
│   │   └── wallet.js
│   ├── server.js
│   ├── seedData.js
│   └── package.json
│
└── frontend/
    ├── public/
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.js
    │   │   ├── MapView.js
    │   │   ├── TrackingMap.js
    │   │   ├── LiveUpdates.js
    │   │   └── SplashScreen.js
    │   ├── pages/
    │   │   ├── Login.js
    │   │   ├── Dashboard.js
    │   │   ├── UmbrellaSelection.js
    │   │   ├── RentalTracking.js
    │   │   ├── Wallet.js
    │   │   └── Profile.js
    │   ├── services/
    │   │   ├── api.js
    │   │   ├── AuthContext.js
    │   │   └── socket.js
    │   ├── App.js
    │   └── index.js
    └── package.json
```

## 🔑 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/google` - Google OAuth login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update profile
- `DELETE /api/auth/profile` - Delete account

### Umbrellas
- `GET /api/umbrellas` - Get all umbrellas
- `GET /api/umbrellas/:id` - Get umbrella by ID
- `POST /api/umbrellas` - Add new umbrella (admin)

### Rentals
- `POST /api/rentals/start` - Start single rental
- `POST /api/rentals/start-multiple` - Start multiple rentals
- `POST /api/rentals/:id/pay` - Pay for rental
- `POST /api/rentals/pay-all` - Pay for all active rentals
- `POST /api/rentals/:id/end` - End rental
- `POST /api/rentals/end-multiple` - End multiple rentals
- `GET /api/rentals/active` - Get active rentals
- `GET /api/rentals/history` - Get rental history

### Wallet
- `POST /api/wallet/deposit` - Create deposit order
- `POST /api/wallet/verify-deposit` - Verify payment
- `POST /api/wallet/withdraw` - Withdraw funds
- `GET /api/wallet/transactions` - Get transaction history

## 🌐 Deployment

### Backend (Vercel/Render)
1. Set environment variables in platform dashboard
2. Deploy from GitHub repository
3. Update `FRONTEND_URL` in backend env

### Frontend (Netlify/Vercel)
1. Set environment variables
2. Build command: `npm run build`
3. Publish directory: `build`
4. Update `REACT_APP_API_URL` to backend URL

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Author

**Sanjay Kumar**
- GitHub: [@i-am-sanjaykumar07](https://github.com/i-am-sanjaykumar07)

## 🙏 Acknowledgments

- Chandigarh University for inspiration
- React and Node.js communities
- All open-source contributors

---

Made with ❤️ for CU Students
