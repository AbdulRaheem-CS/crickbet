# Socket.IO "xhr poll error" Fix

## Date: January 24, 2026

## Problem
Frontend showing "xhr poll error" when trying to connect to backend Socket.IO server.

## Root Cause
Socket.IO connection configuration issues between frontend and backend.

## Changes Made

### 1. Backend Socket Configuration (`backend/sockets/index.js`)
✅ **Updated:**
- Added explicit transport methods: `['websocket', 'polling']`
- Improved CORS configuration with methods and headers
- Increased ping timeout and interval for stability
- Added `allowEIO3: true` for backward compatibility

```javascript
io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    methods: ["GET", "POST"],
    credentials: true,
    allowedHeaders: ["*"]
  },
  transports: ['websocket', 'polling'],
  allowEIO3: true,
  pingTimeout: 60000,
  pingInterval: 25000,
});
```

### 2. Frontend Socket Connection (`context/SocketContext.tsx`)
✅ **Updated:**
- Fixed token key from `'token'` to `'authToken'` (matches AuthContext)
- Added explicit transport configuration
- Improved reconnection settings:
  - Max delay: 5000ms
  - Max attempts: 10
- Added comprehensive event logging:
  - `connect_error`
  - `reconnect`
  - `reconnect_attempt`
  - `reconnect_error`
  - `reconnect_failed`
- Better error messages with connection details in development mode

## How to Verify the Fix

### 1. Check Backend is Running
```bash
cd backend
npm run dev
```

**Expected output:**
```
✅ MongoDB Connected
╔═══════════════════════════════════════════════════════════╗
║   🏏 CrickBet Backend Server                              ║
║   Port: 5001                                              ║
╚═══════════════════════════════════════════════════════════╝
```

### 2. Check Frontend Environment
Verify `.env.local` has:
```
NEXT_PUBLIC_API_URL=http://localhost:5001/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:5001
```

### 3. Restart Both Servers
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
npm run dev
```

### 4. Check Browser Console
After page refresh, you should see:
```
✅ Socket connected: [socket-id] | User: [username/Anonymous]
```

**Instead of:**
```
❌ xhr poll error
```

## Common Issues & Solutions

### Issue 1: Backend Port Mismatch
**Symptom:** "Connection refused" or "ECONNREFUSED"
**Solution:**
```bash
# Check what's using port 5001
lsof -i :5001

# Make sure backend .env has:
PORT=5001
```

### Issue 2: CORS Errors
**Symptom:** "CORS policy" errors in browser console
**Solution:** Backend CORS config allows `http://localhost:3000`
```javascript
// backend/config/cors.js should include
origin: ['http://localhost:3000', 'http://localhost:3001']
```

### Issue 3: Token Issues
**Symptom:** Socket connects but authentication fails
**Solution:** 
- Frontend stores token as `authToken` in localStorage
- Socket reads from `localStorage.getItem('authToken')`
- Anonymous users (no token) are allowed for public data

### Issue 4: Firewall/Network Issues
**Symptom:** Connection timeout
**Solution:**
```bash
# Check if port is accessible
curl http://localhost:5001/health

# Should return:
{"status":"OK","timestamp":"...","uptime":...}
```

### Issue 5: Multiple Backend Instances
**Symptom:** Intermittent connections
**Solution:**
```bash
# Kill all node processes
killall node

# Restart backend
cd backend && npm run dev
```

## What the Logs Mean

### Good Logs ✅
```
✅ Socket connected: abc123 | User: john_doe
📊 Subscribed to market: market_123
[OddsFeed] WebSocket client connected: abc123
```

### Bad Logs ❌
```
❌ xhr poll error
❌ Socket connection error: ...
❌ ECONNREFUSED
❌ CORS policy error
```

### Reconnection Logs 🔄
```
🔄 Reconnection attempt: 1
🔄 Socket reconnected after 3 attempts
```

## Testing After Fix

1. **Open Browser DevTools Console**
2. **Navigate to** `http://localhost:3000`
3. **Check for:**
   - ✅ Green "Socket connected" message
   - ✅ Socket ID displayed
   - ✅ No red error messages

4. **Test Real-time Features:**
   - Navigate to Sports/Betting page
   - Check if live odds update (if available)
   - Open multiple tabs and check if all connect

5. **Test Reconnection:**
   - Stop backend server
   - Wait 10 seconds
   - Restart backend
   - Frontend should automatically reconnect

## Additional Notes

- Socket.IO will automatically try WebSocket first
- If WebSocket fails, it falls back to polling (xhr)
- The "xhr poll error" was happening because polling couldn't connect
- Now both transports are properly configured
- Anonymous users can connect without tokens
- Authenticated users get their userId and username attached to socket

## Environment Variables Reference

### Backend (`.env`)
```env
PORT=5001
CORS_ORIGIN=http://localhost:3000
JWT_SECRET=your_secret_here
```

### Frontend (`.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:5001/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:5001
```

## Files Modified

1. ✅ `backend/sockets/index.js` - Socket.IO server config
2. ✅ `context/SocketContext.tsx` - Socket.IO client config

---

## Quick Fix Commands

If you still see errors after changes:

```bash
# 1. Clear node modules and reinstall (if needed)
cd backend && rm -rf node_modules && npm install
cd .. && rm -rf node_modules && npm install

# 2. Kill all node processes
killall node

# 3. Restart backend
cd backend && npm run dev

# 4. In new terminal, restart frontend
npm run dev

# 5. Hard refresh browser
# Mac: Cmd + Shift + R
# Windows: Ctrl + Shift + R
```

---

**Status:** ✅ Fixed
**Date:** January 24, 2026
**Version:** Socket.IO v4.x compatible
