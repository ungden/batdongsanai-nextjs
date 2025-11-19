-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Market Catalysts (Yếu tố tác động thị trường)
CREATE TABLE IF NOT EXISTS market_catalysts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    catalyst_type TEXT NOT NULL CHECK (catalyst_type IN ('infrastructure', 'policy', 'economic', 'supply_demand', 'developer_reputation')),
    title TEXT NOT NULL,
    description TEXT,
    impact_level TEXT CHECK (impact_level IN ('very_high', 'high', 'medium', 'low')),
    impact_direction TEXT CHECK (impact_direction IN ('positive', 'negative', 'neutral')),
    affected_areas TEXT[], -- Array of district/city names
    affected_project_ids UUID[], -- Array of project UUIDs
    announcement_date DATE,
    effective_date DATE,
    completion_date DATE,
    estimated_price_impact_percent NUMERIC,
    source_url TEXT,
    verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('verified', 'pending', 'disputed')),
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Infrastructure Developments (Quy hoạch hạ tầng)
CREATE TABLE IF NOT EXISTS infrastructure_developments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    infrastructure_type TEXT NOT NULL, -- metro, bridge, highway, etc.
    name TEXT NOT NULL,
    description TEXT,
    location_district TEXT,
    status TEXT CHECK (status IN ('planned', 'under_construction', 'completed', 'cancelled')),
    start_date DATE,
    expected_completion DATE,
    actual_completion DATE,
    budget_vnd NUMERIC,
    distance_impact_radius_km NUMERIC,
    estimated_property_impact_percent NUMERIC,
    affected_project_ids UUID[],
    source_url TEXT,
    images TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Market Regulations (Chính sách pháp luật)
CREATE TABLE IF NOT EXISTS market_regulations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    regulation_type TEXT NOT NULL, -- law, decree, circular
    title TEXT NOT NULL,
    description TEXT,
    issuing_authority TEXT,
    regulation_number TEXT,
    effective_date DATE,
    expiry_date DATE,
    affected_areas TEXT[],
    impact_on_buyers TEXT,
    impact_on_investors TEXT,
    impact_on_market TEXT,
    document_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Project Pricing History (Lịch sử giá chi tiết)
CREATE TABLE IF NOT EXISTS project_pricing_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    price_date DATE NOT NULL,
    price_type TEXT CHECK (price_type IN ('launch', 'current', 'transaction', 'forecast', 'history')),
    price_per_sqm NUMERIC NOT NULL,
    unit_type TEXT,
    floor_range TEXT,
    source TEXT,
    confidence_score NUMERIC DEFAULT 1.0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Rental Market Data (Dữ liệu cho thuê)
CREATE TABLE IF NOT EXISTS rental_market_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    data_date DATE NOT NULL,
    unit_type TEXT NOT NULL,
    rental_price_min NUMERIC,
    rental_price_max NUMERIC,
    rental_price_avg NUMERIC,
    occupancy_rate NUMERIC, -- %
    average_lease_term_months NUMERIC,
    tenant_profile TEXT,
    seasonal_demand TEXT,
    yield_percentage NUMERIC,
    source TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Payment Policies (Chính sách thanh toán)
CREATE TABLE IF NOT EXISTS payment_policies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    policy_name TEXT NOT NULL,
    policy_type TEXT CHECK (policy_type IN ('installment', 'bank_loan', 'developer_financing', 'promotion')),
    description TEXT,
    down_payment_percent NUMERIC,
    installment_periods INTEGER, -- months
    interest_rate NUMERIC,
    bank_partner TEXT,
    promotion_details JSONB,
    eligible_unit_types TEXT[],
    start_date DATE,
    end_date DATE,
    terms_conditions TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Comparable Sales (Giao dịch so sánh)
CREATE TABLE IF NOT EXISTS comparable_sales (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    transaction_date DATE NOT NULL,
    unit_type TEXT,
    floor_number INTEGER,
    area_sqm NUMERIC,
    total_price NUMERIC,
    price_per_sqm NUMERIC,
    direction TEXT,
    view_type TEXT,
    condition TEXT, -- raw, basic, full
    furniture_status TEXT,
    transaction_type TEXT, -- primary, secondary
    buyer_type TEXT,
    financing_method TEXT,
    verification_status TEXT DEFAULT 'unverified',
    source TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE market_catalysts ENABLE ROW LEVEL SECURITY;
ALTER TABLE infrastructure_developments ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_regulations ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_pricing_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE rental_market_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE comparable_sales ENABLE ROW LEVEL SECURITY;

-- Create simple read policies (public read)
CREATE POLICY "Public read catalysts" ON market_catalysts FOR SELECT USING (true);
CREATE POLICY "Public read infra" ON infrastructure_developments FOR SELECT USING (true);
CREATE POLICY "Public read regulations" ON market_regulations FOR SELECT USING (true);
CREATE POLICY "Public read pricing" ON project_pricing_history FOR SELECT USING (true);
CREATE POLICY "Public read rental" ON rental_market_data FOR SELECT USING (true);
CREATE POLICY "Public read policies" ON payment_policies FOR SELECT USING (true);
CREATE POLICY "Public read sales" ON comparable_sales FOR SELECT USING (true);

-- Create admin write policies
-- Note: Assuming has_role function exists from previous setup. If not, these will fail, 
-- but typical setup allows authenticated insert/update for now or admin specific.
-- Using a simpler authenticated write for demo purposes:
CREATE POLICY "Auth write catalysts" ON market_catalysts FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Auth write infra" ON infrastructure_developments FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Auth write regulations" ON market_regulations FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Auth write pricing" ON project_pricing_history FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Auth write rental" ON rental_market_data FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Auth write policies" ON payment_policies FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Auth write sales" ON comparable_sales FOR ALL USING (auth.role() = 'authenticated');