-- Run this in Supabase Dashboard → SQL Editor
-- Fixes permission errors for products, customers, and orders

-- 0. Schema + sequence access (needed for IDENTITY / serial columns)
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;

-- 1. Grant table privileges to the anon role (used by the browser app)
GRANT SELECT, INSERT ON public.products TO anon;
GRANT SELECT, INSERT ON public.customers TO anon;
GRANT SELECT, INSERT ON public.orders TO anon;
-- 2. Enable RLS (if not already enabled)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- 3. Policies for products (read-only for employees)
DROP POLICY IF EXISTS "anon read products" ON public.products;
CREATE POLICY "anon read products"
  ON public.products FOR SELECT TO anon USING (true);

-- 4. Policies for customers
DROP POLICY IF EXISTS "anon read customers" ON public.customers;
CREATE POLICY "anon read customers"
  ON public.customers FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "anon insert customers" ON public.customers;
CREATE POLICY "anon insert customers"
  ON public.customers FOR INSERT TO anon WITH CHECK (true);

-- 5. Policies for orders
DROP POLICY IF EXISTS "anon read orders" ON public.orders;
CREATE POLICY "anon read orders"
  ON public.orders FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "anon insert orders" ON public.orders;
CREATE POLICY "anon insert orders"
  ON public.orders FOR INSERT TO anon WITH CHECK (true);
