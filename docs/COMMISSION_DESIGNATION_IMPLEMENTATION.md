# Commission Designation Page Implementation

## Overview
Complete implementation of the Commission Designation page that allows affiliates to create and manage commission structures for their referred players with currency and status filters.

## Features Implemented

### Database Model (`backend/models/CommissionDesignation.js`)

#### CommissionDesignation Schema:
```javascript
{
  affiliateId: ObjectId (ref: User, indexed),
  playerId: ObjectId (ref: User),
  currency: String (INR, USD, EUR, GBP),
  commissionRate: Number (0-100),
  status: String (active, inactive, suspended),
  notes: String,
  timestamps: true (createdAt, updatedAt)
}
```

**Indexes:**
- Compound unique index on `affiliateId + playerId` (prevents duplicate designations)
- Single indexes on `status` and `currency` for fast filtering

### Backend (`backend/controllers/affiliate.controller.js`)

#### 1. getCommissionDesignations Method
- **Route**: `GET /api/affiliate/commission-designations`
- **Description**: Get all commission designations with filters and pagination
- **Authentication**: Required (JWT token)
- **Access**: Private (Affiliate users only)

**Query Parameters:**
- `currency`: Filter by currency (optional, 'All' for all currencies)
- `status`: Filter by status (optional, 'All' for all statuses)
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)

**Features:**
- Dynamic filtering by currency and status
- Pagination support
- Populates player information (username, email, phone)
- Sorted by creation date (newest first)
- Returns total count for pagination

#### 2. createCommissionDesignation Method
- **Route**: `POST /api/affiliate/commission-designations`
- **Description**: Create new commission designation for a player
- **Authentication**: Required (JWT token)
- **Access**: Private (Affiliate users only)

**Required Fields:**
- `playerId`: Player's user ID
- `currency`: Currency code
- `commissionRate`: Commission percentage (0-100)

**Optional Fields:**
- `status`: Designation status (default: 'active')
- `notes`: Additional notes

**Validation:**
- Player must exist in database
- Commission rate must be between 0-100
- No duplicate designations (one per affiliate-player pair)
- All required fields must be provided

#### 3. updateCommissionDesignation Method
- **Route**: `PUT /api/affiliate/commission-designations/:id`
- **Description**: Update existing commission designation
- **Authentication**: Required (JWT token)
- **Access**: Private (Affiliate users only)

**Updatable Fields:**
- `currency`: Change currency
- `commissionRate`: Change commission rate (0-100)
- `status`: Change status
- `notes`: Update notes

**Validation:**
- Designation must exist and belong to affiliate
- Commission rate validation (0-100)

#### 4. deleteCommissionDesignation Method
- **Route**: `DELETE /api/affiliate/commission-designations/:id`
- **Description**: Delete commission designation
- **Authentication**: Required (JWT token)
- **Access**: Private (Affiliate users only)

**Validation:**
- Designation must exist and belong to affiliate
- Soft delete (can be implemented as status change)

### Backend Routes (`backend/routes/affiliate.routes.js`)

Added routes:
```javascript
GET    /api/affiliate/commission-designations       // Get all designations
POST   /api/affiliate/commission-designations       // Create designation
PUT    /api/affiliate/commission-designations/:id   // Update designation
DELETE /api/affiliate/commission-designations/:id   // Delete designation
```

All routes protected with authentication middleware.

### Frontend (`app/(main)/affiliate/commission-designation/page.tsx`)

#### Page Structure:

1. **Filters Section**
   - **Currency Filter** (dropdown):
     - All (default)
     - INR
     - USD
     - EUR
     - GBP
   
   - **Status Filter** (dropdown):
     - All (default)
     - Active
     - Inactive
     - Suspended
   
   - **Search Button**:
     - Applies filters
     - Resets to page 1
     - Fetches filtered data

2. **Create Button**
   - Opens modal for creating new designation
   - Positioned above table

3. **Data Table**
   
   **Columns:**
   - **Player**: Player username
   - **Currency**: Currency code
   - **Commission Rate**: Percentage with % symbol
   - **Created Time**: Date and time of creation
   - **Update Date**: Last update timestamp
   - **Status**: Badge with color coding
   - **Action**: Delete button

   **Features:**
   - Dark gray header (bg-gray-700)
   - Alternating row hover effect
   - Empty state: "No data available in table"
   - Loading state: "Loading..."
   - Responsive design
   - Column sorting icons (UI only)

