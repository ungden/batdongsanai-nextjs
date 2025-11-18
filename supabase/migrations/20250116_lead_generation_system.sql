-- Lead Generation System for Real Estate Platform
-- Connects users with agents/brokers for project inquiries

-- ============================================
-- AGENTS TABLE - Real estate agents/brokers
-- ============================================

CREATE TABLE IF NOT EXISTS public.agents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Agent Information
  full_name VARCHAR(100) NOT NULL,
  company_name VARCHAR(200),
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(255) NOT NULL,

  -- Professional Details
  license_number VARCHAR(50),
  years_experience INTEGER,
  specialization TEXT[], -- Array of specializations (e.g., luxury, commercial, residential)
  languages TEXT[], -- Languages spoken

  -- Profile
  bio TEXT,
  avatar_url VARCHAR(500),

  -- Service Areas
  service_districts TEXT[], -- Districts they cover

  -- Performance Metrics
  total_leads_received INTEGER DEFAULT 0,
  total_leads_converted INTEGER DEFAULT 0,
  conversion_rate DECIMAL(5,2) DEFAULT 0,
  average_response_time_minutes INTEGER,
  rating DECIMAL(3,2) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,

  -- Availability
  is_active BOOLEAN DEFAULT true,
  is_verified BOOLEAN DEFAULT false,
  max_leads_per_month INTEGER DEFAULT 50,
  current_month_leads INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- PROJECT_AGENTS - Many-to-many relationship
-- ============================================

CREATE TABLE IF NOT EXISTS public.project_agents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id TEXT NOT NULL,
  agent_id UUID REFERENCES public.agents(id) ON DELETE CASCADE NOT NULL,

  -- Agent's role for this project
  role VARCHAR(50) DEFAULT 'agent', -- 'agent', 'lead_agent', 'developer_rep'
  commission_rate DECIMAL(5,2), -- Commission percentage

  -- Status
  is_active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 0, -- Higher priority agents get leads first

  -- Performance for this project
  leads_received INTEGER DEFAULT 0,
  leads_converted INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(project_id, agent_id)
);

-- ============================================
-- PROJECT_INQUIRIES - User inquiries/leads
-- ============================================

CREATE TABLE IF NOT EXISTS public.project_inquiries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Contact Information
  customer_name VARCHAR(100) NOT NULL,
  customer_phone VARCHAR(20) NOT NULL,
  customer_email VARCHAR(255),

  -- Inquiry Details
  inquiry_type VARCHAR(50) NOT NULL DEFAULT 'general', -- 'general', 'viewing', 'pricing', 'purchase'
  message TEXT,

  -- Customer Requirements
  budget_min BIGINT,
  budget_max BIGINT,
  preferred_bedrooms INTEGER,
  preferred_area_sqm INTEGER,
  preferred_floor_range VARCHAR(50), -- e.g., 'high', 'medium', 'low', '10-20'
  move_in_timeline VARCHAR(50), -- e.g., 'immediate', '1-3_months', '3-6_months', '6-12_months'

  -- Additional Info
  how_did_you_hear VARCHAR(100), -- Marketing attribution
  preferred_contact_time VARCHAR(50), -- 'morning', 'afternoon', 'evening', 'anytime'
  notes TEXT,

  -- Lead Status
  status VARCHAR(50) DEFAULT 'new', -- 'new', 'assigned', 'contacted', 'viewing_scheduled', 'negotiating', 'closed_won', 'closed_lost'

  -- Assignment
  assigned_agent_id UUID REFERENCES public.agents(id) ON DELETE SET NULL,
  assigned_at TIMESTAMP WITH TIME ZONE,

  -- Tracking
  first_contacted_at TIMESTAMP WITH TIME ZONE,
  viewing_scheduled_at TIMESTAMP WITH TIME ZONE,
  closed_at TIMESTAMP WITH TIME ZONE,

  -- Source
  source VARCHAR(50) DEFAULT 'web', -- 'web', 'mobile', 'phone', 'email'
  referrer_url TEXT,
  utm_source VARCHAR(100),
  utm_medium VARCHAR(100),
  utm_campaign VARCHAR(100),

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- INQUIRY_ACTIVITIES - Activity log
-- ============================================

