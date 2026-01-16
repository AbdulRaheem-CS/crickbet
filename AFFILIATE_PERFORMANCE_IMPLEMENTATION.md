# Affiliate Performance Page Implementation

## Overview
The Performance page provides detailed analytics and metrics for affiliate referred players and downline performance. It includes comprehensive financial and activity tracking with advanced filtering and column customization options.

## Implementation Date
January 2025

## Features

### 1. Tabs
- **Player Tab**: Shows direct referrals performance
- **Downline Tab**: Shows performance of players referred by downline affiliates

### 2. Advanced Filters
- **Date Filter**: Toggle-able date range filter with From/To dates
- **Player Search**: Search by player username
- **Currency Filter**: Filter by currency (BDT, INR, USD, EUR, GBP, All)
- **Keywords Filter**: Filter by tracking link keywords
- **Column Visibility**: Toggle visibility of individual columns

### 3. Performance Metrics (20 Columns)

#### User Information
1. **#**: Serial number
2. **Username**: Player's username
3. **Keyword**: Associated tracking keyword
4. **Sign Up Country**: Registration country
5. **Currency**: Player's currency
6. **Registration Time**: Account creation timestamp
7. **First Deposit Time**: First deposit timestamp
8. **Phone Number**: Contact number
9. **Email Address**: Email address
10. **Sign Up IP**: IP address at registration
11. **Last Login IP**: Most recent login IP
12. **Last Login Time**: Last login timestamp

#### Financial Metrics
13. **Total Deposit**: Sum of all deposits
14. **Total Deposit Payment Fee**: Sum of deposit fees
15. **Total Withdrawal**: Sum of all withdrawals
16. **Total Withdrawal Payment Fee**: Sum of withdrawal fees
17. **Total Number of Bets**: Count of all bets placed
18. **Total Turnover**: Sum of all bet amounts
19. **Profit/Loss**: Net profit/loss (deposits - withdrawals - winnings)
20. **Total Jackpot**: Total jackpot winnings

### 4. Summary Rows
- **Page Total**: Sum of financial metrics for current page
- **Grand Total**: Sum of financial metrics for all filtered records

### 5. Actions
- **Export**: Download data as CSV file with all visible columns
- **Search**: Apply filters and fetch data
- **Column Visibility**: Show/hide specific columns

## Technical Implementation

### Backend

#### Controller Method: `getPerformance`
**Location**: `backend/controllers/affiliate.controller.js`

**Functionality**:
1. Determines if showing Player or Downline data based on `type` parameter
2. For Player: Fetches direct referrals (referredBy = affiliateId)
3. For Downline: Fetches players referred by downline affiliates
4. Applies filters: player name, date range, currency, keywords
5. Enriches each user with:
   - Deposit statistics (total amount, total fees)
   - Withdrawal statistics (total amount, total fees)
   - Betting statistics (count, turnover, winnings)
   - First deposit time
6. Calculates profit/loss for each player
7. Computes page totals and grand totals
8. Returns paginated results

**Query Parameters**:
- `type` (default: 'player'): 'player' or 'downline'
- `player` (optional): Username search term
- `startDate` (optional): Filter from this date
- `endDate` (optional): Filter until this date
- `currency` (optional): Filter by currency
- `keywords` (optional): Filter by keyword
- `page` (default: 1): Page number
- `limit` (default: 10): Records per page

**Response Format**:
```json
{
  "success": true,
  "data": {
    "players": [
      {
        "_id": "user_id",
        "username": "player123",
        "keyword": "social_media",
        "signUpCountry": "",
        "currency": "BDT",
        "registrationTime": "2024-01-15T10:30:00.000Z",
        "firstDepositTime": "2024-01-15T11:00:00.000Z",
        "phoneNumber": "+1234567890",
        "emailAddress": "player@example.com",
        "signUpIP": "192.168.1.1",
        "lastLoginIP": "192.168.1.2",
        "lastLoginTime": "2024-01-16T09:00:00.000Z",
        "totalDeposit": 10000,
        "totalDepositPaymentFee": 100,
        "totalWithdrawal": 5000,
        "totalWithdrawalPaymentFee": 50,
        "totalNumberOfBets": 150,
        "totalTurnover": 8000,
        "profitLoss": 3000,
        "totalJackpot": 0
      }
    ],
    "pageTotal": {
      "totalDeposit": 50000,
      "totalDepositPaymentFee": 500,
      "totalWithdrawal": 25000,
      "totalWithdrawalPaymentFee": 250,
      "totalNumberOfBets": 750,
      "totalTurnover": 40000,
      "profitLoss": 15000,
      "totalJackpot": 0
    },
    "grandTotal": {
      "totalDeposit": 500000,
      "totalDepositPaymentFee": 5000,
      "totalWithdrawal": 250000,
      "totalWithdrawalPaymentFee": 2500,
      "totalNumberOfBets": 7500,
      "totalTurnover": 400000,
      "profitLoss": 150000,
      "totalJackpot": 0
    },
    "pagination": {
      "total": 100,
      "page": 1,
      "pages": 10
    }
  }
}
```

