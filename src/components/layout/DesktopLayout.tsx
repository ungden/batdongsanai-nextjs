import { usePathname } from 'next/navigation';

import { ReactNode } from "react";
import { AppSidebar } from '@/components/layout/AppSidebar';
import UserNav from '@/components/layout/UserNav';
import { ThemeToggle } from '@/components/ThemeToggle';
import { NotificationBell } from '@/components/NotificationBell';
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";


interface DesktopLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  showHeader?: boolean;
}

const DesktopLayout: React.FC<DesktopLayoutProps> = ({ children, title, subtitle, showHeader = true }) => {
  const pathname = usePathname();
  
  // Simple breadcrumb logic
  const pathSegments = pathname.split('/').filter(Boolean);
  
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background text-foreground">
        <AppSidebar />
        
        <div className="flex flex-1 flex-col min-w-0 overflow-hidden bg-background/50 dark:bg-background transition-colors duration-300">
          {showHeader && (
            <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center gap-4 border-b border-border bg-background/80 px-6 backdrop-blur-xl transition-all">
              <div className="flex items-center gap-2">
                <SidebarTrigger className="-ml-2 hover:bg-accent hover:text-accent-foreground" />
                <Separator orientation="vertical" className="mr-2 h-4" />
                
                <div className="hidden md:flex flex-col">
                   {title ? (
                     <h1 className="text-sm font-semibold leading-none text-foreground">{title}</h1>
                   ) : (
                    <Breadcrumb>
                      <BreadcrumbList>
                        <BreadcrumbItem>
                          <BreadcrumbLink href="/" className="text-muted-foreground hover:text-foreground transition-colors">Home</BreadcrumbLink>
                        </BreadcrumbItem>
                        {pathSegments.map((segment, index) => (
                          <div key={index} className="flex items-center">
                             <BreadcrumbSeparator />
                             <BreadcrumbItem>
                               <BreadcrumbPage className="capitalize text-foreground font-medium">{segment.replace(/-/g, ' ')}</BreadcrumbPage>
                             </BreadcrumbItem>
                          </div>
                        ))}
                      </BreadcrumbList>
                    </Breadcrumb>
                   )}
                   {subtitle && <span className="text-xs text-muted-foreground mt-0.5">{subtitle}</span>}
                </div>
              </div>

              <div className="ml-auto flex items-center gap-3">
                <ThemeToggle />
                <NotificationBell />
                <Separator orientation="vertical" className="h-6 mx-1" />
                <UserNav />
              </div>
            </header>
          )}
          
          <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6 lg:p-8 animate-fade-in">
            <div className="mx-auto max-w-7xl w-full space-y-6 min-h-[calc(100vh-10rem)]">
              {children}
            </div>

            <footer className="mt-12 py-6 text-center text-xs text-muted-foreground border-t border-border/40">
              <div className="flex flex-col gap-1.5 opacity-70 hover:opacity-100 transition-opacity">
                <p className="font-semibold">1 sản phẩm của Titanlabs.vn</p>
                <p>by Alex Le</p>
                <a href="mailto:alexle@titanlabs.vn" className="hover:text-primary transition-colors">
                  alexle@titanlabs.vn
                </a>
              </div>
            </footer>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default DesktopLayout;