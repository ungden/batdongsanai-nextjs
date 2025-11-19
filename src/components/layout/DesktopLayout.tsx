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
      <div className="flex min-h-screen w-full bg-background text-foreground transition-colors duration-300">
        <AppSidebar />
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {showHeader && (
            <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border/40 bg-background/80 px-6 backdrop-blur-md transition-all">
              <div className="flex-1" />
              <div className="flex items-center gap-2">
                <ThemeToggle />
                <NotificationBell />
                <UserNav />
              </div>
            </header>
          )}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 scroll-smooth">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default DesktopLayout;