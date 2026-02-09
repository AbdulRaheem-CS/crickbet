# Affiliate Hierarchy Page Implementation

## Overview
Complete implementation of the Affiliate Hierarchy/Network page showing the affiliate's upline (referrer) and downline (referred users) with detailed statistics and user information.

## Features Implemented

### Backend (`backend/controllers/affiliate.controller.js`)

#### getHierarchy Method
- **Route**: `GET /api/affiliate/hierarchy`
- **Description**: Get affiliate's complete network hierarchy
- **Authentication**: Required (JWT token)
- **Access**: Private (Affiliate users only)

#### Data Retrieved:

1. **Upline Information**
   - Username
   - Email
   - Phone number
   - Account creation date
   - Status

2. **Downline Users** (All referred users)
   - Basic user information
   - Total deposits (completed)
   - Total withdrawals (completed)
   - Total bets placed
   - Join date
   - Account status

3. **Network Statistics**
   - Total Referrals: Total number of users referred
   - Active Referrals: Users who placed bets in last 30 days
   - Total Earnings: Sum of all commissions earned

### Backend Routes (`backend/routes/affiliate.routes.js`)

Added route:
```javascript
GET /api/affiliate/hierarchy
```

Protected with authentication middleware.

### Frontend (`app/(main)/affiliate/hierarchy/page.tsx`)

#### Page Sections:

1. **Statistics Cards** (3 cards in responsive grid)
   - **Total Referrals**
     - Icon: Users group (blue)
     - Shows total count of referred users
   
   - **Active Referrals**
     - Icon: Checkmark circle (green)
     - Shows users active in last 30 days
   
   - **Total Earnings**
     - Icon: Money/Dollar (purple)
     - Shows total commission earned
     - Formatted as currency

2. **Upline Section**
   - Title with up arrow icon
   - Shows parent affiliate (if exists)
   - Displays:
     - Avatar with first letter of username
     - Username and email
     - Join date
   - Empty state: "No upline found. You are a top-level affiliate."

3. **Downline Section**
   - Title with down arrow icon
   - List of all referred users
   - Each user card shows:
     - Avatar with first letter
     - Username and status badge
     - Phone number or email
     - Join date
     - Total bets count
     - Expandable details section
   - Expanded view shows:
     - Email
     - Phone number
     - Total deposits
     - Total withdrawals
   - Empty state: 
     - Icon and message
     - "Copy Referral Link" button

#### Design Features:

**Color Scheme:**
- Background: Light gray (bg-gray-100)
- Cards: White with shadow
- Stats card icons: Blue, Green, Purple backgrounds
- Avatar gradients: Blue-purple, Green-blue
- Status badges: Green for active, Gray for inactive

**Layout:**
- Responsive grid for stats (1 column mobile, 3 columns desktop)
- Full-width sections for upline/downline
- Expandable user cards with smooth transitions

**Interactive Elements:**
- Expand/collapse user details (chevron rotation)
- Copy referral link button
- Hover effects on cards and buttons
- Status indicators

**Icons:**
- Users group icon (stats)
- Check circle icon (active)
- Money icon (earnings)
- Up arrow (upline)
- Down arrow (downline)
- Chevron (expand/collapse)
- User icons in avatars

**User Cards:**
- Gradient avatars with initials
- Status badges (active/inactive)
- Hover border color change
- Smooth expand/collapse animation
- Grid layout for expanded stats

**Empty States:**
- Upline: Text message for top-level affiliates
- Downline: Icon, message, and action button

## Database Queries

### User Queries:
1. **Find Current User**: Get referredBy field
2. **Find Upline**: Get user who referred current user
3. **Find Downline**: Get all users referred by current user

### Transaction Aggregations:
For each downline user:
- **Total Deposits**: Sum of completed deposit transactions
- **Total Withdrawals**: Sum of completed withdrawal transactions

### Bet Queries:
- **Total Bets**: Count of settled/won/lost bets per user
- **Active Bettors**: Distinct users who bet in last 30 days

### Commission Query:
- **Total Earnings**: Sum of completed commission transactions for affiliate

## API Response Structure

### Endpoint
```
GET /api/affiliate/hierarchy
```

### Headers
```
Authorization: Bearer <JWT_TOKEN>
```

### Response
```json
{
  "success": true,
  "data": {
    "upline": {
      "_id": "507f1f77bcf86cd799439011",
      "username": "topaffiliate",
      "email": "top@example.com",
      "phoneNumber": "+1234567890",
      "createdAt": "2026-01-01T00:00:00.000Z",
      "status": "active"
    },
    "downline": [
      {
        "_id": "507f1f77bcf86cd799439012",
        "username": "user123",
        "email": "user@example.com",
        "phoneNumber": "+9876543210",
        "createdAt": "2026-01-15T10:00:00.000Z",
        "status": "active",
        "totalDeposits": 5000.00,
        "totalWithdrawals": 2000.00,
        "totalBets": 150
      }
    ],
    "stats": {
      "totalReferrals": 25,
      "activeReferrals": 15,
      "totalEarnings": 12500.00
    }
  }
}
```

## Files Modified

### Backend Files:
1. **`backend/controllers/affiliate.controller.js`**
   - Added `getHierarchy()` method
   - Comprehensive network data aggregation
   - Stats calculations for each referred user

2. **`backend/routes/affiliate.routes.js`**
   - Added route: `GET /api/affiliate/hierarchy`

