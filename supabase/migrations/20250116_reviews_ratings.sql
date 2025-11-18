-- Reviews & Ratings System
CREATE TABLE IF NOT EXISTS public.project_reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  location_rating INTEGER CHECK (location_rating >= 1 AND location_rating <= 5),
  quality_rating INTEGER CHECK (quality_rating >= 1 AND quality_rating <= 5),
  amenities_rating INTEGER CHECK (amenities_rating >= 1 AND amenities_rating <= 5),
  developer_rating INTEGER CHECK (developer_rating >= 1 AND developer_rating <= 5),
  title VARCHAR(200),
  review_text TEXT,
  pros TEXT[],
  cons TEXT[],
  is_verified_buyer BOOLEAN DEFAULT false,
  purchase_date DATE,
  unit_type VARCHAR(100),
  helpful_count INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Review Images
CREATE TABLE IF NOT EXISTS public.review_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  review_id UUID REFERENCES public.project_reviews(id) ON DELETE CASCADE,
  image_url VARCHAR(500) NOT NULL,
  caption TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Review Helpful Votes
CREATE TABLE IF NOT EXISTS public.review_helpful_votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  review_id UUID REFERENCES public.project_reviews(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(review_id, user_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_project_reviews_project_id ON public.project_reviews(project_id);
CREATE INDEX IF NOT EXISTS idx_project_reviews_user_id ON public.project_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_project_reviews_rating ON public.project_reviews(rating);
CREATE INDEX IF NOT EXISTS idx_project_reviews_created_at ON public.project_reviews(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_review_images_review_id ON public.review_images(review_id);
CREATE INDEX IF NOT EXISTS idx_review_helpful_votes_review_id ON public.review_helpful_votes(review_id);

-- RLS Policies
ALTER TABLE public.project_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_helpful_votes ENABLE ROW LEVEL SECURITY;

-- Public can view approved reviews
CREATE POLICY "Public can view approved reviews" ON public.project_reviews
  FOR SELECT USING (status = 'approved');

-- Users can create reviews
CREATE POLICY "Users can create reviews" ON public.project_reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own reviews
CREATE POLICY "Users can update own reviews" ON public.project_reviews
  FOR UPDATE USING (auth.uid() = user_id);

-- Review images policies
CREATE POLICY "Public can view review images" ON public.review_images
  FOR SELECT USING (true);

CREATE POLICY "Users can add review images" ON public.review_images
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.project_reviews
      WHERE id = review_images.review_id AND user_id = auth.uid()
    )
  );

-- Helpful votes policies
CREATE POLICY "Public can view helpful votes" ON public.review_helpful_votes
  FOR SELECT USING (true);

CREATE POLICY "Users can vote helpful" ON public.review_helpful_votes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Function to update helpful count
CREATE OR REPLACE FUNCTION update_review_helpful_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.project_reviews
    SET helpful_count = helpful_count + 1
    WHERE id = NEW.review_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.project_reviews
    SET helpful_count = helpful_count - 1
    WHERE id = OLD.review_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger for helpful count
DROP TRIGGER IF EXISTS update_review_helpful_count_trigger ON public.review_helpful_votes;
CREATE TRIGGER update_review_helpful_count_trigger
AFTER INSERT OR DELETE ON public.review_helpful_votes
FOR EACH ROW EXECUTE FUNCTION update_review_helpful_count();

-- Sample reviews data
INSERT INTO public.project_reviews (project_id, rating, location_rating, quality_rating, amenities_rating, developer_rating, title, review_text, pros, cons, is_verified_buyer, purchase_date, unit_type, status) VALUES
('vinhomes-central-park', 5, 5, 5, 5, 5, 'Tuyệt vời! Đáng đồng tiền', 'Sống ở đây được 2 năm rồi, rất hài lòng. View đẹp, tiện ích đầy đủ, an ninh tốt.', ARRAY['View sông tuyệt đẹp', 'Tiện ích đẳng cấp', 'An ninh 24/7', 'Gần trung tâm'], ARRAY['Giá hơi cao', 'Phí quản lý không rẻ'], true, '2022-03-15', '2PN', 'approved'),
('vinhomes-central-park', 4, 5, 4, 5, 4, 'Tốt nhưng giá hơi cao', 'Dự án tốt, vị trí đẹp nhưng giá và phí quản lý khá cao.', ARRAY['Vị trí trung tâm', 'Đầy đủ tiện ích', 'Chất lượng xây dựng tốt'], ARRAY['Giá cao', 'Phí quản lý cao', 'Bãi đậu xe chật'], true, '2023-01-20', '3PN', 'approved'),
('masteri-thao-dien', 5, 5, 5, 5, 5, 'Lựa chọn hoàn hảo cho gia đình', 'Khu vực yên tĩnh, gần trường quốc tế. Rất phù hợp cho gia đình có con nhỏ.', ARRAY['Yên tĩnh', 'Gần trường học', 'Cộng đồng văn minh', 'Không khí trong lành'], ARRAY['Xa trung tâm hơn', 'Ít quán ăn xung quanh'], true, '2022-08-10', '2PN', 'approved'),
('empire-city', 4, 4, 5, 4, 5, 'Chất lượng xây dựng tốt', 'Hoàn thiện đẹp, chất lượng vật liệu tốt. View sông và thành phố đều có.', ARRAY['Chất lượng cao', 'View đẹp', 'Thiết kế hiện đại'], ARRAY['Chưa đủ tiện ích', 'Giao thông đang phát triển'], true, '2023-06-15', '1PN', 'approved');

