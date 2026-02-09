# Affiliate Registration API Fix

## Problem
Affiliate registration was failing with 404 error:
```
POST http://localhost:3000/api/affiliate/register 404 (Not Found)
```

The frontend was making a raw axios call to `/api/affiliate/register` which was targeting the Next.js dev server (port 3000) instead of the backend API server (port 5001).

## Root Cause
- The affiliate registration page was using `axios.post('/api/affiliate/register', ...)` directly
- This caused the request to go to `http://localhost:3000/api/...` (Next.js server)
- The backend API is actually running on `http://localhost:5001/api/...`
- No API client integration existed for affiliate endpoints

## Solution Implemented

### 1. Added Affiliate API Client
**File**: `lib/api-client.ts`

Created a new `affiliateAPI` export with methods for:
- ✅ `register()` - Register new affiliate
- ✅ `getProfile()` - Get affiliate profile
- ✅ `getDashboard()` - Get affiliate dashboard stats
- ✅ `getCommissions()` - Get affiliate commissions
- ✅ `getReferrals()` - Get affiliate referrals

This ensures all affiliate API calls use the correct base URL (`http://localhost:5001/api` or `NEXT_PUBLIC_API_URL`).

### 2. Updated Affiliate Register Page
**File**: `app/affiliate/register/page.tsx`

Changes made:
- Removed direct `axios` import
- Added `import { affiliateAPI } from '@/lib/api-client'`
- Replaced `axios.post('/api/affiliate/register', ...)` with `affiliateAPI.register(...)`
- Updated error handling to work with API client response format

## Technical Details

### Backend Route (Already Configured)
```javascript
// backend/routes/affiliate.routes.js
router.post('/register', affiliateController.registerAffiliate);

// Mounted at:
// backend/server.js
app.use('/api/affiliate', affiliateRoutes);
```

### API Client Configuration
```typescript
// lib/api-client.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

export const affiliateAPI = {
  register: async (data) => {
    return apiClient.post('/affiliate/register', data);
  },
  // ... other methods
};
```

### Request Flow (After Fix)
1. Frontend calls `affiliateAPI.register(data)`
2. API client uses configured base URL: `http://localhost:5001/api`
3. Full URL becomes: `http://localhost:5001/api/affiliate/register`
4. Request reaches backend correctly ✅

## Files Modified

### Created/Added
- `affiliateAPI` section in `lib/api-client.ts`

### Modified
- `app/affiliate/register/page.tsx` - Updated to use `affiliateAPI.register()`

## Testing

To test the fix:
1. Navigate to `/affiliate/register`
2. Fill in the registration form:
   - Username
   - First Name
   - Last Name
   - Email
   - Password
   - Phone (optional)
   - Date of Birth (optional)
3. Submit the form
4. Should see success message: "Registration submitted successfully!"
5. Should redirect to `/affiliate/login` after 3 seconds

## Expected Behavior

### Success Flow
1. Form submits to backend API
2. Backend creates pending affiliate account
3. Success message displays
4. Auto-redirect to login page
5. User must wait for admin approval before login

### Backend Response
```json
{
  "success": true,
  "message": "Affiliate registration submitted. Please wait for admin approval.",
  "data": {
    "user": { ... },
    "affiliate": { ... }
  }
}
```

## Related Fixes

This is the same pattern we used to fix:
- ✅ Admin login page (404 on `/api/auth/me`)
- ✅ Admin dashboard stats (404 on `/api/admin/stats/overview`)

All frontend API calls should go through the centralized `api-client.ts` to ensure correct base URL configuration.

## Benefits

1. **Correct API Routing**: All requests go to backend server
2. **Centralized Configuration**: Base URL managed in one place
3. **Type Safety**: TypeScript types for API methods
4. **Error Handling**: Consistent error handling via API client interceptors
5. **Token Management**: Auth tokens automatically added via request interceptor
6. **Maintainability**: Easier to update API endpoints in future

## Next Steps

Consider updating any other pages that might be using direct axios calls:
- Check other affiliate pages
- Check user pages
- Search for `axios.post('/api/` or `axios.get('/api/` patterns
- Replace with appropriate API client methods

## Environment Variables

Make sure `.env.local` has:
```env
NEXT_PUBLIC_API_URL=http://localhost:5001/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:5001
```

If not set, the default `http://localhost:5001/api` is used.
