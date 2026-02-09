# Affiliate Dashboard Implementation

## Overview
Complete implementation of the Affiliate Dashboard page with full backend and frontend integration.

## Features Implemented

### Backend (`backend/controllers/affiliate.controller.js`)

#### getDashboard Method
- **Route**: `GET /api/affiliate/dashboard`
- **Authentication**: Required (via JWT token)
- **Access**: Private (Affiliate users only)

#### Statistics Tracked:

1. **Commission Stats**
   - This Month: Total commission earned in current month
   - Last Month: Total commission earned in previous month
   - Percentage change calculation

2. **Active Players**
   - This Month: Count of referred users who placed bets this month
   - Last Month: Count of referred users who placed bets last month
   - Percentage change calculation

3. **Data Tables (11 tables with time-series data):**

   a. **Registered Users**
      - Period: Date of registration
      - Count: Number of users registered

   b. **First Deposit**
      - Period: Date of first deposit
      - Count: Number of first deposits
      - Amount: Total first deposit amount

   c. **Deposit**
      - Period: Date of deposits
      - Count: Number of deposits
      - Amount: Total deposit amount

   d. **Withdrawal**
      - Period: Date of withdrawals
      - Count: Number of withdrawals
      - Amount: Total withdrawal amount

   e. **Bonus**
      - Period: Date of bonuses
      - Count: Number of bonuses
      - Amount: Total bonus amount

   f. **Recycle Amount**
      - Period: Date of refunds
      - Count: Number of refunds
      - Amount: Total refund amount

   g. **Cancel Fee**
      - Period: Date of cancel fees
      - Count: Number of cancel fees
      - Amount: Total cancel fee amount

   h. **VIP Cash Bonus**
      - Period: Date of VIP bonuses
      - Count: Number of VIP bonuses
      - Amount: Total VIP bonus amount

   i. **Referral Commission**
      - Period: Date of commissions
      - Count: Number of commission transactions
      - Amount: Total commission earned

   j. **Turnover**
      - Period: Date of bets
      - Count: Number of bets placed
      - Amount: Total bet stakes

   k. **Affiliate Profit & Loss**
      - Period: Date
      - Count: Transactions count
      - Amount: Net profit/loss (deposits + settlements - withdrawals)

#### Database Queries Used:
- **MongoDB Aggregation Pipeline**
  - `$match`: Filter referred users and transaction types
  - `$group`: Group by date and calculate totals
  - `$dateToString`: Format dates as 'YYYY-MM-DD'
  - `$sum`: Calculate totals and counts
  - `$sort`: Sort by date descending
  - `$limit`: Limit to 10 most recent periods

- **Models Used:**
  - `User`: Find referred users via `referredBy` field
  - `Transaction`: Aggregate deposits, withdrawals, commissions, bonuses, fees
  - `Bet`: Aggregate turnover and track active players

### Frontend (`app/(main)/affiliate/page.tsx`)

#### Components:

1. **Main Dashboard Component (`AffiliatePage`)**
   - Fetches data from `/api/affiliate/dashboard`
   - Handles loading and error states
   - Displays all statistics and data tables

2. **Stat Cards**
   - Commission Card (green gradient)
     - This Month amount
     - Last Month amount
     - Percentage change with arrow indicator
   - Active Players Card (blue gradient)
     - This Month count
     - Last Month count
     - Percentage change with arrow indicator

3. **DataTable Component**
   - Reusable table component
   - Displays Period, Count, and Amount columns
   - Configurable to show/hide Amount column
   - Dark theme styling
   - Hover effects on rows
   - Empty state handling

#### Features:
- **Responsive Design**
  - Grid layout: 1 column on mobile, 2 columns on tablet+
  - Data tables: 1 column on mobile, 2 columns on desktop
- **Dark Theme**
  - bg-gray-900 (main background)
  - bg-gray-800 (cards)
  - bg-gray-700 (table headers)
  - Gradient accents (green for commission, blue for players)
- **Currency Formatting**
  - Indian Rupee (₹) symbol
  - Locale formatting (en-IN)
  - 2 decimal places
