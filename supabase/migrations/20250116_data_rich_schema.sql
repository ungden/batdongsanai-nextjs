-- ============================================
-- DATA-RICH SCHEMA FOR REAL ESTATE AI HUB
-- Focus: Pricing, Catalysts, Rental, Policies
-- ============================================

-- 1. PRICING ANALYTICS - Historical & Forecast
CREATE TABLE IF NOT EXISTS public.project_pricing_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id VARCHAR(255) NOT NULL,
  price_date DATE NOT NULL,
  price_type VARCHAR(50) NOT NULL, -- 'launch', 'current', 'transaction', 'forecast'
  price_per_sqm DECIMAL NOT NULL,
  unit_type VARCHAR(100), -- 'studio', '1br', '2br', '3br', 'penthouse', etc
  floor_range VARCHAR(50), -- 'low (1-10)', 'mid (11-20)', 'high (21+)'
  source VARCHAR(100), -- 'developer', 'transaction', 'listing', 'ai_forecast'
  confidence_score DECIMAL(3,2), -- 0.00 to 1.00 for AI forecasts
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. MARKET CATALYSTS - Yếu tố thúc đẩy giá
CREATE TABLE IF NOT EXISTS public.market_catalysts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  catalyst_type VARCHAR(50) NOT NULL, -- 'infrastructure', 'policy', 'economic', 'supply_demand', 'developer_reputation'
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  impact_level VARCHAR(20) NOT NULL, -- 'very_high', 'high', 'medium', 'low'
  impact_direction VARCHAR(20) NOT NULL, -- 'positive', 'negative', 'neutral'
  affected_areas TEXT[], -- Array of districts/areas affected
  affected_project_ids TEXT[], -- Array of project IDs
  announcement_date DATE,
  effective_date DATE,
  completion_date DATE,
  estimated_price_impact_percent DECIMAL(5,2), -- -100.00 to +100.00
  source_url VARCHAR(500),
  verification_status VARCHAR(20) DEFAULT 'pending', -- 'verified', 'pending', 'disputed'
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. RENTAL MARKET DATA
CREATE TABLE IF NOT EXISTS public.rental_market_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id VARCHAR(255) NOT NULL,
  data_date DATE NOT NULL,
  unit_type VARCHAR(100) NOT NULL,
  rental_price_min DECIMAL,
  rental_price_max DECIMAL,
  rental_price_avg DECIMAL,
  occupancy_rate DECIMAL(5,2), -- 0.00 to 100.00
  average_lease_term_months INTEGER,
  tenant_profile VARCHAR(100), -- 'expat', 'local_professional', 'family', 'student'
  seasonal_demand VARCHAR(50), -- 'high', 'medium', 'low'
  yield_percentage DECIMAL(5,2), -- rental yield %
  source VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. PAYMENT POLICIES & SCHEMES
CREATE TABLE IF NOT EXISTS public.payment_policies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id VARCHAR(255) NOT NULL,
  policy_name VARCHAR(255) NOT NULL,
  policy_type VARCHAR(50) NOT NULL, -- 'installment', 'bank_loan', 'developer_financing', 'promotion'
  description TEXT,
  down_payment_percent DECIMAL(5,2),
  installment_periods INTEGER, -- months
  interest_rate DECIMAL(5,2),
  bank_partner VARCHAR(100),
  promotion_details JSONB, -- flexible structure for various promotions
  eligible_unit_types TEXT[],
  start_date DATE,
  end_date DATE,
  terms_conditions TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. INFRASTRUCTURE DEVELOPMENTS
CREATE TABLE IF NOT EXISTS public.infrastructure_developments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  infrastructure_type VARCHAR(50) NOT NULL, -- 'metro', 'highway', 'bridge', 'school', 'hospital', 'mall', 'park'
  name VARCHAR(255) NOT NULL,
  description TEXT,
  location_district VARCHAR(100),
  location_coordinates POINT, -- PostGIS point for mapping
  status VARCHAR(50) NOT NULL, -- 'planned', 'under_construction', 'completed', 'cancelled'
  start_date DATE,
  expected_completion DATE,
  actual_completion DATE,
  budget_vnd DECIMAL,
  distance_impact_radius_km DECIMAL, -- How far the impact reaches
  estimated_property_impact_percent DECIMAL(5,2),
  affected_project_ids TEXT[],
  source_url VARCHAR(500),
  images TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. COMPARABLE SALES (Giao dịch thực tế)
