# Affiliate Profile Page Implementation

## Overview
Complete implementation of the Affiliate Profile page with full backend and frontend integration, matching the design from the provided screenshot.

## Features Implemented

### Backend (`backend/controllers/affiliate.controller.js`)

#### getProfile Method
- **Route**: `GET /api/affiliate/profile`
- **Authentication**: Required (via JWT token)
- **Access**: Private (Affiliate users only)

#### Data Sections:

1. **Profile Information**
   - Username
   - First Name
   - Last Name
   - Email
   - Phone Number
   - Date of Birth
   - Referral Code
   - Account Status (Active/Inactive badge)
   - Approved Date and Time
   - Last Login Time
   - Last Withdrawal Time

2. **Potential Earnings (This Period)**

   **Earnings Tab:**
   - (-) Total Profit & Loss
   - (-) Total Bonus
   - (-) Total Revenue Adjustment
   - Negative Carry Forward
   - **Total Net Profit**
   - Commission(%)
   - **Earnings**

   **Total Revenue Tab:**
   - (-) Total Deduction
   - Total Revenue From Turnover
   - Total Recycle Amount
   - (-) Total Referral Commission
   - Total Cancel Fee
   - (-) Total VIP Cash Bonus
   - (-) Total Payment Fee

3. **Commission Balances**
   - Pending: Commission waiting to be approved
   - Available: Commission ready for withdrawal
   - Processing Withdrawal: Commission being withdrawn

#### Database Queries Used:

**User Profile:**
- Fetch user details (username, name, email, phone, DOB, referral code, status)
- Last withdrawal transaction timestamp

**Potential Calculations (Current Month):**
- **Total Profit & Loss**: Deposits + Settlements - Withdrawals
- **Total Deduction**: Sum of deduction transactions
- **Total Revenue From Turnover**: Sum of all bet stakes (settled bets)
- **Total Bonus**: Sum of bonus transactions
- **Total Recycle Amount**: Sum of refund transactions
- **Total Cancel Fee**: Sum of cancel fee transactions
- **Total VIP Cash Bonus**: Sum of VIP cash bonus transactions
- **Total Referral Commission**: Sum of commission transactions
- **Total Revenue Adjustment**: Sum of adjustment transactions
- **Total Payment Fee**: Sum of payment fee transactions
- **Negative Carry Forward**: Abs(Profit&Loss) if negative
- **Total Net Profit**: Max(0, Profit&Loss)
- **Commission(%)**: Configurable percentage (default 0)
- **Earnings**: Net Profit × (Commission% / 100)

**Commission Balances:**
- **Pending**: Sum of pending commission transactions
- **Available**: Sum of completed commission transactions
- **Processing Withdrawal**: Sum of processing withdrawal transactions

### Frontend (`app/(main)/affiliate/profile/page.tsx`)

#### Layout Structure:

**Top Section (2-column grid):**
1. **Profile Card** (Left)
   - Settings icon in header
   - 2-column grid layout for profile fields
   - Green "Active" status badge
   - All profile information displayed

2. **Contact Info Card** (Right)
   - Settings icon in header
   - Phone Number with delete button (red circle)
   - Email with delete button (red circle)
   - Both fields in light gray background containers

**Bottom Section (2-column grid):**
1. **Potential (This Period) Card** (Left)
   - Currency dropdown (BDT)
   - Tab switcher: Earnings | Total Revenue
   - Financial metrics in 2-column layout (label | value)
   - Red text for negative values (-)
   - Gray "Refresh" button at bottom

2. **Commission Card** (Right)
   - Currency dropdown (BDT)
   - Contact Info badges: Email, Phone Number, Identity(Any One), Identity Card
   - Three commission amounts (Pending, Available, Processing Withdrawal)
   - Three action buttons: View, Apply, Refresh

#### Design Features:
- **Color Scheme**: Light theme (white cards on gray background)
- **Typography**: 
  - Headers: Bold gray-800
  - Labels: Medium gray-600
  - Values: Regular gray-900
  - Monospace for currency amounts
- **Badges**:
  - Account Status: Green badge
  - Contact Info: Colored rounded-full badges (red, yellow, blue, green)
- **Icons**: 
  - Profile icon
  - Contact/Email icon
  - Chart icon for potential
  - Money icon for commission
  - Settings/gear icons in headers
  - Delete (X) icons for contact fields
- **Buttons**:
  - Gray: Refresh, View
  - Blue: Apply
  - Green: Refresh (commission section)
  - Red circle: Delete (contact info)
- **Interactive Elements**:
  - Tab switcher with blue underline for active tab
  - Hover effects on buttons
  - Currency dropdown selectors

#### State Management:
- Loading state with centered spinner
- Error state with red alert banner
- Active tab state (Earnings/Revenue)
- Data fetching on mount
- Refresh functionality on button click

## API Integration

### Endpoint
```
GET /api/affiliate/profile
```

### Request Headers
```
Authorization: Bearer <JWT_TOKEN>
```

### Response Structure
```json
{
  "success": true,
  "data": {
    "profile": {
      "username": "01721000007",
      "firstName": "shipon",
      "lastName": "uddin",
      "email": "shiponboard@gmail.com",
      "phoneNumber": "+880 1721000007",
      "dateOfBirth": "1994-07-12",
      "referralCode": "S97yYt27",
      "accountStatus": "active",
      "approvedDate": "2026-06-12T10:03:43",
      "lastLoginTime": "2025-01-16T01:40:57",
      "lastWithdrawalTime": null
    },
    "potential": {
      "totalProfitLoss": 0.00,
      "totalDeduction": 0.00,
      "totalRevenueTurnover": 0.00,
      "totalBonus": 0.00,
      "totalRecycleAmount": 0.00,
      "totalReferralCommission": 0.00,
      "totalRevenueAdjustment": 0.00,
      "totalCancelFee": 0.00,
      "totalVipCashBonus": 0.00,
      "totalPaymentFee": 0.00,
      "negativeCarryForward": 0.00,
      "totalNetProfit": 0.00,
      "commissionPercentage": 0,
      "earnings": 0.00
    },
    "commission": {
      "pending": 0.00,
      "available": 0.00,
      "processingWithdrawal": 0.00
    }
  }
}
```

