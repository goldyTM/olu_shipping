-- Create storage bucket for shipment documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('shipment-files', 'shipment-files', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies to allow authenticated users to upload
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'shipment-files');

-- Allow public read access to shipment documents
CREATE POLICY "Allow public downloads"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'shipment-files');

-- Allow authenticated users to update their uploads
CREATE POLICY "Allow authenticated updates"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'shipment-files');

-- Allow authenticated users to delete their uploads
CREATE POLICY "Allow authenticated deletes"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'shipment-files');
