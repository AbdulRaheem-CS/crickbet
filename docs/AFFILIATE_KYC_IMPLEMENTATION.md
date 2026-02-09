# Affiliate KYC Page Implementation

## Overview
Complete implementation of the Affiliate KYC (Know Your Customer) verification page with document upload functionality for both identity and address verification.

## Features Implemented

### Backend (`backend/controllers/affiliate.controller.js`)

#### 1. getKYC Method
- **Route**: `GET /api/affiliate/kyc`
- **Description**: Get affiliate's KYC status and submitted documents
- **Authentication**: Required (JWT token)
- **Access**: Private (Affiliate users only)

**Returns:**
- Overall KYC status (pending/verified/rejected)
- Identity verification data:
  - Document type
  - Document number
  - Expiry date
  - Uploaded images (front, back, selfie)
  - Verification status
- Address verification data:
  - Document type
  - Document number
  - Expiry date
  - Uploaded images (front, back)
  - Verification status

#### 2. submitIdentityKYC Method
- **Route**: `POST /api/affiliate/kyc/identity`
- **Description**: Submit identity verification documents
- **Authentication**: Required (JWT token)
- **Access**: Private (Affiliate users only)

**Required Fields:**
- documentType: Type of identity document (passport, driving license, national ID, etc.)
- documentNumber: Document identification number
- expiryDate: Document expiry date
- frontImage: Front side photo (base64)
- selfieImage: Selfie with document (base64)

**Optional Fields:**
- backImage: Back side photo (base64)

**Validation:**
- All required fields must be provided
- Images stored as base64 strings
- Sets verification status to 'pending'
- Records submission timestamp

#### 3. submitAddressKYC Method
- **Route**: `POST /api/affiliate/kyc/address`
- **Description**: Submit address verification documents
- **Authentication**: Required (JWT token)
- **Access**: Private (Affiliate users only)

**Required Fields:**
- documentType: Type of address document (utility bill, bank statement, etc.)
- documentNumber: Document reference number
- expiryDate: Document date
- frontImage: Document photo front side (base64)

**Optional Fields:**
- backImage: Document photo back side (base64)

**Validation:**
- All required fields must be provided
- Images stored as base64 strings
- Sets verification status to 'pending'
- Records submission timestamp

### Backend Routes (`backend/routes/affiliate.routes.js`)

Added routes:
```javascript
GET  /api/affiliate/kyc              // Get KYC status
POST /api/affiliate/kyc/identity     // Submit identity documents
POST /api/affiliate/kyc/address      // Submit address documents
```

All routes protected with authentication middleware.

### Frontend (`app/(main)/affiliate/kyc/page.tsx`)

#### Page Structure:

1. **Tab Navigation**
   - Identity tab: For identity document verification
   - Address tab: For address proof verification
   - Active tab highlighting with blue underline
   - Smooth tab switching

2. **Identity Tab Form**
   
   **Form Fields:**
   - **Document Type** (dropdown):
     - Passport
     - Driving License
     - National ID Card
     - Voter ID
     - Aadhaar Card
   
   - **Document Number** (text input):
     - Required field
     - Placeholder: "Type ID No here"
   
   - **Expiry Date** (date picker):
     - Required field
     - Date format: YYYY-MM-DD
   
   **File Uploads:**
   - **Front Side Photo**:
     - Drag & drop or click to upload
     - Image preview after upload
     - Remove option
     - Validation: jpg, jpeg, png only
     - Max size: 8MB
   
   - **Back Side Photo** (optional):
     - Same upload interface as front
     - Optional field
   
   - **Selfie with Document**:
     - Required for identity verification
     - Same upload interface
     - Must show person holding document

   **Upload Requirements Display:**
   - Info icon with blue background
   - File format: jpg, jpeg, png
   - Max file size: 8MB
   - Document must show:
     - Date of issue
     - Name of person
     - Not older than 3 months

3. **Address Tab Form**
   
   **Form Fields:**
   - **Document Type** (dropdown):
     - Utility Bill
     - Bank Statement
     - Rental Agreement
     - Property Tax Receipt
   
   - **Document Number** (text input):
     - Required field
     - Placeholder: "Type ID No here"
   
   - **Expiry Date** (date picker):
     - Required field
     - Actually represents document date
   
   **File Uploads:**
   - **Front Side Photo**:
     - Required
     - Same upload interface as identity
   
   - **Back Side Photo** (optional):
     - Optional field
     - Same upload interface

   **Upload Requirements:** Same as identity tab

