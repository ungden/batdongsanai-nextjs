"use client";

import { NavLink, useLocation } from "react-router-dom";
import {
  Home,
  TrendingUp,
  Calculator,
  Heart,
  Users,
  Newspaper,
  Shield,
  FileText,
  Briefcase,
  Calendar,
  Sparkles,
  GitCompare,
  Store
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { usePermissions } from "@/hooks/usePermissions";
import { cn } from "@/lib/utils";
import { useCompareStore } from "@/stores/compareStore";

const mainItems = [
  { title: "Trang chủ", url: "/", icon: Home },
  { title: "Tổng quan thị trường", url: "/market-overview", icon: TrendingUp, highlight: true },
  { title: "Market Intelligence", url: "/market-intelligence", icon: Sparkles, highlight: true },
  { title: "Chợ BĐS", url: "/marketplace", icon: Store, highlight: true },
  { title: "So sánh dự án", url: "/compare", icon: GitCompare, badge: "dynamic" },
  { title: "Danh mục đầu tư", url: "/portfolio", icon: Briefcase },
  { title: "Lịch hẹn", url: "/appointments", icon: Calendar },
  { title: "Yêu thích", url: "/favorites", icon: Heart },
  { title: "Chủ đầu tư", url: "/developers", icon: Users },
  { title: "Tin tức", url: "/news", icon: Newspaper },
];

const toolItems = [
  { title: "Tính toán đầu tư", url: "/calculator", icon: Calculator },
  { title: "Phân tích dự án", url: "/project-analysis", icon: FileText, badge: "VIP" },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const { user } = useAuth();
  const { isAdmin, loading: permissionsLoading } = usePermissions();
  const { compareList } = useCompareStore();
  const currentPath = location.pathname;
  const collapsed = state === "collapsed";

  const isActive = (path: string) => {
    if (path === "/") return currentPath === "/";
    return currentPath.startsWith(path);
  };

  const getNavClassName = (path: string, highlight?: boolean) => {
    const baseClass = isActive(path) 
      ? "bg-white/20 text-white border-l-4 border-white font-semibold shadow-sm" 
      : "hover:bg-white/10 hover:text-white text-white/80 font-medium transition-all duration-200";
    
    if (highlight && !isActive(path)) {
      return `${baseClass} bg-white/5 border-l-2 border-white/30`;
    }
    
    return baseClass;
  };

  return (
    <Sidebar
      className={cn(
        "transition-all duration-300 ease-in-out bg-gradient-hero text-white border-r border-primary/20 shadow-lg",
        collapsed ? "w-16" : "w-64"
      )}
      collapsible="icon"
    >
      <SidebarHeader className="border-b border-white/20 px-5 py-6">
        {!collapsed && (
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-white tracking-tight">PropertyHub</h2>
            <p className="text-sm text-white/80">Thông tin BĐS Việt Nam</p>
          </div>
        )}
        {collapsed && (
          <div className="text-2xl font-black text-white text-center">P</div>
        )}
      </SidebarHeader>

      <SidebarContent className="px-3 py-6 flex flex-col h-full">
        <div className="space-y-6">
          {/* Main Navigation */}
          <SidebarGroup className="space-y-3">
            {!collapsed && (
              <SidebarGroupLabel className="px-2 text-white/70 text-xs uppercase tracking-wide">
                Điều hướng chính
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu className="space-y-2.5">
                {mainItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        className={`${getNavClassName(item.url, item.highlight)} block w-full rounded-lg py-2.5 px-3 flex items-center gap-3`}
                      >
                        <item.icon className="h-5 w-5" />
                        {!collapsed && <span>{item.title}</span>}
                        {item.highlight && !collapsed && (
                          <Badge variant="secondary" className="ml-auto text-xs font-bold px-2 bg-yellow-400 text-yellow-900">
                            HOT
                          </Badge>
                        )}
                        {item.badge === "dynamic" && compareList.length > 0 && !collapsed && (
                          <Badge variant="default" className="ml-auto text-xs font-bold px-2">
                            {compareList.length}
                          </Badge>
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Tools */}
          <SidebarGroup className="space-y-3">
            {!collapsed && (
              <SidebarGroupLabel className="px-2 text-white/70 text-xs uppercase tracking-wide">
                Công cụ
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu className="space-y-2.5">
                {toolItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        className={`${getNavClassName(item.url)} block w-full rounded-lg py-2.5 px-3 flex items-center gap-3`}
                      >
                        <item.icon className="h-5 w-5" />
                        {!collapsed && <span>{item.title}</span>}
                        {item.badge && !collapsed && (
                          <Badge className="ml-auto text-xs font-bold px-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0">
                            {item.badge}
                          </Badge>
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </div>

        {/* Admin Section */}
        <div className="mt-auto pt-6">
          {permissionsLoading ? (
            <SidebarGroup className="space-y-3">
              {!collapsed && (
                <SidebarGroupLabel className="px-2 text-red-200/80 text-xs uppercase tracking-wide">
                  Quản trị
                </SidebarGroupLabel>
              )}
              <SidebarGroupContent>
                <SidebarMenu className="space-y-2.5">
                  <Skeleton className="h-[42px] w-full rounded-lg bg-white/10" />
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ) : (
            user && isAdmin && (
              <SidebarGroup className="space-y-3">
                {!collapsed && (
                  <SidebarGroupLabel className="px-2 text-red-200/80 text-xs uppercase tracking-wide">
                    Quản trị
                  </SidebarGroupLabel>
                )}
                <SidebarGroupContent>
                  <SidebarMenu className="space-y-2.5">
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <NavLink
                          to="/admin"
                          className={`${isActive("/admin") 
                            ? "bg-red-500/20 text-red-200 font-semibold border-l-4 border-red-300" 
                            : "hover:bg-red-500/10 hover:text-red-200 font-medium transition-all duration-200"} block w-full rounded-lg py-2.5 px-3 flex items-center gap-3`}
                        >
                          <Shield className="h-5 w-5" />
                          {!collapsed && <span>Admin Panel</span>}
                          {!collapsed && (
                            <Badge variant="destructive" className="ml-auto text-xs font-bold px-2">
                              ADMIN
                            </Badge>
                          )}
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            )
          )}
        </div>
      </SidebarContent>
    </Sidebar>
  );
}