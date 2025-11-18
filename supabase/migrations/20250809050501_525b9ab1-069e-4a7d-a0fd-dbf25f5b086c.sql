-- Create content management tables
CREATE TABLE public.content_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('page', 'banner', 'announcement', 'seo')),
  title TEXT NOT NULL,
  content TEXT,
  slug TEXT UNIQUE,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('active', 'draft', 'archived')),
  meta_title TEXT,
  meta_description TEXT,
  keywords TEXT[],
  featured_image TEXT,
  priority INTEGER DEFAULT 0,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create media files table
CREATE TABLE public.media_files (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  filename TEXT NOT NULL,
  original_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  mime_type TEXT NOT NULL,
  alt_text TEXT,
  description TEXT,
  tags TEXT[],
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create site settings table for global configuration
CREATE TABLE public.site_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  section TEXT NOT NULL,
  key TEXT NOT NULL,
  value JSONB NOT NULL,
  description TEXT,
  is_public BOOLEAN NOT NULL DEFAULT false,
  updated_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(section, key)
);

-- Create menu management table
CREATE TABLE public.menus (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  items JSONB NOT NULL DEFAULT '[]',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.content_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menus ENABLE ROW LEVEL SECURITY;

-- RLS Policies for content_items
CREATE POLICY "Anyone can view active content" ON public.content_items
  FOR SELECT USING (status = 'active' OR is_admin(auth.uid()));

CREATE POLICY "Admins can manage all content" ON public.content_items
  FOR ALL USING (is_admin(auth.uid()));

-- RLS Policies for media_files
CREATE POLICY "Anyone can view media files" ON public.media_files
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage media files" ON public.media_files
  FOR ALL USING (is_admin(auth.uid()));

-- RLS Policies for site_settings
CREATE POLICY "Anyone can view public settings" ON public.site_settings
  FOR SELECT USING (is_public = true OR is_admin(auth.uid()));

CREATE POLICY "Admins can manage site settings" ON public.site_settings
  FOR ALL USING (is_admin(auth.uid()));

-- RLS Policies for menus
CREATE POLICY "Anyone can view active menus" ON public.menus
  FOR SELECT USING (is_active = true OR is_admin(auth.uid()));

CREATE POLICY "Admins can manage menus" ON public.menus
  FOR ALL USING (is_admin(auth.uid()));

-- Create triggers for updated_at
CREATE TRIGGER update_content_items_updated_at
  BEFORE UPDATE ON public.content_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_media_files_updated_at
  BEFORE UPDATE ON public.media_files
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_site_settings_updated_at
  BEFORE UPDATE ON public.site_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_menus_updated_at
  BEFORE UPDATE ON public.menus
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some default content and settings
INSERT INTO public.content_items (type, title, content, slug, status, created_by, updated_by) VALUES
  ('page', 'Trang chủ - Hero Section', 'Chào mừng đến với PropertyHub - Nền tảng đầu tư BĐS hàng đầu', 'home-hero', 'active', NULL, NULL),
  ('banner', 'Banner khuyến mãi', 'Ưu đãi đặc biệt cho khách hàng mới - Giảm 50% phí tư vấn', 'promo-banner', 'active', NULL, NULL),
  ('announcement', 'Thông báo bảo trì', 'Hệ thống sẽ được bảo trì định kỳ', 'maintenance-notice', 'draft', NULL, NULL);

INSERT INTO public.site_settings (section, key, value, description, is_public) VALUES
  ('general', 'site_name', '"PropertyHub"', 'Tên website', true),
  ('general', 'site_description', '"Nền tảng đầu tư BĐS hàng đầu"', 'Mô tả website', true),
  ('seo', 'default_meta_title', '"PropertyHub - Đầu tư BĐS thông minh"', 'Meta title mặc định', true),
  ('seo', 'default_meta_description', '"Khám phá cơ hội đầu tư bất động sản tốt nhất với PropertyHub"', 'Meta description mặc định', true),
  ('contact', 'support_email', '"support@propertyhub.vn"', 'Email hỗ trợ', true),
  ('contact', 'hotline', '"1900-1234"', 'Số hotline', true),
  ('analytics', 'google_analytics_id', '""', 'Google Analytics ID', false),
  ('ads', 'adsense_client_id', '""', 'Google AdSense Client ID', false);

INSERT INTO public.menus (name, location, items, is_active) VALUES
  ('Header Menu', 'header', '[
    {"label": "Trang chủ", "url": "/", "icon": "home"},
    {"label": "Dự án", "url": "/projects", "icon": "building"},
    {"label": "Thị trường", "url": "/market-overview", "icon": "trending-up"},
    {"label": "Nhà phát triển", "url": "/developers", "icon": "users"},
    {"label": "Tính toán", "url": "/calculator", "icon": "calculator"}
  ]', true),
  ('Footer Menu', 'footer', '[
    {"label": "Về chúng tôi", "url": "/about"},
    {"label": "Liên hệ", "url": "/contact"},
    {"label": "Điều khoản", "url": "/terms"},
    {"label": "Chính sách", "url": "/privacy"}
  ]', true);