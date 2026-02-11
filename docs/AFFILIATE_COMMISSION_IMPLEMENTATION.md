# Affiliate Commission Page Implementation

## Overview
The Commission page displays affiliate commission earnings based on referred player performance. It shows net profit generated from players and the commission earned by the affiliate. The page supports both personal account commissions and downline affiliate commissions.

## Implementation Date
January 2026

## Features

### 1. Tabs
- **My Account**: Shows commission records for the logged-in affiliate's direct referrals
- **Downline**: Shows commission records from downline affiliates' referrals

### 2. Filters
- **Date Filter**: Toggle-able date range filter (From/To dates)
- **Currency Filter**: Filter by currency (BDT, INR, USD, EUR, GBP, All)
- **Column Visibility**: Toggle visibility of individual columns

### 3. Commission Data (7 Columns)

1. **#**: Serial number
2. **Start Date**: Commission period start date
3. **Currency**: Transaction currency
4. **Net Profit**: House profit from players (Deposits - Withdrawals - Winnings)
5. **Commission**: Affiliate's commission amount (Net Profit × Commission Rate)
6. **Period**: Commission period (e.g., "Monthly")
7. **Status**: Commission status (Pending, Approved, Paid, Rejected)
8. **Action**: Actions available (View details)

### 4. Status Colors
- **Paid**: Green background
- **Approved**: Blue background
- **Pending**: Yellow background
- **Rejected**: Red background

### 5. Summary
- **Page Total**: Sum of Net Profit and Commission for current page

### 6. Actions
- **Export**: Download commission data as CSV
- **Search**: Apply filters and fetch data

## Technical Implementation

### Backend

#### Controller Method: `getCommissions`
**Location**: `backend/controllers/affiliate.controller.js`

**Functionality**:
1. Determines if showing My Account or Downline commissions based on `type` parameter
2. For My Account: Calculates commissions from direct referrals
3. For Downline: Calculates commissions from downline affiliates' referrals
4. Applies date and currency filters
5. For each affiliate and currency combination:
   - Calculates total deposits from referred players
   - Calculates total withdrawals
   - Calculates total winnings from bets
   - Computes net profit: `Deposits - Withdrawals - Winnings`
   - Calculates commission: `Net Profit × Commission Rate`
6. Returns paginated commission records with totals

**Commission Calculation Formula**:
```javascript
Net Profit = Total Deposits - Total Withdrawals - Total Winnings
Commission = Net Profit × Commission Rate (default: 30%)
```

**Query Parameters**:
- `type` (default: 'myAccount'): 'myAccount' or 'downline'
- `startDate` (optional): Filter from this date
- `endDate` (optional): Filter until this date
- `currency` (optional): Filter by currency
- `page` (default: 1): Page number
- `limit` (default: 10): Records per page

**Response Format**:
```json
{
  "success": true,
  "data": {
    "commissions": [
      {
        "_id": "affiliate_id_BDT_timestamp",
        "affiliateId": "affiliate_id",
        "startDate": "2026-01-01T00:00:00.000Z",
        "currency": "BDT",
        "netProfit": 15000,
        "commission": 4500,
        "period": "Monthly",
        "status": "pending",
        "createdAt": "2026-01-16T00:00:00.000Z"
      }
    ],
    "pageTotal": {
      "netProfit": 50000,
      "commission": 15000
    },
    "pagination": {
      "total": 25,
      "page": 1,
      "pages": 3
    }
  }
}
```

#### Route
**Path**: `GET /api/affiliate/commissions`
**Authentication**: Required (JWT token)
**Location**: `backend/routes/affiliate.routes.js`

### Frontend

#### Component: `CommissionPage`
**Location**: `app/(main)/affiliate/commission/page.tsx`

**State Management**:
- `activeTab`: Current tab ('myAccount' or 'downline')
- `showDateFilter`: Boolean for date filter toggle
- `startDate`: Start date (DD/MM/YYYY format)
- `endDate`: End date (DD/MM/YYYY format)
- `currency`: Selected currency filter
- `showColumnVisibility`: Boolean for column visibility panel
- `visibleColumns`: Object tracking which columns are visible
- `data`: Commission data with totals
- `loading`: Loading state
- `error`: Error message