4. **UI Components**

   **Upload Areas:**
   - Dashed border design
   - Gray background
   - Upload icon (cloud with arrow)
   - "choose Image" button (teal color)
   - Image preview with remove option
   - Responsive design

   **Form Styling:**
   - White background cards
   - Rounded corners with shadow
   - 2-column grid on desktop
   - Single column on mobile
   - Blue focus rings on inputs

   **Submit Button:**
   - Gray-800 background
   - White text
   - Right-aligned
   - Disabled state during submission
   - Loading text: "Submitting..."

   **Messages:**
   - Success: Green banner at top
   - Error: Red banner at top
   - Auto-clears on tab switch

5. **Functionality**

   **File Handling:**
   - Client-side file validation
   - File size check (max 8MB)
   - File type check (jpg, jpeg, png)
   - Image preview generation
   - Base64 conversion for upload
   - Remove uploaded files

   **Form Submission:**
   - Async submission with loading state
   - Error handling and display
   - Success message display
   - Form reset after successful submission
   - Preview clearing after submission
   - Automatic data refresh

   **State Management:**
   - Separate state for identity and address forms
   - Preview URLs for each image
   - Loading state during data fetch
   - Submitting state during form submission
   - Error and success message state
   - KYC data state from backend

   **Data Fetching:**
   - Fetch KYC status on page load
   - Re-fetch after successful submission
   - Display existing KYC data (future enhancement)

## Design Features

### Color Scheme:
- Background: Light gray (bg-gray-100)
- Cards: White with shadow
- Tab active: Blue (text-blue-600, border-blue-600)
- Tab inactive: Gray (text-gray-600)
- Upload button: Teal (bg-teal-600)
- Submit button: Dark gray (bg-gray-800)
- Success message: Green background
- Error message: Red background
- Info box: Blue background (bg-blue-50)

### Layout:
- Responsive grid (1 column mobile, 2 columns desktop)
- Maximum width container (max-w-7xl)
- Consistent spacing (p-6, gap-6)
- Rounded corners (rounded-lg)
- Shadow effects for depth

### Icons:
- Upload cloud icon (gray)
- Info icon (blue)
- Tab icons (potential enhancement)
- Remove button (red text)

### Typography:
- Page title: 3xl, bold
- Labels: Small, medium weight
- Help text: Extra small, gray
- Button text: Medium

### Interactive Elements:
- Hover effects on buttons
- Focus rings on inputs
- Disabled state styling
- Loading state text changes
- Tab active/inactive states
- Image preview with remove option

## Validation Rules

### Client-Side:
1. **File Upload:**
   - Only jpg, jpeg, png allowed
   - Maximum 8MB per file
   - Required fields must be uploaded

2. **Form Fields:**
   - Document type must be selected
   - Document number required
   - Expiry date required
   - Front image required for both tabs
   - Selfie required for identity tab

3. **Error Messages:**
   - File size exceeded
   - Invalid file type
   - Missing required fields

### Server-Side:
1. **Identity Verification:**
   - documentType required
   - documentNumber required
   - expiryDate required
   - frontImage required (base64)
   - selfieImage required (base64)
   - backImage optional

2. **Address Verification:**
   - documentType required
   - documentNumber required
   - expiryDate required
   - frontImage required (base64)
   - backImage optional

## Database Schema Requirements

### User Model KYC Field:
```javascript
kyc: {
  status: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending'
  },
  identity: {
    documentType: String,        // passport, driving_license, etc.
    documentNumber: String,       // Document ID number
    expiryDate: Date,            // Document expiry date
    frontImage: String,          // Base64 image
    backImage: String,           // Base64 image (optional)
    selfieImage: String,         // Base64 image (selfie with doc)
    verified: {
      type: Boolean,
      default: false
    },
    submittedAt: Date,           // Submission timestamp
    verifiedAt: Date,            // Verification timestamp
    rejectedAt: Date,            // Rejection timestamp
    rejectionReason: String      // Reason for rejection
  },
  address: {
    documentType: String,        // utility_bill, bank_statement, etc.
    documentNumber: String,       // Document reference number
    expiryDate: Date,            // Document date
    frontImage: String,          // Base64 image
    backImage: String,           // Base64 image (optional)
    verified: {
      type: Boolean,
      default: false
    },
    submittedAt: Date,           // Submission timestamp
    verifiedAt: Date,            // Verification timestamp
    rejectedAt: Date,            // Rejection timestamp
    rejectionReason: String      // Reason for rejection
  }
}
```

## API Response Structure

### Get KYC Status
```
GET /api/affiliate/kyc
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
    "kyc": {
      "status": "pending",
      "identity": {
        "documentType": "passport",
        "documentNumber": "A12345678",
        "expiryDate": "2027-12-31T00:00:00.000Z",
        "frontImage": "data:image/jpeg;base64,...",
        "backImage": null,
        "selfieImage": "data:image/jpeg;base64,...",
        "verified": false,
        "submittedAt": "2026-01-16T10:00:00.000Z"
      },
      "address": {
        "documentType": "utility_bill",
        "documentNumber": "BILL123456",
        "expiryDate": "2026-01-15T00:00:00.000Z",
        "frontImage": "data:image/jpeg;base64,...",
        "backImage": null,
        "verified": false,
        "submittedAt": "2026-01-16T10:05:00.000Z"
      }
    }
  }
}
```