4. **Pagination Controls**
   
   **Show Entries:**
   - Dropdown to select items per page (10, 25, 50, 100)
   - Currently fixed at 10

   **Info Display:**
   - "Showing X to Y of Z entries"
   - Updates based on current page

   **Navigation:**
   - Previous button (disabled on first page)
   - Next button (disabled on last page)
   - Page number tracking

5. **Create Modal**
   
   **Form Fields:**
   - **Player** (dropdown) *:
     - Lists all referred players
     - Shows username and email
     - Required field
   
   - **Currency** (dropdown) *:
     - INR (default)
     - USD
     - EUR
     - GBP
     - Required field
   
   - **Commission Rate** (number input) *:
     - Min: 0
     - Max: 100
     - Step: 0.01 (allows decimals)
     - Shows % symbol
     - Required field
   
   - **Status** (dropdown):
     - Active (default)
     - Inactive
     - Suspended
   
   - **Notes** (textarea):
     - Optional field
     - 3 rows
     - Placeholder text

   **Buttons:**
   - **Cancel**: Close modal, reset form
   - **Create**: Submit form (disabled during submission)

#### Design Features:

**Color Scheme:**
- Background: Light gray (bg-gray-100)
- Cards: White with shadow
- Header: Dark gray (bg-gray-700)
- Primary button: Gray-700
- Status badges:
  - Active: Green (bg-green-100, text-green-800)
  - Inactive: Gray (bg-gray-100, text-gray-800)
  - Suspended: Red (bg-red-100, text-red-800)

**Layout:**
- Full-width table with horizontal scroll
- 4-column filter grid on desktop
- Responsive single column on mobile
- Modal centered with backdrop
- Consistent spacing (p-6, gap-4)

**Interactive Elements:**
- Hover effects on rows and buttons
- Focus rings on inputs
- Disabled states
- Loading states
- Success/error messages
- Modal overlay (50% opacity black)

**Typography:**
- Page title: 3xl, bold
- Table headers: Small, medium weight, white
- Table data: Small, gray-900
- Labels: Small, medium weight

#### Functionality:

**Data Fetching:**
- Fetch designations on page load
- Re-fetch on filter change
- Re-fetch on pagination
- Fetch available players for dropdown

**Filtering:**
- Currency filter (client-side selection, server-side filtering)
- Status filter (client-side selection, server-side filtering)
- Search button applies filters
- Resets to page 1 on filter change

**Pagination:**
- Track current page
- Calculate total pages
- Previous/Next navigation
- Show current range
- Disable buttons at boundaries

**Create Designation:**
- Modal form submission
- Validation before submit
- Success message on creation
- Auto-refresh table
- Reset form on success
- Close modal on success

**Delete Designation:**
- Confirmation dialog
- Delete API call
- Success message
- Auto-refresh table
- Error handling

**Player Selection:**
- Fetches referred players from hierarchy API
- Populates dropdown with username and email
- Prevents duplicate designations (server-side)

## API Response Structure

