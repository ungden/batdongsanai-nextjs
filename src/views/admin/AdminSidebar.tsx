"use client";

import { NavLink } from '@/components/NavLink';
import { usePathname } from 'next/navigation';
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
  Newspaper
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
  { title: "Quản lý Leads", url: "/admin/leads", icon: Target, badge: "NEW", badgeColor: "bg-red-500" },
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
];

export function AdminSidebar() {
  const { state } = useSidebar();
  const pathname = usePathname();
  const collapsed = state === "collapsed";

  const isActive = (path: string) => pathname.startsWith(path);

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
      <SidebarHeader className="border-b px-4 py-3 h-16 flex items-center justify-center">
        {!collapsed ? (
          <div className="space-y-1 w-full">
            <h2 className="text-lg font-bold tracking-tight flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Admin Panel
            </h2>
            <p className="text-xs text-muted-foreground pl-7">Realprofit.vn System</p>
          </div>
        ) : (
          <Shield className="w-6 h-6 text-primary" />
        )}
      </SidebarHeader>

      <SidebarContent className="px-3 py-4 flex flex-col h-full overflow-y-auto custom-scrollbar">
        <div className="space-y-6">
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <NavLink href="/" className="block w-full rounded-lg py-2.5 px-3 flex items-center gap-3 hover:bg-muted/50 text-muted-foreground font-medium">
                      <Home className="h-5 w-5" />
                      {!collapsed && <span>Về trang chủ</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup className="space-y-2">
            {!collapsed && <SidebarGroupLabel className="px-2 text-xs uppercase tracking-wide text-muted-foreground/70 font-bold">Quản lý</SidebarGroupLabel>}
            <SidebarGroupContent>
              <SidebarMenu className="space-y-1">
                {mainItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild tooltip={item.title}>
                      <NavLink href={item.url} className={`${getNavClassName(item.url)} block w-full rounded-lg py-2 px-3 flex items-center gap-3 relative group`}>
                        <item.icon className="h-5 w-5 flex-shrink-0" />
                        {!collapsed && (
                          <>
                            <span className="flex-1 truncate">{item.title}</span>
                            {item.badge && (
                              <Badge 
                                className={`ml-auto text-[10px] px-1.5 h-5 ${item.badgeColor || "bg-primary/10 text-primary border-primary/20"}`}
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

          <SidebarGroup className="space-y-2">
            {!collapsed && <SidebarGroupLabel className="px-2 text-xs uppercase tracking-wide text-blue-600 font-bold">Công cụ AI</SidebarGroupLabel>}
            <SidebarGroupContent>
              <SidebarMenu className="space-y-1">
                {aiTools.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild tooltip={item.title}>
                      <NavLink href={item.url} className={`${getNavClassName(item.url)} block w-full rounded-lg py-2 px-3 flex items-center gap-3 relative`}>
                        <item.icon className="h-5 w-5 flex-shrink-0" />
                        {!collapsed && (
                          <>
                            <span className="flex-1 truncate">{item.title}</span>
                            {item.badge && (
                              <Badge className="ml-auto bg-purple-100 text-purple-700 border-purple-200 text-[10px] px-1.5 h-5">
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