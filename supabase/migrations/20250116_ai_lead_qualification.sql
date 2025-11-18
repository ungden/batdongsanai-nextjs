-- AI Lead Qualification & Admin Lead Management
-- Adds AI scoring and admin-centric lead management

-- ============================================
-- UPDATE PROJECT_INQUIRIES - Add AI fields
-- ============================================

ALTER TABLE public.project_inquiries
ADD COLUMN IF NOT EXISTS lead_score INTEGER DEFAULT 0 CHECK (lead_score >= 0 AND lead_score <= 100),
ADD COLUMN IF NOT EXISTS lead_quality VARCHAR(20) DEFAULT 'unqualified' CHECK (lead_quality IN ('hot', 'warm', 'cold', 'unqualified')),
ADD COLUMN IF NOT EXISTS ai_summary TEXT,
ADD COLUMN IF NOT EXISTS ai_recommendations TEXT[],
ADD COLUMN IF NOT EXISTS qualification_data JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS admin_notes TEXT,
ADD COLUMN IF NOT EXISTS last_admin_action_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS admin_action_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Add index for lead quality filtering
CREATE INDEX IF NOT EXISTS idx_project_inquiries_lead_quality ON public.project_inquiries(lead_quality);
CREATE INDEX IF NOT EXISTS idx_project_inquiries_lead_score ON public.project_inquiries(lead_score DESC);

-- ============================================
-- LEAD SCORING FUNCTION
-- ============================================

CREATE OR REPLACE FUNCTION calculate_lead_score(inquiry_id UUID)
RETURNS INTEGER AS $$
DECLARE
  inquiry RECORD;
  score INTEGER := 0;
  quality VARCHAR(20) := 'unqualified';
  summary TEXT := '';
  recommendations TEXT[] := ARRAY[]::TEXT[];
