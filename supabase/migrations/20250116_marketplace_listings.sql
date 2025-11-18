-- Marketplace Listings System

-- User Property Listings (Sell/Rent)
CREATE TABLE IF NOT EXISTS public.property_listings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  project_id TEXT, -- Link to existing project if applicable
  listing_type VARCHAR(20) NOT NULL CHECK (listing_type IN ('sale', 'rent')),
  property_type VARCHAR(50) NOT NULL, -- apartment, house, villa, etc.
  
  -- Property Details
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  address TEXT NOT NULL,
  district VARCHAR(100),
  city VARCHAR(100) DEFAULT 'Ho Chi Minh',
  
  -- Specifications
  bedrooms INTEGER,
  bathrooms INTEGER,
  area_sqm DECIMAL(10,2) NOT NULL,
  floor_number INTEGER,
  total_floors INTEGER,
  
  -- Pricing
  price_total BIGINT, -- For sale
  price_per_sqm BIGINT,
  rental_price_monthly BIGINT, -- For rent
  
  -- Additional Details
  furniture_status VARCHAR(50), -- full, partial, none
  direction VARCHAR(20), -- north, south, east, west, etc.
  balcony_direction VARCHAR(20),
  view_description TEXT,
  
  -- Legal
  legal_status VARCHAR(100), -- red_book, pink_book, sale_contract, etc.
  ownership_type VARCHAR(50), -- full, partial, leasehold
  
  -- Availability
  available_from DATE,
  is_available BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  is_verified BOOLEAN DEFAULT false,
  
  -- Contact
  contact_name VARCHAR(100),
  contact_phone VARCHAR(20),
  contact_email VARCHAR(100),
  allow_public_contact BOOLEAN DEFAULT true,
  
  -- Metrics
  view_count INTEGER DEFAULT 0,
  favorite_count INTEGER DEFAULT 0,
  contact_count INTEGER DEFAULT 0,
  
  -- Status
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'sold', 'rented', 'expired')),
  rejection_reason TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  sold_rented_at TIMESTAMP WITH TIME ZONE
);

-- Listing Images
CREATE TABLE IF NOT EXISTS public.listing_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id UUID REFERENCES public.property_listings(id) ON DELETE CASCADE NOT NULL,
  image_url VARCHAR(500) NOT NULL,
  caption TEXT,
  is_primary BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Listing Favorites (Users save listings)
CREATE TABLE IF NOT EXISTS public.listing_favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  listing_id UUID REFERENCES public.property_listings(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, listing_id)
);

-- Listing Contact Requests
CREATE TABLE IF NOT EXISTS public.listing_contacts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id UUID REFERENCES public.property_listings(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  contact_name VARCHAR(100),
  contact_phone VARCHAR(20),
  contact_email VARCHAR(100),
  message TEXT,
  status VARCHAR(20) DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'viewing_scheduled', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_property_listings_user_id ON public.property_listings(user_id);
CREATE INDEX IF NOT EXISTS idx_property_listings_project_id ON public.property_listings(project_id);
CREATE INDEX IF NOT EXISTS idx_property_listings_type ON public.property_listings(listing_type);
CREATE INDEX IF NOT EXISTS idx_property_listings_status ON public.property_listings(status);
CREATE INDEX IF NOT EXISTS idx_property_listings_city_district ON public.property_listings(city, district);
CREATE INDEX IF NOT EXISTS idx_property_listings_price ON public.property_listings(price_per_sqm);
CREATE INDEX IF NOT EXISTS idx_property_listings_created_at ON public.property_listings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_listing_images_listing_id ON public.listing_images(listing_id);
CREATE INDEX IF NOT EXISTS idx_listing_favorites_user_id ON public.listing_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_listing_favorites_listing_id ON public.listing_favorites(listing_id);

-- RLS Policies
ALTER TABLE public.property_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listing_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listing_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listing_contacts ENABLE ROW LEVEL SECURITY;

-- Public can view approved listings
CREATE POLICY "Public can view approved listings" ON public.property_listings
  FOR SELECT USING (status = 'approved' AND is_available = true);

-- Users can view their own listings
CREATE POLICY "Users can view own listings" ON public.property_listings
  FOR SELECT USING (auth.uid() = user_id);

-- Users can create listings
CREATE POLICY "Users can create listings" ON public.property_listings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own listings
CREATE POLICY "Users can update own listings" ON public.property_listings
  FOR UPDATE USING (auth.uid() = user_id);

-- Listing images policies
CREATE POLICY "Public can view listing images" ON public.listing_images
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.property_listings
      WHERE id = listing_images.listing_id 
      AND (status = 'approved' OR user_id = auth.uid())
    )
  );

