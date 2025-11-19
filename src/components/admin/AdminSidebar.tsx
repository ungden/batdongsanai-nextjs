"use client";

import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  LineChart,
  Sparkles,
  Users,
  Settings,
  Shield,
  Home,
  Database,
  BarChart3,
  Target,
  Newspaper,
  PenTool,
  CheckSquare
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
import { cn } from "@/lib/utils";

const mainItems = [
  { title: "Dashboard", url: "/admin/dashboard", icon: LayoutDashboard },
  { title: "Duyệt nội dung", url: "/admin/approvals", icon: CheckSquare, badge: "PENDING", badgeColor: "bg-orange-100 text-orange-700 border-orange-200" },
  { title: "Quản lý Leads", url: "/admin/leads", icon: Target, badge: "NEW", badgeColor: "bg-red-100 text-red-700 border-red-200" },
  { title: "Quản lý dữ liệu", url: "/admin/data-management", icon: Database },
  { title: "Analytics", url: "/admin/analytics", icon: BarChart3 },
  { title: "Quản lý người dùng", url: "/admin/users", icon: Users },
  { title: "Quản lý dự án", url: "/admin/projects", icon: FileText },
  { title: "Tin tức & Bài viết", url: "/admin/news", icon: Newspaper },
  { title: "Cài đặt hệ thống", url: "/admin/settings", icon: Settings },
  { title: "Nhật ký Admin", url: "/admin/logs", icon: Shield },
];

const aiTools = [
  { title: "Nghiên cứu Dự án", url: "/admin/research-factory", icon: Sparkles, badge: "AI" },
  { title: "Nghiên cứu Thị trường", url: "/admin/market-research-factory", icon: LineChart },
  { title: "Phân tích Chất xúc tác", url: "/admin/catalyst-factory", icon: Sparkles },
  { title: "Content Studio", url: "/admin/content-studio", icon: PenTool, badge: "Beta" },
];

export function AdminSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const collapsed = state === "collapsed";

  return (
    <Sidebar
      className={cn(
        "border-r border-sidebar-border bg-sidebar transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
      collapsible="icon"
    >
      <SidebarHeader className="border-b border-sidebar-border px-4 py-3 h-16 flex items-center justify-center bg-sidebar">
        {!collapsed ? (
          <div className="space-y-1 w-full">
            <h2 className="text-lg font-bold tracking-tight flex items-center gap-2 text-sidebar-foreground">
              <Shield className="w-5 h-5 text-sidebar-primary" />
              Admin Panel
            </h2>
            <p className="text-xs text-sidebar-foreground/60 pl-7">Realprofit.vn System</p>
          </div>
        ) : (
          <Shield className="w-6 h-6 text-sidebar-primary" />
        )}
      </SidebarHeader>

      <SidebarContent className="px-3 py-4 flex flex-col h-full overflow-y-auto custom-scrollbar bg-sidebar">
        <div className="space-y-6">
          {/* Home Link */}
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Về trang chủ">
                    <NavLink 
                      to="/" 
                      className={({ isActive }) => cn(
                        "flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                        "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                      )}
                    >
                      <Home className="h-5 w-5 flex-shrink-0" />
                      {!collapsed && <span>Về trang chủ</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Management Group */}
          <SidebarGroup className="space-y-2">
            {!collapsed && <SidebarGroupLabel className="px-2 text-xs uppercase tracking-wide text-sidebar-foreground/50 font-bold">Quản lý</SidebarGroupLabel>}
            <SidebarGroupContent>
              <SidebarMenu className="space-y-1">
                {mainItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild tooltip={item.title}>
                      <NavLink 
                        to={item.url} 
                        className={({ isActive }) => cn(
                          "flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors relative group",
                          isActive 
                            ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold shadow-sm border-l-4 border-sidebar-primary pl-2" 
                            : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                        )}
                      >
                        <item.icon className="h-5 w-5 flex-shrink-0" />
                        {!collapsed && (
                          <>
                            <span className="flex-1 truncate">{item.title}</span>
                            {item.badge && (
                              <Badge 
                                className={cn(
                                  "ml-auto text-[10px] px-1.5 h-5", 
                                  item.badgeColor || "bg-sidebar-primary/10 text-sidebar-primary border-sidebar-primary/20"
                                )}
                                variant="outline"
                              >
                                {item.badge}
                              </Badge>
                            )}
                          </>
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* AI Tools Group */}
          <SidebarGroup className="space-y-2">
            {!collapsed && <SidebarGroupLabel className="px-2 text-xs uppercase tracking-wide text-blue-500 font-bold">Công cụ AI</SidebarGroupLabel>}
            <SidebarGroupContent>
              <SidebarMenu className="space-y-1">
                {aiTools.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild tooltip={item.title}>
                      <NavLink 
                        to={item.url} 
                        className={({ isActive }) => cn(
                          "flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors relative",
                          isActive 
                            ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold shadow-sm border-l-4 border-blue-500 pl-2" 
                            : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                        )}
                      >
                        <item.icon className="h-5 w-5 flex-shrink-0" />
                        {!collapsed && (
                          <>
                            <span className="flex-1 truncate">{item.title}</span>
                            {item.badge && (
                              <Badge className="ml-auto bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20 text-[10px] px-1.5 h-5">
                                {item.badge}
                              </Badge>
                            )}
                          </>
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}