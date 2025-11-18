-- ============================================
-- SAMPLE DATA FOR DEMO
-- Realistic Vietnamese Real Estate Data
-- ============================================

-- 1. PRICING HISTORY SAMPLES
INSERT INTO public.project_pricing_history (project_id, price_date, price_type, price_per_sqm, unit_type, source, confidence_score) VALUES
-- Vinhomes Central Park
('vinhomes-central-park', '2022-01-01', 'launch', 85000000, '2BR', 'developer', 1.00),
('vinhomes-central-park', '2023-01-01', 'current', 95000000, '2BR', 'developer', 1.00),
('vinhomes-central-park', '2023-06-01', 'transaction', 92000000, '2BR', 'transaction', 1.00),
('vinhomes-central-park', '2024-01-01', 'current', 98000000, '2BR', 'developer', 1.00),
('vinhomes-central-park', '2024-06-01', 'forecast', 105000000, '2BR', 'ai_forecast', 0.85),

-- Masteri Thao Dien
('masteri-thao-dien', '2021-01-01', 'launch', 65000000, '1BR', 'developer', 1.00),
('masteri-thao-dien', '2022-01-01', 'current', 72000000, '1BR', 'developer', 1.00),
('masteri-thao-dien', '2023-01-01', 'transaction', 75000000, '1BR', 'transaction', 1.00),
('masteri-thao-dien', '2024-01-01', 'current', 78000000, '1BR', 'developer', 1.00),

-- The Metropole Thu Thiem
('the-metropole-thu-thiem', '2022-06-01', 'launch', 120000000, '3BR', 'developer', 1.00),
('the-metropole-thu-thiem', '2023-06-01', 'current', 135000000, '3BR', 'developer', 1.00),
('the-metropole-thu-thiem', '2024-01-01', 'transaction', 138000000, '3BR', 'transaction', 1.00),
('the-metropole-thu-thiem', '2024-06-01', 'forecast', 145000000, '3BR', 'ai_forecast', 0.80);

-- 2. MARKET CATALYSTS
INSERT INTO public.market_catalysts (catalyst_type, title, description, impact_level, impact_direction, affected_areas, announcement_date, effective_date, estimated_price_impact_percent, verification_status) VALUES

('infrastructure', 'Metro Line 1 - Ben Thanh to Suoi Tien', 'First metro line in HCMC connecting District 1 to District 9, significantly reducing commute time and increasing property values along the route.', 'very_high', 'positive', ARRAY['District 1', 'District 2', 'District 9', 'Thu Duc'], '2020-01-15', '2024-12-01', 15.5, 'verified'),

('infrastructure', 'Thu Thiem Bridge 2', 'New bridge connecting District 1 to Thu Thiem New Urban Area, improving accessibility to premium developments.', 'high', 'positive', ARRAY['District 1', 'District 2', 'Thu Duc'], '2021-03-10', '2022-11-20', 12.0, 'verified'),

('policy', 'Interest Rate Reduction for Real Estate Loans', 'State Bank of Vietnam reduced interest rates for real estate loans from 9.5% to 7.5% to stimulate market recovery.', 'very_high', 'positive', ARRAY['All'], '2023-06-01', '2023-07-01', 8.0, 'verified'),

('infrastructure', 'District 2 School Zone Expansion', 'Construction of 5 new international schools in District 2, attracting expat families and increasing rental demand.', 'high', 'positive', ARRAY['District 2', 'Thu Duc'], '2022-09-01', '2024-03-01', 6.5, 'verified'),

('economic', 'Foreign Investment Surge in Tech Sector', 'Major tech companies opening offices in HCMC, driving demand for premium housing near District 2 and Thu Duc.', 'high', 'positive', ARRAY['District 2', 'District 7', 'Thu Duc'], '2023-01-01', '2023-06-01', 10.0, 'verified'),

('policy', 'Property Tax Law Amendment', 'New property tax structure affecting properties valued over 1 billion VND, potentially cooling speculative buying.', 'medium', 'negative', ARRAY['All'], '2023-11-01', '2024-06-01', -3.5, 'pending'),

('supply_demand', 'New Supply Surge in Thu Duc', 'Over 15,000 new units expected to be handed over in Thu Duc in 2024, potentially creating oversupply.', 'medium', 'negative', ARRAY['Thu Duc', 'District 9'], '2024-01-01', '2024-01-01', -5.0, 'verified'),

('infrastructure', 'Vincom Mega Mall Thu Thiem', '200,000 sqm mega shopping mall opening in Thu Thiem, enhancing lifestyle amenities and property values.', 'high', 'positive', ARRAY['District 2', 'Thu Duc'], '2023-05-01', '2025-06-01', 8.5, 'verified');

