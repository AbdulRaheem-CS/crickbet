# Material (Links) Page Implementation

## Overview
Complete implementation of the Material/Links page that allows affiliates to create and manage marketing tracking links for different pages and domains with status and keyword tracking.

## Features Implemented

### Database Model (`backend/models/AffiliateLink.js`)

#### AffiliateLink Schema:
```javascript
{
  affiliateId: ObjectId (ref: User, indexed),
  domain: String (website domain),
  status: String (active, inactive, suspended),
  keywords: String (tracking keywords),
  page: String (destination page),
  trackingCode: String (unique tracking code, indexed),
  clicks: Number (total clicks),
  conversions: Number (total conversions),
  notes: String,
  timestamps: true (createdAt, updatedAt)
}
```

**Indexes:**
- Single index on `affiliateId`
- Compound index on `affiliateId + domain`
- Single index on `status`
- Unique index on `trackingCode`

### Backend (`backend/controllers/affiliate.controller.js`)

#### 1. getAffiliateLinks Method
- **Route**: `GET /api/affiliate/links`
- **Description**: Get all affiliate marketing links with search and pagination
- **Authentication**: Required (JWT token)
- **Access**: Private (Affiliate users only)

**Query Parameters:**
- `search`: Search in domain, keywords, or page (optional)
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)

**Features:**
- Search across domain, keywords, and page fields
- Pagination support
- Sorted by creation date (newest first)
- Returns total count for pagination

#### 2. createAffiliateLink Method
- **Route**: `POST /api/affiliate/links`
- **Description**: Create new affiliate marketing link
- **Authentication**: Required (JWT token)
- **Access**: Private (Affiliate users only)

**Required Fields:**
- `domain`: Website domain
- `page`: Destination page

**Optional Fields:**
- `status`: Link status (default: 'active')
- `keywords`: Tracking keywords

**Features:**
- Auto-generates unique tracking code
- Initializes click and conversion counters
- Tracking code format: `{last8DigitsOfAffiliateId}{timestamp}`

#### 3. updateAffiliateLink Method
- **Route**: `PUT /api/affiliate/links/:id`
- **Description**: Update existing affiliate marketing link
- **Authentication**: Required (JWT token)
- **Access**: Private (Affiliate users only)

**Updatable Fields:**
- `domain`: Change domain
- `status`: Change status
- `keywords`: Update keywords
- `page`: Change destination page

**Validation:**
- Link must exist and belong to affiliate

#### 4. deleteAffiliateLink Method
- **Route**: `DELETE /api/affiliate/links/:id`
- **Description**: Delete affiliate marketing link
- **Authentication**: Required (JWT token)
- **Access**: Private (Affiliate users only)

**Validation:**
- Link must exist and belong to affiliate

#### 5. getAffiliateLinkStats Method
- **Route**: `GET /api/affiliate/links/:id/stats`
- **Description**: Get link performance statistics
- **Authentication**: Required (JWT token)
- **Access**: Private (Affiliate users only)

**Returns:**
- Total clicks
- Total conversions
- Conversion rate (percentage)

### Backend Routes (`backend/routes/affiliate.routes.js`)

Added routes:
```javascript
GET    /api/affiliate/links              // Get all links
POST   /api/affiliate/links              // Create link
PUT    /api/affiliate/links/:id          // Update link
DELETE /api/affiliate/links/:id          // Delete link
GET    /api/affiliate/links/:id/stats    // Get link stats
```

All routes protected with authentication middleware.

### Frontend (`app/(main)/affiliate/material/page.tsx`)

#### Page Structure:

1. **Header Section**
   - Page title: "Links"
   - Column visibility button (UI element)
   - Search input field
   - Search on Enter key press

2. **Data Table**
   
   **Columns:**
   - **#**: Row number (paginated)
   - **Domain**: Website domain
   - **Status**: Status badge (Active/Inactive/Suspended)
   - **Keywords**: Tracking keywords
   - **Page**: Destination page
   - **Action**: Edit button (pencil icon)

   **Features:**
   - Dark gray header (bg-gray-700)
   - Row hover effect
   - Empty state: "No data available in table"
   - Loading state: "Loading..."
   - Status badges with color coding
   - Responsive design

