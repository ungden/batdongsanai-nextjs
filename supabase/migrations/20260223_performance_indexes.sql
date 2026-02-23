-- Optimize Projects Table
CREATE INDEX IF NOT EXISTS idx_projects_city_district ON projects (city, district);
CREATE INDEX IF NOT EXISTS idx_projects_price_per_sqm ON projects (price_per_sqm);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects (status);

-- Optimize Property Listings Table (Marketplace)
CREATE INDEX IF NOT EXISTS idx_property_listings_city_district ON property_listings (city, district);
CREATE INDEX IF NOT EXISTS idx_property_listings_price_total ON property_listings (price_total);
CREATE INDEX IF NOT EXISTS idx_property_listings_listing_type ON property_listings (listing_type);
CREATE INDEX IF NOT EXISTS idx_property_listings_status ON property_listings (status);
CREATE INDEX IF NOT EXISTS idx_property_listings_project_id ON property_listings (project_id);

-- Optimize Consultations & Inquiries (Admin Dashboard)
CREATE INDEX IF NOT EXISTS idx_consultation_requests_status ON consultation_requests (status);
CREATE INDEX IF NOT EXISTS idx_consultation_requests_created_at ON consultation_requests (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_project_inquiries_status ON project_inquiries (status);
CREATE INDEX IF NOT EXISTS idx_project_inquiries_created_at ON project_inquiries (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_project_inquiries_lead_score ON project_inquiries (lead_score DESC);

-- Optimize Reviews & User Engagement
CREATE INDEX IF NOT EXISTS idx_project_reviews_project_id ON project_reviews (project_id);
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites (user_id);
CREATE INDEX IF NOT EXISTS idx_listing_favorites_user_id ON listing_favorites (user_id);

-- Optimize Market Data lookups
CREATE INDEX IF NOT EXISTS idx_project_pricing_history_project_id ON project_pricing_history (project_id);
CREATE INDEX IF NOT EXISTS idx_market_catalysts_effective_date ON market_catalysts (effective_date);
