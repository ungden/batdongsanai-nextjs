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
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";

const mainItems = [
  { title: "Dashboard", url: "/admin/dashboard", icon: LayoutDashboard },
  { title: "Quản lý Leads", url: "/admin/leads", icon: Target, badge: "AI" },
  { title: "Quản lý dữ liệu", url: "/admin/data-management", icon: Database },
  { title: "Analytics", url: "/admin/analytics", icon: BarChart3 },
  { title: "Quản lý người dùng", url: "/admin/users", icon: Users },
  { title: "Quản lý dự án", url: "/admin/projects", icon: FileText },
  { title: "Cài đặt hệ thống", url: "/admin/settings", icon: Settings },
  { title: "Nhật ký Admin", url: "/admin/logs", icon: Shield },
];

const aiTools = [
  { title: "Nghiên cứu Dự án", url: "/admin/research-factory", icon: Sparkles },
  { title: "Nghiên cứu Thị trường", url: "/admin/market-research-factory", icon: LineChart },
  { title: "Phân tích Chất xúc tác", url: "/admin/catalyst-factory", icon: Sparkles },
];

export function AdminSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const collapsed = state === "collapsed";

  const isActive = (path: string) => location.pathname.startsWith(path);

  const getNavClassName = (path: string) => {
    return isActive(path)
      ? "bg-primary/10 text-primary border-l-4 border-primary font-semibold"
      : "hover:bg-muted/50 text-muted-foreground font-medium transition-all duration-200";
  };

  return (
    <Sidebar
      className={cn(
        "transition-all duration-300 ease-in-out bg-card text-card-foreground border-r",
        collapsed ? "w-16" : "w-64"
      )}
      collapsible="icon"
    >
      <SidebarHeader className="border-b px-4 py-3">
        {!collapsed && (
          <div className="space-y-1">
            <h2 className="text-lg font-bold tracking-tight">Admin Panel</h2>
            <p className="text-xs text-muted-foreground">PropertyHub</p>
          </div>
        )}
        {collapsed && <Shield className="w-6 h-6 mx-auto" />}
      </SidebarHeader>

      <SidebarContent className="px-3 py-4 flex flex-col h-full">
        <div className="space-y-6">
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <NavLink to="/" className="block w-full rounded-lg py-2.5 px-3 flex items-center gap-3 hover:bg-muted/50 text-muted-foreground font-medium">
                      <Home className="h-5 w-5" />
                      {!collapsed && <span>Về trang chủ</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup className="space-y-2">
            {!collapsed && <SidebarGroupLabel className="px-2 text-xs uppercase tracking-wide">Quản lý</SidebarGroupLabel>}
            <SidebarGroupContent>
              <SidebarMenu className="space-y-1">
                {mainItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink to={item.url} className={`${getNavClassName(item.url)} block w-full rounded-lg py-2 px-3 flex items-center gap-3`}>
                        <item.icon className="h-5 w-5" />
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup className="space-y-2">
            {!collapsed && <SidebarGroupLabel className="px-2 text-xs uppercase tracking-wide text-blue-600">Công cụ AI</SidebarGroupLabel>}
            <SidebarGroupContent>
              <SidebarMenu className="space-y-1">
                {aiTools.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink to={item.url} className={`${getNavClassName(item.url)} block w-full rounded-lg py-2 px-3 flex items-center gap-3`}>
                        <item.icon className="h-5 w-5" />
                        {!collapsed && <span>{item.title}</span>}
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