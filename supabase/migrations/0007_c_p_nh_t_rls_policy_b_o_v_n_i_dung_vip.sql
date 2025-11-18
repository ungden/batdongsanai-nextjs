-- Xóa policy cũ không an toàn
DROP POLICY IF EXISTS "view_public_reports" ON public.project_reports;

-- Policy mới: Cho phép mọi người xem các báo cáo không phải VIP
CREATE POLICY "Public can view non-VIP reports" ON public.project_reports
FOR SELECT USING (is_vip_only = false);

-- Policy mới: Chỉ cho phép người dùng có VIP đang hoạt động xem báo cáo VIP
CREATE POLICY "VIPs can view VIP reports" ON public.project_reports
FOR SELECT TO authenticated USING (is_vip_active(auth.uid()) = true);