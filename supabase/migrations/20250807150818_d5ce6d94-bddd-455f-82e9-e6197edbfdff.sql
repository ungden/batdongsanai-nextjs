-- Fix function search paths for security
ALTER FUNCTION public.get_user_role(_user_id uuid) SET search_path = '';
ALTER FUNCTION public.has_role(_user_id uuid, _role app_role) SET search_path = '';
ALTER FUNCTION public.is_admin(_user_id uuid) SET search_path = '';

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_consultation_requests_status ON public.consultation_requests(status);
CREATE INDEX IF NOT EXISTS idx_consultation_requests_created_at ON public.consultation_requests(created_at);
CREATE INDEX IF NOT EXISTS idx_project_views_created_at ON public.project_views(created_at);
CREATE INDEX IF NOT EXISTS idx_project_views_project_id ON public.project_views(project_id);
CREATE INDEX IF NOT EXISTS idx_admin_logs_created_at ON public.admin_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_admin_logs_admin_id ON public.admin_logs(admin_id);

-- Create enhanced analytics functions
CREATE OR REPLACE FUNCTION public.get_daily_stats()
RETURNS TABLE (
  date DATE,
  views_count BIGINT,
  consultations_count BIGINT,
  favorites_count BIGINT
) 
LANGUAGE SQL 
SECURITY DEFINER 
SET search_path = ''
AS $$
  SELECT 
    DATE(created_at) as date,
    COUNT(*) FILTER (WHERE table_name = 'project_views') as views_count,
    COUNT(*) FILTER (WHERE table_name = 'consultation_requests') as consultations_count,
    COUNT(*) FILTER (WHERE table_name = 'favorites') as favorites_count
  FROM (
    SELECT created_at, 'project_views' as table_name FROM project_views
    UNION ALL
    SELECT created_at, 'consultation_requests' as table_name FROM consultation_requests
    UNION ALL
    SELECT created_at, 'favorites' as table_name FROM favorites
  ) combined
  WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
  GROUP BY DATE(created_at)
  ORDER BY date DESC;
$$;

-- Create system health monitoring function
CREATE OR REPLACE FUNCTION public.get_system_health()
RETURNS JSON
LANGUAGE SQL
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT json_build_object(
    'total_users', (SELECT COUNT(*) FROM profiles),
    'active_consultations', (SELECT COUNT(*) FROM consultation_requests WHERE status = 'pending'),
    'total_project_views', (SELECT COUNT(*) FROM project_views),
    'admin_actions_today', (SELECT COUNT(*) FROM admin_logs WHERE DATE(created_at) = CURRENT_DATE),
    'last_activity', (SELECT MAX(created_at) FROM admin_logs)
  );
$$;