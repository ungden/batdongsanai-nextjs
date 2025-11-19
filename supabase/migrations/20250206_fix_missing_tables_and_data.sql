-- 1. FIX MARKETPLACE LISTINGS
-- Đảm bảo bảng tồn tại (phòng trường hợp migration trước bị lỗi)
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

-- Bảng hình ảnh tin đăng
CREATE TABLE IF NOT EXISTS public.listing_images (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    listing_id UUID REFERENCES public.property_listings(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    caption TEXT,
    is_primary BOOLEAN DEFAULT false,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Cấp quyền RLS cho Marketplace
ALTER TABLE public.property_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listing_images ENABLE ROW LEVEL SECURITY;

-- Xóa policy cũ để tránh trùng lặp
DROP POLICY IF EXISTS "Public listings are viewable by everyone" ON public.property_listings;
DROP POLICY IF EXISTS "Listing images are viewable by everyone" ON public.listing_images;

-- Tạo policy mới: Ai cũng xem được tin đã duyệt (approved)
CREATE POLICY "Public listings are viewable by everyone" 
ON public.property_listings FOR SELECT 
USING (status = 'approved' AND is_available = true);

CREATE POLICY "Listing images are viewable by everyone" 
ON public.listing_images FOR SELECT 
USING (true);

-- Tạo policy cho user quản lý tin của mình
CREATE POLICY "Users can insert own listings" ON public.property_listings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own listings" ON public.property_listings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own listings" ON public.property_listings FOR DELETE USING (auth.uid() = user_id);

-- 2. FIX PROJECT AGENTS
-- Tạo bảng project_agents nếu chưa có
CREATE TABLE IF NOT EXISTS public.project_agents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id TEXT NOT NULL,
    agent_id UUID NOT NULL, -- Link tới profiles.id (giả lập)
    role TEXT DEFAULT 'agent',
    priority INTEGER DEFAULT 0,
    leads_received INTEGER DEFAULT 0,
    leads_converted INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Cấp quyền RLS cho Agents
ALTER TABLE public.project_agents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view active project agents" ON public.project_agents;

CREATE POLICY "Public can view active project agents" 
ON public.project_agents FOR SELECT 
USING (is_active = true);

-- 3. SEED DATA (DỮ LIỆU MẪU)

-- Tạo user giả lập (Agents) trong bảng profiles nếu chưa có
-- Lưu ý: Trong thực tế agent_id phải khớp với auth.users.id. Ở đây ta fake ID cho mục đích hiển thị.
INSERT INTO public.profiles (id, user_id, full_name, phone, email, occupation, avatar_url)
VALUES 
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Nguyễn Văn Hùng', '0909123456', 'hung.nguyen@realty.com', 'Chuyên viên tư vấn', 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&fit=crop'),
    ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'Trần Thị Mai', '0909888777', 'mai.tran@realty.com', 'Trưởng phòng kinh doanh', 'https://images.unsplash.com/photo-1573496359-09a00dd522bf?w=200&fit=crop')
ON CONFLICT (id) DO NOTHING;

-- Link Agents vào Projects (ID '1' là Vinhomes Grand Park, '2' là Masterise Homes...)
INSERT INTO public.project_agents (project_id, agent_id, role, priority, is_active)
VALUES 
    ('1', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'agent', 1, true),
    ('1', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'lead_agent', 2, true),
    ('2', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'agent', 1, true)
ON CONFLICT DO NOTHING;

-- Thêm tin đăng mẫu vào Marketplace
INSERT INTO public.property_listings (
    id, user_id, listing_type, property_type, title, description, 
    address, district, city, bedrooms, bathrooms, area_sqm, 
    price_total, price_per_sqm, rental_price_monthly, 
    status, is_available, contact_name, contact_phone, is_verified, is_featured
)
VALUES 
    (
        'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', -- Dùng ID của agent làm owner
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
        'Nguyễn Văn Hùng', '0909123456', true, true
    ),
    (
        'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 
        'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12',
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
        'Trần Thị Mai', '0909888777', true, false
    )
ON CONFLICT (id) DO NOTHING;

-- Thêm ảnh cho tin đăng mẫu
INSERT INTO public.listing_images (listing_id, image_url, is_primary)
VALUES 
    ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&fit=crop', true),
    ('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&fit=crop', true)
ON CONFLICT DO NOTHING;