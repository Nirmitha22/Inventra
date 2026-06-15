
-- 1. Drop duplicate/overly-broad storage policies
DROP POLICY IF EXISTS "Users can delete own item images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own item images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view item images" ON storage.objects;

-- 2. Create proper SELECT policy for authenticated users only
CREATE POLICY "Authenticated users can view item images"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'item-images');

-- 3. Make bucket private
UPDATE storage.buckets SET public = false WHERE id = 'item-images';

-- 4. Fix categories: public -> authenticated
DROP POLICY IF EXISTS "Users can manage own categories" ON public.categories;
CREATE POLICY "Users can manage own categories" ON public.categories
FOR ALL TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 5. Fix locations: public -> authenticated
DROP POLICY IF EXISTS "Users can manage own locations" ON public.locations;
CREATE POLICY "Users can manage own locations" ON public.locations
FOR ALL TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 6. Fix items: public -> authenticated
DROP POLICY IF EXISTS "Users can manage own items" ON public.items;
CREATE POLICY "Users can manage own items" ON public.items
FOR ALL TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 7. Fix alerts: public -> authenticated
DROP POLICY IF EXISTS "Users can manage own alerts" ON public.alerts;
CREATE POLICY "Users can manage own alerts" ON public.alerts
FOR ALL TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 8. Fix transactions: public -> authenticated
DROP POLICY IF EXISTS "Users can manage own transactions" ON public.transactions;
CREATE POLICY "Users can manage own transactions" ON public.transactions
FOR ALL TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 9. Fix suppliers: public -> authenticated
DROP POLICY IF EXISTS "Users can manage own suppliers" ON public.suppliers;
CREATE POLICY "Users can manage own suppliers" ON public.suppliers
FOR ALL TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
