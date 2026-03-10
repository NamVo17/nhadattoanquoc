# Supabase Storage Setup for News Images

## Issue

You're getting 500 errors when uploading images. This is likely because the Supabase storage bucket `news-images` doesn't exist yet.

## Solution: Create Storage Bucket

### Option 1: Supabase Dashboard (Recommended)

1. Go to your Supabase project: https://app.supabase.com
2. Click on **Storage** in the left sidebar
3. Click **+ New bucket**
4. Fill in:
   - **Name:** `news-images` (exactly this)
   - **Privacy:** Public (so uploaded images are publicly accessible)
5. Click **Create bucket**
6. Click on the `news-images` bucket
7. Click **Policies** tab
8. Click **+ New policy** or **Create policy**
9. Select **For authenticated users** and set:
   - SELECT: TRUE
   - INSERT: TRUE (allow uploads)
   - UPDATE: FALSE
   - DELETE: TRUE (allow deletion by admins)
10. Click **Review** then **Save policy**

### Option 2: Direct SQL/API

Run in Supabase SQL Editor:

```sql
-- Create the storage bucket (if needed)
INSERT INTO storage.buckets (id, name, public)
VALUES ('news-images', 'news-images', true)
ON CONFLICT DO NOTHING;

-- Allow authenticated users to upload
CREATE POLICY "Allow authenticated users to upload news images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'news-images'
  AND auth.role() = 'authenticated'
);

-- Allow public to view images
CREATE POLICY "Allow public to view news images"
ON storage.objects FOR SELECT
USING (bucket_id = 'news-images');
```

## Testing

1. After creating the bucket, try uploading an image in the Admin Dashboard
2. Check browser console (F12) for error messages
3. Check backend logs for detailed error messages (they'll now be in the console)

If you still get errors, check:

- ✅ Bucket name is exactly `news-images`
- ✅ Bucket is set to Public
- ✅ You're logged in as an admin user
- ✅ Your SUPABASE_SERVICE_ROLE_KEY is set in backend `.env`

## URLs

- **Supabase Dashboard:** https://app.supabase.com
- **Documentation:** https://supabase.com/docs/guides/storage

## Troubleshooting

### Error: "Storage bucket not found"

- Create the bucket named exactly `news-images`
- Verify it appears in the Storage tab

### Error: "Permission denied"

- Ensure bucket is set to **Public** privacy
- Check storage policies are properly configured
- Verify auth token is being sent (check browser Network tab)

### Error: "401 Unauthorized"

- Check you're logged in to the admin panel
- Check localStorage has `accessToken` (F12 > Storage > Local Storage)
- Try logging out and back in to refresh token

### Error: "403 Forbidden"

- Verify your user account has admin role in the database
- Check the `users` table in Supabase: `role` column should be `'admin'`