BEGIN
  -- Get inquiry data
  SELECT * INTO inquiry
  FROM public.project_inquiries
  WHERE id = inquiry_id;

  IF NOT FOUND THEN
    RETURN 0;
  END IF;

  -- Scoring algorithm (0-100 points)

  -- 1. Contact Information Quality (20 points)
  IF inquiry.customer_phone IS NOT NULL AND inquiry.customer_phone != '' THEN
    score := score + 10;
  END IF;
  IF inquiry.customer_email IS NOT NULL AND inquiry.customer_email != '' THEN
    score := score + 10;
  END IF;

  -- 2. Budget Information (25 points)
  IF inquiry.budget_min IS NOT NULL AND inquiry.budget_max IS NOT NULL THEN
    score := score + 25;
  ELSIF inquiry.budget_min IS NOT NULL OR inquiry.budget_max IS NOT NULL THEN
    score := score + 15;
  END IF;

  -- 3. Specific Requirements (20 points)
  IF inquiry.preferred_bedrooms IS NOT NULL THEN
    score := score + 7;
  END IF;
  IF inquiry.preferred_area_sqm IS NOT NULL THEN
    score := score + 7;
  END IF;
  IF inquiry.preferred_floor_range IS NOT NULL THEN
    score := score + 6;
  END IF;

  -- 4. Timeline Urgency (20 points)
  CASE inquiry.move_in_timeline
    WHEN 'immediate' THEN score := score + 20;
    WHEN '1-3_months' THEN score := score + 15;
    WHEN '3-6_months' THEN score := score + 10;
    WHEN '6-12_months' THEN score := score + 5;
    ELSE score := score + 0;
  END CASE;

  -- 5. Inquiry Type (15 points)
  CASE inquiry.inquiry_type
    WHEN 'purchase' THEN score := score + 15;
    WHEN 'viewing' THEN score := score + 12;
    WHEN 'pricing' THEN score := score + 8;
    WHEN 'general' THEN score := score + 5;
    ELSE score := score + 0;
  END CASE;

  -- Determine quality based on score
  IF score >= 75 THEN
    quality := 'hot';
  ELSIF score >= 50 THEN
    quality := 'warm';
  ELSIF score >= 25 THEN
    quality := 'cold';
  ELSE
    quality := 'unqualified';
  END IF;

  -- Generate AI Summary
  summary := 'Lead từ ' || inquiry.customer_name || ' (' || COALESCE(inquiry.customer_phone, 'No phone') || ')';

  IF inquiry.inquiry_type = 'purchase' THEN
    summary := summary || ' - QUAN TÂM MUA';
  ELSIF inquiry.inquiry_type = 'viewing' THEN
    summary := summary || ' - Muốn xem nhà';
  END IF;

  IF inquiry.budget_min IS NOT NULL AND inquiry.budget_max IS NOT NULL THEN
    summary := summary || '. Ngân sách: ' ||
               (inquiry.budget_min / 1000000000)::TEXT || '-' ||
               (inquiry.budget_max / 1000000000)::TEXT || ' tỷ';
  END IF;

  IF inquiry.preferred_bedrooms IS NOT NULL THEN
    summary := summary || '. Cần ' || inquiry.preferred_bedrooms || ' PN';
  END IF;

  IF inquiry.move_in_timeline = 'immediate' THEN
    summary := summary || '. URGENT - Chuyển ngay';
  ELSIF inquiry.move_in_timeline = '1-3_months' THEN
    summary := summary || '. Timeline: 1-3 tháng';
  END IF;

  -- Generate recommendations
  IF quality = 'hot' THEN
    recommendations := ARRAY['Ưu tiên liên hệ trong 1 giờ', 'Gọi điện trực tiếp', 'Đặt lịch xem nhà ngay'];
  ELSIF quality = 'warm' THEN
    recommendations := ARRAY['Liên hệ trong ngày hôm nay', 'Gửi brochure chi tiết', 'Follow-up sau 2-3 ngày'];
  ELSIF quality = 'cold' THEN
    recommendations := ARRAY['Gửi email thông tin', 'Thêm vào nurture campaign', 'Follow-up sau 1 tuần'];
  ELSE
    recommendations := ARRAY['Xác minh thông tin liên hệ', 'Gửi survey để qualify thêm'];
  END IF;

  -- Update inquiry with AI data
  UPDATE public.project_inquiries
  SET
    lead_score = score,
    lead_quality = quality,
    ai_summary = summary,
    ai_recommendations = recommendations,
    qualification_data = jsonb_build_object(
      'score_breakdown', jsonb_build_object(
        'contact_info', CASE WHEN inquiry.customer_email IS NOT NULL THEN 20 ELSE 10 END,
        'budget_info', CASE WHEN inquiry.budget_min IS NOT NULL AND inquiry.budget_max IS NOT NULL THEN 25 ELSE 0 END,
        'requirements', CASE WHEN inquiry.preferred_bedrooms IS NOT NULL THEN 20 ELSE 0 END,
        'timeline_urgency', CASE
          WHEN inquiry.move_in_timeline = 'immediate' THEN 20
          WHEN inquiry.move_in_timeline = '1-3_months' THEN 15
          ELSE 0
        END,
        'inquiry_type', CASE
          WHEN inquiry.inquiry_type = 'purchase' THEN 15
          WHEN inquiry.inquiry_type = 'viewing' THEN 12
          ELSE 5
        END
      ),
      'calculated_at', NOW()
    ),
    updated_at = NOW()
  WHERE id = inquiry_id;

  RETURN score;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- TRIGGER: Auto-calculate score on insert
-- ============================================

CREATE OR REPLACE FUNCTION trigger_calculate_lead_score()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM calculate_lead_score(NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER auto_calculate_lead_score
AFTER INSERT ON public.project_inquiries
FOR EACH ROW
EXECUTE FUNCTION trigger_calculate_lead_score();

-- ============================================
-- ADMIN ACTIONS LOG
-- ============================================

CREATE TABLE IF NOT EXISTS public.admin_lead_actions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  inquiry_id UUID REFERENCES public.project_inquiries(id) ON DELETE CASCADE NOT NULL,
  admin_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  action_type VARCHAR(50) NOT NULL, -- 'viewed', 'assigned', 'contacted', 'notes_added', 'status_changed', 'exported'
  action_details JSONB DEFAULT '{}'::jsonb,
  notes TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_admin_lead_actions_inquiry ON public.admin_lead_actions(inquiry_id);
CREATE INDEX idx_admin_lead_actions_admin ON public.admin_lead_actions(admin_user_id);
CREATE INDEX idx_admin_lead_actions_created ON public.admin_lead_actions(created_at DESC);

-- ============================================
-- RLS POLICIES for Admin
-- ============================================

ALTER TABLE public.admin_lead_actions ENABLE ROW LEVEL SECURITY;

-- Admins can view all actions
CREATE POLICY "Admins can view all lead actions"
  ON public.admin_lead_actions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.role = 'admin'
    )
  );

