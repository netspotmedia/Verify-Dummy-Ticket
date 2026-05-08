-- URGENT: Fix infinite recursion in profiles RLS policy
-- Run this in Supabase SQL Editor immediately after 011

-- Step 1: Create a SECURITY DEFINER function that reads profiles.role
-- without triggering RLS (runs as the function owner, bypassing row checks).
-- This breaks the recursion: profiles policy → function → profiles (no RLS) ✓
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS TEXT
LANGUAGE SQL
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

-- Step 2: Fix all profiles policies that self-referenced the profiles table
-- (self-referencing an RLS-enabled table from its own policy = infinite recursion)

DROP POLICY IF EXISTS "profiles_select_own"   ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own"   ON public.profiles;
DROP POLICY IF EXISTS "profiles_admin_all"    ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own"   ON public.profiles;

-- SELECT: own row or admin
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (
  auth.uid() = id OR public.current_user_role() = 'admin'
);

-- INSERT: only own row
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- UPDATE: own row or admin
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (
  auth.uid() = id OR public.current_user_role() = 'admin'
);

-- Full admin access
CREATE POLICY "profiles_admin_all" ON public.profiles FOR ALL USING (
  public.current_user_role() = 'admin'
) WITH CHECK (
  public.current_user_role() = 'admin'
);
