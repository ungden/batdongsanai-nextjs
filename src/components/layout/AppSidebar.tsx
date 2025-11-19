"use client";

import { NavLink, useLocation } from "react-router-dom";
import {
  Home, TrendingUp, Calculator, Heart, Users, Newspaper,
  Shield, Briefcase, Calendar, Sparkles, GitCompare, Store,
  Settings, LogOut, User as UserIcon, ChevronRight
} from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  SidebarHeader, SidebarFooter, useSidebar, SidebarRail
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { usePermissions } from "@/hooks/usePermissions";
import { useCompareStore } from "@/stores/compareStore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

// Grouped Navigation Items
const navGroups = [
  {
    label: "Tổng quan",
    items: [
      { title: "Trang chủ", url: "/", icon: Home },
      { title: "Thị trường", url: "/market-overview", icon: TrendingUp },
      { title: "Market Intelligence", url: "/market-intelligence", icon: Sparkles },
    ]
  },
  {
    label: "Công cụ",
    items: [
      { title: "Chợ BĐS", url: "/marketplace", icon: Store },
      { title: "So sánh dự án", url: "/compare", icon: GitCompare, badge: "compare" },
      { title: "Tính toán vay", url: "/calculator", icon: Calculator },
    ]
  },
  {
    label: "Cá nhân",
    items: [
      { title: "Danh mục đầu tư", url: "/portfolio", icon: Briefcase },
      { title: "Lịch hẹn", url: "/appointments", icon: Calendar },
      { title: "Yêu thích", url: "/favorites", icon: Heart },
    ]
  },
  {
    label: "Thông tin",
    items: [
      { title: "Chủ đầu tư", url: "/developers", icon: Users },
      { title: "Tin tức", url: "/news", icon: Newspaper },
    ]
  }
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { isAdmin } = usePermissions();
  const { compareList } = useCompareStore();
  const collapsed = state === "collapsed";

  const isActive = (path: string) => {
    if (path === "/" && location.pathname !== "/") return false;
    return location.pathname.startsWith(path);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-border bg-sidebar">
      {/* Header Logo */}
      <SidebarHeader className="h-16 border-b border-sidebar-border/50 flex items-center justify-center px-4">
        <div className="flex items-center gap-3 w-full overflow-hidden transition-all duration-300">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
            <Sparkles className="h-4 w-4" />
          </div>
          {!collapsed && (
            <div className="flex flex-col gap-0.5 leading-none">
              <span className="font-bold text-sidebar-foreground">PropertyHub</span>
              <span className="text-[10px] text-sidebar-foreground/60">AI Real Estate</span>
            </div>
          )}
        </div>
      </SidebarHeader>

      {/* Main Navigation */}
      <SidebarContent className="px-2 py-4">
        {navGroups.map((group, index) => (
          <SidebarGroup key={index} className="mb-4">
            {!collapsed && (
              <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/50 px-2 mb-2">
                {group.label}
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const active = isActive(item.url);
                  return (
                    <SidebarMenuItem key={item.url}>
                      <SidebarMenuButton
                        asChild
                        tooltip={item.title}
                        isActive={active}
                        className={cn(
                          "h-10 rounded-lg transition-all duration-200 group",
                          active 
                            ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium shadow-sm" 
                            : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                        )}
                      >
                        <NavLink to={item.url} className="flex items-center gap-3 w-full">
                          <item.icon className={cn("h-4 w-4", active ? "text-primary" : "opacity-70 group-hover:opacity-100")} />
                          <span className="flex-1 truncate">{item.title}</span>
                          
                          {/* Badges */}
                          {item.badge === "compare" && compareList.length > 0 && (
                            <Badge variant="secondary" className="ml-auto h-5 min-w-5 px-1 flex items-center justify-center bg-primary/10 text-primary text-[10px]">
                              {compareList.length}
                            </Badge>
                          )}
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}

        {/* Admin Section */}
        {user && isAdmin && (
          <SidebarGroup className="mt-auto border-t border-sidebar-border/50 pt-4">
            {!collapsed && (
              <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider text-destructive/70 px-2 mb-2">
                Administrator
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={isActive("/admin")}>
                    <NavLink to="/admin" className="h-10 rounded-lg text-destructive/90 hover:bg-destructive/10 hover:text-destructive transition-colors">
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

      {/* User Footer */}
      <SidebarFooter className="border-t border-sidebar-border/50 p-4">
        {user ? (
          <div className={cn("flex items-center gap-3", collapsed ? "justify-center" : "")}>
            <Avatar className="h-9 w-9 rounded-lg border border-sidebar-border">
              <AvatarImage src={user.user_metadata?.avatar_url} />
              <AvatarFallback className="rounded-lg bg-sidebar-accent text-sidebar-foreground font-medium">
                {user.email?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {!collapsed && (
              <div className="flex flex-1 flex-col overflow-hidden">
                <span className="truncate text-sm font-medium text-sidebar-foreground">
                  {user.user_metadata?.full_name || "User"}
                </span>
                <span className="truncate text-xs text-sidebar-foreground/60">
                  {user.email}
                </span>
              </div>
            )}
            {!collapsed && (
              <button onClick={handleSignOut} className="text-sidebar-foreground/50 hover:text-sidebar-foreground transition-colors">
                <LogOut className="h-4 w-4" />
              </button>
            )}
          </div>
        ) : (
          <SidebarMenuButton asChild className="w-full justify-center bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm">
            <NavLink to="/auth">
              <UserIcon className="h-4 w-4 mr-2" />
              {!collapsed && "Đăng nhập"}
            </NavLink>
          </SidebarMenuButton>
        )}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}