### Submit Identity KYC
```
POST /api/affiliate/kyc/identity
```

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Request Body:**
```json
{
  "documentType": "passport",
  "documentNumber": "A12345678",
  "expiryDate": "2027-12-31",
  "frontImage": "data:image/jpeg;base64,...",
  "backImage": "data:image/jpeg;base64,...",
  "selfieImage": "data:image/jpeg;base64,..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Identity KYC submitted successfully. Verification pending.",
  "data": {
    "kyc": {
      "status": "pending",
      "identity": {
        "documentType": "passport",
        "documentNumber": "A12345678",
        "expiryDate": "2027-12-31T00:00:00.000Z",
        "frontImage": "data:image/jpeg;base64,...",
        "backImage": "data:image/jpeg;base64,...",
        "selfieImage": "data:image/jpeg;base64,...",
        "verified": false,
        "submittedAt": "2026-01-16T10:00:00.000Z"
      }
    }
  }
}
```

### Submit Address KYC
```
POST /api/affiliate/kyc/address
```

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Request Body:**
```json
{
  "documentType": "utility_bill",
  "documentNumber": "BILL123456",
  "expiryDate": "2026-01-15",
  "frontImage": "data:image/jpeg;base64,...",
  "backImage": null
}
```

**Response:**
```json
{
  "success": true,
  "message": "Address KYC submitted successfully. Verification pending.",
  "data": {
    "kyc": {
      "status": "pending",
      "address": {
        "documentType": "utility_bill",
        "documentNumber": "BILL123456",
        "expiryDate": "2026-01-15T00:00:00.000Z",
        "frontImage": "data:image/jpeg;base64,...",
        "backImage": null,
        "verified": false,
        "submittedAt": "2026-01-16T10:05:00.000Z"
      }
    }
  }
}
```

## Files Modified

### Backend Files:
1. **`backend/controllers/affiliate.controller.js`**
   - Added `getKYC()` method
   - Added `submitIdentityKYC()` method
   - Added `submitAddressKYC()` method

2. **`backend/routes/affiliate.routes.js`**
   - Added route: `GET /api/affiliate/kyc`
   - Added route: `POST /api/affiliate/kyc/identity`
   - Added route: `POST /api/affiliate/kyc/address`

### Frontend Files:
1. **`app/(main)/affiliate/kyc/page.tsx`**
   - Complete KYC page implementation
   - Two-tab interface (Identity, Address)
   - Document upload with preview
   - Form validation
   - API integration
   - Success/error handling

## Testing Checklist

### Backend:
- [ ] GET /api/affiliate/kyc returns KYC data
- [ ] New users get default KYC structure
- [ ] POST /api/affiliate/kyc/identity accepts valid data
- [ ] POST /api/affiliate/kyc/identity validates required fields
- [ ] POST /api/affiliate/kyc/address accepts valid data
- [ ] POST /api/affiliate/kyc/address validates required fields
- [ ] Base64 images stored correctly
- [ ] Dates converted to Date objects
- [ ] Authentication required for all routes
- [ ] Users can only access their own KYC data

### Frontend:
- [ ] Page loads without errors
- [ ] Tabs switch correctly
- [ ] Document type dropdowns work
- [ ] File upload validation works (size, type)
- [ ] Image preview displays after upload
- [ ] Remove button clears uploaded files
- [ ] Form submission sends correct data
- [ ] Loading state shows during submission
- [ ] Success message displays after submission
- [ ] Error message displays on failure
- [ ] Form resets after successful submission
- [ ] Data refreshes after submission
- [ ] Responsive design works on mobile
- [ ] Date picker works correctly
- [ ] Required field validation works

## Features & Functionality

### Document Types:

**Identity Documents:**
✅ Passport  
✅ Driving License  
✅ National ID Card  
✅ Voter ID  
✅ Aadhaar Card  

**Address Documents:**
✅ Utility Bill  
✅ Bank Statement  
✅ Rental Agreement  
✅ Property Tax Receipt  

### Upload Features:
✅ Drag & drop interface  
✅ Click to browse  
✅ Image preview  
✅ Remove uploaded files  
✅ File validation (type, size)  
✅ Multiple file support  
✅ Base64 conversion  

### Form Features:
✅ Two-tab interface  
✅ Document type selection  
✅ Document number input  
✅ Expiry date picker  
✅ Required field validation  
✅ Form submission  
✅ Loading states  
✅ Error handling  
✅ Success feedback  
✅ Auto form reset  

