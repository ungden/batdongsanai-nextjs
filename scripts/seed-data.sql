-- =============================================
-- SEED DATA FOR REALPROFIT.VN
-- Run this in Supabase SQL Editor
-- =============================================

-- Step 1: Add unique constraints (if not exists)
DO $$
BEGIN
  -- Add unique constraint to developers.name if not exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'developers_name_key'
  ) THEN
    ALTER TABLE developers ADD CONSTRAINT developers_name_key UNIQUE (name);
  END IF;

  -- Add unique constraint to projects.name if not exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'projects_name_key'
  ) THEN
    ALTER TABLE projects ADD CONSTRAINT projects_name_key UNIQUE (name);
  END IF;
END $$;

-- Step 2: Clear existing data (optional - comment out if you want to keep existing)
-- DELETE FROM projects;
-- DELETE FROM developers;

-- ============ DEVELOPERS ============
INSERT INTO developers (name, logo, description, established_year, website, hotline, email, address, total_projects, completed_projects, avg_legal_score, avg_rating, specialties)
VALUES
  ('Vinhomes', 'https://vinhomes.vn/themes/flavor/images/logo.svg', 'Vinhomes là thương hiệu bất động sản hàng đầu Việt Nam, trực thuộc Tập đoàn Vingroup. Được thành lập từ năm 2008, Vinhomes đã phát triển hơn 49 đại đô thị trên toàn quốc với tiêu chuẩn quốc tế.', 2008, 'https://vinhomes.vn', '1900 2323 89', 'contact@vinhomes.vn', 'Số 7, đường Bằng Lăng 1, Phường Việt Hưng, Quận Long Biên, Hà Nội', 49, 35, 9.5, 4.8, ARRAY['Đại đô thị', 'Căn hộ cao cấp', 'Biệt thự', 'Shophouse']),

  ('Masterise Homes', 'https://masterisehomes.com/wp-content/uploads/2020/03/masterise-homes-logo.png', 'Masterise Homes là nhà phát triển bất động sản hạng sang số 1 Việt Nam, thuộc Masterise Group. Tiền thân là Thảo Điền Investment, công ty nổi tiếng với các dự án căn hộ hàng hiệu mang đẳng cấp quốc tế.', 2007, 'https://masterisehomes.com', '1800 6868 68', 'info@masterisehomes.com', 'Tầng 25, Saigon Centre Tower 2, 67 Lê Lợi, Quận 1, TP.HCM', 12, 6, 9.2, 4.7, ARRAY['Căn hộ hạng sang', 'Branded Residence', 'Penthouse', 'Duplex']),

  ('Novaland', 'https://novaland.com.vn/Data/Sites/1/News/5773/novaland-logo.png', 'Novaland Group là tập đoàn phát triển bất động sản hàng đầu Việt Nam, được thành lập năm 1992. Công ty đã phát triển nhiều dự án đa dạng từ căn hộ đến biệt thự nghỉ dưỡng trên toàn quốc.', 1992, 'https://novaland.com.vn', '1800 6789 99', 'info@novaland.com.vn', 'Tầng 8, Tòa nhà Citi Tower, 115 Nguyễn Cơ Thạch, Quận 2, TP.HCM', 45, 28, 7.5, 4.2, ARRAY['Căn hộ', 'Biệt thự', 'Nghỉ dưỡng', 'Đô thị tích hợp']),

  ('Gamuda Land', 'https://gamudaland.com.vn/wp-content/uploads/2020/01/gamuda-land-logo.png', 'Gamuda Land là công ty phát triển bất động sản thuộc Tập đoàn Gamuda Berhad (Malaysia). Tại Việt Nam, Gamuda Land nổi tiếng với các dự án đô thị xanh quy mô lớn như Celadon City và Gamuda Gardens.', 1995, 'https://gamudaland.com.vn', '1800 599 920', 'info@gamudaland.com.vn', 'Tầng 12A, Tòa nhà Centec Tower, 72-74 Nguyễn Thị Minh Khai, Quận 3, TP.HCM', 8, 5, 9.0, 4.6, ARRAY['Đô thị xanh', 'Căn hộ sinh thái', 'Township', 'TOD']),

  ('Sơn Kim Land', 'https://sonkimland.com/wp-content/uploads/logo-sonkim.png', 'Sơn Kim Land là công ty phát triển bất động sản cao cấp tại TP.HCM, thuộc Tập đoàn Sơn Kim Group. Nổi tiếng với các dự án chất lượng cao tại khu vực Thủ Đức như The 9 Stellars.', 2010, 'https://sonkimland.com', '1900 5858 98', 'info@sonkimland.com', '15 Lê Thánh Tôn, Phường Bến Nghé, Quận 1, TP.HCM', 6, 3, 8.5, 4.4, ARRAY['Căn hộ cao cấp', 'TOD', 'Mixed-use']),

  ('Khang Điền', 'https://khangdien.com.vn/wp-content/uploads/logo-khang-dien.png', 'Nhà Khang Điền (KDH) là một trong những doanh nghiệp bất động sản uy tín nhất Việt Nam, chuyên phát triển các khu đô thị và nhà ở tại khu vực phía Đông TP.HCM.', 2001, 'https://khangdien.com.vn', '1800 6868 02', 'info@khangdien.com.vn', '57 Đường số 3, Khu phố 4, Phường An Khánh, TP. Thủ Đức, TP.HCM', 15, 12, 9.3, 4.7, ARRAY['Nhà phố', 'Biệt thự', 'Căn hộ', 'Khu đô thị']),

  ('Phú Mỹ Hưng', 'https://phumyhung.vn/wp-content/uploads/logo-phu-my-hung.png', 'Phú Mỹ Hưng là nhà phát triển đô thị tiên phong tại Việt Nam, đã biến vùng đất hoang sơ phía Nam Sài Gòn thành khu đô thị kiểu mẫu đạt chuẩn quốc tế.', 1993, 'https://phumyhung.vn', '028 5411 9999', 'info@phumyhung.vn', 'Tầng 10, Tòa nhà Lawrence S.Ting, 801 Nguyễn Văn Linh, Quận 7, TP.HCM', 25, 22, 9.8, 4.9, ARRAY['Khu đô thị', 'Căn hộ cao cấp', 'Biệt thự', 'Văn phòng']),

  ('CapitaLand', 'https://capitaland.com/content/dam/capitaland-sites/international/about-capitaland/our-brand/capitaland-logo.png', 'CapitaLand là một trong những tập đoàn bất động sản đa dạng hóa lớn nhất châu Á, có trụ sở tại Singapore. Tại Việt Nam, CapitaLand nổi tiếng với các dự án căn hộ cao cấp.', 2000, 'https://capitaland.com', '028 3821 8888', 'vietnam@capitaland.com', 'Tầng 29, Bitexco Financial Tower, 2 Hải Triều, Quận 1, TP.HCM', 10, 8, 9.5, 4.6, ARRAY['Căn hộ cao cấp', 'Commercial', 'Retail', 'Integrated Development']),

  ('Hưng Thịnh Corp', 'https://hungthinhcorp.com.vn/images/logo.png', 'Tập đoàn Hưng Thịnh là một trong những doanh nghiệp bất động sản lớn nhất Việt Nam với hơn 20 năm kinh nghiệm phát triển các dự án đa dạng từ căn hộ đến nghỉ dưỡng.', 2002, 'https://hungthinhcorp.com.vn', '1800 6789 68', 'info@hungthinhcorp.com.vn', '110 Đường D1, Phường 25, Quận Bình Thạnh, TP.HCM', 35, 25, 8.0, 4.3, ARRAY['Căn hộ', 'Biệt thự biển', 'Shophouse', 'Condotel']),

  ('Nam Long Group', 'https://namlonggroup.com.vn/images/logo.png', 'Nam Long Group là tập đoàn bất động sản với hơn 30 năm kinh nghiệm, nổi tiếng với các dự án nhà ở vừa túi tiền cho người trẻ và gia đình trung lưu.', 1992, 'https://namlonggroup.com.vn', '028 3848 0088', 'info@namlonggroup.com.vn', '6 Nguyễn Khắc Viện, Phường Tân Phú, Quận 7, TP.HCM', 20, 15, 8.5, 4.4, ARRAY['Căn hộ tầm trung', 'Khu đô thị', 'Nhà phố', 'EHome'])