#### Route
**Path**: `GET /api/affiliate/performance`
**Authentication**: Required (JWT token)
**Location**: `backend/routes/affiliate.routes.js`

### Frontend

#### Component: `PerformancePage`
**Location**: `app/(main)/affiliate/performance/page.tsx`

**State Management**:
- `activeTab`: Current tab ('player' or 'downline')
- `showDateFilter`: Boolean for date filter toggle
- `player`: Player username search term
- `startDate`: Start date (DD/MM/YYYY format)
- `endDate`: End date (DD/MM/YYYY format)
- `currency`: Selected currency filter
- `keywords`: Selected keyword filter
- `showColumnVisibility`: Boolean for column visibility panel
- `visibleColumns`: Object tracking which columns are visible
- `data`: Performance data with totals
- `loading`: Loading state
- `error`: Error message

**Key Functions**:
1. `fetchPerformance()`: Fetches data from backend API
2. `handleSearch()`: Triggers data fetch with current filters
3. `handleExport()`: Exports visible columns to CSV
4. `formatDateTime()`: Formats date/time for display
5. `convertDateFormat()`: Converts DD/MM/YYYY to YYYY-MM-DD
6. `toggleColumn()`: Toggles column visibility

**UI Components**:
1. **Tab Navigation**:
   - Player tab (dark gray when active)
   - Downline tab (dark gray when active)

2. **Filter Section**:
   - Date Filter toggle button
   - Player search input
   - Conditional date range inputs (From/To)
   - Currency dropdown
   - Keywords dropdown
   - Column Visibility button with dropdown panel

3. **Data Table**:
   - 20 dynamic columns (visibility controlled)
   - Dark gray header (bg-gray-600)
   - Page Total row (gray-700 background)
   - Grand Total row (gray-800 background)
   - Empty state message
   - Loading state
   - Pagination info

4. **Action Buttons**:
   - Export button (gray-700)
   - Search button (blue)

## Database Queries

### 1. Find Players (Player Tab)
```javascript
const filter = { referredBy: affiliateId };
// Apply additional filters (player name, date, currency, keywords)
const users = await User.find(filter).sort({ createdAt: -1 });
```

### 2. Find Downline Players (Downline Tab)
```javascript
// First get downline affiliates
const downlineAffiliates = await User.find({ 
  referredBy: affiliateId, 
  isAffiliate: true 
}).select('_id');

const downlineIds = downlineAffiliates.map(a => a._id);

// Then get players referred by downline
const filter = { referredBy: { $in: downlineIds } };
const users = await User.find(filter).sort({ createdAt: -1 });
```

### 3. Deposit Statistics
```javascript
const depositStats = await Transaction.aggregate([
  {
    $match: {
      userId: user._id,
      type: 'deposit',
      status: 'completed'
    }
  },
  {
    $group: {
      _id: null,
      totalDeposit: { $sum: '$amount' },
      totalFee: { $sum: { $ifNull: ['$fee', 0] } }
    }
  }
]);
```

### 4. Withdrawal Statistics
```javascript
const withdrawalStats = await Transaction.aggregate([
  {
    $match: {
      userId: user._id,
      type: 'withdrawal',
      status: 'completed'
    }
  },
  {
    $group: {
      _id: null,
      totalWithdrawal: { $sum: '$amount' },
      totalFee: { $sum: { $ifNull: ['$fee', 0] } }
    }
  }
]);
```

