import {
  Home, TrendingUp, Calculator, Heart, Users, Newspaper,
  Briefcase, Calendar, Sparkles, GitCompare, Store, Building2,
  BarChart3, FileText, Shield, Settings
} from "lucide-react";

export interface NavItem {
  title: string;
  url: string;
  icon: any;
  badge?: string;
  description?: string;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

// Main user navigation - simplified
export const USER_NAV_GROUPS: NavGroup[] = [
  {
    label: "Khám phá",
    items: [
      {
        title: "Trang chủ",
        url: "/",
        icon: Home,
        description: "Tổng quan và tìm kiếm nhanh"
      },
      {
        title: "Dự án",
        url: "/projects",
        icon: Building2,
        description: "Danh sách tất cả dự án BĐS"
      },
      {
        title: "Thị trường",
        url: "/market-overview",
        icon: TrendingUp,
        description: "Dữ liệu và xu hướng thị trường"
      },
    ]
  },
  {
    label: "Công cụ",
    items: [
      {
        title: "Chợ BĐS",
        url: "/marketplace",
        icon: Store,
        description: "Mua bán, cho thuê BĐS"
      },
      {
        title: "So sánh",
        url: "/compare",
        icon: GitCompare,
        badge: "compare",
        description: "So sánh các dự án"
      },
      {
        title: "Calculator",
        url: "/calculator",
        icon: Calculator,
        description: "Tính toán đầu tư"
      },
    ]
  },
  {
    label: "Cá nhân",
    items: [
      {
        title: "Portfolio",
        url: "/portfolio",
        icon: Briefcase,
        description: "Danh mục đầu tư cá nhân"
      },
      {
        title: "Yêu thích",
        url: "/favorites",
        icon: Heart,
        description: "Dự án đã lưu"
      },
      {
        title: "Lịch hẹn",
        url: "/appointments",
        icon: Calendar,
        description: "Quản lý lịch hẹn"
      },
    ]
  },
  {
    label: "Thông tin",
    items: [
      {
        title: "Chủ đầu tư",
        url: "/developers",
        icon: Users,
        description: "Thông tin chủ đầu tư"
      },
      {
        title: "Tin tức",
        url: "/news",
        icon: Newspaper,
        description: "Tin tức thị trường"
      },
    ]
  }
];

// Admin navigation - consolidated
export const ADMIN_NAV_GROUPS: NavGroup[] = [
  {
    label: "Tổng quan",
    items: [
      { title: "Dashboard", url: "/admin/dashboard", icon: Home },
      { title: "Approvals", url: "/admin/approvals", icon: FileText },
    ]
  },
  {
    label: "Quản lý",
    items: [
      { title: "Projects", url: "/admin/projects", icon: Building2 },
      { title: "Pipeline", url: "/admin/pipeline", icon: BarChart3 },
      { title: "Users & Leads", url: "/admin/users", icon: Users },
      { title: "Developers", url: "/admin/developers", icon: Briefcase },
    ]
  },
  {
    label: "AI Tools",
    items: [
      { title: "AI Scout", url: "/admin/ai-scout", icon: Sparkles },
      { title: "Research Factory", url: "/admin/research-factory", icon: TrendingUp },
      { title: "Content Studio", url: "/admin/content-studio", icon: FileText },
    ]
  },
  {
    label: "Hệ thống",
    items: [
      { title: "Analytics", url: "/admin/analytics", icon: BarChart3 },
      { title: "Settings", url: "/admin/settings", icon: Settings },
    ]
  }
];

// Bottom navigation for mobile
export const MOBILE_BOTTOM_NAV: NavItem[] = [
  { title: "Home", url: "/", icon: Home },
  { title: "Dự án", url: "/projects", icon: Building2 },
  { title: "Market", url: "/market-overview", icon: TrendingUp },
  { title: "Saved", url: "/favorites", icon: Heart },
  { title: "Profile", url: "/profile", icon: Users },
];

// Quick actions for home page
export const QUICK_ACTIONS = [
  {
    title: "Tìm dự án",
    description: "Khám phá dự án BĐS",
    url: "/projects",
    icon: Building2,
    color: "blue",
  },
  {
    title: "Tính toán",
    description: "ROI & dòng tiền",
    url: "/calculator",
    icon: Calculator,
    color: "amber",
  },
  {
    title: "Thị trường",
    description: "Dữ liệu & xu hướng",
    url: "/market-overview",
    icon: TrendingUp,
    color: "green",
  },
  {
    title: "Chợ BĐS",
    description: "Mua bán, cho thuê",
    url: "/marketplace",
    icon: Store,
    color: "purple",
  },
];
