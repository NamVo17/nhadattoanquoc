# 🔧 Fixing "Cập nhật thất bại" (Update Failed) Error

## The Error You're Seeing:

```
error: POST /api/v1/auth/login → 500: Cập nhật thất bại.
    at Object.update (D:\React\batdongsan\backend\models\user.model.js:118:26)
    at async login (...auth.controller.js:207:9)
```

This error occurs during login when the backend tries to save the refresh token hash. It means the database update failed.

---

## ✅ What I've Fixed:

I improved the error logging in `backend/models/user.model.js` so you'll now see the **actual error** from Supabase:

```javascript
if (error) {
    console.error('User update error:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
        userId: id,
        fieldsAttempted: Object.keys(fields),
    });
```

When you try to login again, you'll see detailed error info in the backend terminal.

---

## 🚀 How to Fix This:

### Step 1: Check Your Supabase Table

Go to Supabase Studio:

1. Click on **SQL Editor**
2. Click **New Query**
3. Paste this query:

```sql
-- Check what columns the users table has
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'users' AND table_schema = 'public'
ORDER BY ordinal_position;
```

4. Click **Run**
5. Look for these columns in the results:
   - ✅ `refresh_token_hash` (TEXT)
   - ✅ `avatar_url` (TEXT)
   - ✅ `id`, `email`, `password_hash`, etc.

### Step 2: Add Missing Column (if needed)

If `avatar_url` is missing, run this in SQL Editor:

```sql
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS avatar_url TEXT DEFAULT NULL;
```

If `refresh_token_hash` is missing, run this:

```sql
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS refresh_token_hash TEXT DEFAULT NULL;
```

### Step 3: Check RLS Policies

Make sure Row Level Security (RLS) isn't blocking updates:

```sql
-- Run this to see RLS policies
SELECT policyname, qual, with_check
FROM pg_policies
WHERE tablename = 'users'
ORDER BY policyname;
```

If you see RLS policies, they might be preventing the backend from updating. Make sure you have a policy like:

```sql
-- Create policy for service role (backend) to bypass RLS
DROP POLICY IF EXISTS "service_role_bypass" ON public.users;
CREATE POLICY "service_role_bypass" ON public.users
  FOR ALL USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');
```

### Step 4: Run Full Schema Migration

To ensure everything is correct, run the complete schema in Supabase SQL Editor:

**File:** `backend/database/schema.sql`

Copy the entire file and paste it into Supabase SQL Editor, then click **Run**.

This will:

- ✅ Create the users table with all columns
- ✅ Add indexes
- ✅ Set up triggers
- ✅ Configure RLS policies correctly

### Step 5: Try Login Again

1. Restart backend:

   ```bash
   cd backend
   npm run dev
   ```

2. Now check the **backend console output** when you try to login
   - If successful: You'll see `User logged in: user@email.com`
   - If error: You'll see the detailed error with the actual reason

---

## Understanding the Better Error Messages

When the improved logging runs, you'll see something like:

#### ✅ Success (no error logged):

```
User logged in: test@example.com
Logged in URL: http://localhost:3000/login
```

#### ❌ Column doesn't exist:

```
User update error: {
  message: "column \"avatar_url\" does not exist",
  code: "42703",
  fieldsAttempted: [ "refresh_token_hash" ]
}
```

**Fix:** Run the migration to add the column

#### ❌ RLS policy blocking:

```
User update error: {
  message: "new row violates row-level security policy",
  code: "42501",
  details: "Policy is preventing the operation"
}
```

**Fix:** Create service role policy (see Step 3)

#### ❌ User not found:

```
User update error: {
  message: "No rows affected",
  code: "NO_DATA"
}
```

**Fix:** User ID is invalid - check if user exists in database

---

## Quick Checklist:

- [ ] Ran `backend/database/schema.sql` in Supabase SQL Editor
- [ ] Checked that `users` table has `refresh_token_hash` column
- [ ] Checked that `users` table has `avatar_url` column
- [ ] Verified RLS policies allow service role
- [ ] Restarted backend (`npm run dev`)
- [ ] Checked backend console for detailed error messages
- [ ] Share the error message if you still see `User update error: ...`

---

## If You Still Have Issues:

1. **Share the error message** from the improved logging with detailed `message`, `code`, `details`
2. **Check backend console** for full stack trace
3. **Verify SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY** are correct in `.env`

The detailed logging will tell us exactly what's wrong! 🔍