### 5. Betting Statistics
```javascript
const betStats = await Bet.aggregate([
  {
    $match: {
      userId: user._id
    }
  },
  {
    $group: {
      _id: null,
      totalBets: { $sum: 1 },
      totalTurnover: { $sum: '$amount' },
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

### 6. Profit/Loss Calculation
```javascript
const profitLoss = depositData.totalDeposit - withdrawalData.totalWithdrawal - betData.totalWinnings;
```

## Column Visibility Feature

### Implementation
The page includes a column visibility toggle feature:

1. **Column Visibility Button**: Opens a panel with checkboxes
2. **Panel**: Shows all 19 data columns with checkboxes
3. **Toggle Logic**: Clicking a checkbox shows/hides the column
4. **Persistent State**: Column visibility state persists during session

### Default State
All columns are visible by default. Users can customize which columns to display.

### UI Design
- Panel has scrollable max-height (max-h-96)
- Grid layout with 2 columns for checkboxes
- Column names are formatted (camelCase to Title Case)

## Styling

### Theme
- **Background**: Light gray (`bg-gray-100`)
- **Tab Active**: Dark gray (`bg-gray-700`)
- **Tab Inactive**: Light gray (`bg-gray-200`)
- **Table Header**: Gray (`bg-gray-600`) with white text
- **Page Total Row**: Dark gray (`bg-gray-700`) with white text
- **Grand Total Row**: Darker gray (`bg-gray-800`) with white text

### Responsive Design
- Wide container (max-w-[98%]) for large tables
- Horizontal scrolling for table overflow
- Grid layout for filters (responsive breakpoints)
- Mobile-friendly inputs and buttons

## CSV Export Format

The export includes only visible columns:
```csv
#,Username,Keyword,Currency,Registration Time,...,Total Deposit,Total Withdrawal,Profit/Loss
1,player123,social_media,BDT,15/01/2024 10:30:00,...,10000,5000,3000
```

## Performance Considerations

1. **Pagination**: Default 10 records per page
2. **Lazy Loading**: Data fetched only when needed
3. **Aggregation Pipelines**: Efficient calculation of statistics
4. **Separate Grand Totals**: Calculated independently to avoid loading all records
5. **Indexes**: Ensure indexes on:
   - `User.referredBy`
   - `User.isAffiliate`
   - `User.createdAt`
   - `Transaction.userId`
   - `Transaction.type`
   - `Transaction.status`
   - `Bet.userId`
   - `Bet.status`

## Player vs Downline Comparison

### Player Tab
- Shows direct referrals only
- Filter: `referredBy = affiliateId`
- Use case: Track performance of players you directly referred

### Downline Tab
- Shows players referred by your downline affiliates
- Filter: `referredBy IN (downlineAffiliateIds)`
- Use case: Track performance of your network's referrals

## Future Enhancements

1. **Advanced Analytics**:
   - Average bet size per player
   - Win/loss ratio
   - Retention rate
   - Lifetime value (LTV)

2. **Additional Filters**:
   - Filter by bet amount range
   - Filter by deposit amount range
   - Filter by activity status (active/inactive)

3. **Visualizations**:
   - Performance trend charts
   - Top performers ranking
   - Revenue breakdown by currency
   - Geographic distribution (if country data available)

4. **Export Options**:
   - PDF export with charts
   - Excel export with formulas
   - Scheduled email reports

5. **Real-time Updates**:
   - WebSocket integration for live metrics
   - Auto-refresh option
   - Push notifications for milestones

6. **Additional Metrics**:
   - Average session duration
   - Conversion funnel analytics
   - Churn analysis
   - Customer acquisition cost (CAC)

## Testing Checklist

- [ ] Player tab loads correctly
- [ ] Downline tab loads correctly
- [ ] Player search filters work
- [ ] Date filter toggle works
- [ ] Date range filtering returns correct results
- [ ] Currency filter works correctly
- [ ] Keywords filter works (when keywords added)
- [ ] Column visibility toggle works
- [ ] All columns show/hide correctly
- [ ] Table displays all metrics properly
- [ ] Page Total calculates correctly
- [ ] Grand Total calculates correctly
- [ ] Financial calculations are accurate
- [ ] Profit/loss calculation is correct
- [ ] Pagination works correctly
- [ ] Export generates valid CSV with visible columns only
- [ ] Loading states display properly
- [ ] Error handling works correctly
- [ ] Empty state displays when no data
- [ ] Downline with no data shows proper message
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
- `username`
- `email`
- `phone`
- `currency`
- `createdAt`
- `lastLoginIP`
- `lastLoginTime`
- `referredBy`
- `isAffiliate`
- Optional: `signUpIP`, `country`

### Transaction Model Fields Needed
- `_id`
- `userId`
- `type` ('deposit' or 'withdrawal')
- `status` ('completed', etc.)
- `amount`
- `fee`
- `createdAt`

### Bet Model Fields Needed
- `_id`
- `userId`
- `amount`
- `status` ('won', 'lost', 'pending')
- `winAmount`
- `createdAt`

## Notes

1. **Sign Up Country** and **Sign Up IP** fields return empty if not available in User model. Add these fields to the schema for complete functionality.

2. **Total Jackpot** currently returns 0. Implement jackpot tracking if needed.

3. **Profit/Loss Calculation**: 
   ```
   Profit/Loss = Total Deposits - Total Withdrawals - Total Winnings
   ```
   This represents the house edge/profit from the player.

4. **Downline Tab**: Requires players to have `isAffiliate` flag set to true. Ensure this field is properly maintained.

5. **Column Visibility**: State is not persisted to localStorage. Add persistence if needed.

6. **Date Format**: Frontend uses DD/MM/YYYY format, converted to YYYY-MM-DD for backend.

7. **Performance**: With large datasets, consider implementing:
   - Server-side column filtering
   - Caching for grand totals
   - Materialized views for aggregated statistics

## Related Pages
- Dashboard: Shows overall performance summary
- Member Search: Shows member details without financial metrics
- Registrations & FTDs: Shows registration and first-time deposit data
- Commission: Shows commission earnings from performance