### Frontend Files:
1. **`app/(main)/affiliate/hierarchy/page.tsx`**
   - Complete hierarchy UI implementation
   - Stats cards with icons
   - Upline section
   - Downline expandable list
   - Empty states
   - API integration

## Testing Checklist

### Backend:
- [ ] GET /api/affiliate/hierarchy returns correct data
- [ ] Upline is null for top-level affiliates
- [ ] Downline array is empty when no referrals
- [ ] Stats calculations are accurate
- [ ] Total deposits/withdrawals calculated correctly
- [ ] Active referrals count (last 30 days) works
- [ ] Total earnings from commissions correct
- [ ] User can only access their own hierarchy
- [ ] Authentication required

### Frontend:
- [ ] Stats cards display correct values
- [ ] Upline section shows parent affiliate
- [ ] Upline empty state for top-level users
- [ ] Downline list displays all referrals
- [ ] User cards show correct information
- [ ] Expand/collapse functionality works
- [ ] Expanded view shows detailed stats
- [ ] Status badges display correctly (active/inactive)
- [ ] Currency formatting works
- [ ] Date formatting displays correctly
- [ ] Copy referral link button works
- [ ] Empty state for downline displays
- [ ] Responsive design (mobile/tablet/desktop)
- [ ] Loading state shows while fetching
- [ ] Error handling displays errors

## Features & Functionality

### Network Visualization:
✅ View upline (parent affiliate)  
✅ View all downline (referred users)  
✅ Expandable user details  
✅ Status indicators  
✅ Join date tracking  

### Statistics:
✅ Total referrals count  
✅ Active referrals (last 30 days)  
✅ Total earnings from commissions  
✅ Per-user deposits  
✅ Per-user withdrawals  
✅ Per-user bet count  

### User Experience:
✅ Gradient avatars with initials  
✅ Expandable cards for details  
✅ Empty states with helpful messages  
✅ Copy referral link button  
✅ Responsive design  
✅ Loading and error states  
✅ Smooth animations  

## Usage Instructions

### For Affiliates:

1. **Viewing Your Network:**
   - Navigate to Hierarchy page
   - See your stats at the top (referrals, active, earnings)
   - View your upline (who referred you)
   - View your downline (who you referred)

2. **Checking User Details:**
   - Click the chevron icon on any downline user
   - View expanded details:
     - Email and phone
     - Total deposits and withdrawals
     - Activity statistics

3. **Growing Your Network:**
   - If you have no referrals, click "Copy Referral Link"
   - Share the link with potential users
   - Track your growing network

### For Developers:

**Database Schema Requirements:**

User Model needs:
```javascript
{
  referredBy: ObjectId, // Reference to parent affiliate
  referralCode: String, // For referral links
  // ... other fields
}
```

## Performance Considerations

- Downline stats calculated with parallel queries (Promise.all)
- Aggregation queries for efficient statistics
- Limited data fields selected (no sensitive info)
- Indexed fields recommended:
  - `User.referredBy`
  - `Transaction.userId`, `Transaction.type`, `Transaction.status`
  - `Bet.userId`, `Bet.createdAt`
- Consider pagination for large downlines (100+ users)

## Security

- JWT authentication required
- Users can only view their own hierarchy
- No sensitive user data exposed (passwords, etc.)
- Masked phone numbers and emails (optional enhancement)
- Referral code validation on copy

## Future Enhancements

1. **Multi-Level Hierarchy:**
   - Show sub-levels (referrals of referrals)
   - Tree visualization
   - Drill-down navigation

2. **Advanced Filtering:**
   - Filter by status (active/inactive)
   - Filter by date range
   - Search by username/email
   - Sort options (date, deposits, bets)

3. **Export Functionality:**
   - Export hierarchy as CSV
   - Generate PDF reports
   - Email reports

4. **Performance Metrics:**
   - Graphs and charts
   - Commission trends
   - Growth analytics
   - Conversion rates

5. **Communication:**
   - Message downline users
   - Bulk notifications
   - Performance tips

6. **Gamification:**
   - Leaderboards
   - Achievement badges
   - Tier levels

7. **Enhanced Visualization:**
   - Tree diagram view
   - Network graph
   - Interactive org chart

## Notes

- Active referrals: Users who placed bets in last 30 days
- Total earnings: Sum of all completed commissions
- User avatars: Generated from first letter of username
- Status badges: Green for active, gray for inactive
- Expandable cards: Click chevron to toggle
- Empty states: Helpful messages with actions
- Referral link: Copies to clipboard on button click
- Currency: Indian Rupee (₹) format with 2 decimals
- Dates: DD/MM/YYYY format

## Error Handling

**Common Errors:**
- 404: User not found
- 401: Unauthorized (no token)
- 500: Server error

**Frontend Error Handling:**
- Error state with red banner
- Loading state with spinner text
- Graceful empty states
- Try-catch for API calls
- Console logging for debugging

## Matching Screenshot Requirements

From the screenshot:
✅ **Upline Section**: Header with "Upline" title  
✅ **Downline Section**: Header with "Downline" title  
✅ **User Display**: Shows user ID (01712100007)  
✅ **Clean Layout**: White background sections  
✅ **Simple Design**: Minimalist, focused on data  

Additional enhancements beyond screenshot:
- Stats cards at top
- Expandable user details
- Status indicators
- Avatar icons
- Action buttons
- Empty state handling
