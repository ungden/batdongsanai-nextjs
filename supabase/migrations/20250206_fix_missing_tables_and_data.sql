-- XÓA CÁC BẢNG CŨ ĐỂ TẠO LẠI SẠCH SẼ (Chỉ xóa bảng liên quan tính năng mới)
DROP TABLE IF EXISTS public.listing_images CASCADE;
DROP TABLE IF EXISTS public.property_listings CASCADE;
DROP TABLE IF EXISTS public.project_agents CASCADE;

-- 1. TẠO BẢNG PROFILES (Đảm bảo bảng này tồn tại để link Foreign Key)
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

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public profiles view" ON public.profiles;
CREATE POLICY "Public profiles view" ON public.profiles FOR SELECT USING (true);

-- 2. TẠO BẢNG PROPERTY LISTINGS (CHỢ BĐS)
CREATE TABLE public.property_listings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id), -- Người đăng
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
    status TEXT DEFAULT 'approved', -- Mặc định approved để hiện ngay
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. TẠO BẢNG LISTING IMAGES
CREATE TABLE public.listing_images (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    listing_id UUID REFERENCES public.property_listings(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    caption TEXT,
    is_primary BOOLEAN DEFAULT false,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. TẠO BẢNG PROJECT AGENTS (TƯ VẤN VIÊN) - QUAN TRỌNG: CÓ FOREIGN KEY
CREATE TABLE public.project_agents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id TEXT NOT NULL,
    agent_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE, -- Link tới Profiles
    role TEXT DEFAULT 'agent',
    priority INTEGER DEFAULT 0,
    leads_received INTEGER DEFAULT 0,
    leads_converted INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. CẤP QUYỀN RLS
ALTER TABLE public.property_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listing_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_agents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public view listings" ON public.property_listings FOR SELECT USING (true);
CREATE POLICY "Public view images" ON public.listing_images FOR SELECT USING (true);
CREATE POLICY "Public view agents" ON public.project_agents FOR SELECT USING (true);

-- Cho phép insert (để test form)
CREATE POLICY "Auth insert listings" ON public.property_listings FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Auth insert images" ON public.listing_images FOR INSERT WITH CHECK (auth.role() = 'authenticated');


-- 6. NẠP DỮ LIỆU MẪU (SEED DATA)

-- 6.1. Tạo Profile cho Agents
INSERT INTO public.profiles (id, full_name, phone, email, occupation, avatar_url)
VALUES 
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Nguyễn Văn Hùng', '0909123456', 'hung.nguyen@realty.com', 'Chuyên viên tư vấn', 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&fit=crop'),
    ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'Trần Thị Mai', '0909888777', 'mai.tran@realty.com', 'Trưởng phòng kinh doanh', 'https://images.unsplash.com/photo-1573496359-09a00dd522bf?w=200&fit=crop')
ON CONFLICT (id) DO NOTHING;

-- 6.2. Gán Agents vào Dự án (ID '1' là Vinhomes Grand Park)
INSERT INTO public.project_agents (project_id, agent_id, role, priority, is_active)
VALUES 
    ('1', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'agent', 1, true),
    ('1', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'lead_agent', 2, true)
ON CONFLICT DO NOTHING;

-- 6.3. Tạo Tin đăng BĐS
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
        'Căn hộ tầng trung, view thoáng mát, đã có nội thất cơ bản. Tiện ích đầy đủ: hồ bơi, gym, công viên 36ha.',
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
    );

-- 6.4. Ảnh tin đăng
INSERT INTO public.listing_images (listing_id, image_url, is_primary)
VALUES 
    ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&fit=crop', true),
    ('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&fit=crop', true);