CREATE POLICY "Users can add images to own listings" ON public.listing_images
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.property_listings
      WHERE id = listing_images.listing_id AND user_id = auth.uid()
    )
  );

-- Favorites policies
CREATE POLICY "Users can view own favorites" ON public.listing_favorites
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can add favorites" ON public.listing_favorites
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove favorites" ON public.listing_favorites
  FOR DELETE USING (auth.uid() = user_id);

-- Contact requests policies
CREATE POLICY "Users can create contact requests" ON public.listing_contacts
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Listing owners can view contacts" ON public.listing_contacts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.property_listings
      WHERE id = listing_contacts.listing_id AND user_id = auth.uid()
    )
  );

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_property_listings_updated_at ON public.property_listings;
CREATE TRIGGER update_property_listings_updated_at
  BEFORE UPDATE ON public.property_listings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to increment view count
CREATE OR REPLACE FUNCTION increment_listing_view_count(listing_uuid UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.property_listings
  SET view_count = view_count + 1
  WHERE id = listing_uuid;
END;
$$ LANGUAGE plpgsql;

-- Sample listings
INSERT INTO public.property_listings (
  user_id, project_id, listing_type, property_type, title, description, 
  address, district, city, bedrooms, bathrooms, area_sqm, 
  price_total, price_per_sqm, furniture_status, direction, legal_status,
  contact_name, contact_phone, contact_email, status, is_available
) VALUES
-- Sale listings
(
  (SELECT id FROM auth.users LIMIT 1),
  'vinhomes-central-park',
  'sale',
  'apartment',
  'Bán căn hộ 2PN Vinhomes Central Park - View sông tuyệt đẹp',
  'Căn hộ 2 phòng ngủ, 2WC tại Landmark 1, tầng cao, view sông Saigon cực đẹp. Full nội thất cao cấp. Giá tốt nhất thị trường.',
  'Vinhomes Central Park, 208 Nguyễn Hữu Cảnh',
  'Bình Thạnh',
  'Ho Chi Minh',
  2, 2, 75.5,
  9500000000, 125800000,
  'full', 'south', 'red_book',
  'Anh Minh', '0901234567', 'minh@example.com',
  'approved', true
),
(
  (SELECT id FROM auth.users LIMIT 1),
  'masteri-thao-dien',
  'sale',
  'apartment',
  'Bán căn 3PN Masteri Thảo Điền - Giá tốt',
  '3PN, 2WC, diện tích 95m2. Tầng trung, yên tĩnh. Gần trường quốc tế. Sổ hồng chính chủ.',
  'Masteri Thảo Điền, 159 Xa Lộ Hà Nội',
  'Quận 2',
  'Ho Chi Minh',
  3, 2, 95.0,
  11400000000, 120000000,
  'partial', 'east', 'red_book',
  'Chị Lan', '0912345678', 'lan@example.com',
  'approved', true
),
-- Rental listings  
(
  (SELECT id FROM auth.users LIMIT 1),
  'vinhomes-central-park',
  'rent',
  'apartment',
  'Cho thuê 2PN Vinhomes CP - Full nội thất',
  'Căn 2PN đầy đủ nội thất, view hồ bơi. Giá thuê tốt. Liên hệ ngay!',
  'Vinhomes Central Park, Landmark 3',
  'Bình Thạnh',
  'Ho Chi Minh',
  2, 2, 72.0,
  NULL, NULL, 28000000,
  'full', 'north', 'red_book',
  'Mr. Tuấn', '0923456789', 'tuan@example.com',
  'approved', true
);
