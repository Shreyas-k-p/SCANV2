-- =====================================================
-- Supabase Database Schema for ScanNServe
-- Migration from Firebase to Supabase
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. PROFILES TABLE (User Roles & Metadata)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  staff_id TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('MANAGER', 'SUB_MANAGER', 'WAITER', 'KITCHEN')),
  name TEXT NOT NULL,
  profile_photo TEXT,
  secret_id TEXT NOT NULL,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_staff_id ON public.profiles(staff_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- =====================================================
-- 2. MENU ITEMS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.menu_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  description TEXT,
  image TEXT,
  available BOOLEAN DEFAULT true,
  benefits TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_menu_items_category ON public.menu_items(category);
CREATE INDEX IF NOT EXISTS idx_menu_items_available ON public.menu_items(available);

-- =====================================================
-- 3. TABLES TABLE (Restaurant Tables)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.tables (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  table_number TEXT UNIQUE NOT NULL,
  capacity INTEGER DEFAULT 4,
  status TEXT DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'reserved')),
  qr_code TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tables_status ON public.tables(status);

-- =====================================================
-- 4. ORDERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_id TEXT UNIQUE NOT NULL,
  table_number TEXT NOT NULL,
  customer_name TEXT,
  customer_mobile TEXT,
  items JSONB NOT NULL,
  total_amount NUMERIC(10, 2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'preparing', 'ready', 'served', 'completed', 'cancelled')),
  assigned_waiter TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_table_number ON public.orders(table_number);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);

-- =====================================================
-- 5. FEEDBACKS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.feedbacks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  customer_name TEXT,
  customer_email TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_feedbacks_created_at ON public.feedbacks(created_at DESC);

-- =====================================================
-- TRIGGERS FOR UPDATED_AT
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_menu_items_updated_at BEFORE UPDATE ON public.menu_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tables_updated_at BEFORE UPDATE ON public.tables
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedbacks ENABLE ROW LEVEL SECURITY;

-- Helper function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT AS $$
BEGIN
  RETURN (
    SELECT role FROM public.profiles WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- PROFILES TABLE POLICIES
-- =====================================================

-- Users can read their own profile
CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Managers can read all profiles
CREATE POLICY "Managers can read all profiles"
  ON public.profiles FOR SELECT
  USING (public.get_user_role() = 'MANAGER');

-- Managers can insert profiles (create staff accounts)
CREATE POLICY "Managers can insert profiles"
  ON public.profiles FOR INSERT
  WITH CHECK (public.get_user_role() = 'MANAGER');

-- Managers can update profiles
CREATE POLICY "Managers can update profiles"
  ON public.profiles FOR UPDATE
  USING (public.get_user_role() = 'MANAGER');

-- Managers can delete profiles
CREATE POLICY "Managers can delete profiles"
  ON public.profiles FOR DELETE
  USING (public.get_user_role() = 'MANAGER');

-- =====================================================
-- MENU ITEMS TABLE POLICIES
-- =====================================================

-- Everyone can read menu items (including public/customers)
CREATE POLICY "Anyone can read menu items"
  ON public.menu_items FOR SELECT
  USING (true);

-- Managers and Sub-Managers can insert menu items
CREATE POLICY "Managers can insert menu items"
  ON public.menu_items FOR INSERT
  WITH CHECK (public.get_user_role() IN ('MANAGER', 'SUB_MANAGER'));

-- Managers and Sub-Managers can update menu items
CREATE POLICY "Managers can update menu items"
  ON public.menu_items FOR UPDATE
  USING (public.get_user_role() IN ('MANAGER', 'SUB_MANAGER'));

-- Managers can delete menu items
CREATE POLICY "Managers can delete menu items"
  ON public.menu_items FOR DELETE
  USING (public.get_user_role() = 'MANAGER');

-- =====================================================
-- TABLES TABLE POLICIES
-- =====================================================

-- Everyone can read tables
CREATE POLICY "Anyone can read tables"
  ON public.tables FOR SELECT
  USING (true);

-- Managers and Waiters can insert tables
CREATE POLICY "Staff can insert tables"
  ON public.tables FOR INSERT
  WITH CHECK (public.get_user_role() IN ('MANAGER', 'SUB_MANAGER', 'WAITER'));

-- Managers and Waiters can update tables
CREATE POLICY "Staff can update tables"
  ON public.tables FOR UPDATE
  USING (public.get_user_role() IN ('MANAGER', 'SUB_MANAGER', 'WAITER'));

-- Managers can delete tables
CREATE POLICY "Managers can delete tables"
  ON public.tables FOR DELETE
  USING (public.get_user_role() = 'MANAGER');

-- =====================================================
-- ORDERS TABLE POLICIES
-- =====================================================

-- Everyone can read orders (for customer tracking)
CREATE POLICY "Anyone can read orders"
  ON public.orders FOR SELECT
  USING (true);

-- Anyone can insert orders (customers placing orders)
CREATE POLICY "Anyone can insert orders"
  ON public.orders FOR INSERT
  WITH CHECK (true);

-- Staff can update orders
CREATE POLICY "Staff can update orders"
  ON public.orders FOR UPDATE
  USING (public.get_user_role() IN ('MANAGER', 'SUB_MANAGER', 'WAITER', 'KITCHEN'));

-- Managers can delete orders
CREATE POLICY "Managers can delete orders"
  ON public.orders FOR DELETE
  USING (public.get_user_role() = 'MANAGER');

-- =====================================================
-- FEEDBACKS TABLE POLICIES
-- =====================================================

-- Anyone can insert feedback
CREATE POLICY "Anyone can insert feedback"
  ON public.feedbacks FOR INSERT
  WITH CHECK (true);

-- Managers can read all feedback
CREATE POLICY "Managers can read feedback"
  ON public.feedbacks FOR SELECT
  USING (public.get_user_role() = 'MANAGER');

-- =====================================================
-- REALTIME SUBSCRIPTIONS
-- =====================================================

-- Enable realtime for orders (for live updates)
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.menu_items;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tables;