## Files Modified

### Backend Files:
1. **`backend/controllers/affiliate.controller.js`**
   - Added `getProfile()` method (300+ lines)
   - Comprehensive MongoDB aggregation queries
   - Calculates all potential earnings metrics
   - Fetches commission balances

2. **`backend/routes/affiliate.routes.js`**
   - Added route: `GET /api/affiliate/profile`
   - Protected with authentication middleware

### Frontend Files:
1. **`app/(main)/affiliate/profile/page.tsx`**
   - Complete profile UI implementation (450+ lines)
   - 4-section layout matching screenshot
   - Tab switching functionality
   - API integration with loading/error states
   - Responsive grid layout

## Database Requirements

### User Model Fields:
- `username`: String
- `firstName`: String
- `lastName`: String
- `email`: String
- `phoneNumber`: String
- `dateOfBirth`: Date
- `referralCode`: String (unique)
- `status`: String (active, inactive)
- `createdAt`: Date (approval date)
- `lastLogin`: Date
- `referredBy`: ObjectId (for tracking referrals)

### Transaction Model Fields:
- `userId`: ObjectId
- `type`: String (deposit, withdrawal, commission, bonus, fee, refund, adjustment, deduction, bet_settlement)
- `subType`: String (cancel_fee, payment_fee, vip_cash)
- `amount`: Number
- `status`: String (pending, completed, processing, failed)
- `profitLoss`: Number (for bet_settlement type)
- `createdAt`: Date

### Bet Model Fields:
- `userId`: ObjectId
- `stake`: Number
- `status`: String (settled, won, lost, pending)
- `createdAt`: Date

## Testing Checklist

### Backend:
- [ ] Test `/api/affiliate/profile` endpoint
- [ ] Verify profile data retrieval
- [ ] Check potential calculations (all 14 metrics)
- [ ] Verify commission balance calculations
- [ ] Test with no referred users
- [ ] Test with no transactions
- [ ] Test date formatting
- [ ] Test last withdrawal timestamp

### Frontend:
- [ ] Profile card displays correctly
- [ ] Contact Info card shows phone and email
- [ ] Tab switching works (Earnings ↔ Total Revenue)
- [ ] All metrics display with correct formatting
- [ ] Currency formatting (2 decimal places)
- [ ] Date formatting (DD/MM/YYYY HH:MM:SS)
- [ ] Status badge shows correct color
- [ ] Contact info badges display
- [ ] Buttons are functional
- [ ] Refresh reloads data
- [ ] Loading state displays
- [ ] Error handling works
- [ ] Responsive layout (mobile, tablet, desktop)
- [ ] Settings icons appear in headers
- [ ] Delete buttons appear on contact fields

## Key Differences from Screenshot

### Maintained:
✅ 4-section grid layout  
✅ White cards on gray background  
✅ Tab switcher with Earnings/Total Revenue  
✅ Contact info badges with colors  
✅ Three action buttons (View, Apply, Refresh)  
✅ Delete buttons on contact fields  
✅ Currency dropdown (BDT)  
✅ Settings icons in card headers  
✅ Green status badge  
✅ Financial metrics layout  

### Enhancements:
- Added icons to all section headers
- Added hover effects on buttons
- Added loading and error states
- Implemented responsive grid layout
- Added TypeScript type safety
- Monospace font for currency values

## Performance Considerations

- All queries limited to current month period
- Parallel aggregation queries using Promise.all
- Indexed fields recommended:
  - `User.referredBy`
  - `Transaction.userId`, `Transaction.type`, `Transaction.status`, `Transaction.createdAt`
  - `Bet.userId`, `Bet.status`, `Bet.createdAt`
- Consider caching profile data
- Lazy loading for contact info section

## Security

- JWT authentication required
- User can only view their own profile
- Referred user data filtered by `referredBy` field
- No sensitive financial data exposed
- Input validation on all fields
- Protected routes with authentication middleware

## Future Enhancements

1. **Edit Profile Functionality**
   - Modal for editing profile fields
   - Update API endpoint
   - Form validation

2. **Delete Contact Info**
   - Implement delete functionality for phone/email
   - Confirmation modal
   - Backend API for deletion

3. **Commission Details**
   - Click "View" to see commission history
   - Modal or redirect to commission page
   - Detailed transaction list

4. **Apply for Withdrawal**
   - Modal for withdrawal request
   - Amount input with validation
   - Submit to backend API

5. **Date Range Selector**
   - Custom period selection for potential calculations
   - Date picker component
   - Dynamic query updates

6. **Export Functionality**
   - Export profile data as PDF
   - Export potential earnings as CSV
   - Email reports

7. **Real-time Updates**
   - Socket.io integration
   - Live commission updates
   - Notification system

## Notes

- Currency formatting uses 2 decimal places (0.00)
- Dates formatted as: YYYY/MM/DD HH:MM:SS
- Period calculations based on current month (UTC)
- Commission percentage currently defaults to 0 (configurable)
- Negative values shown with red (-) prefix
- All amounts calculated from referred users' transactions
