import { ReactNode } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import DesktopLayout from "./DesktopLayout";
import MobileLayout from "./MobileLayout";

interface ResponsiveLayoutProps {
  children: ReactNode;
  // Common props
  title?: string;
  // Desktop-specific props
  desktopSubtitle?: string;
  showDesktopHeader?: boolean;
  // Mobile-specific props
  showMobileBackButton?: boolean;
  showMobileBottomNav?: boolean;
  showMobileHeader?: boolean;
  mobileHeaderActions?: ReactNode;
  mobileFullScreen?: boolean;
}

const ResponsiveLayout = ({
  children,
  title,
  desktopSubtitle,
  showDesktopHeader = true,
  showMobileBackButton = false,
  showMobileBottomNav = true,
  showMobileHeader = true,
  mobileHeaderActions,
  mobileFullScreen = false,
}: ResponsiveLayoutProps) => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <MobileLayout
        title={title}
        showBackButton={showMobileBackButton}
        showBottomNav={showMobileBottomNav}
        showHeader={showMobileHeader}
        headerActions={mobileHeaderActions}
        fullScreen={mobileFullScreen}
      >
        {children}
      </MobileLayout>
    );
  }

  return (
    <DesktopLayout
      title={title}
      subtitle={desktopSubtitle}
      showHeader={showDesktopHeader}
    >
      {children}
    </DesktopLayout>
  );
};

export default ResponsiveLayout;