-- 3. RENTAL MARKET DATA
INSERT INTO public.rental_market_data (project_id, data_date, unit_type, rental_price_min, rental_price_max, rental_price_avg, occupancy_rate, average_lease_term_months, tenant_profile, seasonal_demand, yield_percentage) VALUES

-- Vinhomes Central Park
('vinhomes-central-park', '2024-01-01', '1BR', 15000000, 18000000, 16500000, 95.5, 12, 'expat', 'high', 5.2),
('vinhomes-central-park', '2024-01-01', '2BR', 25000000, 32000000, 28000000, 92.0, 12, 'expat', 'high', 5.0),
('vinhomes-central-park', '2024-01-01', '3BR', 40000000, 50000000, 45000000, 88.0, 12, 'family', 'medium', 4.8),

-- Masteri Thao Dien
('masteri-thao-dien', '2024-01-01', 'Studio', 10000000, 12000000, 11000000, 90.0, 12, 'local_professional', 'high', 5.5),
('masteri-thao-dien', '2024-01-01', '1BR', 14000000, 17000000, 15500000, 93.0, 12, 'local_professional', 'high', 5.3),
('masteri-thao-dien', '2024-01-01', '2BR', 20000000, 25000000, 22500000, 89.0, 12, 'family', 'medium', 5.0),

-- The Metropole Thu Thiem
('the-metropole-thu-thiem', '2024-01-01', '2BR', 35000000, 42000000, 38000000, 85.0, 12, 'expat', 'high', 4.5),
('the-metropole-thu-thiem', '2024-01-01', '3BR', 55000000, 70000000, 62000000, 82.0, 12, 'expat', 'medium', 4.3),
('the-metropole-thu-thiem', '2024-01-01', 'Penthouse', 100000000, 150000000, 125000000, 75.0, 12, 'corporate', 'low', 4.0);

-- 4. PAYMENT POLICIES
INSERT INTO public.payment_policies (project_id, policy_name, policy_type, description, down_payment_percent, installment_periods, interest_rate, bank_partner, start_date, end_date, is_active, eligible_unit_types) VALUES

('vinhomes-central-park', 'Standard Bank Loan 70%', 'bank_loan', 'Vay ngân hàng lên đến 70% giá trị căn hộ với lãi suất ưu đãi', 30, 240, 7.5, 'Vietcombank', '2024-01-01', '2024-12-31', true, ARRAY['1BR', '2BR', '3BR']),

('vinhomes-central-park', 'Developer Financing 0% Interest', 'developer_financing', 'Trả góp 0% lãi suất trong 24 tháng, chỉ cần đặt cọc 20%', 20, 24, 0.0, NULL, '2024-01-01', '2024-06-30', true, ARRAY['1BR', '2BR']),

('masteri-thao-dien', 'Flash Sale 5% Discount', 'promotion', 'Giảm ngay 5% giá bán cho khách hàng đặt mua trong tháng 6/2024', 30, NULL, NULL, NULL, '2024-06-01', '2024-06-30', true, ARRAY['Studio', '1BR', '2BR']),

('the-metropole-thu-thiem', 'VIP Early Bird 50-50', 'installment', 'Thanh toán 50% khi ký HĐ, 50% khi nhận nhà, không lãi suất', 50, 12, 0.0, NULL, '2024-01-01', '2024-12-31', true, ARRAY['2BR', '3BR', 'Penthouse']),

('masteri-thao-dien', 'Premium Furniture Package', 'promotion', 'Tặng gói nội thất cao cấp trị giá 200 triệu cho căn 2BR trở lên', 30, NULL, NULL, NULL, '2024-01-01', '2024-12-31', true, ARRAY['2BR', '3BR']);

-- 5. INFRASTRUCTURE DEVELOPMENTS
INSERT INTO public.infrastructure_developments (infrastructure_type, name, description, location_district, status, start_date, expected_completion, budget_vnd, distance_impact_radius_km, estimated_property_impact_percent, affected_project_ids) VALUES

('metro', 'Metro Line 1 - Ben Thanh - Suoi Tien', 'First metro line in HCMC, 19.7km with 14 stations connecting city center to eastern districts', 'District 1', 'under_construction', '2012-08-01', '2024-12-31', 43757000000000, 2.0, 15.0, ARRAY['vinhomes-central-park', 'masteri-thao-dien', 'the-metropole-thu-thiem']),

('metro', 'Metro Line 2 - Ben Thanh - Tham Luong', 'Second metro line, 11.3km connecting District 1 to District 12', 'District 1', 'planned', '2025-01-01', '2030-12-31', 48000000000000, 2.0, 12.0, NULL),

('mall', 'Vincom Mega Mall Thu Thiem', 'Largest shopping mall in Vietnam, 200,000 sqm with luxury brands and entertainment', 'District 2', 'under_construction', '2022-06-01', '2025-06-30', 15000000000000, 5.0, 8.5, ARRAY['the-metropole-thu-thiem', 'empire-city']),