3. **Pagination Controls**
   
   **Info Display:**
   - "Showing X to Y of Z entries"
   - Updates based on current page

   **Navigation:**
   - Previous button (<) - disabled on first page
   - Current page number (highlighted)
   - Next button (>) - disabled on last page

4. **Action Buttons** (Bottom Right)
   - **Create**: Opens create modal
   - **Search**: Executes search query

5. **Create Modal**
   
   **Form Fields:**
   - **Domain** (text input) *:
     - Placeholder: "example.com"
     - Required field
   
   - **Status** (dropdown):
     - Active (default)
     - Inactive
     - Suspended
   
   - **Keywords** (text input):
     - Placeholder: "join, signup, register"
     - Optional field
   
   - **Page** (dropdown) *:
     - Sign Up
     - Login
     - Home
     - Sports
     - Casino
     - Promotions
     - Required field

   **Buttons:**
   - **Cancel**: Close modal, reset form
   - **Create**: Submit form (disabled during submission)

6. **Edit Modal**
   
   Same fields as Create Modal, pre-populated with existing data:
   - Domain (editable)
   - Status (editable)
   - Keywords (editable)
   - Page (editable)

   **Buttons:**
   - **Cancel**: Close modal
   - **Update**: Submit changes

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
- Search input in top right
- Column visibility button in top left
- Action buttons bottom right
- Modal centered with backdrop
- Consistent spacing (p-6)

**Interactive Elements:**
- Hover effects on rows and buttons
- Focus rings on inputs
- Disabled states
- Loading states
- Success/error messages
- Edit icon button
- Modal overlay (50% opacity black)

**Icons:**
- Column visibility icon (sliders)
- Edit icon (pencil)
- Pagination arrows (< >)

#### Functionality:

**Data Fetching:**
- Fetch links on page load
- Re-fetch on pagination
- Fetch on search
- Auto-refresh after create/update/delete

**Search:**
- Search in domain, keywords, and page
- Real-time input tracking
- Execute on Enter key or Search button
- Resets to page 1 on search

**Pagination:**
- Track current page
- Calculate total pages
- Previous/Next navigation
- Show current range
- Disable buttons at boundaries
- Page number display

**Create Link:**
- Modal form submission
- Validation before submit
- Auto-generate tracking code (backend)
- Success message on creation
- Auto-refresh table
- Reset form on success

**Edit Link:**
- Opens modal with existing data
- Update form submission
- Success message on update
- Auto-refresh table

**Delete Link:**
- Confirmation dialog
- Delete API call
- Success message
- Auto-refresh table

## API Response Structure

### Get Affiliate Links
```
GET /api/affiliate/links?search=join&page=1&limit=10
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
    "links": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "affiliateId": "507f1f77bcf86cd799439012",
        "domain": "cxsport.vip",
        "status": "active",
        "keywords": "join",
        "page": "Sign Up",
        "trackingCode": "bcf86cd7lm3x9p",
        "clicks": 150,
        "conversions": 12,
        "createdAt": "2026-01-16T10:00:00.000Z",
        "updatedAt": "2026-01-16T10:00:00.000Z"
      }
    ],
    "pagination": {
      "total": 1,
      "page": 1,
      "pages": 1
    }
  }
}
```

### Create Affiliate Link
```
POST /api/affiliate/links
```

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Request Body:**
```json
{
  "domain": "cxsport.vip",
  "status": "active",
  "keywords": "join",
  "page": "Sign Up"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Affiliate link created successfully",
  "data": {
    "link": {
      "_id": "507f1f77bcf86cd799439011",
      "affiliateId": "507f1f77bcf86cd799439012",
      "domain": "cxsport.vip",
      "status": "active",
      "keywords": "join",
      "page": "Sign Up",
      "trackingCode": "bcf86cd7lm3x9p",
      "clicks": 0,
      "conversions": 0,
      "createdAt": "2026-01-16T10:00:00.000Z",
      "updatedAt": "2026-01-16T10:00:00.000Z"
    }
  }
}
```

