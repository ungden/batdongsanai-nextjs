import { ReactNode } from "react";
import BottomNavigation from "./BottomNavigation";
import { ThemeToggle } from "@/components/ThemeToggle";
import { NotificationBell } from "@/components/NotificationBell";
import { ArrowLeft, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface MobileLayoutProps {
  children: ReactNode;
  title?: string;
  showBackButton?: boolean;
  showBottomNav?: boolean;
  showHeader?: boolean;
  headerActions?: ReactNode;
  fullScreen?: boolean;
}

const MobileLayout = ({
  children,
  title,
  showBackButton = false,
  showBottomNav = true,
  showHeader = true,
  headerActions,
  fullScreen = false,
}: MobileLayoutProps) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Mobile Header */}
      {showHeader && (
        <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
          <div className="flex items-center justify-between h-14 px-4">
            <div className="flex items-center gap-2">
              {showBackButton && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 -ml-2"
                  onClick={() => navigate(-1)}
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              )}
              {title && (
                <h1 className="text-base font-semibold truncate max-w-[200px]">
                  {title}
                </h1>
              )}
            </div>

            <div className="flex items-center gap-1">
              {headerActions}
              <ThemeToggle />
              <NotificationBell />
            </div>
          </div>
        </header>
      )}

      {/* Main Content */}
      <main
        className={`flex-1 overflow-y-auto ${
          showBottomNav ? "pb-20" : ""
        } ${fullScreen ? "" : "px-4 py-4"}`}
      >
        {children}
      </main>

      {/* Bottom Navigation */}
      {showBottomNav && <BottomNavigation />}
    </div>
  );
};

export default MobileLayout;