('school', 'British International School District 2', 'Premium international school following British curriculum, capacity 1,500 students', 'District 2', 'completed', '2020-01-01', '2022-08-01', 500000000000, 3.0, 6.0, ARRAY['vinhomes-central-park', 'masteri-thao-dien']),

('hospital', 'FV Hospital Extension - Thu Duc', 'International hospital extension, 500 beds with advanced medical facilities', 'Thu Duc', 'under_construction', '2023-03-01', '2025-12-31', 3000000000000, 5.0, 5.5, ARRAY['the-metropole-thu-thiem']),

('bridge', 'Thu Thiem Bridge 3', 'Third bridge connecting District 1 to Thu Thiem, reducing traffic congestion', 'District 1', 'planned', '2024-06-01', '2027-12-31', 8000000000000, 3.0, 10.0, ARRAY['the-metropole-thu-thiem', 'empire-city']),

('park', 'Thu Thiem Central Park', '20 hectares central park with lake, jogging track, and outdoor facilities', 'District 2', 'under_construction', '2023-01-01', '2025-06-30', 2000000000000, 2.0, 7.0, ARRAY['the-metropole-thu-thiem']);

-- 6. COMPARABLE SALES
INSERT INTO public.comparable_sales (project_id, transaction_date, unit_type, floor_number, area_sqm, total_price, price_per_sqm, direction, view_type, condition, furniture_status, transaction_type, buyer_type, financing_method, verification_status) VALUES

-- Vinhomes Central Park
('vinhomes-central-park', '2024-05-15', '2BR', 25, 85, 8330000000, 98000000, 'south', 'river', 'premium', 'fully_furnished', 'resale', 'individual', 'bank_loan', 'verified'),
('vinhomes-central-park', '2024-04-20', '2BR', 18, 82, 7790000000, 95000000, 'east', 'city', 'premium', 'basic', 'resale', 'investor', 'cash', 'verified'),
('vinhomes-central-park', '2024-03-10', '1BR', 15, 56, 5320000000, 95000000, 'north', 'park', 'basic', 'unfurnished', 'primary_sale', 'individual', 'bank_loan', 'verified'),
('vinhomes-central-park', '2024-02-28', '3BR', 30, 120, 11760000000, 98000000, 'south', 'river', 'luxury', 'fully_furnished', 'resale', 'corporate', 'cash', 'verified'),

-- Masteri Thao Dien
('masteri-thao-dien', '2024-05-10', '1BR', 12, 52, 4056000000, 78000000, 'east', 'city', 'premium', 'basic', 'resale', 'individual', 'bank_loan', 'verified'),
('masteri-thao-dien', '2024-04-15', '2BR', 20, 75, 5850000000, 78000000, 'south', 'park', 'premium', 'fully_furnished', 'resale', 'investor', 'bank_loan', 'verified'),
('masteri-thao-dien', '2024-03-05', 'Studio', 8, 35, 2730000000, 78000000, 'west', 'street', 'basic', 'unfurnished', 'primary_sale', 'individual', 'developer_financing', 'verified'),

-- The Metropole Thu Thiem
('the-metropole-thu-thiem', '2024-05-20', '3BR', 35, 145, 20010000000, 138000000, 'south', 'river', 'luxury', 'fully_furnished', 'primary_sale', 'corporate', 'cash', 'verified'),
('the-metropole-thu-thiem', '2024-04-25', '2BR', 28, 95, 13110000000, 138000000, 'east', 'city', 'premium', 'fully_furnished', 'primary_sale', 'individual', 'bank_loan', 'verified'),
('the-metropole-thu-thiem', '2024-03-15', '2BR', 22, 92, 12696000000, 138000000, 'north', 'park', 'premium', 'basic', 'resale', 'investor', 'bank_loan', 'verified');

-- 7. MARKET REGULATIONS
INSERT INTO public.market_regulations (regulation_type, title, description, issuing_authority, regulation_number, effective_date, affected_areas, impact_on_buyers, impact_on_investors, impact_on_market) VALUES

('lending', 'Credit Package for Social Housing', 'SBV allocates 120 trillion VND credit package with preferential interest rates (4.8%/year) for social housing purchases.', 'State Bank of Vietnam', '02/2024/TT-NHNN', '2024-04-01', ARRAY['All'], 'Positive - Lower borrowing costs for affordable housing', 'Neutral - Focus on lower-end segment', 'Stimulates affordable housing demand'),

