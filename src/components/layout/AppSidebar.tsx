"use client";
import { NavLink } from '@/components/NavLink';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';


import { Shield, LogOut, User as UserIcon, Sparkles } from "lucide-react";
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
import { USER_NAV_GROUPS } from "@/config/navigation";

export function AppSidebar() {
  const { state } = useSidebar();
  const pathname = usePathname();
  const navigate = useRouter();
  const { user, signOut } = useAuth();
  const { isAdmin } = usePermissions();
  const { compareList } = useCompareStore();
  const collapsed = state === "collapsed";

  const isActive = (path: string) => {
    if (path === "/" && pathname !== "/") return false;
    return pathname.startsWith(path);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate.push("/auth");
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border bg-sidebar-background text-sidebar-foreground">
      {/* Header Logo */}
      <SidebarHeader className="h-16 border-b border-sidebar-border flex items-center justify-center px-4">
        <div className="flex items-center gap-3 w-full overflow-hidden transition-all duration-300">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-md">
            <Sparkles className="h-5 w-5" />
          </div>
          {!collapsed && (
            <div className="flex flex-col gap-0.5 leading-none">
              <span className="font-bold text-lg tracking-tight text-sidebar-foreground">Realprofit.vn</span>
              <span className="text-[11px] font-medium text-sidebar-foreground/60 uppercase tracking-wider">Smart Investment</span>
            </div>
          )}
        </div>
      </SidebarHeader>

      {/* Main Navigation */}
      <SidebarContent className="px-3 py-4">
        {USER_NAV_GROUPS.map((group, index) => (
          <SidebarGroup key={index} className="mb-6 last:mb-0">
            {!collapsed && (
              <SidebarGroupLabel className="text-[11px] font-bold uppercase tracking-wider text-sidebar-foreground/50 px-3 mb-2">
                {group.label}
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu className="space-y-1">
                {group.items.map((item) => {
                  const active = isActive(item.url);
                  const Icon = item.icon;
                  return (
                    <SidebarMenuItem key={item.url}>
                      <SidebarMenuButton
                        asChild
                        tooltip={item.title}
                        isActive={active}
                        className={cn(
                          "h-11 rounded-md transition-all duration-200 group",
                          active
                            ? "bg-primary/10 text-primary font-semibold shadow-sm hover:bg-primary/15 hover:text-primary"
                            : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                        )}
                      >
                        <NavLink href={item.url} className="flex items-center gap-3 w-full px-3">
                          <Icon className={cn(
                            "h-5 w-5 transition-colors",
                            active ? "text-primary" : "text-sidebar-foreground/60 group-hover:text-sidebar-accent-foreground"
                          )} />
                          <span className="flex-1 truncate text-sm">{item.title}</span>

                          {/* Badges */}
                          {item.badge === "compare" && compareList.length > 0 && (
                            <Badge variant="secondary" className="ml-auto h-5 min-w-5 px-1.5 flex items-center justify-center bg-primary text-primary-foreground text-[10px] font-bold shadow-sm">
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
          <SidebarGroup className="mt-auto border-t border-sidebar-border pt-4">
            {!collapsed && (
              <SidebarGroupLabel className="text-[11px] font-bold uppercase tracking-wider text-destructive/80 px-3 mb-2">
                Quản trị
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={isActive("/admin")} className="h-11 hover:bg-destructive/10 hover:text-destructive text-destructive/80">
                    <NavLink href="/admin" className="flex items-center gap-3 w-full px-3">
                      <Shield className="h-5 w-5" />
                      <span className="font-semibold">Admin System</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Titanlabs Footer Info */}
        {!collapsed && (
          <div className="px-6 py-4 text-[10px] text-sidebar-foreground/40 text-center leading-relaxed border-t border-sidebar-border/50">
            <p className="font-medium hover:text-sidebar-foreground/60 transition-colors">1 sản phẩm của Titanlabs.vn</p>
            <p>by Alex Le</p>
            <p className="mt-1 hover:text-primary cursor-pointer transition-colors">
              <a href="mailto:alexle@titanlabs.vn">alexle@titanlabs.vn</a>
            </p>
          </div>
        )}
      </SidebarContent>

      {/* User Footer */}
      <SidebarFooter className="border-t border-sidebar-border p-4 bg-sidebar-background">
        {user ? (
          <div className={cn("flex items-center gap-3", collapsed ? "justify-center" : "")}>
            <Avatar className="h-10 w-10 rounded-lg border border-sidebar-border shadow-sm cursor-pointer hover:ring-2 hover:ring-primary/20 transition-all" onClick={() => navigate.push('/profile')}>
              <AvatarImage src={user.user_metadata?.avatar_url} />
              <AvatarFallback className="rounded-lg bg-primary/10 text-primary font-bold">
                {user.email?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {!collapsed && (
              <div className="flex flex-1 flex-col overflow-hidden">
                <span className="truncate text-sm font-semibold text-sidebar-foreground">
                  {user.user_metadata?.full_name || "User"}
                </span>
                <span className="truncate text-xs text-sidebar-foreground/60 font-medium">
                  {user.email}
                </span>
              </div>
            )}
            {!collapsed && (
              <button 
                onClick={handleSignOut} 
                className="p-2 rounded-md text-sidebar-foreground/50 hover:text-destructive hover:bg-destructive/10 transition-all"
                title="Đăng xuất"
              >
                <LogOut className="h-5 w-5" />
              </button>
            )}
          </div>
        ) : (
          <SidebarMenuButton asChild className="w-full h-11 justify-center bg-primary text-primary-foreground hover:bg-primary/90 shadow-md font-semibold transition-all">
            <NavLink href="/auth" className="flex items-center gap-2">
              <UserIcon className="h-5 w-5" />
              {!collapsed && "Đăng nhập ngay"}
            </NavLink>
          </SidebarMenuButton>
        )}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}