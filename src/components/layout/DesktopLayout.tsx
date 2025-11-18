import { ReactNode } from "react";
import { AppSidebar } from '@/components/layout/AppSidebar';
import UserNav from '@/components/layout/UserNav';
import { ThemeToggle } from '@/components/ThemeToggle';
import { NotificationBell } from '@/components/NotificationBell';
import { SidebarProvider } from "@/components/ui/sidebar";

interface DesktopLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  showHeader?: boolean;
}

const DesktopLayout: React.FC<DesktopLayoutProps> = ({ children, showHeader = true }) => {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-background">
        <AppSidebar />
        <main className="flex-1 flex flex-col">
          {showHeader && (
            <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/80 px-6 backdrop-blur-sm transition-theme">
              <div className="flex-1" />
              <div className="flex items-center gap-2">
                <ThemeToggle />
                <NotificationBell />
                <UserNav />
              </div>
            </header>
          )}
          <div className="flex-1 p-6 lg:p-8">{children}</div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default DesktopLayout;