-- ===================================================
-- YAKDA E-COMMERCE SEO TAXONOMY OVERHAUL
-- ===================================================

-- 1. Create Brands Table
CREATE TABLE IF NOT EXISTS public.brands (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  seo_title TEXT,
  seo_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Read Brands" ON public.brands FOR SELECT USING (true);
CREATE POLICY "Admin Manage Brands" ON public.brands FOR ALL USING (true) WITH CHECK (true);

-- 2. Create Collections Table (for Eco-friendly, Kawaii, Best Sellers, etc.)
CREATE TABLE IF NOT EXISTS public.collections (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  seo_title TEXT,
  seo_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Read Collections" ON public.collections FOR SELECT USING (true);
CREATE POLICY "Admin Manage Collections" ON public.collections FOR ALL USING (true) WITH CHECK (true);

-- Seed initial collections based on YAKDA requirements
INSERT INTO public.collections (name, slug) VALUES 
  ('Eco-Friendly', 'eco-friendly'),
  ('Kawaii Stationery', 'kawaii-stationery'),
  ('Books & Novels', 'books-novels'),
  ('Toys & Games', 'toys-games'),
  ('Arts & Crafts', 'arts-crafts'),
  ('Best Sellers', 'best-sellers'),
  ('New Arrivals', 'new-arrivals'),
  ('Deals', 'deals')
ON CONFLICT (slug) DO NOTHING;

-- 3. Enhance Categories Table
ALTER TABLE public.categories 
  ADD COLUMN IF NOT EXISTS parent_id TEXT REFERENCES public.categories(id),
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS seo_title TEXT,
  ADD COLUMN IF NOT EXISTS seo_description TEXT,
  ADD COLUMN IF NOT EXISTS seo_h1 TEXT,
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;

-- 4. Enhance SubCategories Table
ALTER TABLE public.sub_categories 
  ADD COLUMN IF NOT EXISTS seo_title TEXT,
  ADD COLUMN IF NOT EXISTS seo_description TEXT,
  ADD COLUMN IF NOT EXISTS seo_h1 TEXT,
  ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;

-- 5. Enhance Products Table
ALTER TABLE public.products 
  ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS category_id TEXT REFERENCES public.categories(id),
  ADD COLUMN IF NOT EXISTS subcategory_id TEXT REFERENCES public.sub_categories(id),
  ADD COLUMN IF NOT EXISTS brand_id TEXT REFERENCES public.brands(id),
  ADD COLUMN IF NOT EXISTS product_type TEXT,
  ADD COLUMN IF NOT EXISTS is_eco_friendly BOOLEAN DEFAULT false;

-- Create Indexes for new foreign keys and SEO lookups
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_subcategory_id ON public.products(subcategory_id);
CREATE INDEX IF NOT EXISTS idx_products_brand_id ON public.products(brand_id);
CREATE INDEX IF NOT EXISTS idx_products_is_eco_friendly ON public.products(is_eco_friendly);

-- 6. Data Migration for existing products

-- Step 1: Generate safe URL-friendly slugs for existing products using their title and a small random suffix to ensure uniqueness if titles match
UPDATE public.products 
SET slug = lower(regexp_replace(title, '[^a-zA-Z0-9]+', '-', 'g')) || '-' || substring(md5(random()::text) from 1 for 4)
WHERE slug IS NULL;

-- Step 2: Migrate existing string-based "category" to exact "category_id" mapping
-- The previous 'category' column stored values like 'writing', 'paper' which corresponded to categories.slug
UPDATE public.products p
SET category_id = c.id
FROM public.categories c
WHERE p.category = c.slug 
AND p.category_id IS NULL;

-- Step 3: Handle loose classification (e.g., if any product titles contain 'book', put them in the 'books-novels' collection to preserve current logic temporarily until manual review)
CREATE TABLE IF NOT EXISTS public.product_collections (
  product_id TEXT REFERENCES public.products(id) ON DELETE CASCADE,
  collection_id TEXT REFERENCES public.collections(id) ON DELETE CASCADE,
  PRIMARY KEY (product_id, collection_id)
);

-- Note: We do not drop the old 'category' column just yet to ensure zero downtime or breaking of legacy queries that haven't been migrated yet.
