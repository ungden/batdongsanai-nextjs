// SEO Configuration for all public pages

export interface PageSEO {
  title: string;
  description: string;
  keywords: string;
  ogType?: 'website' | 'article';
}

export const SITE_CONFIG = {
  name: 'Realprofit.vn',
  url: 'https://realprofit.vn',
  defaultImage: 'https://realprofit.vn/og-image.png',
  twitterHandle: '@realprofitvn',
  locale: 'vi_VN',
};

// SEO metadata for each public page
export const PAGE_SEO: Record<string, PageSEO> = {
  '/': {
    title: 'Realprofit.vn - Nền tảng Đầu tư BĐS Thông minh #1 Việt Nam',
    description: 'Phân tích pháp lý, tính toán ROI và khám phá cơ hội đầu tư bất động sản tốt nhất. Kiểm tra an toàn pháp lý dự án với AI.',
    keywords: 'bất động sản, đầu tư bđs, pháp lý dự án, ROI bất động sản, kiểm tra pháp lý, realprofit',
  },
  '/projects': {
    title: 'Dự án Bất động sản | Realprofit.vn',
    description: 'Danh sách dự án bất động sản đã được kiểm tra pháp lý. So sánh giá, vị trí, chủ đầu tư và điểm an toàn.',
    keywords: 'dự án bất động sản, danh sách dự án, chung cư mới, dự án căn hộ, bđs việt nam',
  },
  '/explore': {
    title: 'Khám phá Dự án | Realprofit.vn',
    description: 'Tìm kiếm và khám phá các dự án bất động sản theo khu vực, giá và tiện ích. Lọc dự án theo nhu cầu đầu tư.',
    keywords: 'tìm kiếm dự án, khám phá bđs, dự án theo khu vực, lọc dự án',
  },
  '/calculator': {
    title: 'Tính toán Đầu tư BĐS | Calculator | Realprofit.vn',
    description: 'Công cụ tính toán lợi nhuận đầu tư bất động sản. Dự phóng ROI, lịch trả nợ, dòng tiền cho thuê.',
    keywords: 'tính toán đầu tư, ROI calculator, lợi nhuận bđs, công cụ đầu tư, tính lãi vay',
  },
  '/calculator/advanced': {
    title: 'Calculator Nâng cao | Realprofit.vn',
    description: 'Công cụ phân tích đầu tư nâng cao với AI. Dự báo giá, phân tích rủi ro, so sánh kịch bản đầu tư.',
    keywords: 'phân tích đầu tư nâng cao, AI calculator, dự báo giá bđs, phân tích rủi ro',
  },
  '/marketplace': {
    title: 'Sàn Giao dịch BĐS | Marketplace | Realprofit.vn',
    description: 'Mua bán, cho thuê bất động sản uy tín. Tin đăng đã xác minh, kết nối trực tiếp với chủ nhà.',
    keywords: 'mua bán bđs, cho thuê căn hộ, sàn giao dịch, tin đăng bđs',
  },
  '/market-overview': {
    title: 'Tổng quan Thị trường BĐS | Realprofit.vn',
    description: 'Dữ liệu thị trường bất động sản cập nhật. Xu hướng giá, biểu đồ tăng trưởng theo khu vực.',
    keywords: 'thị trường bđs, xu hướng giá, dữ liệu bđs, tăng trưởng bđs',
  },
  '/market-intelligence': {
    title: 'Market Intelligence | Phân tích Thị trường | Realprofit.vn',
    description: 'Báo cáo phân tích thị trường bất động sản chuyên sâu. Catalyst, hạ tầng, chính sách ảnh hưởng giá.',
    keywords: 'market intelligence, phân tích thị trường, báo cáo bđs, catalyst bđs',
  },
  '/legal-matrix': {
    title: 'Ma trận Pháp lý | Legal Matrix | Realprofit.vn',
    description: 'Kiểm tra pháp lý dự án bất động sản toàn diện. Sổ đỏ, giấy phép xây dựng, quy hoạch.',
    keywords: 'pháp lý bđs, kiểm tra sổ đỏ, giấy phép xây dựng, legal matrix',
  },
  '/developers': {
    title: 'Chủ đầu tư Uy tín | Realprofit.vn',
    description: 'Danh sách chủ đầu tư bất động sản uy tín tại Việt Nam. Đánh giá, lịch sử dự án, độ tin cậy.',
    keywords: 'chủ đầu tư bđs, developer uy tín, nhà phát triển, vinhomes, novaland',
  },
  '/compare': {
    title: 'So sánh Dự án | Realprofit.vn',
    description: 'So sánh chi tiết các dự án bất động sản. Giá, vị trí, pháp lý, tiện ích song song.',
    keywords: 'so sánh dự án, compare bđs, đối chiếu dự án',
  },
  '/news': {
    title: 'Tin tức BĐS | Realprofit.vn',
    description: 'Tin tức thị trường bất động sản mới nhất. Chính sách, quy hoạch, xu hướng đầu tư.',
    keywords: 'tin tức bđs, news, chính sách bđs, quy hoạch',
  },
  '/portfolio': {
    title: 'Danh mục Đầu tư | Portfolio | Realprofit.vn',
    description: 'Quản lý danh mục đầu tư bất động sản cá nhân. Theo dõi hiệu suất, cảnh báo giá.',
    keywords: 'portfolio bđs, danh mục đầu tư, quản lý tài sản',
  },
  '/favorites': {
    title: 'Dự án Yêu thích | Realprofit.vn',
    description: 'Danh sách dự án bất động sản đã lưu. Theo dõi và so sánh dự án yêu thích.',
    keywords: 'dự án yêu thích, saved projects, theo dõi dự án',
  },
};

// Generate page title with site name
export const generateTitle = (pageTitle?: string): string => {
  if (!pageTitle) return SITE_CONFIG.name;
  return `${pageTitle} | ${SITE_CONFIG.name}`;
};

// Get SEO config for a path
export const getPageSEO = (path: string): PageSEO => {
  // Remove trailing slash and query params
  const cleanPath = path.split('?')[0].replace(/\/$/, '') || '/';

  // Check for exact match
  if (PAGE_SEO[cleanPath]) {
    return PAGE_SEO[cleanPath];
  }

  // Check for dynamic routes
  if (cleanPath.startsWith('/projects/')) {
    return {
      title: 'Chi tiết Dự án | Realprofit.vn',
      description: 'Thông tin chi tiết dự án bất động sản. Giá, pháp lý, tiện ích, vị trí và đánh giá.',
      keywords: 'chi tiết dự án, thông tin dự án, đánh giá dự án',
    };
  }

  if (cleanPath.startsWith('/developers/')) {
    return {
      title: 'Chi tiết Chủ đầu tư | Realprofit.vn',
      description: 'Thông tin chi tiết chủ đầu tư. Lịch sử dự án, đánh giá, độ tin cậy.',
      keywords: 'chủ đầu tư, developer, thông tin nhà phát triển',
    };
  }

  if (cleanPath.startsWith('/marketplace/listing/')) {
    return {
      title: 'Chi tiết Tin đăng | Marketplace | Realprofit.vn',
      description: 'Chi tiết tin đăng mua bán, cho thuê bất động sản.',
      keywords: 'tin đăng bđs, chi tiết listing, mua bán bđs',
    };
  }

  // Default SEO
  return PAGE_SEO['/'];
};

// Canonical URL helper
export const getCanonicalUrl = (path: string): string => {
  const cleanPath = path.split('?')[0].replace(/\/$/, '') || '/';
  return `${SITE_CONFIG.url}${cleanPath}`;
};
