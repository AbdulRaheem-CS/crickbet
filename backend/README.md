# CrickBet Backend

Complete backend API for CrickBet - Betting Exchange & Casino Platform

## Features

✅ User Authentication & Authorization (JWT)
✅ Sports Betting Exchange (Back/Lay)
✅ Casino Games Integration
✅ Wallet Management (Deposit/Withdrawal)
✅ KYC Verification
✅ Referral Program
✅ Affiliate System
✅ Real-time Updates (Socket.io)
✅ Payment Gateway Integration
✅ Admin Panel APIs

## Tech Stack

- **Runtime**: Node.js v18+
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT + bcryptjs
- **Real-time**: Socket.io
- **Payment**: Razorpay, PayTM, UPI
- **File Upload**: Multer + AWS S3

## Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Edit .env with your credentials

# Start development server
npm run dev
```

## Environment Variables

See `.env.example` for all required variables.

## API Endpoints

### Authentication
- POST /api/auth/register - Register new user
- POST /api/auth/login - Login user
- POST /api/auth/logout - Logout user
- GET /api/auth/me - Get current user
- POST /api/auth/forgot-password - Request password reset
- POST /api/auth/reset-password - Reset password

### User
- GET /api/user/profile - Get user profile
- PUT /api/user/profile - Update profile
- POST /api/user/change-password - Change password

### Betting
- POST /api/bet/place - Place bet
- GET /api/bet/my-bets - Get user's bets
- DELETE /api/bet/:id - Cancel bet
- POST /api/bet/:id/cashout - Cash out bet

### Markets
- GET /api/market/sports - Get all sports
- GET /api/market/:sportId - Get markets for sport
- GET /api/market/details/:marketId - Get market details

### Wallet
- GET /api/wallet/balance - Get wallet balance
- POST /api/wallet/deposit - Initiate deposit
- POST /api/wallet/withdraw - Request withdrawal
- GET /api/wallet/transactions - Get transaction history

### KYC
- POST /api/kyc/submit - Submit KYC documents
- GET /api/kyc/status - Check KYC status

### Casino
- GET /api/casino/games - Get casino games
- POST /api/casino/launch - Launch game

### Referral
- GET /api/referral/stats - Get referral statistics
- POST /api/referral/claim - Claim referral rewards

### Admin
- GET /api/admin/users - List all users
- GET /api/admin/bets - List all bets
- PUT /api/admin/kyc/:id/approve - Approve KYC
- PUT /api/admin/kyc/:id/reject - Reject KYC

## Socket Events

### Client → Server
- `subscribe:market` - Subscribe to market updates
- `unsubscribe:market` - Unsubscribe from market
- `subscribe:crash` - Subscribe to crash game

### Server → Client
- `odds:update` - Live odds update
- `market:status` - Market status change
- `bet:placed` - Bet placed notification
- `bet:matched` - Bet matched notification
- `bet:settled` - Bet settled notification
- `wallet:balance_update` - Balance updated

## Project Structure

```
backend/
├── config/           # Configuration files
├── controllers/      # Route controllers
├── middleware/       # Custom middleware
├── models/          # MongoDB models
├── routes/          # API routes
├── services/        # Business logic
├── sockets/         # Socket.io handlers
├── utils/           # Utility functions
├── logs/            # Application logs
├── server.js        # Entry point
└── package.json
```

## Development

```bash
# Run in development mode with auto-restart
npm run dev

# Run in production mode
npm start

# Run tests (TODO)
npm test
```

## License

Proprietary - All Rights Reserved