CREATE TABLE IF NOT EXISTS public.comparable_sales (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id VARCHAR(255) NOT NULL,
  transaction_date DATE NOT NULL,
  unit_type VARCHAR(100),
  floor_number INTEGER,
  area_sqm DECIMAL,
  total_price DECIMAL NOT NULL,
  price_per_sqm DECIMAL NOT NULL,
  direction VARCHAR(20), -- 'north', 'south', 'east', 'west', 'northeast', etc
  view_type VARCHAR(100), -- 'city', 'river', 'park', 'street'
  condition VARCHAR(50), -- 'raw', 'basic', 'premium', 'luxury'
  furniture_status VARCHAR(50), -- 'unfurnished', 'basic', 'fully_furnished'
  transaction_type VARCHAR(50), -- 'primary_sale', 'resale', 'auction'
  buyer_type VARCHAR(50), -- 'individual', 'investor', 'corporate'
  financing_method VARCHAR(50), -- 'cash', 'bank_loan', 'developer_financing'
  verification_status VARCHAR(20) DEFAULT 'pending',
  source VARCHAR(100),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. MARKET REGULATIONS & POLICIES (Chính sách thị trường)
CREATE TABLE IF NOT EXISTS public.market_regulations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  regulation_type VARCHAR(50) NOT NULL, -- 'tax', 'lending', 'foreign_ownership', 'zoning', 'environmental'
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  issuing_authority VARCHAR(100), -- 'government', 'sbv', 'ministry', 'city'
  regulation_number VARCHAR(100),
  effective_date DATE NOT NULL,
  expiry_date DATE,
  affected_areas TEXT[], -- provinces/cities
  impact_on_buyers TEXT,
  impact_on_investors TEXT,
  impact_on_market TEXT,
  document_url VARCHAR(500),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. PROJECT AMENITIES DETAILED (Chi tiết tiện ích)
CREATE TABLE IF NOT EXISTS public.project_amenities_detailed (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id VARCHAR(255) NOT NULL,
  amenity_category VARCHAR(50) NOT NULL, -- 'sports', 'wellness', 'entertainment', 'services', 'green_space', 'security'
  amenity_name VARCHAR(255) NOT NULL,
  amenity_description TEXT,
  quantity INTEGER,
  area_sqm DECIMAL,
  floor_location VARCHAR(50),
  operating_hours VARCHAR(100),
  usage_fee DECIMAL,
  images TEXT[],
  rating DECIMAL(2,1), -- 0.0 to 5.0
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. MARKET SENTIMENT ANALYSIS (AI Generated)
CREATE TABLE IF NOT EXISTS public.market_sentiment (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id VARCHAR(255),
  area VARCHAR(100), -- can be project-specific or area-wide
  sentiment_date DATE NOT NULL,
  overall_sentiment VARCHAR(20) NOT NULL, -- 'very_positive', 'positive', 'neutral', 'negative', 'very_negative'
  sentiment_score DECIMAL(3,2), -- -1.00 to +1.00
  buyer_interest_level VARCHAR(20),
  investor_interest_level VARCHAR(20),
  data_sources TEXT[], -- 'news', 'social_media', 'forum', 'listings', 'transactions'
  key_topics TEXT[],
  confidence_score DECIMAL(3,2),
  ai_analysis_summary TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. PRICE FORECASTS (AI Predictions)
CREATE TABLE IF NOT EXISTS public.price_forecasts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id VARCHAR(255) NOT NULL,
  forecast_date DATE NOT NULL,
  target_date DATE NOT NULL, -- date being forecasted
  forecasted_price_per_sqm DECIMAL NOT NULL,
  confidence_interval_low DECIMAL,
  confidence_interval_high DECIMAL,
  confidence_level DECIMAL(3,2), -- 0.00 to 1.00
  model_used VARCHAR(100), -- 'linear_regression', 'arima', 'lstm', 'ensemble'
  influencing_factors JSONB, -- factors that influenced this forecast
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX idx_pricing_history_project ON public.project_pricing_history(project_id, price_date DESC);
CREATE INDEX idx_pricing_history_type ON public.project_pricing_history(price_type);

CREATE INDEX idx_catalysts_type ON public.market_catalysts(catalyst_type);
CREATE INDEX idx_catalysts_impact ON public.market_catalysts(impact_level, impact_direction);
CREATE INDEX idx_catalysts_dates ON public.market_catalysts(effective_date);

CREATE INDEX idx_rental_project ON public.rental_market_data(project_id, data_date DESC);
CREATE INDEX idx_rental_yield ON public.rental_market_data(yield_percentage DESC);

CREATE INDEX idx_payment_project ON public.payment_policies(project_id);
CREATE INDEX idx_payment_active ON public.payment_policies(is_active, end_date);

CREATE INDEX idx_infrastructure_type ON public.infrastructure_developments(infrastructure_type);
CREATE INDEX idx_infrastructure_status ON public.infrastructure_developments(status);
CREATE INDEX idx_infrastructure_location ON public.infrastructure_developments(location_district);

CREATE INDEX idx_comparable_project ON public.comparable_sales(project_id, transaction_date DESC);
CREATE INDEX idx_comparable_price ON public.comparable_sales(price_per_sqm);

CREATE INDEX idx_regulations_type ON public.market_regulations(regulation_type);
CREATE INDEX idx_regulations_dates ON public.market_regulations(effective_date);

CREATE INDEX idx_amenities_project ON public.project_amenities_detailed(project_id);
CREATE INDEX idx_amenities_category ON public.project_amenities_detailed(amenity_category);

CREATE INDEX idx_sentiment_project ON public.market_sentiment(project_id, sentiment_date DESC);
CREATE INDEX idx_sentiment_area ON public.market_sentiment(area, sentiment_date DESC);

CREATE INDEX idx_forecasts_project ON public.price_forecasts(project_id, target_date);

-- ============================================
-- RLS POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.project_pricing_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_catalysts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rental_market_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.infrastructure_developments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comparable_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_regulations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_amenities_detailed ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_sentiment ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.price_forecasts ENABLE ROW LEVEL SECURITY;

-- Public read access for most data
CREATE POLICY "Public read access to pricing history"
  ON public.project_pricing_history FOR SELECT
  USING (true);

CREATE POLICY "Public read access to catalysts"
  ON public.market_catalysts FOR SELECT
  USING (true);

CREATE POLICY "Public read access to rental data"
  ON public.rental_market_data FOR SELECT
  USING (true);

CREATE POLICY "Public read access to payment policies"
  ON public.payment_policies FOR SELECT
  USING (true);

CREATE POLICY "Public read access to infrastructure"
  ON public.infrastructure_developments FOR SELECT
  USING (true);

CREATE POLICY "Public read access to comparable sales"
  ON public.comparable_sales FOR SELECT
  USING (true);

CREATE POLICY "Public read access to regulations"
  ON public.market_regulations FOR SELECT
  USING (true);

CREATE POLICY "Public read access to amenities"
  ON public.project_amenities_detailed FOR SELECT
  USING (true);

CREATE POLICY "Public read access to sentiment"
  ON public.market_sentiment FOR SELECT
  USING (true);

CREATE POLICY "Public read access to forecasts"
  ON public.price_forecasts FOR SELECT
  USING (true);

-- Admin write access
CREATE POLICY "Admins can manage pricing history"
  ON public.project_pricing_history FOR ALL
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can manage catalysts"
  ON public.market_catalysts FOR ALL
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can manage rental data"
  ON public.rental_market_data FOR ALL
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can manage payment policies"
  ON public.payment_policies FOR ALL
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can manage infrastructure"
  ON public.infrastructure_developments FOR ALL
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can manage comparable sales"
  ON public.comparable_sales FOR ALL
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can manage regulations"
  ON public.market_regulations FOR ALL
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can manage amenities"
  ON public.project_amenities_detailed FOR ALL
  USING (is_admin(auth.uid()));

-- Auto-update triggers
CREATE TRIGGER catalysts_updated_at
  BEFORE UPDATE ON public.market_catalysts
  FOR EACH ROW
  EXECUTE FUNCTION update_notifications_updated_at();

CREATE TRIGGER payment_policies_updated_at
  BEFORE UPDATE ON public.payment_policies
  FOR EACH ROW
  EXECUTE FUNCTION update_notifications_updated_at();

CREATE TRIGGER infrastructure_updated_at
  BEFORE UPDATE ON public.infrastructure_developments
  FOR EACH ROW
  EXECUTE FUNCTION update_notifications_updated_at();

CREATE TRIGGER regulations_updated_at
  BEFORE UPDATE ON public.market_regulations
  FOR EACH ROW
  EXECUTE FUNCTION update_notifications_updated_at();
