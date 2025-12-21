# Supabase Storage Setup for Shipment Documents

## Creating the Storage Bucket

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project (`tndlbjxkdrftxbcxyawi`)
3. Click on **Storage** in the left sidebar
4. Click **New bucket**
5. Configure the bucket:
   - **Name:** `shipment-files`
   - **Public bucket:** ✅ Enable (so documents can be viewed/downloaded)
   - Click **Create bucket**

## Setting Up Policies

After creating the bucket, set up the following policies:

### 1. Allow Public Read Access
- **Policy name:** Allow public downloads
- **Policy definition:**
  ```sql
  bucket_id = 'shipment-files'
  ```
- **Allowed operations:** SELECT
- **Target roles:** public

### 2. Allow Authenticated Uploads
- **Policy name:** Allow authenticated uploads  
- **Policy definition:**
  ```sql
  bucket_id = 'shipment-files'
  ```
- **Allowed operations:** INSERT
- **Target roles:** authenticated

### 3. Allow Authenticated Updates
- **Policy name:** Allow authenticated updates
- **Policy definition:**
  ```sql
  bucket_id = 'shipment-files'
  ```
- **Allowed operations:** UPDATE
- **Target roles:** authenticated

### 4. Allow Authenticated Deletes
- **Policy name:** Allow authenticated deletes
- **Policy definition:**
  ```sql
  bucket_id = 'shipment-files'
  ```
- **Allowed operations:** DELETE
- **Target roles:** authenticated

## Alternative: Run SQL Migration

You can also create the bucket and policies by running the migration file:

```sql
-- Run this in the SQL Editor in Supabase Dashboard
-- File: backend/db/migrations/7_create_storage_bucket.up.sql
```

## File Upload Limits

- Maximum file size: 5MB (enforced in frontend)
- Allowed file types: PDF, PNG, JPG, JPEG
- Files are stored in: `shipment-documents/{vendor_decl_id}_{type}_{timestamp}.{ext}`

## Testing

1. Log in as admin
2. Go to Admin Dashboard
3. Edit a shipment
4. Upload an invoice or packing list
5. Save the shipment
6. Track the shipment and verify the documents appear in the tracking page