('tax', 'Personal Income Tax on Property Transfer', 'Updated PIT calculation method for property transfers, 2% of transfer value or 25% of profit (whichever is higher).', 'Ministry of Finance', '10/2023/TT-BTC', '2024-01-01', ARRAY['All'], 'Negative - Higher tax burden when selling', 'Negative - Reduces net returns on property flips', 'May cool speculative trading'),

('foreign_ownership', 'Foreign Ownership Quota Extension', 'Extension of 30% foreign ownership quota in condominiums for another 5 years.', 'National Assembly', '65/2020/QH14', '2024-01-01', ARRAY['All'], 'Positive for foreign buyers - Continued access', 'Positive - Maintains international investor interest', 'Supports premium segment demand'),

('zoning', 'Thu Duc City Planning Adjustment', 'New urban planning for Thu Duc City, increasing allowed building heights in certain zones to 50+ floors.', 'HCMC People Committee', '28/2023/QD-UBND', '2023-12-01', ARRAY['Thu Duc', 'District 2', 'District 9'], 'Neutral - More future supply', 'Positive - Higher land use efficiency', 'Increases future supply capacity'),

('environmental', 'Green Building Standards Mandate', 'All new developments over 10,000 sqm must achieve minimum LEED Silver certification.', 'Ministry of Construction', '15/2023/TT-BXD', '2024-06-01', ARRAY['All'], 'Positive - Better building quality and lower operating costs', 'Neutral - Slightly higher development costs', 'Pushes industry toward sustainability');

-- 8. PROJECT AMENITIES (Detailed)
INSERT INTO public.project_amenities_detailed (project_id, amenity_category, amenity_name, amenity_description, quantity, area_sqm, floor_location, operating_hours, usage_fee, rating) VALUES

-- Vinhomes Central Park
('vinhomes-central-park', 'sports', 'Olympic Swimming Pool', '50m Olympic-standard pool with separate children pool and jacuzzi', 2, 2500, 'Podium Level 2', '6:00 - 22:00', 0, 4.8),
('vinhomes-central-park', 'sports', 'Tennis Courts', 'Professional tennis courts with lighting for night play', 4, 2800, 'Podium Level 3', '6:00 - 22:00', 50000, 4.5),
('vinhomes-central-park', 'wellness', 'Spa & Sauna', 'Full-service spa with sauna, steam room, and massage services', 1, 500, 'Podium Level 2', '8:00 - 22:00', 200000, 4.7),
('vinhomes-central-park', 'entertainment', 'Cinema', 'Private cinema for residents with latest AV equipment', 1, 200, 'Podium Level 4', '14:00 - 23:00', 0, 4.6),
('vinhomes-central-park', 'services', 'Minimart', '24/7 convenience store with fresh groceries and essentials', 1, 300, 'Ground Floor', '24/7', 0, 4.4),
('vinhomes-central-park', 'green_space', 'Central Park', '14 hectares landscaped park with jogging track and BBQ areas', 1, 140000, 'Ground Level', 'Always Open', 0, 4.9),

-- Masteri Thao Dien
('masteri-thao-dien', 'sports', 'Infinity Pool', 'Rooftop infinity pool with skyline views', 1, 800, 'Rooftop', '6:00 - 22:00', 0, 4.7),
('masteri-thao-dien', 'sports', 'Gym & Fitness Center', 'Fully equipped gym with personal training services', 1, 600, 'Podium Level 1', '5:00 - 23:00', 0, 4.6),
('masteri-thao-dien', 'services', 'Coworking Space', 'Modern coworking area with high-speed internet and meeting rooms', 1, 400, 'Podium Level 2', '24/7', 0, 4.5),
('masteri-thao-dien', 'entertainment', 'BBQ Garden', 'Outdoor BBQ area with gazebos and seating', 1, 500, 'Podium Level 3', '16:00 - 23:00', 100000, 4.3),

-- The Metropole Thu Thiem
('the-metropole-thu-thiem', 'sports', 'Golf Simulator', 'Indoor golf simulator with professional setup', 2, 300, 'Podium Level 5', '8:00 - 22:00', 200000, 4.8),
('the-metropole-thu-thiem', 'wellness', 'Yoga Studio', 'Dedicated yoga and meditation studio with certified instructors', 1, 200, 'Podium Level 4', '6:00 - 21:00', 0, 4.7),
('the-metropole-thu-thiem', 'entertainment', 'Kids Club', 'Supervised play area for children with educational activities', 1, 400, 'Podium Level 2', '8:00 - 20:00', 0, 4.9),
('the-metropole-thu-thiem', 'services', 'Concierge Service', '24/7 concierge for bookings, deliveries, and assistance', 1, 50, 'Lobby', '24/7', 0, 4.8),
('the-metropole-thu-thiem', 'security', 'Smart Security System', 'AI-powered facial recognition and 24/7 monitoring', 1, 100, 'All Floors', '24/7', 0, 4.9);