ON CONFLICT (name) DO UPDATE SET
  logo = EXCLUDED.logo,
  description = EXCLUDED.description,
  established_year = EXCLUDED.established_year,
  website = EXCLUDED.website,
  hotline = EXCLUDED.hotline,
  email = EXCLUDED.email,
  address = EXCLUDED.address,
  total_projects = EXCLUDED.total_projects,
  completed_projects = EXCLUDED.completed_projects,
  avg_legal_score = EXCLUDED.avg_legal_score,
  avg_rating = EXCLUDED.avg_rating,
  specialties = EXCLUDED.specialties,
  updated_at = now();

-- ============ PROJECTS ============
INSERT INTO projects (name, developer, location, district, city, description, image, price_per_sqm, price_range, legal_score, status, total_units, sold_units, floors, launch_date, completion_date, amenities, apartment_types)
VALUES
  -- Vinhomes Projects
  ('Vinhomes Grand Park', 'Vinhomes', '128 Nguyễn Xiển, Phường Long Thạnh Mỹ, TP. Thủ Đức', 'Thủ Đức', 'Hồ Chí Minh', 'Vinhomes Grand Park là đại đô thị đẳng cấp quốc tế đầu tiên tại TP.HCM, với quy mô 271ha, tích hợp đầy đủ tiện ích như công viên 36ha, biển hồ nhân tạo, trung tâm thương mại Vincom Mega Mall.', 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800', 55000000, '2.5 - 15 tỷ', 9.5, 'Đang mở bán', 44000, 38000, 45, '2019-09-01', '2024-12-01', ARRAY['Hồ bơi', 'Gym', 'Công viên 36ha', 'Vincom Mega Mall', 'Trường học Vinschool', 'Bệnh viện Vinmec'], ARRAY['Studio', '1PN', '2PN', '3PN', 'Penthouse']),

  ('The Opus One', 'Vinhomes', 'Vinhomes Grand Park, Phường Long Thạnh Mỹ, TP. Thủ Đức', 'Thủ Đức', 'Hồ Chí Minh', 'The Opus One là phân khu căn hộ cao cấp hợp tác với SAMTY Nhật Bản, mang đến không gian sống chuẩn Nhật với thiết kế tối ưu và chất lượng xây dựng đẳng cấp.', 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800', 75000000, '3.5 - 8 tỷ', 9.5, 'Đang mở bán', 2500, 1200, 35, '2024-02-01', '2026-03-01', ARRAY['Hồ bơi Nhật Bản', 'Onsen', 'Gym', 'Sky Garden', 'Co-working space'], ARRAY['1PN', '2PN', '3PN']),

  ('The Beverly', 'Vinhomes', 'Vinhomes Grand Park, Phường Long Bình, TP. Thủ Đức', 'Thủ Đức', 'Hồ Chí Minh', 'The Beverly là phân khu căn hộ phong cách Beverly Hills với thiết kế sang trọng, view trực diện công viên 36ha và biển hồ nhân tạo.', 'https://images.unsplash.com/photo-1460317442991-0ec209397118?w=800', 50000000, '1.6 - 15 tỷ', 9.5, 'Đang mở bán', 5000, 4200, 32, '2022-06-01', '2025-06-01', ARRAY['Hồ bơi vô cực', 'Clubhouse', 'BBQ Garden', 'Kids playground', 'Tennis court'], ARRAY['Studio', '1PN', '2PN', '3PN', 'Duplex']),

  ('Glory Heights', 'Vinhomes', 'Vinhomes Grand Park, TP. Thủ Đức', 'Thủ Đức', 'Hồ Chí Minh', 'Glory Heights là phân khu căn hộ ultra-premium với thiết kế full LED sang trọng, tiện ích chuẩn resort 5 sao, vị trí liền kề Vincom Mega Mall.', 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800', 85000000, '5 - 20 tỷ', 9.5, 'Đang mở bán', 1800, 600, 40, '2024-09-01', '2027-06-01', ARRAY['Sky Pool', 'Cigar Lounge', 'Private Cinema', 'Spa & Wellness', 'Concierge 24/7'], ARRAY['2PN', '3PN', '4PN', 'Penthouse', 'Sky Villa']),

  ('Vinhomes Central Park', 'Vinhomes', '208 Nguyễn Hữu Cảnh, Phường 22, Quận Bình Thạnh', 'Bình Thạnh', 'Hồ Chí Minh', 'Vinhomes Central Park là khu đô thị cao cấp bên bờ sông Sài Gòn với tòa tháp Landmark 81 biểu tượng - tòa nhà cao nhất Việt Nam.', 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800', 90000000, '5 - 50 tỷ', 9.8, 'Đã bàn giao', 10000, 10000, 81, '2015-06-01', '2018-12-01', ARRAY['Landmark 81', 'Công viên 14ha', 'Hồ bơi', 'Gym', 'Vincom Center'], ARRAY['1PN', '2PN', '3PN', 'Penthouse']),

  -- Masterise Homes Projects
  ('Lumiere Boulevard', 'Masterise Homes', 'Vinhomes Grand Park, TP. Thủ Đức', 'Thủ Đức', 'Hồ Chí Minh', 'Lumiere Boulevard là tổ hợp căn hộ cao cấp mang thương hiệu Lumiere, với vị trí đắc địa kế bên công viên 36ha và biển hồ nhân tạo của Vinhomes Grand Park.', 'https://images.unsplash.com/photo-1515263487990-61b07816b324?w=800', 70000000, '3 - 12 tỷ', 9.2, 'Đang mở bán', 2422, 1800, 39, '2021-11-01', '2025-03-01', ARRAY['Hồ bơi tràn viền', 'Sky Lounge', 'Yoga Deck', 'Smart Home', 'Concierge'], ARRAY['1PN', '2PN', '3PN', 'Penthouse']),

  ('The Global City', 'Masterise Homes', 'An Phú, TP. Thủ Đức', 'Thủ Đức', 'Hồ Chí Minh', 'The Global City là khu Downtown sang trọng & hiện đại bậc nhất TP. Thủ Đức, được phát triển với đối tác Foster + Partners - kiến trúc sư hàng đầu thế giới.', 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800', 160000000, '10 - 50 tỷ', 9.0, 'Sắp mở bán', 8000, 0, 50, '2025-06-01', '2029-12-01', ARRAY['Kênh đào Venice', 'Marina', 'Helipad', 'Private Club', 'International School'], ARRAY['2PN', '3PN', '4PN', 'Penthouse', 'Branded Residence']),

  ('Masteri Grand View', 'Masterise Homes', 'The Global City, An Phú, TP. Thủ Đức', 'Thủ Đức', 'Hồ Chí Minh', 'Masteri Grand View là phân khu căn hộ đầu tiên của The Global City với 27 tòa tháp nằm dọc theo kênh đào, mang đến tầm view đẳng cấp.', 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800', 140000000, '8 - 30 tỷ', 9.0, 'Đang mở bán', 3000, 500, 45, '2024-12-01', '2028-06-01', ARRAY['Canal View', 'Infinity Pool', 'Sky Garden', 'Premium Gym', 'Co-living Space'], ARRAY['1PN', '2PN', '3PN', 'Duplex']),

  ('One Central Saigon', 'Masterise Homes', 'Khu tứ giác Bến Thành, Quận 1', 'Quận 1', 'Hồ Chí Minh', 'One Central Saigon là biểu tượng danh giá tại khu tứ giác Chợ Bến Thành - trung tâm đắt địa nhất Quận 1, phát triển bởi Masterise Homes.', 'https://images.unsplash.com/photo-1524813686514-a57563d77965?w=800', 350000000, '30 - 150 tỷ', 9.3, 'Sắp mở bán', 500, 0, 55, '2025-09-01', '2029-12-01', ARRAY['Rooftop Bar', 'Michelin Restaurant', 'Spa Retreat', 'Art Gallery', 'Valet Parking'], ARRAY['2PN', '3PN', '4PN', 'Penthouse', 'Super Penthouse']),

  ('Masteri Thao Dien', 'Masterise Homes', 'Xa lộ Hà Nội, Phường Thảo Điền, TP. Thủ Đức', 'Thủ Đức', 'Hồ Chí Minh', 'Masteri Thảo Điền là dự án căn hộ cao cấp đầu tiên của Masterise Homes, nằm ngay trung tâm khu Thảo Điền sầm uất.', 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800', 75000000, '3.5 - 15 tỷ', 9.0, 'Đã bàn giao', 1500, 1500, 45, '2015-03-01', '2017-12-01', ARRAY['Hồ bơi', 'Gym', 'Sky Garden', 'BBQ Area', 'Kids Club'], ARRAY['1PN', '2PN', '3PN', 'Penthouse']),

  -- Novaland Projects
  ('The Grand Manhattan', 'Novaland', '100 Cô Giang, Phường Cô Giang, Quận 1', 'Quận 1', 'Hồ Chí Minh', 'The Grand Manhattan là dự án căn hộ hạng sang tại trung tâm Quận 1, gần Chợ Bến Thành và Công viên 23/9, đã hoàn thành cất nóc.', 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800', 180000000, '15 - 80 tỷ', 7.5, 'Đang xây dựng', 1000, 750, 40, '2019-03-01', '2025-12-01', ARRAY['Rooftop Pool', 'Sky Garden', 'Premium Lobby', 'Smart Parking', 'Concierge'], ARRAY['1PN', '2PN', '3PN', 'Penthouse']),

  ('The Sun Avenue', 'Novaland', '28 Mai Chí Thọ, Phường An Phú, Quận 2', 'Thủ Đức', 'Hồ Chí Minh', 'The Sun Avenue là khu căn hộ cao cấp tại mặt tiền Mai Chí Thọ, gần Metro và các tiện ích thương mại sầm uất.', 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800', 65000000, '3 - 8 tỷ', 8.0, 'Đã bàn giao', 1800, 1800, 28, '2016-09-01', '2020-06-01', ARRAY['Hồ bơi', 'Gym', 'Sân tennis', 'BBQ', 'Khu vui chơi trẻ em'], ARRAY['1PN', '2PN', '3PN']),

  ('Kingston Residence', 'Novaland', '146 Nguyễn Văn Trỗi, Phường 8, Quận Phú Nhuận', 'Phú Nhuận', 'Hồ Chí Minh', 'Kingston Residence là dự án căn hộ cao cấp tại trung tâm Phú Nhuận, gần sân bay Tân Sơn Nhất với thiết kế hiện đại.', 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800', 80000000, '5 - 12 tỷ', 8.5, 'Đã bàn giao', 250, 250, 25, '2017-06-01', '2020-12-01', ARRAY['Hồ bơi tầng thượng', 'Gym', 'Sauna', 'Sky Lounge', 'Hầm xe thông minh'], ARRAY['2PN', '3PN', 'Penthouse']),

  ('Saigon Royal', 'Novaland', '34-35 Bến Vân Đồn, Phường 12, Quận 4', 'Quận 4', 'Hồ Chí Minh', 'Saigon Royal là dự án căn hộ view sông Sài Gòn tuyệt đẹp, nằm ngay bên Cầu Nguyễn Tất Thành.', 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800', 70000000, '4 - 15 tỷ', 7.8, 'Đã bàn giao', 600, 600, 30, '2016-01-01', '2019-06-01', ARRAY['River View', 'Hồ bơi', 'Gym', 'Yoga Room', 'BBQ'], ARRAY['1PN', '2PN', '3PN']),

  -- Gamuda Land Projects
  ('Celadon City', 'Gamuda Land', 'Đường Nguyễn Hữu Thọ, Phường Sơn Kỳ, Quận Tân Phú', 'Tân Phú', 'Hồ Chí Minh', 'Celadon City là khu đô thị xanh đẳng cấp với hơn 16ha cây xanh và mặt nước, được Gamuda Land phát triển theo tiêu chuẩn Malaysia.', 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800', 75000000, '4.9 - 7.9 tỷ', 9.0, 'Đang mở bán', 6000, 4500, 35, '2010-01-01', '2025-12-01', ARRAY['Hồ cảnh quan 3.2ha', 'Công viên trung tâm', 'Aeon Mall', 'Trường quốc tế', 'Gym'], ARRAY['1PN', '2PN', '3PN', 'Duplex']),

  ('Eaton Park', 'Gamuda Land', 'Mai Chí Thọ, Phường An Phú, TP. Thủ Đức', 'Thủ Đức', 'Hồ Chí Minh', 'Eaton Park là dự án căn hộ cao cấp ngay mặt tiền Mai Chí Thọ với view sông Sài Gòn, được Gamuda Land nhận chuyển nhượng và phát triển.', 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800', 120000000, '6 - 15 tỷ', 8.8, 'Đang mở bán', 1200, 400, 40, '2024-03-01', '2027-06-01', ARRAY['River View', 'Infinity Pool', 'Sky Garden', 'Tennis Court', 'Jogging Track'], ARRAY['1PN', '2PN', '3PN', 'Penthouse']),

  -- Other Projects
  ('The 9 Stellars', 'Sơn Kim Land', 'Xa lộ Hà Nội, Phường Long Bình, TP. Thủ Đức', 'Thủ Đức', 'Hồ Chí Minh', 'The 9 Stellars là khu đô thị TOD đầu tiên tại TP.HCM, nằm ngay điểm cuối Metro Bến Thành - Suối Tiên, kết nối hoàn hảo giao thông công cộng.', 'https://images.unsplash.com/photo-1600585152220-90363fe7e115?w=800', 65000000, '3 - 10 tỷ', 8.5, 'Đang mở bán', 3500, 1500, 30, '2023-06-01', '2026-12-01', ARRAY['Ga Metro', 'Shopping Mall', 'Hồ bơi', 'Gym', 'Công viên 5ha'], ARRAY['Studio', '1PN', '2PN', '3PN']),

  ('The Privia', 'Khang Điền', 'Đường Nguyễn Duy Trinh, Phường Long Trường, TP. Thủ Đức', 'Thủ Đức', 'Hồ Chí Minh', 'The Privia là khu căn hộ cao cấp thuộc khu đô thị Khang Điền, với thiết kế xanh và tiện ích đồng bộ.', 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800', 55000000, '2.5 - 6 tỷ', 9.3, 'Đang mở bán', 1500, 800, 25, '2024-01-01', '2026-06-01', ARRAY['Hồ bơi', 'Gym', 'Công viên nội khu', 'Trường học', 'TTTM'], ARRAY['1PN', '2PN', '3PN']),

  ('The Antonia', 'Phú Mỹ Hưng', 'Khu đô thị Phú Mỹ Hưng, Quận 7', 'Quận 7', 'Hồ Chí Minh', 'The Antonia là căn hộ cao cấp tại trung tâm Phú Mỹ Hưng với thiết kế sang trọng và view công viên.', 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800', 90000000, '6 - 18 tỷ', 9.8, 'Đang mở bán', 600, 350, 30, '2023-09-01', '2026-03-01', ARRAY['Club House', 'Hồ bơi', 'Gym', 'Sân tennis', 'Vườn BBQ'], ARRAY['2PN', '3PN', '4PN', 'Penthouse']),

  ('The Peak Midtown', 'Phú Mỹ Hưng', 'Midtown Phú Mỹ Hưng, Quận 7', 'Quận 7', 'Hồ Chí Minh', 'The Peak Midtown là tháp căn hộ biểu tượng của Midtown với view panorama toàn cảnh Phú Mỹ Hưng.', 'https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=800', 100000000, '8 - 25 tỷ', 9.8, 'Đã bàn giao', 450, 450, 35, '2019-06-01', '2022-12-01', ARRAY['Sky Lounge', 'Hồ bơi vô cực', 'Gym cao cấp', 'Spa', 'Sân golf mini'], ARRAY['2PN', '3PN', 'Penthouse']),

  ('Feliz en Vista', 'CapitaLand', 'Song Hành, Phường An Phú, TP. Thủ Đức', 'Thủ Đức', 'Hồ Chí Minh', 'Feliz en Vista là dự án căn hộ cao cấp view sông Sài Gòn, được CapitaLand phát triển với chất lượng Singapore.', 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800', 75000000, '4 - 12 tỷ', 9.5, 'Đã bàn giao', 1100, 1100, 36, '2016-03-01', '2020-06-01', ARRAY['Hồ bơi', 'Gym', 'Tennis', 'BBQ', 'Sân chơi trẻ em', 'Jogging track'], ARRAY['1PN', '2PN', '3PN', 'Duplex', 'Penthouse']),

  ('D''Capitale', 'CapitaLand', '119 Trần Duy Hưng, Quận Cầu Giấy, Hà Nội', 'Cầu Giấy', 'Hà Nội', 'D''Capitale là tổ hợp căn hộ cao cấp tại trung tâm Cầu Giấy với thiết kế hiện đại và tiện ích đẳng cấp.', 'https://images.unsplash.com/photo-1600607687644-aac4c3eac7f4?w=800', 65000000, '3 - 10 tỷ', 9.2, 'Đã bàn giao', 1800, 1800, 39, '2017-09-01', '2020-12-01', ARRAY['Vincom Center', 'Hồ bơi', 'Gym', 'Sky Bar', 'Kids Zone'], ARRAY['1PN', '2PN', '3PN', 'Penthouse']),

  ('Moonlight Boulevard', 'Hưng Thịnh Corp', '510 Kinh Dương Vương, Phường An Lạc, Quận Bình Tân', 'Bình Tân', 'Hồ Chí Minh', 'Moonlight Boulevard là dự án căn hộ tầm trung với thiết kế hiện đại và giá hợp lý tại Bình Tân.', 'https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=800', 45000000, '2 - 4 tỷ', 8.0, 'Đang mở bán', 2000, 1500, 20, '2022-03-01', '2025-06-01', ARRAY['Hồ bơi', 'Gym', 'Shophouse', 'Công viên', 'Trường mầm non'], ARRAY['1PN', '2PN', '3PN']),

  ('Akari City', 'Nam Long Group', 'Đường Võ Văn Kiệt, Phường An Lạc, Quận Bình Tân', 'Bình Tân', 'Hồ Chí Minh', 'Akari City là khu đô thị phong cách Nhật Bản với thiết kế xanh và giá hợp lý cho gia đình trẻ.', 'https://images.unsplash.com/photo-1600585152915-d208bec867a1?w=800', 48000000, '2 - 5 tỷ', 8.5, 'Đang mở bán', 3500, 2500, 25, '2021-06-01', '2025-12-01', ARRAY['Kênh đào Nhật Bản', 'Hồ bơi', 'Gym', 'Công viên 2ha', 'Trường học'], ARRAY['1PN', '2PN', '3PN'])
ON CONFLICT (name) DO UPDATE SET
  developer = EXCLUDED.developer,
  location = EXCLUDED.location,
  district = EXCLUDED.district,
  city = EXCLUDED.city,
  description = EXCLUDED.description,
  image = EXCLUDED.image,
  price_per_sqm = EXCLUDED.price_per_sqm,
  price_range = EXCLUDED.price_range,
  legal_score = EXCLUDED.legal_score,
  status = EXCLUDED.status,
  total_units = EXCLUDED.total_units,
  sold_units = EXCLUDED.sold_units,
  floors = EXCLUDED.floors,
  launch_date = EXCLUDED.launch_date,
  completion_date = EXCLUDED.completion_date,
  amenities = EXCLUDED.amenities,
  apartment_types = EXCLUDED.apartment_types,
  updated_at = now();

-- Success message
SELECT 'Seed data completed!' as message,
       (SELECT count(*) FROM developers) as total_developers,
       (SELECT count(*) FROM projects) as total_projects;