**Key Functions**:
1. `fetchCommissions()`: Fetches commission data from backend API
2. `handleSearch()`: Triggers data fetch with current filters
3. `handleExport()`: Exports table data to CSV
4. `formatDate()`: Formats date for display (DD/MM/YYYY)
5. `convertDateFormat()`: Converts DD/MM/YYYY to YYYY-MM-DD for API
6. `toggleColumn()`: Toggles column visibility
7. `getStatusColor()`: Returns color class based on status

**UI Components**:
1. **Tab Navigation**:
   - My Account tab (dark gray when active)
   - Downline tab (dark gray when active)

2. **Filter Section**:
   - Date Filter toggle button
   - Conditional date range inputs (From/To)
   - Currency dropdown
   - Column Visibility button with dropdown

3. **Data Table**:
   - 8 columns (dynamic visibility)
   - Dark gray header (bg-gray-600)
   - Status badges with colors
   - Page Total row (gray-700 background)
   - Empty state message
   - Loading state
   - Pagination info

4. **Action Buttons**:
   - Export button (gray-700)
   - Search button (blue)

## Database Queries

### 1. Get Referred Players
```javascript
const referredPlayers = await User.find({ 
  referredBy: affiliateId 
}).select('_id currency');
```

### 2. Get Downline Affiliates (for Downline tab)
```javascript
const downlineAffiliates = await User.find({ 
  referredBy: affiliateId, 
  isAffiliate: true 
}).select('_id');
```

### 3. Calculate Total Deposits
```javascript
const depositStats = await Transaction.aggregate([
  {
    $match: {
      userId: { $in: playerIds },
      type: 'deposit',
      status: 'completed',
      createdAt: dateFilter // if date filter applied
    }
  },
  {
    $group: {
      _id: null,
      totalDeposit: { $sum: '$amount' }
    }
  }
]);
```

### 4. Calculate Total Withdrawals
```javascript
const withdrawalStats = await Transaction.aggregate([
  {
    $match: {
      userId: { $in: playerIds },
      type: 'withdrawal',
      status: 'completed',
      createdAt: dateFilter // if date filter applied
    }
  },
  {
    $group: {
      _id: null,
      totalWithdrawal: { $sum: '$amount' }
    }
  }
]);
```

### 5. Calculate Total Winnings
```javascript
const betStats = await Bet.aggregate([
  {
    $match: {
      userId: { $in: playerIds },
      createdAt: dateFilter // if date filter applied
    }
  },
  {
    $group: {
      _id: null,
      totalWinnings: { 
        $sum: { 
          $cond: [
            { $eq: ['$status', 'won'] }, 
            '$winAmount', 
            0
          ] 
        } 
      }
    }
  }
]);
```

### 6. Get Affiliate Commission Rate
```javascript
const affiliate = await User.findById(affiliateId).select('commissionRate');
const commissionRate = affiliate?.commissionRate || 0.30; // Default 30%
```

## Commission Calculation Logic

### Net Profit
Net profit represents the house's profit from a player's activity:
```
Net Profit = Total Deposits - Total Withdrawals - Total Winnings
```

**Example**:
- Player deposits: 10,000 BDT
- Player withdrawals: 3,000 BDT
- Player winnings: 5,000 BDT
- Net Profit = 10,000 - 3,000 - 5,000 = 2,000 BDT

### Commission
Commission is the affiliate's earnings based on the net profit:
```
Commission = Net Profit × Commission Rate
```

**Example** (with 30% commission rate):
- Net Profit: 2,000 BDT
- Commission Rate: 30%
- Commission = 2,000 × 0.30 = 600 BDT

### Negative Net Profit
If net profit is negative (player won more than deposited), commission is 0:
```javascript
const commission = netProfit > 0 ? netProfit * commissionRate : 0;
```

## Currency Grouping

Commissions are calculated separately for each currency:
- BDT commissions
- INR commissions
- USD commissions
- EUR commissions
- GBP commissions

Each currency group generates a separate commission record.

## Commission Periods

Currently implemented as "Monthly" periods. Future enhancements can include:
- Weekly
- Bi-weekly
- Custom periods

## Commission Status Workflow

