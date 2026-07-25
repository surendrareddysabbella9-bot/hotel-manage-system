-- ====================================================================
-- RestaurantOS — Supabase Storage Buckets & Policies
-- ====================================================================

-- 1. CREATE STORAGE BUCKETS
INSERT INTO storage.buckets (id, name, public) 
VALUES 
    ('menu-images', 'menu-images', true),
    ('avatars', 'avatars', true),
    ('restaurant-assets', 'restaurant-assets', true),
    ('receipts', 'receipts', false),
    ('invoices', 'invoices', false)
ON CONFLICT (id) DO NOTHING;

-- 2. STORAGE POLICIES FOR PUBLIC BUCKETS (menu-images, avatars, restaurant-assets)
DROP POLICY IF EXISTS "Public Read Access for menu-images" ON storage.objects;
CREATE POLICY "Public Read Access for menu-images"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'menu-images');

DROP POLICY IF EXISTS "Public Read Access for avatars" ON storage.objects;
CREATE POLICY "Public Read Access for avatars"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Public Read Access for restaurant-assets" ON storage.objects;
CREATE POLICY "Public Read Access for restaurant-assets"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'restaurant-assets');

-- 3. AUTHENTICATED UPLOAD POLICIES
DROP POLICY IF EXISTS "Authenticated User Upload Avatar" ON storage.objects;
CREATE POLICY "Authenticated User Upload Avatar"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Staff Upload Menu Images & Assets" ON storage.objects;
CREATE POLICY "Staff Upload Menu Images & Assets"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id IN ('menu-images', 'restaurant-assets', 'receipts', 'invoices') AND auth.role() = 'authenticated');

-- 4. PRIVATE BUCKETS READ POLICIES (receipts, invoices)
DROP POLICY IF EXISTS "Staff & Customer View Receipts" ON storage.objects;
CREATE POLICY "Staff & Customer View Receipts"
    ON storage.objects FOR SELECT
    USING (bucket_id IN ('receipts', 'invoices') AND auth.role() = 'authenticated');
