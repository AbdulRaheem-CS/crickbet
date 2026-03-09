# CrickBet - Betting Exchange & Casino Platform

A full-stack MERN application for a betting exchange and casino platform similar to KingBajinow.com.

## Project Structure

```
crickbet/
├── backend/                    # Node.js + Express Backend
│   ├── config/                 # Configuration files
│   ├── controllers/            # Request handlers
│   ├── middleware/             # Custom middleware
│   ├── models/                 # MongoDB schemas
│   ├── routes/                 # API routes
│   ├── services/               # Business logic services
│   ├── sockets/                # WebSocket handlers
│   ├── utils/                  # Utility functions
│   └── server.js               # Entry point
│
├── app/                        # Next.js Frontend (App Router)
│   ├── (auth)/                 # Authentication pages
│   ├── (main)/                 # Main application pages
│   ├── admin/                  # Admin panel pages
│   ├── components/             # Reusable components
│   ├── context/                # React context providers
│   ├── services/               # API service calls
│   ├── hooks/                  # Custom React hooks
│   ├── utils/                  # Frontend utilities
│   └── constants/              # Frontend constants
│
├── public/                     # Static assets
└── scripts/                    # Build and deployment scripts
```

## Backend Structure

### /backend/config
- `db.js` - MongoDB connection setup
- `env.js` - Environment variables configuration
- `cors.js` - CORS configuration
- `payment.js` - Payment gateway configurations

### /backend/models
- `User.js` - User schema with authentication
- `Bet.js` - Bet schema for back/lay bets
- `Market.js` - Sports market schema
- `Transaction.js` - Wallet transactions
- `KYC.js` - KYC verification documents
- `Referral.js` - Referral tracking
- `Affiliate.js` - Affiliate program data
- `Casino.js` - Casino games and sessions
- `Promotion.js` - Promotions and bonuses
- `Lottery.js` - Lottery tickets and draws

### /backend/routes
- `auth.routes.js` - Authentication endpoints
- `user.routes.js` - User management
- `bet.routes.js` - Betting operations
- `market.routes.js` - Sports markets
- `wallet.routes.js` - Wallet operations
- `kyc.routes.js` - KYC verification
- `admin.routes.js` - Admin operations
- `casino.routes.js` - Casino games
- `referral.routes.js` - Referral system
- `affiliate.routes.js` - Affiliate program
- `promotion.routes.js` - Promotions
- `lottery.routes.js` - Lottery system

### /backend/controllers
Controllers handle the business logic for each route module.

### /backend/services
- `betting.service.js` - Betting matching engine
- `wallet.service.js` - Wallet transactions
- `payment.service.js` - Payment processing
- `casino.service.js` - Casino game integration
- `kyc.service.js` - KYC verification
- `referral.service.js` - Referral calculations
- `notification.service.js` - Push notifications
- `odds.service.js` - Live odds management

### /backend/sockets
- `index.js` - Socket.io server setup
- `odds.socket.js` - Live odds updates
- `bet.socket.js` - Bet placement updates
- `market.socket.js` - Market updates

### /backend/middleware
- `auth.middleware.js` - JWT authentication
- `kyc.middleware.js` - KYC verification check
- `rateLimit.middleware.js` - Rate limiting
- `error.middleware.js` - Error handling
- `admin.middleware.js` - Admin access control

## Frontend Structure

### /app/(auth)
- `login/` - Login page
- `signup/` - Registration page
- `forgot-password/` - Password recovery

### /app/(main)
- `dashboard/` - User dashboard
- `sports/` - Sports betting
- `casino/` - Casino games
- `slots/` - Slot games
- `crash/` - Crash games
- `table/` - Table games
- `fishing/` - Fishing games
- `arcade/` - Arcade games
- `lottery/` - Lottery
- `promotions/` - Promotions page
- `leaderboard/` - Leaderboard
- `referral/` - Referral program
- `download/` - App download
- `sponsorship/` - Sponsorship info
- `affiliate/` - Affiliate program
- `contact/` - Contact us
- `blog/` - Blog
- `about/` - About us
- `faq/` - FAQ
- `responsible-gaming/` - Responsible gaming

### /app/admin
- `dashboard/` - Admin dashboard
- `users/` - User management
- `bets/` - Bet management
- `markets/` - Market management
- `kyc/` - KYC approvals
- `transactions/` - Transaction history
- `reports/` - Reports and analytics

### /app/components
- `layout/` - Layout components (Navbar, Sidebar, Footer)
- `betting/` - Betting components (BetSlip, OddsTicker, MarketCard)
- `wallet/` - Wallet components
- `casino/` - Casino game components
- `forms/` - Form components (KYCForm, LoginForm)
- `ui/` - UI components (Buttons, Modals, Cards)

### /app/context
- `AuthContext.js` - Authentication state
- `WalletContext.js` - Wallet state
- `BetSlipContext.js` - Bet slip state
- `SocketContext.js` - WebSocket connection

### /app/services
- `api.js` - Axios instance setup
- `auth.service.js` - Authentication API calls
- `bet.service.js` - Betting API calls
- `wallet.service.js` - Wallet API calls
- `casino.service.js` - Casino API calls
- `socket.service.js` - WebSocket client

## Getting Started

### Prerequisites
- Node.js >= 18
- MongoDB
- npm or yarn

### Installation

1. Install backend dependencies:
```bash
cd backend
npm install
```

2. Install frontend dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp backend/.env.example backend/.env
cp .env.example .env.local
```

4. Start development servers:
```bash
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend
npm run dev
```

## Scripts

- `npm run dev` - Start frontend development server
- `npm run build` - Build frontend for production
- `npm run start` - Start production frontend server
- `npm run backend:dev` - Start backend development server
- `npm run backend:prod` - Start backend production server

## Environment Variables

### Backend (.env)
```
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/crickbet
JWT_SECRET=your-jwt-secret
PAYMENT_API_KEY=your-payment-key
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

## API Documentation

API documentation is available at `/api/docs` when running the backend server.

## License

Private - All rights reserved.
