-- Fix function search paths for security
ALTER FUNCTION public.get_user_role(_user_id uuid) SET search_path = '';
ALTER FUNCTION public.has_role(_user_id uuid, _role app_role) SET search_path = '';
ALTER FUNCTION public.is_admin(_user_id uuid) SET search_path = '';

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_consultation_requests_status ON public.consultation_requests(status);
CREATE INDEX IF NOT EXISTS idx_consultation_requests_created_at ON public.consultation_requests(created_at);
CREATE INDEX IF NOT EXISTS idx_favorites_created_at ON public.favorites(created_at);
CREATE INDEX IF NOT EXISTS idx_favorites_project_id ON public.favorites(project_id);
CREATE INDEX IF NOT EXISTS idx_admin_logs_created_at ON public.admin_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_admin_logs_admin_id ON public.admin_logs(admin_id);

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
    'total_favorites', (SELECT COUNT(*) FROM favorites),
    'admin_actions_today', (SELECT COUNT(*) FROM admin_logs WHERE DATE(created_at) = CURRENT_DATE),
    'last_activity', (SELECT MAX(created_at) FROM admin_logs)
  );
$$;