1. **Pending**: Commission calculated but not yet approved
2. **Approved**: Commission approved by admin, ready for payout
3. **Paid**: Commission paid to affiliate
4. **Rejected**: Commission rejected (e.g., fraudulent activity detected)

## Styling

### Theme
- **Background**: Light gray (`bg-gray-100`)
- **Tab Active**: Dark gray (`bg-gray-700`)
- **Tab Inactive**: Light gray (`bg-gray-200`)
- **Table Header**: Gray (`bg-gray-600`) with white text
- **Page Total Row**: Dark gray (`bg-gray-700`) with white text

### Status Badge Colors
- **Paid**: `text-green-600 bg-green-50`
- **Approved**: `text-blue-600 bg-blue-50`
- **Pending**: `text-yellow-600 bg-yellow-50`
- **Rejected**: `text-red-600 bg-red-50`

### Responsive Design
- Grid layout for date filters (3 columns on desktop)
- Horizontal scrolling for table overflow
- Mobile-friendly inputs and buttons

## CSV Export Format

```csv
#,Start Date,Currency,Net Profit,Commission,Period,Status
1,01/01/2026,BDT,15000.00,4500.00,Monthly,pending
2,01/01/2026,INR,25000.00,7500.00,Monthly,approved
```

## Performance Considerations

1. **On-Demand Calculation**: Commissions are calculated when requested (not pre-stored)
2. **Currency Grouping**: Reduces number of calculations
3. **Aggregation Pipelines**: Efficient for large datasets
4. **Pagination**: Limits data transfer
5. **Date Filtering**: Reduces scope of calculations

### Recommended Optimization
For production with many affiliates and high traffic, consider:
1. **Create Commission Model**: Store calculated commissions
2. **Scheduled Jobs**: Calculate commissions monthly via cron job
3. **Caching**: Cache recent commission data
4. **Materialized Views**: Pre-aggregate common queries

## Future Enhancements

### 1. Commission Model
Create a dedicated Commission schema:
```javascript
const CommissionSchema = new mongoose.Schema({
  affiliateId: { type: ObjectId, ref: 'User', required: true },
  period: { type: String, required: true }, // 'monthly', 'weekly'
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  currency: { type: String, required: true },
  netProfit: { type: Number, required: true },
  commissionRate: { type: Number, required: true },
  commission: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'paid', 'rejected'],
    default: 'pending' 
  },
  paidAt: Date,
  paidAmount: Number,
  notes: String
});
```

### 2. Automated Commission Generation
- Cron job to generate monthly commissions
- Email notifications when commissions are ready
- Automatic status updates

### 3. Commission Tiers
Different commission rates based on performance:
```javascript
const tiers = [
  { threshold: 0, rate: 0.25 },      // 25% for 0-10k
  { threshold: 10000, rate: 0.30 },  // 30% for 10k-50k
  { threshold: 50000, rate: 0.35 },  // 35% for 50k+
];
```

### 4. Payment Integration
- Request payout button
- Payment method selection
- Payment history tracking
- Minimum payout threshold

### 5. Commission Details View
When clicking "View" action:
- Detailed breakdown by player
- Individual player contributions
- Transaction list
- Download detailed report

### 6. Analytics
- Commission trend charts
- Month-over-month comparison
- Top performing periods
- Currency-wise breakdown chart

### 7. Commission Adjustments
- Manual adjustments by admin
- Bonus commissions
- Penalty deductions
- Adjustment history

## Testing Checklist

- [ ] My Account tab loads correctly
- [ ] Downline tab loads correctly
- [ ] Date filter toggle works
- [ ] Date range filtering returns correct results
- [ ] Currency filter works correctly
- [ ] Column visibility toggle works
- [ ] All columns show/hide correctly
- [ ] Table displays all data properly
- [ ] Page Total calculates correctly
- [ ] Status badges display with correct colors
- [ ] Net profit calculation is accurate
- [ ] Commission calculation is correct (Net Profit × Rate)
- [ ] Commission rate defaults to 30%
- [ ] Negative net profit shows 0 commission
- [ ] Pagination works correctly
- [ ] Export generates valid CSV
- [ ] Loading states display properly
- [ ] Error handling works correctly
- [ ] Empty state displays when no data
- [ ] Downline with no affiliates shows proper message
- [ ] Responsive design works on mobile
- [ ] Tab switching preserves filters
- [ ] Date format conversion works correctly

