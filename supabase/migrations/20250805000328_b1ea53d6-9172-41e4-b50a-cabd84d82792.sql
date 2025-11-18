
-- Tạo enum cho vai trò người dùng
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Tạo bảng user_roles để quản lý vai trò
CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  assigned_by UUID REFERENCES auth.users(id),
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Tạo bảng admin_logs để theo dõi hoạt động admin
CREATE TABLE public.admin_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  action TEXT NOT NULL,
  target_table TEXT,
  target_id TEXT,
  old_data JSONB,
  new_data JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tạo bảng system_settings để quản lý cài đặt hệ thống
CREATE TABLE public.system_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL,
  description TEXT,
  updated_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Bật RLS cho các bảng mới
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Function để kiểm tra vai trò người dùng (tránh infinite recursion)
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS app_role
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT role FROM public.user_roles 
  WHERE user_id = _user_id 
  ORDER BY 
    CASE role 
      WHEN 'admin' THEN 1
      WHEN 'moderator' THEN 2
      WHEN 'user' THEN 3
    END
  LIMIT 1;
$$;

-- Function để kiểm tra xem user có vai trò cụ thể không
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = _user_id AND role = _role
  );
$$;

-- Function để kiểm tra xem user có phải admin không
CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT public.has_role(_user_id, 'admin');
$$;

-- Policies cho user_roles
CREATE POLICY "Admins can view all user roles" ON public.user_roles
  FOR SELECT USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can insert user roles" ON public.user_roles
  FOR INSERT WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update user roles" ON public.user_roles
  FOR UPDATE USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete user roles" ON public.user_roles
  FOR DELETE USING (public.is_admin(auth.uid()));

-- Policies cho admin_logs
CREATE POLICY "Admins can view all admin logs" ON public.admin_logs
  FOR SELECT USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can insert admin logs" ON public.admin_logs
  FOR INSERT WITH CHECK (public.is_admin(auth.uid()));

-- Policies cho system_settings
CREATE POLICY "Admins can view all system settings" ON public.system_settings
  FOR SELECT USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can insert system settings" ON public.system_settings
  FOR INSERT WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update system settings" ON public.system_settings
  FOR UPDATE USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete system settings" ON public.system_settings
  FOR DELETE USING (public.is_admin(auth.uid()));

-- Cập nhật policies cho consultation_requests để admin có thể quản lý
CREATE POLICY "Admins can update consultation requests" ON public.consultation_requests
  FOR UPDATE USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete consultation requests" ON public.consultation_requests
  FOR DELETE USING (public.is_admin(auth.uid()));

-- Cập nhật policies cho profiles để admin có thể xem tất cả
CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (public.is_admin(auth.uid()) OR auth.uid() = user_id);

-- Tạo user admin mặc định (cần thêm thủ công sau khi có user đăng ký)
-- INSERT INTO public.user_roles (user_id, role) VALUES ('USER_ID_HERE', 'admin');

-- Thêm một số cài đặt hệ thống mặc định
INSERT INTO public.system_settings (key, value, description) VALUES
  ('site_name', '"Batdongsan App"', 'Tên trang web'),
  ('maintenance_mode', 'false', 'Chế độ bảo trì'),
  ('max_consultation_per_day', '100', 'Số lượng tư vấn tối đa mỗi ngày'),
  ('contact_email', '"admin@batdongsan.com"', 'Email liên hệ'),
  ('contact_phone', '"0123456789"', 'Số điện thoại liên hệ');
