Supabase setup and accounts (local / production)

This document contains step-by-step instructions to configure Supabase for the project, including keys, storage, and example RLS policies.

1) Create Supabase project
- Go to https://app.supabase.com and create a new project (or use an existing one). Note the `Project URL`.

2) Service role key and anon key
- In the Supabase dashboard go to: Settings -> API.
- Copy the `anon` (public) key and the `service_role` key.
- Add them to local env files (do NOT commit service_role key to source control):

  backend/.env
  ----------------
  SUPABASE_URL=https://<your-project-ref>.supabase.co
  SUPABASE_SERVICE_ROLE_KEY=<YOUR_SERVICE_ROLE_KEY>

  frontend/.env (Vite)
  --------------------
  VITE_SUPABASE_URL=https://<your-project-ref>.supabase.co
  VITE_SUPABASE_ANON_KEY=<YOUR_ANON_KEY>

3) Create a storage bucket for generated documents (invoice / packing list / qr)
- In Supabase dashboard: Storage -> Create bucket
  - Name: `documents`
  - Public: OPTIONAL — choose private for secure buckets and use signed URLs for access.

4) Applying SQL migrations
- Install Supabase CLI (https://supabase.com/docs/guides/cli)
- From repository root run (example):

  supabase login
  supabase link --project-ref <your-project-ref>
  supabase db push --file backend/db/migrations/1_create_tables.up.sql
  supabase db push --file backend/db/migrations/2_add_vendor_id.up.sql
  supabase db push --file backend/db/migrations/3_id_generation.up.sql

Alternatively, you can run the SQL files directly with `psql` using the database connection string in the Supabase dashboard.

5) Recommended RLS policies (example)
- Enable RLS for tables you want to protect and create policies for authenticated users and service role.

Example: Allow authenticated users to insert into `vendor_shipments` (if vendors authenticate via Supabase Auth):

-- Enable RLS
ALTER TABLE vendor_shipments ENABLE ROW LEVEL SECURITY;

-- Policy: allow authenticated inserts where vendor_id = auth.uid()
CREATE POLICY "Vendors can insert own shipments"
  ON vendor_shipments
  FOR INSERT
  TO authenticated
  USING (true)
  WITH CHECK (vendor_id = auth.uid());

Note: adjust policies according to your authentication model for vendors and admins.

6) Storage access patterns
- If bucket `documents` is private, generate signed URLs when uploading files (backend will use the service role key to upload and then create signed URLs). Example using Supabase JS:

  const { data, error } = await supabase.storage.from('documents').upload(path, fileBuffer, { contentType });
  const { data: url } = await supabase.storage.from('documents').createSignedUrl(path, 60 * 60 * 24); // 24 hours

7) Service accounts and automation
- For backend server processes (PDF generation, email sending, uploads) use the `SUPABASE_SERVICE_ROLE_KEY` environment variable. Keep it secret.
- For client-side usage (React), use the anon key (`VITE_SUPABASE_ANON_KEY`) — it is public but scoped by RLS policies.

8) Email service
- You can use Supabase's built-in email (SMTP) or integrate SendGrid. For SendGrid, set `SENDGRID_API_KEY` in `backend/.env` then call SendGrid from the backend.

9) Quick checklist before production
- Rotate keys if leaked.
- Ensure `backend/.env` is present on server (Vercel/other) and does NOT include service role in public repo.
- Confirm RLS policies, especially for storage if sensitive PDFs are stored.