### User Experience:
✅ Clean, modern design  
✅ Responsive layout  
✅ Clear instructions  
✅ Visual feedback  
✅ Upload requirements displayed  
✅ Image previews  
✅ Error messages  
✅ Success messages  

## Usage Instructions

### For Affiliates:

1. **Identity Verification:**
   - Click on "Identity" tab
   - Select your document type from dropdown
   - Enter document number
   - Select expiry date
   - Upload front side photo of document
   - Upload back side photo (if applicable)
   - Upload selfie holding the document
   - Click "Submit"
   - Wait for verification

2. **Address Verification:**
   - Click on "Address" tab
   - Select document type (utility bill, etc.)
   - Enter document/reference number
   - Select document date
   - Upload front side photo
   - Upload back side photo (if applicable)
   - Click "Submit"
   - Wait for verification

3. **Document Requirements:**
   - Only jpg, jpeg, or png format
   - Maximum 8MB per file
   - Document must show date and name
   - Document not older than 3 months
   - Clear, readable photos
   - Full document visible

### For Developers:

**Adding New Document Types:**

1. Update frontend dropdown options
2. No backend changes needed (accepts any string)
3. Consider adding enum validation on backend

**Handling Large Files:**

Current implementation:
- Base64 storage in MongoDB
- 8MB client-side limit
- May need cloud storage for production (S3, Cloudinary)

**Future Enhancements:**

1. Cloud storage integration
2. Image compression before upload
3. OCR for automatic data extraction
4. Real-time document validation
5. Admin verification interface
6. Rejection reason feedback
7. Re-submission flow

## Performance Considerations

- Base64 encoding increases file size by ~33%
- Large images may slow down API calls
- Consider implementing:
  - Image compression
  - Cloud storage (S3, Cloudinary)
  - Lazy loading for previews
  - Progress indicators for uploads
  - Background upload processing

## Security

- JWT authentication required
- Users can only access own KYC data
- File type validation (client & server recommended)
- File size limits prevent abuse
- Base64 encoding prevents direct file execution
- HTTPS required for production
- Consider adding:
  - Rate limiting on uploads
  - Virus scanning
  - Image metadata stripping
  - Watermarking for security

## Future Enhancements

1. **Admin Verification Interface:**
   - View submitted documents
   - Approve/reject verification
   - Add rejection reasons
   - Send notifications

2. **Document Status Display:**
   - Show current verification status
   - Display submitted documents
   - Show rejection reasons
   - Allow re-submission

3. **Enhanced Upload:**
   - Webcam capture
   - Drag & drop support
   - Multiple file upload
   - Progress bars
   - Image cropping/editing

4. **Notifications:**
   - Email on submission
   - Email on verification
   - Email on rejection
   - In-app notifications

5. **Analytics:**
   - Track submission rates
   - Monitor verification times
   - Identify common issues
   - Generate reports

6. **Automation:**
   - OCR for data extraction
   - Automated verification
   - Duplicate detection
   - Fraud detection

## Notes

- KYC verification is manual (admin reviews documents)
- Status changes from 'pending' to 'verified' or 'rejected' manually
- Users can re-submit if rejected
- All images stored as base64 in MongoDB
- Consider cloud storage for production
- Document age validation not implemented (3-month rule)
- No OCR or automated verification
- No duplicate submission prevention

## Error Handling

**Common Errors:**
- 400: Missing required fields
- 401: Unauthorized (no token)
- 404: User not found
- 413: File too large (if server-side limit)
- 500: Server error

**Frontend Error Handling:**
- File validation before upload
- Form validation before submission
- Error message display
- Console logging for debugging
- Try-catch for API calls

## Matching Screenshot Requirements

From the screenshot:
✅ **Page Title**: "Affiliate KYC"  
✅ **Two Tabs**: Identity and Address  
✅ **Identity Tab Active**: Shows Identity form first  
✅ **Document Type Dropdown**: "Choose document type"  
✅ **Document Number Field**: "Type ID No here" placeholder  
✅ **Expiry Date**: Date picker with dd/mm/yyyy format  
✅ **Upload Areas**: Three upload sections for Identity  
✅ **Upload Button**: "choose Image" (teal color)  
✅ **Upload Icon**: Cloud with arrow  
✅ **Info Box**: Blue background with requirements  
✅ **Requirements List**: 1. File format, 2. Size limit, 3. Document rules  
✅ **Submit Button**: Dark gray, bottom right  
✅ **Clean Layout**: White background, clear sections  

Additional enhancements:
- Image preview functionality
- Remove uploaded files
- Success/error messages
- Loading states
- Form validation
- Auto-refresh after submission
- Responsive design