## Dependencies

### Backend
- `mongoose`: MongoDB object modeling
- `express`: Web framework
- `jsonwebtoken`: JWT authentication

### Frontend
- `react`: UI library
- `next.js`: React framework
- `tailwindcss`: Styling

## Database Schema Requirements

### User Model Fields Needed
- `_id`
- `referredBy`
- `isAffiliate`
- `commissionRate` (default: 0.30)
- `currency`

### Transaction Model Fields Needed
- `_id`
- `userId`
- `type` ('deposit' or 'withdrawal')
- `status` ('completed', etc.)
- `amount`
- `createdAt`

### Bet Model Fields Needed
- `_id`
- `userId`
- `amount`
- `status` ('won', 'lost', 'pending')
- `winAmount`
- `createdAt`

## Notes

1. **Current Implementation**: Commissions are calculated on-demand. For production, consider implementing a Commission model and scheduled calculations.

2. **Commission Rate**: Default is 30%. Add `commissionRate` field to User model to allow per-affiliate rates.

3. **Period**: Currently hard-coded as "Monthly". Implement period-based calculation logic for actual monthly periods.

4. **Status**: Currently returns 'pending' for positive commissions. Implement admin approval workflow for status changes.

5. **Currency Separation**: Each currency generates a separate commission record, allowing proper tracking per currency.

6. **Performance**: With many affiliates and players, on-demand calculation may be slow. Implement caching or pre-calculation.

7. **Negative Commissions**: Current implementation sets commission to 0 for negative net profit. Consider implementing different policies (carry-forward losses, etc.).

8. **Date Filter**: Applied to transaction/bet dates, not commission period dates. Adjust based on business requirements.

## Related Pages
- Dashboard: Shows overall commission summary
- Performance: Shows detailed player performance that generates commissions
- Bank: Shows bank accounts for commission payouts
- Profile: Shows total commission balance

## Business Logic Examples

### Example 1: Single Player, Single Currency
```
Player Activity (January 2026, BDT):
- Deposits: 50,000 BDT
- Withdrawals: 20,000 BDT
- Winnings: 15,000 BDT

Calculation:
Net Profit = 50,000 - 20,000 - 15,000 = 15,000 BDT
Commission (30%) = 15,000 × 0.30 = 4,500 BDT

Result:
- Start Date: 01/01/2026
- Currency: BDT
- Net Profit: 15,000.00
- Commission: 4,500.00
- Period: Monthly
- Status: Pending
```

### Example 2: Multiple Players, Multiple Currencies
```
Affiliate has 3 players:

Player 1 (BDT):
- Net Profit: 10,000 BDT
- Commission: 3,000 BDT

Player 2 (BDT):
- Net Profit: 5,000 BDT
- Commission: 1,500 BDT

Player 3 (INR):
- Net Profit: 20,000 INR
- Commission: 6,000 INR

Result (2 Commission Records):
Record 1:
- Currency: BDT
- Net Profit: 15,000 (10,000 + 5,000)
- Commission: 4,500 (3,000 + 1,500)

Record 2:
- Currency: INR
- Net Profit: 20,000
- Commission: 6,000
```

### Example 3: Downline Commission
```
Main Affiliate A has 2 downline affiliates (B and C)

Downline B's players:
- Net Profit: 30,000 BDT
- Commission for B: 9,000 BDT

Downline C's players:
- Net Profit: 25,000 BDT
- Commission for C: 7,500 BDT

When A views Downline tab:
Record 1 (from B):
- Net Profit: 30,000
- Commission: 9,000

Record 2 (from C):
- Net Profit: 25,000
- Commission: 7,500
```

## API Testing

### Test Request 1: My Account Commissions
```bash
GET /api/affiliate/commissions?type=myAccount&currency=BDT
Authorization: Bearer <token>
```

### Test Request 2: Downline Commissions with Date Filter
```bash
GET /api/affiliate/commissions?type=downline&startDate=2026-01-01&endDate=2026-01-31
Authorization: Bearer <token>
```

### Test Request 3: All Currencies with Pagination
```bash
GET /api/affiliate/commissions?currency=All&page=1&limit=10
Authorization: Bearer <token>
```