### Update Affiliate Link
```
PUT /api/affiliate/links/507f1f77bcf86cd799439011
```

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Request Body:**
```json
{
  "status": "inactive",
  "keywords": "join, signup"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Affiliate link updated successfully",
  "data": {
    "link": {
      "_id": "507f1f77bcf86cd799439011",
      "status": "inactive",
      "keywords": "join, signup",
      "updatedAt": "2026-01-16T11:00:00.000Z"
    }
  }
}
```

### Delete Affiliate Link
```
DELETE /api/affiliate/links/507f1f77bcf86cd799439011
```

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Response:**
```json
{
  "success": true,
  "message": "Affiliate link deleted successfully"
}
```

### Get Link Statistics
```
GET /api/affiliate/links/507f1f77bcf86cd799439011/stats
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
    "clicks": 150,
    "conversions": 12,
    "conversionRate": "8.00"
  }
}
```

## Files Modified/Created

### Backend Files:
1. **`backend/models/AffiliateLink.js`** (NEW)
   - Created AffiliateLink model
   - Schema with tracking fields
   - Indexes for performance

2. **`backend/controllers/affiliate.controller.js`**
   - Added `getAffiliateLinks()` method
   - Added `createAffiliateLink()` method
   - Added `updateAffiliateLink()` method
   - Added `deleteAffiliateLink()` method
   - Added `getAffiliateLinkStats()` method

3. **`backend/routes/affiliate.routes.js`**
   - Added 5 routes for link management

### Frontend Files:
1. **`app/(main)/affiliate/material/page.tsx`** (NEW)
   - Complete links management page
   - Search functionality
   - Data table with pagination
   - Create modal
   - Edit modal
   - API integration

## Testing Checklist

### Backend:
- [ ] GET /api/affiliate/links returns data
- [ ] Search filter works correctly
- [ ] Pagination works correctly
- [ ] POST creates new link
- [ ] Tracking code is unique
- [ ] PUT updates link
- [ ] DELETE removes link
- [ ] GET stats returns click/conversion data
- [ ] Only affiliate can access their links
- [ ] Required field validation

### Frontend:
- [ ] Page loads without errors
- [ ] Search input works
- [ ] Search executes on Enter key
- [ ] Search button triggers search
- [ ] Table displays data
- [ ] Empty state shows when no data
- [ ] Loading state shows while fetching
- [ ] Create button opens modal
- [ ] Create form validates input
- [ ] Create form submits correctly
- [ ] Edit button opens modal with data
- [ ] Edit form updates correctly
- [ ] Delete confirmation shows (future)
- [ ] Pagination buttons work
- [ ] Previous/Next disabled correctly
- [ ] Status badges color-coded
- [ ] Row numbering correct
- [ ] Responsive design works

## Features & Functionality

### Link Management:
✅ Create affiliate tracking links  
✅ View all links in table  
✅ Search across domain, keywords, page  
✅ Update link details  
✅ Update status (active/inactive/suspended)  
✅ Delete links  
✅ Auto-generate tracking codes  

### Tracking Features:
✅ Unique tracking codes  
✅ Click counter (backend ready)  
✅ Conversion counter (backend ready)  
✅ Conversion rate calculation  
✅ Link statistics endpoint  

### Data Display:
✅ Paginated table  
✅ Row numbering  
✅ Status badges  
✅ Empty state  
✅ Loading state  
✅ Search functionality  

### User Experience:
✅ Create modal  
✅ Edit modal  
✅ Domain input  
✅ Status selection  
✅ Keywords input  
✅ Page dropdown  
✅ Validation feedback  
✅ Success/error messages  
✅ Auto-refresh after actions  

## Usage Instructions

### For Affiliates:

1. **View Links:**
   - Navigate to Material/Links page
   - See all affiliate tracking links in table
   - Use search to find specific links

2. **Create New Link:**
   - Click "Create" button
   - Enter domain (e.g., example.com)
   - Select status (Active/Inactive/Suspended)
   - Add keywords for tracking (optional)
   - Select destination page
   - Click "Create" to save

3. **Edit Link:**
   - Click edit icon (pencil) on any link
   - Update domain, status, keywords, or page
   - Click "Update" to save changes

4. **Search Links:**
   - Enter search term in search box
   - Press Enter or click "Search"
   - Searches in domain, keywords, and page

