# ✅ Quick Setup Checklist - Login & Avatar Features

## Part 1: Backend Setup (DO THIS FIRST!)

- [ ] Make sure you're in the `backend` directory
- [ ] Open `backend/.env` and check JWT_ACCESS_SECRET and JWT_REFRESH_SECRET
- [ ] If they say "your-super-long-random-..." then run:
  ```bash
  node generate-secrets.js
  ```
- [ ] Copy the output secrets and paste into `backend/.env`
- [ ] Save `.env` file
- [ ] Install dependencies: `npm install`
- [ ] Start backend: `npm run dev`
- [ ] Wait for message: **"Server running on http://localhost:5000/api/v1"**

## Part 2: Frontend Setup

- [ ] Open terminal, go to `frontend` directory
- [ ] Check `frontend/.env.local` has: `NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1`
- [ ] Install dependencies: `npm install`
- [ ] Start frontend: `npm run dev`
- [ ] Wait for message: **"ready on http://localhost:3000"**

## Part 3: Database Setup (Supabase)

- [ ] Go to Supabase Studio dashboard
- [ ] Open SQL Editor
- [ ] Run the migration SQL from: `backend/database/migrations/001_add_avatar_url_to_users.sql`
- [ ] Create storage bucket:
  - Go to Storage section
  - Create new bucket: `user_avatars`
  - Set to Private
  - Add RLS policies (from migration file)

## Part 4: Test Login Features

### Test Remember Me:

1. Go to http://localhost:3000/login
2. Enter test email and password
3. Check "Ghi nhớ đăng nhập" checkbox
4. Click "Đăng nhập ngay"
5. After logout, visit /login again
6. Email should be pre-filled ✓

### Test CAPTCHA:

1. Go to http://localhost:3000/login
2. Try to submit form WITHOUT checking "Tôi không phải là người máy"
3. Should see error message ✓
4. Check the CAPTCHA checkbox
5. Submit form - should work ✓

### Test Avatar Dropdown:

1. Successfully log in
2. Look at header - should show avatar or initials
3. Click avatar
4. Should see dropdown with:
   - User name and email ✓
   - "Hồ sơ cá nhân" link ✓
   - "Đăng xuất" button ✓
5. Click logout - should clear token and redirect ✓

---

## Troubleshooting

### ❌ Backend won't start

```
Error: Missing required environment variables
```

**Fix:** Make sure `.env` has all required variables filled in (not placeholder values)

### ❌ Can't login - 401 Unauthorized

**Cause:** JWT secrets are still placeholder values
**Fix:** Run `node generate-secrets.js` and update `.env`

### ❌ Can't login - 500 Server Error

**Check backend logs for:**

1. Supabase connection error → Check SUPABASE_URL and API keys
2. Database error → Check if users table exists
3. Email validation error → Check password requirements

### ❌ CORS Error in browser

```
Access to XMLHttpRequest blocked by CORS policy
```

**Fix:** Make sure `frontend/.env.local` has correct NEXT_PUBLIC_API_URL

### ❌ Login succeeds but no redirect

**Check browser console for errors:**

- Should see "Logging in to: http://localhost:5000/api/v1/auth/login"
- Should see successful response with accessToken
- Check localStorage for "accessToken" and "user" keys

---

## Additional Files Updated

### Backend:

- ✅ `models/user.model.js` - avatar_url field added
- ✅ `controllers/auth.controller.js` - uploadAvatar function + login response updated
- ✅ `routes/auth.routes.js` - /upload-avatar endpoint added
- ✅ `database/migrations/001_add_avatar_url_to_users.sql` - migration script

### Frontend:

- ✅ `src/app/login/page.tsx` - Remember Me + CAPTCHA + Login form
- ✅ `src/components/layout/Header.tsx` - Avatar dropdown + Logout

---

## Port Reference

- Backend API: http://localhost:5000
- Frontend: http://localhost:3000
- Next Auth Endpoint: http://localhost:3000/api/v1

Make sure these ports are not in use before starting!

---

Ready to test? 🚀 Follow the checklist above!
