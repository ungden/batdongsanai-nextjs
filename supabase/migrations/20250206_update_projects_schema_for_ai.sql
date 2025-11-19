-- Bổ sung các cột còn thiếu cho bảng projects để chứa dữ liệu từ AI Deep Scan
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS total_units INTEGER,
ADD COLUMN IF NOT EXISTS sold_units INTEGER,
ADD COLUMN IF NOT EXISTS floors INTEGER,
ADD COLUMN IF NOT EXISTS blocks INTEGER,
ADD COLUMN IF NOT EXISTS launch_price NUMERIC,
ADD COLUMN IF NOT EXISTS current_price NUMERIC,
ADD COLUMN IF NOT EXISTS price_range TEXT,
ADD COLUMN IF NOT EXISTS apartment_types TEXT[], -- Mảng các loại căn hộ (1PN, 2PN...)
ADD COLUMN IF NOT EXISTS legal_score NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS legal_status TEXT, -- Trạng thái pháp lý text (Sổ hồng, HĐMB...)
ADD COLUMN IF NOT EXISTS handover_standard TEXT, -- Tiêu chuẩn bàn giao (Thô, Cơ bản...)
ADD COLUMN IF NOT EXISTS density_construction NUMERIC; -- Mật độ xây dựng (%)

-- Cập nhật lại RLS policy nếu cần (đảm bảo update được các cột mới)
-- (Các policy cũ thường là update ALL columns nên không cần sửa, nhưng chạy lại cho chắc)
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;