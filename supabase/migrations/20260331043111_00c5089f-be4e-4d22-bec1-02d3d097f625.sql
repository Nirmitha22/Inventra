-- Drop existing storage policies for item-images bucket
DROP POLICY IF EXISTS "Authenticated users can upload item images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update own item images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete own item images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view item images" ON storage.objects;

-- Recreate with ownership checks using folder-based ownership (user_id/filename)
CREATE POLICY "Authenticated users can upload item images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'item-images' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Authenticated users can update own item images"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'item-images' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Authenticated users can delete own item images"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'item-images' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Anyone can view item images"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'item-images');