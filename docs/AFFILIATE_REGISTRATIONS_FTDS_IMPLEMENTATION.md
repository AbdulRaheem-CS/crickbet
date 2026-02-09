# Affiliate Registrations & FTDs Page Implementation

## Overview
The Registrations & FTDs (First Time Deposits) page allows affiliates to view and analyze their referred users' registration data and their first-time deposits/bets. This page provides comprehensive tracking of new user acquisition and their initial activities.

## Implementation Date
January 2025

## Features

### 1. Date Filter
- **Toggle Option**: Enable/disable date range filtering
- **From Date**: Start date for registration filter
- **To Date**: End date for registration filter
- **Default**: All-time data when disabled

### 2. Search Filters
- **Keywords**: Filter by tracking link keywords (default: All)
- **Currency**: Filter by user currency (BDT, INR, USD, EUR, GBP)

### 3. Data Display
The table shows the following information for each registered user:
- **#**: Serial number
- **Username**: Registered user's username
- **Keywords**: Associated tracking link keyword
- **Currency**: User's selected currency
- **Registration Time**: Account creation timestamp
- **First Deposit Time**: Timestamp of first deposit
- **First Deposit**: Amount of first deposit
- **First Bet Time**: Timestamp of first bet
- **First Bet**: Amount of first bet
- **Last Bet Time**: Timestamp of last bet
- **Last Bet**: Amount of last bet

### 4. Summary Rows
- **Page Total**: Sum of deposits and bets for current page
- **Grand Total**: Sum of deposits and bets for all filtered records

### 5. Actions
- **Export**: Download data as CSV file
- **Search**: Apply filters and fetch data

## Technical Implementation

### Backend

#### Controller Method: `getRegistrationsFTDs`
**Location**: `backend/controllers/affiliate.controller.js`

**Functionality**:
1. Fetches referred users based on filters
2. Enriches data with first deposit information from Transactions
3. Enriches data with first and last bet information from Bets
4. Calculates page totals and grand totals
5. Returns paginated results

**Query Parameters**:
- `startDate` (optional): Filter registrations from this date
- `endDate` (optional): Filter registrations until this date
- `keywords` (optional): Filter by tracking link keyword
- `currency` (optional): Filter by user currency
- `page` (default: 1): Page number for pagination
- `limit` (default: 10): Number of records per page

**Response Format**:
```json
{
  "success": true,
  "data": {
    "registrations": [
      {
        "_id": "user_id",
        "username": "john_doe",
        "keywords": "social_media",
        "currency": "BDT",
        "registrationTime": "2024-01-15T10:30:00.000Z",
        "firstDepositTime": "2024-01-15T11:00:00.000Z",
        "firstDepositAmount": 1000,
        "firstBetTime": "2024-01-15T11:30:00.000Z",
        "firstBetAmount": 500
      }
    ],
    "pageTotal": {
      "firstDeposit": 5000,
      "firstBet": 2500,
      "lastBet": 2500
    },
    "grandTotal": {
      "firstDeposit": 50000,
      "firstBet": 25000,
      "lastBet": 25000
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
**Path**: `GET /api/affiliate/registrations-ftds`
**Authentication**: Required (JWT token)
**Location**: `backend/routes/affiliate.routes.js`

### Frontend

#### Component: `RegistrationsFTDsPage`
**Location**: `app/(main)/affiliate/registrations-ftds/page.tsx`

**State Management**:
- `showDateFilter`: Boolean for date filter toggle
- `startDate`: Start date for filtering
- `endDate`: End date for filtering
- `keywords`: Selected keyword filter
- `currency`: Selected currency filter
- `data`: Registration data with totals
- `loading`: Loading state
- `error`: Error message

**Key Functions**:
1. `fetchRegistrations()`: Fetches data from backend API
2. `handleSearch()`: Triggers data fetch with current filters
3. `handleExport()`: Exports table data to CSV
4. `formatDateTime()`: Formats date/time for display

**UI Components**:
1. **Filter Section**:
   - Date filter toggle checkbox
   - Conditional date inputs (From/To)
   - Keywords dropdown
   - Currency dropdown

2. **Data Table**:
   - 11 columns showing registration and activity data
   - Page Total row (blue background)
   - Grand Total row (green background)
   - Empty state message
   - Loading state

3. **Action Buttons**:
   - Export button (green)
   - Search button (blue)

## Database Queries

### 1. Find Referred Users
```javascript
const filter = { referredBy: affiliateId };
if (startDate || endDate) {
  filter.createdAt = {};
  if (startDate) filter.createdAt.$gte = new Date(startDate);
  if (endDate) filter.createdAt.$lte = new Date(endDate);
}
if (keywords && keywords !== 'All') {
  filter.username = { $regex: keywords, $options: 'i' };
}
if (currency && currency !== 'All') {
  filter.currency = currency;
}
const users = await User.find(filter).sort({ createdAt: -1 });
```

### 2. Find First Deposit
```javascript
const firstDeposit = await Transaction.findOne({
  userId: user._id,
  type: 'deposit',
  status: 'completed'
}).sort({ createdAt: 1 });
```

### 3. Find First Bet
```javascript
const firstBet = await Bet.findOne({
  userId: user._id
}).sort({ createdAt: 1 });
```

### 4. Calculate Grand Totals
```javascript
// First Deposits Grand Total
const grandTotalDeposits = await Transaction.aggregate([
  {
    $match: {
      userId: { $in: allUserIds },
      type: 'deposit',
      status: 'completed'
    }
  },
  {
    $group: {
      _id: '$userId',
      firstDeposit: { $first: '$amount' }
    }
  },
  {
    $group: {
      _id: null,
      total: { $sum: '$firstDeposit' }
    }
  }
]);

