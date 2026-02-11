# CrickBet - Betting Exchange & Casino Platform

A full-stack MERN betting exchange and casino platform inspired by modern betting platforms.

## 🚀 Tech Stack

### Backend
- **Runtime**: Node.js v18+
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Real-time**: Socket.io
- **Authentication**: JWT + bcryptjs
- **Payment**: Razorpay, PayTM, UPI

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Context API
- **HTTP Client**: Axios
- **Real-time**: Socket.io Client

## 📁 Project Structure

```
crickbet/
├── backend/                  # Node.js Express Backend
│   ├── config/              # Configuration files
│   ├── controllers/         # Route controllers
│   ├── middleware/          # Custom middleware
│   ├── models/             # MongoDB models (11 schemas)
│   ├── routes/             # API routes (15 modules)
│   ├── services/           # Business logic (8 services)
│   ├── sockets/            # Socket.io handlers (4 handlers)
│   ├── utils/              # Utility functions
│   └── server.js           # Entry point
│
├── app/                     # Next.js App Router
│   ├── (auth)/             # Auth pages
│   ├── (main)/             # Main app pages  
│   └── layout.tsx          # Root layout
│
├── components/              # React components
│   ├── layout/             # Navbar, Sidebar
│   └── betting/            # BetSlip
│
├── context/                 # React Context (4 providers)
│   ├── AuthContext.tsx
│   ├── WalletContext.tsx
│   ├── BetSlipContext.tsx
│   └── SocketContext.tsx
│
└── lib/                     # API client & services (7 services)
```

## 🎯 Features Implemented (Structure)

### Backend ✅
- User authentication & JWT
- Sports betting exchange
- Wallet & transactions
- KYC verification
- Casino integration
- Referral & Affiliate
- Socket.io real-time
- Payment gateways
- 11 MongoDB models
- 15 API route modules
- 8 service modules

### Frontend ✅
- Login/Register pages
- Dashboard, Sports, Casino
- Navbar, Sidebar, BetSlip
- 4 Context providers
- 7 API services
- TypeScript setup

## �� Installation

### Backend
```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

### Frontend
```bash
npm install
echo "NEXT_PUBLIC_API_URL=http://localhost:5000/api" > .env.local
npm run dev
```

## 🌐 Access
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## 📝 Next Steps
1. Install dependencies: `npm install` & `cd backend && npm install`
2. Configure MongoDB connection
3. Implement TODO placeholders
4. Add remaining pages (slots, crash, lottery, etc.)
5. Complete business logic

---
**Status**: Structure Complete | Logic: TODO Placeholders
