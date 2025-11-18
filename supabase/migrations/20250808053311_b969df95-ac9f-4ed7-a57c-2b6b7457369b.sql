-- Fix function search paths for security only
ALTER FUNCTION public.get_user_role(_user_id uuid) SET search_path = '';
ALTER FUNCTION public.has_role(_user_id uuid, _role app_role) SET search_path = '';
ALTER FUNCTION public.is_admin(_user_id uuid) SET search_path = '';