CREATE TABLE IF NOT EXISTS public.inquiry_activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  inquiry_id UUID REFERENCES public.project_inquiries(id) ON DELETE CASCADE NOT NULL,
  agent_id UUID REFERENCES public.agents(id) ON DELETE SET NULL,

  activity_type VARCHAR(50) NOT NULL, -- 'status_change', 'note_added', 'call_made', 'email_sent', 'viewing_scheduled'
  description TEXT,

  -- Old and new values for changes
  old_value TEXT,
  new_value TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- AGENT_REVIEWS - User reviews for agents
-- ============================================

CREATE TABLE IF NOT EXISTS public.agent_reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id UUID REFERENCES public.agents(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  inquiry_id UUID REFERENCES public.project_inquiries(id) ON DELETE SET NULL,

  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),

  -- Detailed ratings
  responsiveness_rating INTEGER CHECK (responsiveness_rating >= 1 AND responsiveness_rating <= 5),
  professionalism_rating INTEGER CHECK (professionalism_rating >= 1 AND professionalism_rating <= 5),
  knowledge_rating INTEGER CHECK (knowledge_rating >= 1 AND knowledge_rating <= 5),

  review_text TEXT,

  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'approved', 'rejected'

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(agent_id, user_id, inquiry_id)
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX idx_agents_user_id ON public.agents(user_id);
CREATE INDEX idx_agents_is_active ON public.agents(is_active);
CREATE INDEX idx_agents_service_districts ON public.agents USING GIN(service_districts);

CREATE INDEX idx_project_agents_project_id ON public.project_agents(project_id);
CREATE INDEX idx_project_agents_agent_id ON public.project_agents(agent_id);
CREATE INDEX idx_project_agents_active ON public.project_agents(is_active) WHERE is_active = true;

CREATE INDEX idx_project_inquiries_project_id ON public.project_inquiries(project_id);
CREATE INDEX idx_project_inquiries_user_id ON public.project_inquiries(user_id);
CREATE INDEX idx_project_inquiries_status ON public.project_inquiries(status);
CREATE INDEX idx_project_inquiries_assigned_agent ON public.project_inquiries(assigned_agent_id);
CREATE INDEX idx_project_inquiries_created_at ON public.project_inquiries(created_at DESC);

CREATE INDEX idx_inquiry_activities_inquiry_id ON public.inquiry_activities(inquiry_id);
CREATE INDEX idx_inquiry_activities_agent_id ON public.inquiry_activities(agent_id);

CREATE INDEX idx_agent_reviews_agent_id ON public.agent_reviews(agent_id);

-- ============================================
-- RLS POLICIES
-- ============================================

ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inquiry_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_reviews ENABLE ROW LEVEL SECURITY;

-- Agents: Public can view active agents, users can manage own profile
CREATE POLICY "Public can view active agents"
  ON public.agents FOR SELECT
  USING (is_active = true);

CREATE POLICY "Users can manage own agent profile"
  ON public.agents FOR ALL
  USING (auth.uid() = user_id);

-- Project Agents: Public can view active assignments
CREATE POLICY "Public can view active project agents"
  ON public.project_agents FOR SELECT
  USING (is_active = true);

