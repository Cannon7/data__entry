-- Run this in Supabase Dashboard → SQL Editor
-- Fixes permission errors for products, customers, and orders

-- Schema updates
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS price_override bigint;
ALTER TABLE public."pre-orders" ADD COLUMN IF NOT EXISTS price_override bigint;

-- 0. Schema + sequence access (needed for IDENTITY / serial columns)GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;

-- 1. Grant table privileges to the anon role (used by the browser app)
GRANT SELECT, INSERT ON public.products TO anon;
GRANT SELECT, INSERT ON public.customers TO anon;
GRANT SELECT, INSERT ON public.orders TO anon;
GRANT SELECT, INSERT, UPDATE ON public."pre-orders" TO anon;

-- 2. Enable RLS (if not already enabled)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."pre-orders" ENABLE ROW LEVEL SECURITY;

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

-- 6. Policies for pre-orders
DROP POLICY IF EXISTS "anon read pre-orders" ON public."pre-orders";
CREATE POLICY "anon read pre-orders"
  ON public."pre-orders" FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "anon insert pre-orders" ON public."pre-orders";
CREATE POLICY "anon insert pre-orders"
  ON public."pre-orders" FOR INSERT TO anon WITH CHECK (true);

DROP POLICY IF EXISTS "anon update pre-orders" ON public."pre-orders";
CREATE POLICY "anon update pre-orders"
  ON public."pre-orders" FOR UPDATE TO anon USING (true) WITH CHECK (true);