- **Change Indicators**
  - Green up arrow for positive change
  - Red down arrow for negative change
  - Percentage calculation

## API Integration

### Endpoint
```
GET /api/affiliate/dashboard
```

### Response Structure
```json
{
  "success": true,
  "data": {
    "commission": {
      "thisMonth": 25000.00,
      "lastMonth": 20000.00
    },
    "activePlayers": {
      "thisMonth": 45,
      "lastMonth": 38
    },
    "registeredUsers": [
      { "_id": "2024-01-15", "count": 5 }
    ],
    "firstDeposits": [
      { "_id": "2024-01-15", "count": 3, "amount": 15000.00 }
    ],
    "deposits": [...],
    "withdrawals": [...],
    "bonuses": [...],
    "recycleAmount": [...],
    "cancelFees": [...],
    "vipCashBonus": [...],
    "referralCommissions": [...],
    "turnover": [...],
    "profitLoss": [...]
  }
}
```

## Files Modified

### Backend Files:
1. **`backend/controllers/affiliate.controller.js`**
   - Updated `getDashboard()` method
   - Added comprehensive MongoDB aggregation queries
   - Added commission and active player calculations

### Frontend Files:
1. **`app/(main)/affiliate/page.tsx`**
   - Complete dashboard UI implementation
   - Stat cards for commission and active players
   - 11 data tables for detailed statistics
   - Loading and error states
   - API integration

## Dependencies Required

### Backend:
- `mongoose` - MongoDB ODM (already installed)
- Models: `User`, `Transaction`, `Bet`

### Frontend:
- `react` - UI library (already installed)
- `@/context/AuthContext` - User authentication context
- `@/lib/api-client` - API client for backend calls

## Testing Checklist

- [ ] Backend: Test `/api/affiliate/dashboard` endpoint
- [ ] Verify commission calculations (this month vs last month)
- [ ] Verify active player counts
- [ ] Check all 11 data tables populate correctly
- [ ] Test with no referred users (empty state)
- [ ] Test with referred users but no transactions
- [ ] Frontend: Verify dashboard loads without errors
- [ ] Test responsive layout (mobile, tablet, desktop)
- [ ] Verify currency formatting
- [ ] Test percentage change calculations
- [ ] Test error handling (network errors, auth errors)
- [ ] Test loading states

## Next Steps

1. **Test the dashboard** with real data
2. **Implement remaining affiliate pages:**
   - Profile
   - Bank
   - Hierarchy
   - KYC
   - Commission Designation
   - Member Search
   - Registrations & FTDs
   - Performance
   - Commission

3. **Add filtering options:**
   - Date range selector
   - Custom period selection

4. **Add export functionality:**
   - Export data as CSV/Excel
   - Generate PDF reports

5. **Add real-time updates:**
   - Socket.io integration for live stats
   - Auto-refresh dashboard data

## Database Schema Requirements

### User Model Fields:
- `referredBy`: ObjectId reference to affiliate user
- `createdAt`: Date

### Transaction Model Fields:
- `userId`: ObjectId reference to user
- `type`: String (deposit, withdrawal, commission, bonus, fee, refund, bet_settlement)
- `subType`: String (cancel_fee, vip_cash, etc.)
- `amount`: Number
- `status`: String (completed, pending, failed)
- `profitLoss`: Number (for bet_settlement type)
- `createdAt`: Date

### Bet Model Fields:
- `userId`: ObjectId reference to user
- `stake`: Number
- `status`: String (settled, won, lost, pending)
- `createdAt`: Date

## Performance Considerations

- All aggregation queries limited to 10 most recent periods
- Indexes recommended on:
  - `User.referredBy`
  - `Transaction.userId`, `Transaction.type`, `Transaction.createdAt`
  - `Bet.userId`, `Bet.status`, `Bet.createdAt`
- Consider caching dashboard data for better performance
- Use pagination for larger datasets

## Security

- JWT authentication required for all endpoints
- User can only view their own affiliate data
- Referred user IDs filtered by `referredBy` field
- No direct user data exposure in API responses
