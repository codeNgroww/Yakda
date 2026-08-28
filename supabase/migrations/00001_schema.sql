-- ===================================================
-- YAKDA E-COMMERCE SUPABASE DATABASE SCHEMA & RLS SETUP
-- ===================================================

-- Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.categories (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  icon TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Seed Categories
INSERT INTO public.categories (name, slug, icon) VALUES
  ('All', 'all', 'border_all'),
  ('Writing & Pens', 'writing', 'edit_note'),
  ('Paper & Envelopes', 'paper', 'description'),
  ('Office Machines', 'machines', 'print'),
  ('Executive Furniture', 'furniture', 'desk')
ON CONFLICT (slug) DO NOTHING;

-- 2. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  sku TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10, 2) NOT NULL,
  category TEXT NOT NULL DEFAULT 'writing',
  badge TEXT,
  image TEXT NOT NULL,
  in_stock BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 3. USERS / PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password TEXT,
  fullname TEXT,
  companyname TEXT,
  account_type TEXT DEFAULT 'individual',
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 4. CART & CART ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.cart (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  user_id TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.cart_items (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  cart_id TEXT REFERENCES public.cart(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  product_id TEXT NOT NULL,
  quantity INTEGER DEFAULT 1 CHECK (quantity > 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 5. ORDERS & ORDER ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL DEFAULT 'guest',
  customer_email TEXT NOT NULL,
  items JSONB NOT NULL,
  total_amount NUMERIC(10, 2) NOT NULL,
  status TEXT DEFAULT 'pending',
  contact_phone TEXT,
  delivery_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.order_items (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  order_id TEXT REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL,
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  subtotal NUMERIC(10, 2) NOT NULL
);

-- 6. FAVORITES / WISHLIST TABLE
CREATE TABLE IF NOT EXISTS public.favorites (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  user_id TEXT NOT NULL,
  product_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  UNIQUE(user_id, product_id)
);

-- Indexes for Speed
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_sku ON public.products(sku);
CREATE INDEX IF NOT EXISTS idx_cart_items_user ON public.cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_user ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_user ON public.favorites(user_id);

-- ===================================================
-- ROW LEVEL SECURITY (RLS) POLICIES & PERMISSIONS
-- ===================================================
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to prevent conflicts
DROP POLICY IF EXISTS "Public Read Categories" ON public.categories;
DROP POLICY IF EXISTS "Public Manage Categories" ON public.categories;
DROP POLICY IF EXISTS "Public Read Products" ON public.products;
DROP POLICY IF EXISTS "Admin Insert Products" ON public.products;
DROP POLICY IF EXISTS "Admin Update Products" ON public.products;
DROP POLICY IF EXISTS "Admin Delete Products" ON public.products;
DROP POLICY IF EXISTS "Public Manage Products" ON public.products;
DROP POLICY IF EXISTS "Public Read Users" ON public.users;
DROP POLICY IF EXISTS "Insert User Profiles" ON public.users;
DROP POLICY IF EXISTS "Public Manage Users" ON public.users;
DROP POLICY IF EXISTS "Public Read Cart" ON public.cart;
DROP POLICY IF EXISTS "Public Manage Cart" ON public.cart;
DROP POLICY IF EXISTS "Public Read Cart Items" ON public.cart_items;
DROP POLICY IF EXISTS "Public Manage Cart Items" ON public.cart_items;
DROP POLICY IF EXISTS "Public Read Orders" ON public.orders;
DROP POLICY IF EXISTS "Public Create Orders" ON public.orders;
DROP POLICY IF EXISTS "Public Manage Orders" ON public.orders;
DROP POLICY IF EXISTS "Public Read Order Items" ON public.order_items;
DROP POLICY IF EXISTS "Public Create Order Items" ON public.order_items;
DROP POLICY IF EXISTS "Public Manage Order Items" ON public.order_items;
DROP POLICY IF EXISTS "Public Manage Favorites" ON public.favorites;

-- Permissive Table RLS Policies
CREATE POLICY "Public Manage Categories" ON public.categories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Manage Products" ON public.products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Manage Users" ON public.users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Manage Cart" ON public.cart FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Manage Cart Items" ON public.cart_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Manage Orders" ON public.orders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Manage Order Items" ON public.order_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Manage Favorites" ON public.favorites FOR ALL USING (true) WITH CHECK (true);

-- ===================================================
-- SUPABASE STORAGE BUCKET & RLS SETUP ('yakda')
-- ===================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('yakda', 'yakda', true, 204800, ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/gif'])
ON CONFLICT (id) DO UPDATE SET public = true, file_size_limit = 204800;

DROP POLICY IF EXISTS "Public Bucket Storage Read" ON storage.objects;
DROP POLICY IF EXISTS "Public Bucket Storage Upload" ON storage.objects;
DROP POLICY IF EXISTS "Public Bucket Storage Delete" ON storage.objects;
DROP POLICY IF EXISTS "Public Bucket Storage Manage" ON storage.objects;

CREATE POLICY "Public Bucket Storage Manage" ON storage.objects FOR ALL USING (bucket_id = 'yakda') WITH CHECK (bucket_id = 'yakda');