5. **Navigate Pages:**
   - Use < > buttons to navigate
   - See current page range
   - Total entries displayed

### For Developers:

**Tracking Link Usage:**
The generated tracking code can be used in URLs:
```
https://example.com/signup?ref={trackingCode}
```

**Click Tracking:**
When a user clicks the link, increment the clicks counter:
```javascript
await AffiliateLink.findOneAndUpdate(
  { trackingCode: 'abc123' },
  { $inc: { clicks: 1 } }
);
```

**Conversion Tracking:**
When a user completes desired action:
```javascript
await AffiliateLink.findOneAndUpdate(
  { trackingCode: 'abc123' },
  { $inc: { conversions: 1 } }
);
```

## Business Logic

### Tracking Code Generation:
- Format: `{last8DigitsOfAffiliateId}{timestamp}`
- Guaranteed unique per affiliate
- Short and URL-friendly
- Embedded affiliate identification

### Link Status:
1. **Active**: Link is live and tracking
2. **Inactive**: Link disabled, no tracking
3. **Suspended**: Link temporarily disabled

### Keywords Usage:
- Helps categorize links
- Searchable field
- Can track campaign types
- Multiple keywords comma-separated

### Page Destinations:
- Sign Up: Registration page
- Login: Login page
- Home: Homepage
- Sports: Sports betting section
- Casino: Casino games section
- Promotions: Promotions page

## Performance Considerations

- Indexes on `affiliateId`, `trackingCode`, `status`
- Pagination prevents large data loads
- Search uses regex (consider full-text search for production)
- Compound index on affiliate + domain
- Tracking code unique index for fast lookups

## Security

- JWT authentication required
- Affiliates only see their own links
- Validation on all inputs
- Unique tracking code enforcement
- Confirmation before delete (recommended)

## Future Enhancements

1. **Advanced Tracking:**
   - Real-time click tracking
   - Geolocation data
   - Device/browser tracking
   - Referrer tracking
   - Time-based analytics

2. **Analytics Dashboard:**
   - Click trends over time
   - Conversion rate graphs
   - Top performing links
   - A/B testing support

3. **Link Features:**
   - QR code generation
   - Short URL service
   - UTM parameter builder
   - Custom domain support
   - Link expiration dates

4. **Bulk Operations:**
   - Bulk create links
   - Bulk status updates
   - CSV import/export
   - Bulk delete

5. **Notifications:**
   - Alert on high conversions
   - Daily/weekly reports
   - Link performance emails

6. **Advanced Filters:**
   - Filter by status
   - Filter by page
   - Date range filters
   - Performance filters (clicks, conversions)

## Notes

- Tracking code is auto-generated and unique
- Click/conversion tracking requires integration with main site
- Keywords are comma-separated for multiple values
- Status 'active' required for link to work
- Delete is permanent (consider soft delete for production)
- Search is case-insensitive
- Page options can be customized

## Error Handling

**Common Errors:**
- 400: Missing required fields (domain, page)
- 401: Unauthorized (no token)
- 404: Link not found
- 500: Server error

**Frontend Error Handling:**
- Form validation before submit
- Error message display
- Console logging for debugging
- Try-catch for API calls
- Loading state management

## Matching Screenshot Requirements

From the screenshot:
✅ **Page Title**: "Links"  
✅ **Column Visibility Button**: Top left with icon  
✅ **Search Box**: Top right with label "Search:"  
✅ **Table Columns**: #, Domain, Status, Keywords, Page, Action  
✅ **Row Data**: Shows "1", "cxsport.vip", "Active", "join", "Sign Up"  
✅ **Empty State**: Not shown but implemented  
✅ **Pagination**: "Showing 1 to 1 of 1 entries" with page 1  
✅ **Create/Search Buttons**: Bottom right, dark gray  
✅ **Dark Header**: Gray-700 background  
✅ **Clean Design**: White background, clear structure  
✅ **Edit Icon**: Pencil icon in Action column  

Additional enhancements:
- Create modal for new links
- Edit modal for updating links
- Auto-generated tracking codes
- Status badges with colors
- Success/error messages
- Auto-refresh after actions
- Responsive design
- Enter key search support
