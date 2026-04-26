-- Storage RLS policies for word-images bucket.
-- Run once after first deploy if not already present:
--   docker exec -i supabase-db psql -U postgres -d postgres < storage-policies.sql

CREATE POLICY "Public can read word images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'word-images');

CREATE POLICY "Admins can upload word images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'word-images' AND
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

CREATE POLICY "Admins can delete word images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'word-images' AND
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );
