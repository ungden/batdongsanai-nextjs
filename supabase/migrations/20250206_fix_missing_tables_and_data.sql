-- 1. TẠO BẢNG PROPERTY LISTINGS (CHỢ BĐS)
CREATE TABLE IF NOT EXISTS public.property_listings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    project_id TEXT,
    listing_type TEXT NOT NULL CHECK (listing_type IN ('sale', 'rent')),
    property_type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    address TEXT NOT NULL,
    district TEXT NOT NULL,
    city TEXT NOT NULL,
    bedrooms INTEGER,
    bathrooms INTEGER,
    area_sqm NUMERIC NOT NULL,
    floor_number INTEGER,
    price_total NUMERIC,
    price_per_sqm NUMERIC,
    rental_price_monthly NUMERIC,
    furniture_status TEXT,
    direction TEXT,
    legal_status TEXT,
    view_description TEXT,
    available_from DATE,
    is_featured BOOLEAN DEFAULT false,
    is_verified BOOLEAN DEFAULT false,
    contact_name TEXT NOT NULL,
    contact_phone TEXT NOT NULL,
    contact_email TEXT,
    view_count INTEGER DEFAULT 0,
    favorite_count INTEGER DEFAULT 0,
    status TEXT DEFAULT 'pending', -- pending, approved, rejected, sold
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. TẠO BẢNG LISTING IMAGES (ẢNH TIN ĐĂNG)
CREATE TABLE IF NOT EXISTS public.listing_images (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    listing_id UUID REFERENCES public.property_listings(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    caption TEXT,
    is_primary BOOLEAN DEFAULT false,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. TẠO BẢNG PROJECT AGENTS (TƯ VẤN VIÊN)
CREATE TABLE IF NOT EXISTS public.project_agents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id TEXT NOT NULL,
    agent_id UUID NOT NULL, -- Trong thực tế link tới auth.users, ở đây demo nên để UUID độc lập
    role TEXT DEFAULT 'agent',
    priority INTEGER DEFAULT 0,
    leads_received INTEGER DEFAULT 0,
    leads_converted INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. TẠO BẢNG PROFILES (NẾU CHƯA CÓ - ĐỂ CHỨA INFO AGENT)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    full_name TEXT,
    phone TEXT,
    email TEXT,
    occupation TEXT,
    budget_range TEXT,
    avatar_url TEXT,
    subscription_type TEXT DEFAULT 'free',
    subscription_end_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. CẤP QUYỀN (RLS POLICIES)
ALTER TABLE public.property_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listing_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Xóa policy cũ để tránh lỗi trùng
DROP POLICY IF EXISTS "Public view listings" ON public.property_listings;
DROP POLICY IF EXISTS "Public view images" ON public.listing_images;
DROP POLICY IF EXISTS "Public view agents" ON public.project_agents;
DROP POLICY IF EXISTS "Public view profiles" ON public.profiles;

-- Tạo policy mới: Cho phép xem công khai
CREATE POLICY "Public view listings" ON public.property_listings FOR SELECT USING (true);
CREATE POLICY "Public view images" ON public.listing_images FOR SELECT USING (true);
CREATE POLICY "Public view agents" ON public.project_agents FOR SELECT USING (true);
CREATE POLICY "Public view profiles" ON public.profiles FOR SELECT USING (true);

-- Cho phép insert (để form hoạt động demo)
CREATE POLICY "Enable insert for authenticated users only" ON public.property_listings FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable insert images" ON public.listing_images FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 6. SEED DATA (NẠP DỮ LIỆU MẪU)

-- 6.1. Thêm Agents vào bảng Profiles (Dùng UUID giả định)
INSERT INTO public.profiles (id, full_name, phone, email, occupation, avatar_url)
VALUES 
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Nguyễn Văn Hùng', '0909123456', 'hung.nguyen@realty.com', 'Chuyên viên tư vấn', 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&fit=crop'),
    ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'Trần Thị Mai', '0909888777', 'mai.tran@realty.com', 'Trưởng phòng kinh doanh', 'https://images.unsplash.com/photo-1573496359-09a00dd522bf?w=200&fit=crop')
ON CONFLICT (id) DO NOTHING;

-- 6.2. Link Agents vào Project (Vinhomes Grand Park - id '1')
INSERT INTO public.project_agents (project_id, agent_id, role, priority, is_active)
VALUES 
    ('1', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'agent', 1, true),
    ('1', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'lead_agent', 2, true)
ON CONFLICT DO NOTHING;

-- 6.3. Thêm Tin đăng vào Chợ BĐS
INSERT INTO public.property_listings (
    id, listing_type, property_type, title, description, 
    address, district, city, bedrooms, bathrooms, area_sqm, 
    price_total, price_per_sqm, rental_price_monthly, 
    status, is_available, contact_name, contact_phone, is_verified, is_featured, view_count
)
VALUES 
    (
        'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 
        'sale', 
        'Căn hộ chung cư', 
        'Cần bán gấp căn hộ 2PN Vinhomes Grand Park view công viên', 
        'Căn hộ tầng trung, view thoáng mát, đã có nội thất cơ bản. Tiện ích đầy đủ: hồ bơi, gym, công viên 36ha. Giá tốt nhất thị trường cho khách thiện chí.',
        'Nguyễn Xiển, Long Thạnh Mỹ', 
        'Quận 9', 
        'TP. Hồ Chí Minh', 
        2, 2, 59, 
        2850000000, 48300000, null,
        'approved', true, 
        'Nguyễn Văn Hùng', '0909123456', true, true, 150
    ),
    (
        'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 
        'rent', 
        'Căn hộ chung cư', 
        'Cho thuê căn hộ Studio Masteri Centre Point full nội thất', 
        'Căn hộ mới bàn giao, nội thất cao cấp, xách vali vào ở ngay. Miễn phí quản lý 1 năm.',
        'Khu đô thị Grand Park', 
        'Quận 9', 
        'TP. Hồ Chí Minh', 
        1, 1, 35, 
        null, null, 7500000,
        'approved', true, 
        'Trần Thị Mai', '0909888777', true, false, 85
    )
ON CONFLICT (id) DO NOTHING;

-- 6.4. Thêm ảnh cho tin đăng
INSERT INTO public.listing_images (listing_id, image_url, is_primary)
VALUES 
    ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&fit=crop', true),
    ('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&fit=crop', true)
ON CONFLICT DO NOTHING;