
DROP POLICY IF EXISTS "Authenticated users can view item images" ON storage.objects;

CREATE POLICY "Authenticated users can view item images"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'item-images' AND (storage.foldername(name))[1] = auth.uid()::text);