### Get Commission Designations
```
GET /api/affiliate/commission-designations?currency=INR&status=active&page=1&limit=10
```

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "designations": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "affiliateId": "507f1f77bcf86cd799439012",
        "playerId": {
          "_id": "507f1f77bcf86cd799439013",
          "username": "player123",
          "email": "player@example.com",
          "phoneNumber": "+1234567890"
        },
        "currency": "INR",
        "commissionRate": 5.5,
        "status": "active",
        "notes": "VIP player",
        "createdAt": "2026-01-16T10:00:00.000Z",
        "updatedAt": "2026-01-16T10:00:00.000Z"
      }
    ],
    "pagination": {
      "total": 25,
      "page": 1,
      "pages": 3
    }
  }
}
```

### Create Commission Designation
```
POST /api/affiliate/commission-designations
```

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Request Body:**
```json
{
  "playerId": "507f1f77bcf86cd799439013",
  "currency": "INR",
  "commissionRate": 5.5,
  "status": "active",
  "notes": "VIP player"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Commission designation created successfully",
  "data": {
    "designation": {
      "_id": "507f1f77bcf86cd799439011",
      "affiliateId": "507f1f77bcf86cd799439012",
      "playerId": {
        "_id": "507f1f77bcf86cd799439013",
        "username": "player123",
        "email": "player@example.com",
        "phoneNumber": "+1234567890"
      },
      "currency": "INR",
      "commissionRate": 5.5,
      "status": "active",
      "notes": "VIP player",
      "createdAt": "2026-01-16T10:00:00.000Z",
      "updatedAt": "2026-01-16T10:00:00.000Z"
    }
  }
}
```

### Update Commission Designation
```
PUT /api/affiliate/commission-designations/507f1f77bcf86cd799439011
```

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Request Body:**
```json
{
  "commissionRate": 7.5,
  "status": "inactive",
  "notes": "Updated rate"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Commission designation updated successfully",
  "data": {
    "designation": {
      "_id": "507f1f77bcf86cd799439011",
      "commissionRate": 7.5,
      "status": "inactive",
      "notes": "Updated rate",
      "updatedAt": "2026-01-16T11:00:00.000Z"
    }
  }
}
```

### Delete Commission Designation
```
DELETE /api/affiliate/commission-designations/507f1f77bcf86cd799439011
```

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Response:**
```json
{
  "success": true,
  "message": "Commission designation deleted successfully"
}
```

## Files Modified/Created

### Backend Files:
1. **`backend/models/CommissionDesignation.js`** (NEW)
   - Created CommissionDesignation model
   - Schema with indexes
   - Validation rules

2. **`backend/controllers/affiliate.controller.js`**
   - Added `getCommissionDesignations()` method
   - Added `createCommissionDesignation()` method
   - Added `updateCommissionDesignation()` method
   - Added `deleteCommissionDesignation()` method

3. **`backend/routes/affiliate.routes.js`**
   - Added 4 routes for commission designation CRUD

### Frontend Files:
1. **`app/(main)/affiliate/commission-designation/page.tsx`**
   - Complete commission designation management page
   - Filters (currency, status)
   - Data table with pagination
   - Create modal
   - Delete functionality
   - API integration

## Testing Checklist

### Backend:
- [ ] GET /api/affiliate/commission-designations returns data
- [ ] Currency filter works correctly
- [ ] Status filter works correctly
- [ ] Pagination works correctly
- [ ] POST creates new designation
- [ ] Duplicate prevention works (affiliate-player unique)
- [ ] Commission rate validation (0-100)
- [ ] Player existence validation
- [ ] PUT updates designation
- [ ] DELETE removes designation
- [ ] Only affiliate can access their designations
- [ ] Player info populated correctly

### Frontend:
- [ ] Page loads without errors
- [ ] Filters work correctly
- [ ] Search button applies filters
- [ ] Table displays data
- [ ] Empty state shows when no data
- [ ] Loading state shows while fetching
- [ ] Create button opens modal
- [ ] Modal form validates input
- [ ] Player dropdown populates
- [ ] Create form submits correctly
- [ ] Success message displays
- [ ] Table refreshes after create
- [ ] Delete confirmation shows
- [ ] Delete removes designation
- [ ] Pagination buttons work
- [ ] Previous/Next disabled correctly
- [ ] Status badges color-coded
- [ ] Commission rate shows % symbol
- [ ] Dates format correctly
- [ ] Responsive design works

## Features & Functionality

### Commission Management:
✅ Create commission designation for players  
✅ View all designations in table  
✅ Filter by currency  
✅ Filter by status  
✅ Update commission rate  
✅ Update status (active/inactive/suspended)  
✅ Delete designation  
✅ Add notes to designation  

### Data Display:
✅ Paginated table  
✅ Sortable columns (UI)  
✅ Status badges  
✅ Date formatting  
✅ Empty state  
✅ Loading state  
✅ Commission rate percentage display  

### User Experience:
✅ Modal for creating designations  
✅ Dropdown player selection  
✅ Currency selection  
✅ Status selection  
✅ Notes field  
✅ Validation feedback  
✅ Success/error messages  
✅ Confirmation dialogs  
✅ Auto-refresh after actions  

## Usage Instructions

### For Affiliates:

1. **View Designations:**
   - Navigate to Commission Designation page
   - See all commission designations in table
   - Filter by currency or status if needed
   - Click "Search" to apply filters

2. **Create New Designation:**
   - Click "Create" button
   - Select player from dropdown
   - Choose currency
   - Enter commission rate (0-100%)
   - Select status
   - Add notes (optional)
   - Click "Create" to save

3. **Delete Designation:**
   - Find designation in table
   - Click "Delete" in Action column
   - Confirm deletion
   - Designation removed

4. **Navigate Pages:**
   - Use Previous/Next buttons
   - See current page range
   - Total entries displayed

### For Developers:

**Adding New Currency:**
1. Add to currency filter dropdown (frontend)
2. No backend changes needed (accepts any string)

**Changing Pagination:**
1. Update `limit` state in frontend
2. Make dropdown functional
3. Backend already supports dynamic limit

**Adding Edit Functionality:**
1. Create edit modal similar to create modal
2. Pre-populate form with existing data
3. Call PUT endpoint with designation ID
4. Refresh table on success

## Business Logic

### Commission Calculation:
The commission designation sets the **rate** at which an affiliate earns commission from a player's activities. Actual commission calculation would happen in the betting/transaction flow:

```javascript
// Example commission calculation
const playerBet = 1000; // Player bet amount
const commissionRate = 5.5; // From designation
const commission = playerBet * (commissionRate / 100);
// Affiliate earns 55 INR
```

### Designation Rules:
1. **One designation per player**: Each affiliate can have only one commission designation per player
2. **Status controls earning**: Only 'active' designations earn commissions
3. **Currency matters**: Commission paid in designated currency
4. **Rate range**: 0-100% to allow full flexibility
5. **Notes for tracking**: Internal notes for affiliate's reference

## Performance Considerations

- Indexes on `affiliateId`, `playerId`, `status`, `currency`
- Pagination prevents loading large datasets
- Population only loads needed player fields
- Compound index prevents duplicate queries
- Sorted queries use index (createdAt)

## Security

- JWT authentication required
- Affiliates only see their own designations
- Validation on all inputs
- Commission rate limits (0-100)
- Player existence verification
- Duplicate prevention
- Confirmation before delete

## Future Enhancements

1. **Bulk Operations:**
   - Bulk create designations
   - Bulk update rates
   - Bulk status changes
   - CSV import/export

2. **Advanced Features:**
   - Edit designation modal
   - Designation history/audit log
   - Commission tier levels
   - Auto-calculation of earned commissions
   - Commission payment tracking

3. **Analytics:**
   - Total commissions per designation
   - Player performance metrics
   - Commission trends
   - Rate effectiveness analysis

4. **Filters & Search:**
   - Search by player name
   - Date range filters
   - Commission rate range filter
   - Multi-select filters

5. **Automation:**
   - Auto-apply default rates
   - Rate adjustment based on performance
   - Scheduled rate changes
   - Notifications on designation changes

## Notes

- Commission designations set rates only
- Actual commission calculation happens elsewhere
- Status 'active' required for earning
- One designation per affiliate-player pair
- Decimal rates allowed (0.01 precision)
- Currency must match transaction currency for commission
- Notes are for affiliate's internal use
- Delete is permanent (consider soft delete for production)

## Error Handling

**Common Errors:**
- 400: Missing required fields
- 400: Invalid commission rate (not 0-100)
- 400: Duplicate designation exists
- 401: Unauthorized (no token)
- 404: Player not found
- 404: Designation not found
- 500: Server error

**Frontend Error Handling:**
- Form validation before submit
- Confirmation before delete
- Error message display
- Console logging for debugging
- Try-catch for API calls
- Loading state management

## Matching Screenshot Requirements

From the screenshot:
✅ **Page Title**: "Commission Designation"  
✅ **Currency Filter**: Dropdown with "All" option  
✅ **Status Filter**: Dropdown with "All" option  
✅ **Search Button**: Dark gray button  
✅ **Create Button**: Dark gray button  
✅ **Table Columns**: Player, Currency, Created Time, Update Date, Status, Action  
✅ **Empty State**: "No data available in table"  
✅ **Pagination**: Show entries, info, Previous/Next  
✅ **Column Visibility**: Button in top right (UI element)  
✅ **Dark Header**: Gray-700 background  
✅ **Clean Design**: White background, clear structure  

Additional enhancements:
- Create modal for new designations
- Player dropdown from referred users
- Commission rate input with validation
- Status badges with colors
- Delete confirmation
- Success/error messages
- Auto-refresh after actions
- Responsive design
