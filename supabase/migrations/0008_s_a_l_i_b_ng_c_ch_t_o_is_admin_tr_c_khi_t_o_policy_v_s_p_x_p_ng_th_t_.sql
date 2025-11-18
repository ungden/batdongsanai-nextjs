-- Đảm bảo extension cho UUID
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1) Tạo enum vai trò nếu chưa có
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
    CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');
  END IF;
END $$;

-- 2) Tạo bảng user_roles (nếu chưa tồn tại)
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL DEFAULT 'user',
  assigned_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  assigned_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bật RLS cho user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 3) Tạo hàm is_admin trước khi tạo bất kỳ policy nào tham chiếu tới nó
CREATE OR REPLACE FUNCTION public.is_admin(user_uuid uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    WHERE ur.user_id = user_uuid
      AND ur.role = 'admin'::public.app_role
  );
$$;

-- 4) Chính sách RLS cho user_roles (dùng is_admin đã có)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'user_roles' AND policyname = 'user_roles_select_authenticated'
  ) THEN
    CREATE POLICY user_roles_select_authenticated
    ON public.user_roles
    FOR SELECT
    TO authenticated
    USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'user_roles' AND policyname = 'user_roles_insert_admin_only'
  ) THEN
    CREATE POLICY user_roles_insert_admin_only
    ON public.user_roles
    FOR INSERT
    TO authenticated
    WITH CHECK (public.is_admin(auth.uid()));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'user_roles' AND policyname = 'user_roles_update_admin_only'
  ) THEN
    CREATE POLICY user_roles_update_admin_only
    ON public.user_roles
    FOR UPDATE
    TO authenticated
    USING (public.is_admin(auth.uid()))
    WITH CHECK (public.is_admin(auth.uid()));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'user_roles' AND policyname = 'user_roles_delete_admin_only'
  ) THEN
    CREATE POLICY user_roles_delete_admin_only
    ON public.user_roles
    FOR DELETE
    TO authenticated
    USING (public.is_admin(auth.uid()));
  END IF;
END $$;

-- 5) Tạo bảng developers nếu chưa có
CREATE TABLE IF NOT EXISTS public.developers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  logo TEXT,
  description TEXT,
  established_year INT,
  website TEXT,
  hotline TEXT,
  email TEXT,
  address TEXT,
  total_projects INT DEFAULT 0 NOT NULL,
  completed_projects INT DEFAULT 0 NOT NULL,
  avg_legal_score NUMERIC,
  avg_rating NUMERIC,
  specialties TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bật RLS cho developers
ALTER TABLE public.developers ENABLE ROW LEVEL SECURITY;

-- 6) Chính sách RLS cho developers (tham chiếu is_admin đã tồn tại)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'developers' AND policyname = 'developers_select_authenticated'
  ) THEN
    CREATE POLICY developers_select_authenticated
    ON public.developers
    FOR SELECT
    TO authenticated
    USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'developers' AND policyname = 'developers_insert_admin_only'
  ) THEN
    CREATE POLICY developers_insert_admin_only
    ON public.developers
    FOR INSERT
    TO authenticated
    WITH CHECK (public.is_admin(auth.uid()));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'developers' AND policyname = 'developers_update_admin_only'
  ) THEN
    CREATE POLICY developers_update_admin_only
    ON public.developers
    FOR UPDATE
    TO authenticated
    USING (public.is_admin(auth.uid()))
    WITH CHECK (public.is_admin(auth.uid()));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'developers' AND policyname = 'developers_delete_admin_only'
  ) THEN
    CREATE POLICY developers_delete_admin_only
    ON public.developers
    FOR DELETE
    TO authenticated
    USING (public.is_admin(auth.uid()));
  END IF;
END $$;