# 🚨 Console Error Analysis

## The Error You're Seeing:

```
forward-logs-shared.ts:95 [Fast Refresh] done in 1950ms
intercept-console-error.ts:42 A component is changing an uncontrolled input to be controlled.
```

### What This Means:

A React input field is starting as uncontrolled (no initial value) and then becoming controlled (with a value) during rendering. This usually happens during component hydration mismatch.

### ✅ FIXED IN:

Updated `frontend/src/app/login/page.tsx` to:

1. Initialize all state with proper default values (empty strings)
2. Add `mounted` state to prevent hydration mismatches
3. All input fields now properly use controlled components

---

## The API Errors You're Seeing:

```
:5000/api/v1/auth/login:1  Failed to load resource: the server responded with a status of 401 (Unauthorized)
:5000/api/v1/auth/login:1  Failed to load resource: the status of 500 (Internal Server Error)
```

### What These Mean:

#### 🔴 401 Unauthorized

- JWT token is invalid or expired
- Could be caused by:
  - JWT_ACCESS_SECRET placeholder value not changed
  - Backend JWT configuration wrong
  - Token validation logic failed

#### 🔴 500 Internal Server Error

- Backend crashed or threw an error
- Common causes:
  - Supabase connection failed
  - Database query error (users table missing)
  - Invalid input validation

### ✅ FIX:

1. **Generate real JWT secrets:**

   ```bash
   cd backend
   node generate-secrets.js
   ```

2. **Update backend/.env:**

   ```env
   JWT_ACCESS_SECRET=<long-secret-from-generator>
   JWT_REFRESH_SECRET=<long-secret-from-generator>
   ```

3. **Restart backend:**

   ```bash
   npm run dev
   ```

4. **Check backend started successfully:**
   ```
   ✓ Supabase initialized
   ✓ Server running on http://localhost:5000/api/v1
   ```

---

## Network Request Details:

When login works, you should see in Developer Tools → Network:

**Request:**

```
POST http://localhost:5000/api/v1/auth/login
Headers: Content-Type: application/json
Body: {
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (Success):**

```
Status: 200
{
  "success": true,
  "message": "Đăng nhập thành công.",
  "data": {
    "accessToken": "eyJhbGc...",
    "user": {
      "id": "uuid",
      "fullName": "User Name",
      "email": "user@example.com",
      "avatarUrl": null,
      "role": "user"
    }
  }
}
```

---

## After Fixing JWT Secrets:

The errors should change:

- ❌ 401 Unauthorized → ✅ 200 OK (success)
- ❌ 500 Server Error → ✅ 200 OK or 401 (wrong credentials)
- ✅ React component warning goes away

---

## Quick Terminal Commands:

```bash
# Kill all Node processes
taskkill /IM node.exe /F

# Check what's running on ports
# Windows:
netstat -ano | findstr :5000
netstat -ano | findstr :3000

# Mac/Linux:
lsof -i :5000
lsof -i :3000
```

---

## Next Step:

Follow **SETUP_CHECKLIST.md** to get everything running!