// First Bets Grand Total
const grandTotalBets = await Bet.aggregate([
  {
    $match: {
      userId: { $in: allUserIds }
    }
  },
  {
    $group: {
      _id: '$userId',
      firstBet: { $first: '$amount' }
    }
  },
  {
    $group: {
      _id: null,
      total: { $sum: '$firstBet' }
    }
  }
]);
```

## Styling

### Theme
- **Background**: Light gray (`bg-gray-100`)
- **Cards**: White background with shadow
- **Table Header**: Gray background (`bg-gray-50`)
- **Page Total Row**: Blue background (`bg-blue-50`)
- **Grand Total Row**: Green background (`bg-green-50`)

### Responsive Design
- Grid layout for filters
- Horizontal scrolling for wide tables
- Mobile-friendly date pickers
- Touch-friendly buttons

## CSV Export Format

The export function generates a CSV file with the following structure:
```csv
#,Username,Keywords,Currency,Registration Time,First Deposit Time,First Deposit,First Bet Time,First Bet,Last Bet Time,Last Bet
1,john_doe,social_media,BDT,15/01/2024 10:30:00,15/01/2024 11:00:00,1000,15/01/2024 11:30:00,500,15/01/2024 12:00:00,300
```

## Performance Considerations

1. **Pagination**: Default limit of 10 records per page
2. **Lazy Loading**: Data fetched only when needed
3. **Aggregation**: Grand totals calculated separately to avoid loading all records
4. **Indexes**: Ensure indexes on:
   - `User.referredBy`
   - `User.createdAt`
   - `Transaction.userId`
   - `Transaction.type`
   - `Transaction.status`
   - `Bet.userId`

## Future Enhancements

1. **Advanced Filtering**:
   - Filter by deposit amount range
   - Filter by bet amount range
   - Filter by conversion rate (deposited/registered)

2. **Analytics**:
   - Conversion rate calculation (FTD/registrations)
   - Average time to first deposit
   - Average time to first bet

3. **Visualization**:
   - Charts for registration trends
   - FTD conversion funnel
   - Time-to-conversion analysis

4. **Export Options**:
   - PDF export
   - Excel export with formatting
   - Scheduled email reports

## Testing Checklist

- [ ] Date filter toggle works correctly
- [ ] Date range filtering returns correct results
- [ ] Keywords filter works (when implemented)
- [ ] Currency filter works correctly
- [ ] Table displays all columns properly
- [ ] Page Total calculates correctly
- [ ] Grand Total calculates correctly
- [ ] Pagination works correctly
- [ ] Export generates valid CSV
- [ ] Loading states display properly
- [ ] Error handling works correctly
- [ ] Empty state displays when no data
- [ ] Responsive design works on mobile

## Dependencies

### Backend
- `mongoose`: MongoDB object modeling
- `express`: Web framework
- `jsonwebtoken`: JWT authentication

### Frontend
- `react`: UI library
- `next.js`: React framework
- `tailwindcss`: Styling

## Notes

1. The "Last Bet Time" and "Last Bet" columns currently show the same values as first bet. To implement actual last bet tracking, add another query:
```javascript
const lastBet = await Bet.findOne({
  userId: user._id
}).sort({ createdAt: -1 });
```

2. The keywords filter currently searches in usernames. To properly implement keyword tracking, associate users with affiliate links during registration.

3. Grand total calculations use aggregation pipelines for better performance with large datasets.

4. Consider adding caching for grand totals as they don't change frequently.

## Related Pages
- Dashboard: Shows overall FTD statistics
- Member Search: Shows all referred members
- Material/Links: Manage tracking links that generate registrations