-- Admins can create actions
CREATE POLICY "Admins can create lead actions"
  ON public.admin_lead_actions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.role = 'admin'
    )
  );

-- Update inquiry RLS to allow admins to view all
CREATE POLICY "Admins can view all inquiries"
  ON public.project_inquiries FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.role = 'admin'
    )
  );

CREATE POLICY "Admins can update all inquiries"
  ON public.project_inquiries FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.role = 'admin'
    )
  );

-- ============================================
-- DISABLE AUTO-ASSIGNMENT (Comment out trigger)
-- ============================================

-- Drop the auto-assignment trigger to switch to manual mode
-- Admins will now manually assign leads after reviewing AI summary

-- DROP TRIGGER IF EXISTS auto_assign_inquiry ON public.project_inquiries;

-- If you want to keep auto-assignment for some projects, you can create a setting:
ALTER TABLE public.project_agents
ADD COLUMN IF NOT EXISTS auto_assign_enabled BOOLEAN DEFAULT false;

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Get lead statistics
CREATE OR REPLACE FUNCTION get_lead_statistics(
  start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW() - INTERVAL '30 days',
  end_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
)
RETURNS TABLE (
  total_leads BIGINT,
  hot_leads BIGINT,
  warm_leads BIGINT,
  cold_leads BIGINT,
  unqualified_leads BIGINT,
  avg_score DECIMAL(5,2),
  assigned_leads BIGINT,
  unassigned_leads BIGINT,
  conversion_rate DECIMAL(5,2)
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT as total_leads,
    COUNT(*) FILTER (WHERE lead_quality = 'hot')::BIGINT as hot_leads,
    COUNT(*) FILTER (WHERE lead_quality = 'warm')::BIGINT as warm_leads,
    COUNT(*) FILTER (WHERE lead_quality = 'cold')::BIGINT as cold_leads,
    COUNT(*) FILTER (WHERE lead_quality = 'unqualified')::BIGINT as unqualified_leads,
    AVG(lead_score)::DECIMAL(5,2) as avg_score,
    COUNT(*) FILTER (WHERE assigned_agent_id IS NOT NULL)::BIGINT as assigned_leads,
    COUNT(*) FILTER (WHERE assigned_agent_id IS NULL)::BIGINT as unassigned_leads,
    (COUNT(*) FILTER (WHERE status IN ('closed_won'))::DECIMAL / NULLIF(COUNT(*), 0) * 100)::DECIMAL(5,2) as conversion_rate
  FROM public.project_inquiries
  WHERE created_at BETWEEN start_date AND end_date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Manual assign function (for admin use)
CREATE OR REPLACE FUNCTION admin_assign_inquiry(
  inquiry_uuid UUID,
  agent_uuid UUID,
  admin_uuid UUID
)
RETURNS BOOLEAN AS $$
BEGIN
  -- Update inquiry
  UPDATE public.project_inquiries
  SET
    assigned_agent_id = agent_uuid,
    assigned_at = NOW(),
    status = 'assigned',
    admin_action_by = admin_uuid,
    last_admin_action_at = NOW(),
    updated_at = NOW()
  WHERE id = inquiry_uuid;

  -- Log action
  INSERT INTO public.admin_lead_actions (inquiry_id, admin_user_id, action_type, action_details)
  VALUES (
    inquiry_uuid,
    admin_uuid,
    'assigned',
    jsonb_build_object('agent_id', agent_uuid, 'timestamp', NOW())
  );

  -- Update agent metrics
  UPDATE public.agents
  SET
    total_leads_received = total_leads_received + 1,
    current_month_leads = current_month_leads + 1,
    updated_at = NOW()
  WHERE id = agent_uuid;

  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recalculate score for existing inquiries
DO $$
DECLARE
  inquiry_record RECORD;
BEGIN
  FOR inquiry_record IN SELECT id FROM public.project_inquiries LOOP
    PERFORM calculate_lead_score(inquiry_record.id);
  END LOOP;
END $$;

COMMENT ON FUNCTION calculate_lead_score IS 'AI-powered lead scoring algorithm (0-100) with quality classification';
COMMENT ON FUNCTION get_lead_statistics IS 'Get lead statistics for dashboard';
COMMENT ON FUNCTION admin_assign_inquiry IS 'Manual lead assignment by admin with logging';
