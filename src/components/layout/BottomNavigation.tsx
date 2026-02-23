"use client";
import { useRouter, usePathname } from 'next/navigation';
import { cn } from "@/lib/utils";
import { MOBILE_BOTTOM_NAV } from "@/config/navigation";

const BottomNavigation = () => {
  const navigate = useRouter();
  const pathname = usePathname();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-t border-border pb-safe">
      <div className="flex items-center justify-around h-16 px-2">
        {MOBILE_BOTTOM_NAV.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.url;
          
          return (
            <button
              key={item.url}
              onClick={() => navigate.push(item.url)}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full gap-1 transition-all duration-200",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div className={cn(
                "p-1 rounded-xl transition-all",
                 isActive ? "bg-primary/10 translate-y-[-2px]" : ""
              )}>
                <Icon className={cn("h-5 w-5", isActive && "fill-current")} />
              </div>
              <span className="text-[10px] font-medium">
                {item.title}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNavigation;