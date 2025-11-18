-- Create function to check VIP status
CREATE OR REPLACE FUNCTION public.is_vip_active(user_uuid UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_subscriptions
    WHERE user_id = user_uuid
    AND is_active = true
    AND subscription_type IN ('premium', 'pro')
    AND (end_date IS NULL OR end_date > NOW())
  );
END;
$$;