-- Project Inquiries: Users can view own inquiries, agents can view assigned
CREATE POLICY "Users can view own inquiries"
  ON public.project_inquiries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Agents can view assigned inquiries"
  ON public.project_inquiries FOR SELECT
  USING (
    assigned_agent_id IN (
      SELECT id FROM public.agents WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can create inquiries"
  ON public.project_inquiries FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Agents can update assigned inquiries"
  ON public.project_inquiries FOR UPDATE
  USING (
    assigned_agent_id IN (
      SELECT id FROM public.agents WHERE user_id = auth.uid()
    )
  );

-- Inquiry Activities: Users and assigned agents can view
CREATE POLICY "Users can view activities for own inquiries"
  ON public.inquiry_activities FOR SELECT
  USING (
    inquiry_id IN (
      SELECT id FROM public.project_inquiries WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Agents can view and create activities"
  ON public.inquiry_activities FOR ALL
  USING (
    inquiry_id IN (
      SELECT id FROM public.project_inquiries
      WHERE assigned_agent_id IN (
        SELECT id FROM public.agents WHERE user_id = auth.uid()
      )
    )
  );

-- Agent Reviews: Public can view approved, users can create
CREATE POLICY "Public can view approved agent reviews"
  ON public.agent_reviews FOR SELECT
  USING (status = 'approved');

CREATE POLICY "Users can create agent reviews"
  ON public.agent_reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Auto-assign inquiry to agent (round-robin based on priority)
CREATE OR REPLACE FUNCTION assign_inquiry_to_agent(inquiry_uuid UUID)
RETURNS UUID AS $$
DECLARE
  v_project_id TEXT;
  v_assigned_agent_id UUID;
BEGIN
  -- Get project_id from inquiry
  SELECT project_id INTO v_project_id
  FROM public.project_inquiries
  WHERE id = inquiry_uuid;

  -- Find agent with highest priority and lowest current leads
  SELECT pa.agent_id INTO v_assigned_agent_id
  FROM public.project_agents pa
  INNER JOIN public.agents a ON pa.agent_id = a.id
  WHERE pa.project_id = v_project_id
    AND pa.is_active = true
    AND a.is_active = true
    AND a.current_month_leads < a.max_leads_per_month
  ORDER BY pa.priority DESC, pa.leads_received ASC
  LIMIT 1;

  -- Update inquiry with assigned agent
  IF v_assigned_agent_id IS NOT NULL THEN
    UPDATE public.project_inquiries
    SET
      assigned_agent_id = v_assigned_agent_id,
      assigned_at = NOW(),
      status = 'assigned',
      updated_at = NOW()
    WHERE id = inquiry_uuid;

    -- Update agent metrics
    UPDATE public.agents
    SET
      total_leads_received = total_leads_received + 1,
      current_month_leads = current_month_leads + 1,
      updated_at = NOW()
    WHERE id = v_assigned_agent_id;

    -- Update project_agents metrics
    UPDATE public.project_agents
    SET leads_received = leads_received + 1
    WHERE project_id = v_project_id AND agent_id = v_assigned_agent_id;

    -- Log activity
    INSERT INTO public.inquiry_activities (inquiry_id, agent_id, activity_type, description)
    VALUES (inquiry_uuid, v_assigned_agent_id, 'status_change', 'Inquiry assigned to agent');
  END IF;

  RETURN v_assigned_agent_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update agent rating when review is added
CREATE OR REPLACE FUNCTION update_agent_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.agents
  SET
    rating = (
      SELECT AVG(rating)::DECIMAL(3,2)
      FROM public.agent_reviews
      WHERE agent_id = NEW.agent_id AND status = 'approved'
    ),
    total_reviews = (
      SELECT COUNT(*)
      FROM public.agent_reviews
      WHERE agent_id = NEW.agent_id AND status = 'approved'
    ),
    updated_at = NOW()
  WHERE id = NEW.agent_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_update_agent_rating
AFTER INSERT OR UPDATE ON public.agent_reviews
FOR EACH ROW
WHEN (NEW.status = 'approved')
EXECUTE FUNCTION update_agent_rating();

-- Reset monthly lead counters (run monthly via cron)
CREATE OR REPLACE FUNCTION reset_monthly_lead_counters()
RETURNS void AS $$
BEGIN
  UPDATE public.agents
  SET current_month_leads = 0,
      updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- SAMPLE DATA
-- ============================================

-- Sample agents
INSERT INTO public.agents (
  full_name, company_name, phone, email,
  license_number, years_experience, specialization, languages,
  bio, service_districts, is_active, is_verified, rating, total_reviews
) VALUES
(
  'Nguyễn Văn Minh',
  'MinhLand Real Estate',
  '0901234567',
  'minh.nguyen@minhland.vn',
  'RE-HCM-12345',
  8,
  ARRAY['luxury', 'residential', 'investment'],
  ARRAY['Vietnamese', 'English'],
  'Chuyên gia tư vấn BĐS cao cấp với 8 năm kinh nghiệm. Đã tư vấn thành công cho hơn 200 khách hàng.',
  ARRAY['Quận 1', 'Quận 2', 'Quận 7', 'Thủ Đức'],
  true,
  true,
  4.8,
  45
),
(
  'Trần Thị Hương',
  'Golden Gate Properties',
  '0912345678',
  'huong.tran@goldengate.vn',
  'RE-HCM-67890',
  5,
  ARRAY['residential', 'first_home_buyers'],
  ARRAY['Vietnamese'],
  'Tư vấn tận tâm, hiểu rõ nhu cầu khách hàng. Chuyên hỗ trợ người mua nhà lần đầu.',
  ARRAY['Quận 2', 'Quận 9', 'Thủ Đức', 'Bình Thạnh'],
  true,
  true,
  4.9,
  67
),
(
  'Lê Hoàng Nam',
  'Nam Property Consultants',
  '0923456789',
  'nam.le@namproperties.vn',
  'RE-HCM-54321',
  10,
  ARRAY['commercial', 'luxury', 'investment'],
  ARRAY['Vietnamese', 'English', 'Chinese'],
  'Chuyên gia phân tích đầu tư BĐS. Tư vấn cho các nhà đầu tư lớn và doanh nghiệp.',
  ARRAY['Quận 1', 'Quận 3', 'Quận 7'],
  true,
  true,
  4.7,
  32
);

-- Link agents to sample projects (assuming project IDs from previous data)
-- You'll need to update project_id values based on your actual data
INSERT INTO public.project_agents (project_id, agent_id, role, commission_rate, priority)
SELECT
  'vinhomes-grand-park',
  id,
  'agent',
  2.5,
  CASE
    WHEN full_name = 'Nguyễn Văn Minh' THEN 10
    WHEN full_name = 'Trần Thị Hương' THEN 5
    ELSE 1
  END
FROM public.agents
WHERE full_name IN ('Nguyễn Văn Minh', 'Trần Thị Hương');

INSERT INTO public.project_agents (project_id, agent_id, role, commission_rate, priority)
SELECT
  'the-metropole-thu-thiem',
  id,
  'lead_agent',
  3.0,
  10
FROM public.agents
WHERE full_name = 'Lê Hoàng Nam';

-- Sample inquiry (pending assignment)
INSERT INTO public.project_inquiries (
  project_id,
  customer_name,
  customer_phone,
  customer_email,
  inquiry_type,
  message,
  budget_min,
  budget_max,
  preferred_bedrooms,
  move_in_timeline,
  how_did_you_hear,
  status
) VALUES
(
  'vinhomes-grand-park',
  'Phạm Văn Anh',
  '0934567890',
  'pham.anh@email.com',
  'viewing',
  'Tôi quan tâm đến căn 2PN, view công viên. Muốn đặt lịch xem nhà trong tuần này.',
  3000000000,
  4000000000,
  2,
  '1-3_months',
  'Google Search',
  'new'
);

COMMENT ON TABLE public.agents IS 'Real estate agents/brokers who handle project inquiries';
COMMENT ON TABLE public.project_agents IS 'Many-to-many relationship between projects and agents';
COMMENT ON TABLE public.project_inquiries IS 'Customer inquiries/leads for projects';
COMMENT ON TABLE public.inquiry_activities IS 'Activity log for inquiry tracking';
COMMENT ON TABLE public.agent_reviews IS 'User reviews for agents';
