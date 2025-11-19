"use client";

import { NavLink, useLocation } from "react-router-dom";
import {
  Home, TrendingUp, Calculator, Heart, Users, Newspaper,
  Shield, FileText, Briefcase, Calendar, Sparkles, GitCompare, Store,
  ChevronRight
} from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  SidebarHeader, useSidebar,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { usePermissions } from "@/hooks/usePermissions";
import { cn } from "@/lib/utils";
import { useCompareStore } from "@/stores/compareStore";

const mainItems = [
  { title: "Trang chủ", url: "/", icon: Home },
  { title: "Thị trường", url: "/market-overview", icon: TrendingUp },
  { title: "Market Intelligence", url: "/market-intelligence", icon: Sparkles },
  { title: "Chợ BĐS", url: "/marketplace", icon: Store },
  { title: "So sánh", url: "/compare", icon: GitCompare, badge: "dynamic" },
];

const personalItems = [
  { title: "Danh mục đầu tư", url: "/portfolio", icon: Briefcase },
  { title: "Lịch hẹn", url: "/appointments", icon: Calendar },
  { title: "Yêu thích", url: "/favorites", icon: Heart },
];

const resourceItems = [
  { title: "Chủ đầu tư", url: "/developers", icon: Users },
  { title: "Tin tức", url: "/news", icon: Newspaper },
  { title: "Tính toán", url: "/calculator", icon: Calculator },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const { user } = useAuth();
  const { isAdmin } = usePermissions();
  const { compareList } = useCompareStore();
  const collapsed = state === "collapsed";

  const isActive = (path: string) => location.pathname === path || (path !== "/" && location.pathname.startsWith(path));

  const NavItem = ({ item }: { item: any }) => (
    <SidebarMenuItem>
      <SidebarMenuButton asChild tooltip={item.title} isActive={isActive(item.url)}>
        <NavLink to={item.url} className={cn(
          "flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-sm font-medium",
          isActive(item.url) 
            ? "bg-primary text-white" 
            : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-white"
        )}>
          <item.icon className="h-4 w-4" />
          <span>{item.title}</span>
          {item.badge === "dynamic" && compareList.length > 0 && (
            <Badge variant="secondary" className="ml-auto h-5 px-1.5 min-w-5 flex justify-center bg-primary-foreground text-primary">
              {compareList.length}
            </Badge>
          )}
        </NavLink>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border bg-sidebar">
      <SidebarHeader className="h-16 flex items-center px-4 border-b border-sidebar-border">
        <div className="flex items-center gap-2 font-bold text-xl text-white">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-white">P</span>
          </div>
          {!collapsed && <span>PropertyHub</span>}
        </div>
      </SidebarHeader>

      <SidebarContent className="p-2">
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/50 text-xs font-medium uppercase tracking-wider px-2 mb-2">
            Khám phá
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => <NavItem key={item.url} item={item} />)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/50 text-xs font-medium uppercase tracking-wider px-2 mb-2 mt-4">
            Cá nhân
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {personalItems.map((item) => <NavItem key={item.url} item={item} />)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/50 text-xs font-medium uppercase tracking-wider px-2 mb-2 mt-4">
            Công cụ & Tin tức
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {resourceItems.map((item) => <NavItem key={item.url} item={item} />)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {user && isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-red-400/80 text-xs font-medium uppercase tracking-wider px-2 mb-2 mt-4">
              Admin
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={isActive("/admin")}>
                    <NavLink to="/admin" className="flex items-center gap-3 px-3 py-2 rounded-md text-red-100 hover:bg-red-900/20 transition-colors text-sm font-medium">
                      <Shield className="h-4 w-4" />
                      <span>Quản trị hệ thống</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
    </Sidebar>
  );
}