# 🔧 Login & Backend Debugging Guide

## Issues Found:

### 1. **JWT Secrets are Placeholders** ⚠️

Your `.env` has:

```
JWT_ACCESS_SECRET=your-super-long-random-access-secret-min-64-chars
JWT_REFRESH_SECRET=your-super-long-random-refresh-secret-min-64-chars
```

These MUST be actual random strings (min 64 chars each). This is causing 401 Unauthorized errors!

### 2. **API Port Mismatch** ✅ FIXED

- Backend runs on: `http://localhost:5000`
- Frontend `.env.local` correctly specifies: `NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1`
- Login form now uses correct fallback

---

## How to Fix:

### Step 1: Generate Real JWT Secrets

Run this script in the backend folder:

```bash
# In terminal, go to backend folder:
cd backend

# Run the secret generator:
node generate-secrets.js
```

Output will look like:

```
🔒 JWT Secret Generator

Copy these values to your .env file:

────────────────────────────────────────────────────────────────────────────────

JWT_ACCESS_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0
JWT_REFRESH_SECRET=z9y8x7w6v5u4t3s2r1q0p9o8n7m6l5k4j3i2h1g0f9e8d7c6b5a4z3y2x1w0

────────────────────────────────────────────────────────────────────────────────
```

### Step 2: Update `.env` with Real Secrets

Replace with output from above:

```env
JWT_ACCESS_SECRET=<paste-64-char-secret-here>
JWT_REFRESH_SECRET=<paste-64-char-secret-here>
```

### Step 3: Restart Backend

```bash
# Terminal in backend folder:
npm run dev
```

Watch for these messages:

```
Server running on http://localhost:5000
[✓] All environment variables validated
```

### Step 4: Test Login

1. Go to http://localhost:3000/login
2. Check browser console for API URL in logs
3. You should see: "Logging in to: http://localhost:5000/api/v1/auth/login"

---

## Debugging Checklist:

- [ ] Backend .env has real JWT_ACCESS_SECRET (64+ chars)
- [ ] Backend .env has real JWT_REFRESH_SECRET (64+ chars)
- [ ] Backend running: `npm run dev` in `/backend` folder
- [ ] Backend shows "Server running on http://localhost:5000"
- [ ] Frontend running: `npm run dev` in `/frontend` folder
- [ ] Frontend `.env.local` has `NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1`
- [ ] No CORS errors in browser console
- [ ] Check browser DevTools → Network tab for API requests

---

## Common Errors & Solutions:

### ❌ "Lỗi kết nối: Failed to fetch"

**Cause:** Backend not running
**Fix:**

```bash
cd backend
npm run dev
```

### ❌ 401 Unauthorized

**Cause:** JWT secrets are invalid/placeholder
**Fix:** Use real secrets (see Step 1-2 above)

### ❌ 500 Internal Server Error

**Cause:** Supabase connection failed or database issue
**Check:**

1. Verify `SUPABASE_URL` and keys are correct
2. Users table exists in Supabase
3. Check backend logs for details

### ❌ CORS error in console

**Cause:** Frontend URL not in CORS whitelist
**Fix:** Update backend `app.js` CORS origin

---

## Next Steps After Fixing:

1. Test login with test user email
2. Check "Ghi nhớ đăng nhập" to save credentials
3. Verify avatar dropdown appears after login
4. Test logout functionality
