// Subscription tiers and features configuration

export type SubscriptionTier = 'free' | 'premium' | 'pro';

export interface TierFeature {
  name: string;
  description: string;
  free: boolean | number | string;
  premium: boolean | number | string;
  pro: boolean | number | string;
}

export interface SubscriptionPlan {
  id: SubscriptionTier;
  name: string;
  nameVi: string;
  description: string;
  monthlyPrice: number; // VND
  yearlyPrice: number; // VND (with discount)
  yearlyDiscount: number; // percentage
  features: string[];
  highlighted?: boolean;
  badge?: string;
}

// Feature comparison matrix
export const FEATURES: TierFeature[] = [
  {
    name: 'Xem dự án',
    description: 'Truy cập thông tin cơ bản dự án',
    free: true,
    premium: true,
    pro: true,
  },
  {
    name: 'So sánh dự án',
    description: 'So sánh tối đa số dự án',
    free: 2,
    premium: 5,
    pro: 'Không giới hạn',
  },
  {
    name: 'Calculator ROI',
    description: 'Tính toán lợi nhuận đầu tư',
    free: 'Cơ bản',
    premium: 'Nâng cao',
    pro: 'Chuyên sâu + AI',
  },
  {
    name: 'Báo cáo phân tích',
    description: 'Truy cập báo cáo chi tiết',
    free: false,
    premium: true,
    pro: true,
  },
  {
    name: 'Dữ liệu thị trường',
    description: 'Thống kê và xu hướng thị trường',
    free: 'Cơ bản',
    premium: 'Chi tiết',
    pro: 'Real-time + Lịch sử',
  },
  {
    name: 'Cảnh báo giá',
    description: 'Nhận thông báo khi giá thay đổi',
    free: false,
    premium: '5 dự án',
    pro: 'Không giới hạn',
  },
  {
    name: 'Export PDF',
    description: 'Xuất báo cáo PDF',
    free: false,
    premium: true,
    pro: true,
  },
  {
    name: 'AI Assistant',
    description: 'Trợ lý AI phân tích dự án',
    free: false,
    premium: '20 câu/tháng',
    pro: 'Không giới hạn',
  },
  {
    name: 'Legal Matrix',
    description: 'Ma trận pháp lý chi tiết',
    free: false,
    premium: true,
    pro: true,
  },
  {
    name: 'Hỗ trợ ưu tiên',
    description: 'Hỗ trợ khách hàng ưu tiên',
    free: false,
    premium: false,
    pro: true,
  },
  {
    name: 'API Access',
    description: 'Truy cập API cho developers',
    free: false,
    premium: false,
    pro: true,
  },
];

// Subscription plans
export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'free',
    name: 'Free',
    nameVi: 'Miễn phí',
    description: 'Khám phá cơ bản các dự án',
    monthlyPrice: 0,
    yearlyPrice: 0,
    yearlyDiscount: 0,
    features: [
      'Xem thông tin cơ bản dự án',
      'So sánh tối đa 2 dự án',
      'Calculator ROI cơ bản',
      'Dữ liệu thị trường cơ bản',
    ],
  },
  {
    id: 'premium',
    name: 'Premium',
    nameVi: 'Premium',
    description: 'Dành cho nhà đầu tư cá nhân',
    monthlyPrice: 199000,
    yearlyPrice: 1990000,
    yearlyDiscount: 17,
    highlighted: true,
    badge: 'Phổ biến nhất',
    features: [
      'Tất cả tính năng Free',
      'So sánh tối đa 5 dự án',
      'Calculator ROI nâng cao',
      'Báo cáo phân tích chi tiết',
      'Dữ liệu thị trường chi tiết',
      'Cảnh báo giá (5 dự án)',
      'Export PDF',
      'AI Assistant (20 câu/tháng)',
      'Legal Matrix đầy đủ',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    nameVi: 'Chuyên nghiệp',
    description: 'Dành cho nhà đầu tư chuyên nghiệp',
    monthlyPrice: 499000,
    yearlyPrice: 4990000,
    yearlyDiscount: 17,
    features: [
      'Tất cả tính năng Premium',
      'So sánh không giới hạn',
      'Calculator AI chuyên sâu',
      'Dữ liệu real-time + lịch sử',
      'Cảnh báo giá không giới hạn',
      'AI Assistant không giới hạn',
      'Hỗ trợ ưu tiên 24/7',
      'API Access',
      'White-label reports',
    ],
  },
];

// Feature flags - what requires which tier
export const FEATURE_REQUIREMENTS: Record<string, SubscriptionTier> = {
  'view-project': 'free',
  'compare-basic': 'free',
  'calculator-basic': 'free',
  'market-data-basic': 'free',

  'compare-advanced': 'premium',
  'calculator-advanced': 'premium',
  'analysis-reports': 'premium',
  'market-data-detailed': 'premium',
  'price-alerts-limited': 'premium',
  'export-pdf': 'premium',
  'ai-assistant-limited': 'premium',
  'legal-matrix': 'premium',

  'compare-unlimited': 'pro',
  'calculator-ai': 'pro',
  'market-data-realtime': 'pro',
  'price-alerts-unlimited': 'pro',
  'ai-assistant-unlimited': 'pro',
  'priority-support': 'pro',
  'api-access': 'pro',
};

// Helper to check if user has access to a feature
export const hasFeatureAccess = (
  userTier: SubscriptionTier,
  requiredTier: SubscriptionTier
): boolean => {
  const tierHierarchy: Record<SubscriptionTier, number> = {
    free: 0,
    premium: 1,
    pro: 2,
  };
  return tierHierarchy[userTier] >= tierHierarchy[requiredTier];
};

// Format price for display
export const formatPrice = (price: number): string => {
  if (price === 0) return 'Miễn phí';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(price);
};

// Get plan by ID
export const getPlanById = (id: SubscriptionTier): SubscriptionPlan | undefined => {
  return SUBSCRIPTION_PLANS.find(plan => plan.id === id);
};
