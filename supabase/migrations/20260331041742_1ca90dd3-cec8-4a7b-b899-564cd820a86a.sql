
-- 1. Create storage bucket for item images
INSERT INTO storage.buckets (id, name, public) VALUES ('item-images', 'item-images', true);

-- 2. Storage RLS policies
CREATE POLICY "Authenticated users can upload item images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'item-images');

CREATE POLICY "Anyone can view item images"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'item-images');

CREATE POLICY "Users can update own item images"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'item-images');

CREATE POLICY "Users can delete own item images"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'item-images');

-- 3. Function to auto-generate low stock alerts
CREATE OR REPLACE FUNCTION public.check_low_stock()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Check if quantity dropped to or below min_quantity
  IF NEW.quantity <= NEW.min_quantity AND (OLD.quantity > OLD.min_quantity OR TG_OP = 'INSERT') THEN
    -- Delete existing unread alert for this item to avoid duplicates
    DELETE FROM public.alerts WHERE item_id = NEW.id AND type = 'low_stock' AND is_read = false;
    
    IF NEW.quantity = 0 THEN
      INSERT INTO public.alerts (user_id, item_id, type, message)
      VALUES (NEW.user_id, NEW.id, 'out_of_stock', NEW.name || ' is out of stock!');
    ELSE
      INSERT INTO public.alerts (user_id, item_id, type, message)
      VALUES (NEW.user_id, NEW.id, 'low_stock', NEW.name || ' is running low (' || NEW.quantity || ' ' || COALESCE(NEW.unit, 'pcs') || ' remaining)');
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- 4. Trigger on items table
CREATE TRIGGER on_item_stock_change
  AFTER INSERT OR UPDATE OF quantity ON public.items
  FOR EACH ROW
  EXECUTE FUNCTION public.check_low_stock();
