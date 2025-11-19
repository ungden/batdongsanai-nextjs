"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Building2, TrendingUp, Clock, RefreshCw, BarChart3 } from "lucide-react";

interface MarketTabsProps {
  activeTab: string;
  onTabChange: (value: string) => void;
  counts: {
    all: number;
    selling: number;
    secondary: number;
    upcoming: number;
  };
}

const MarketTabs = ({ activeTab, onTabChange, counts }: MarketTabsProps) => {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
      <TabsList className="w-full justify-start h-auto p-1 bg-muted/30 rounded-xl border border-border overflow-x-auto flex-nowrap">
        <TabsTrigger 
          value="all" 
          className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm rounded-lg px-4 py-2 font-semibold text-sm transition-all flex-shrink-0"
        >
          <Building2 className="w-4 h-4 mr-2 text-muted-foreground" />
          Tất cả
          <Badge variant="secondary" className="ml-2 text-[10px] h-5 px-1.5 bg-muted-foreground/10 text-muted-foreground">
            {counts.all}
          </Badge>
        </TabsTrigger>

        <TabsTrigger 
          value="selling" 
          className="data-[state=active]:bg-amber-500 data-[state=active]:text-white rounded-lg px-4 py-2 font-semibold text-sm transition-all flex-shrink-0"
        >
          <TrendingUp className="w-4 h-4 mr-2" />
          Hàng CĐT (Sơ cấp)
          <Badge variant="secondary" className="ml-2 text-[10px] h-5 px-1.5 bg-white/20 text-white">
            {counts.selling}
          </Badge>
        </TabsTrigger>

        <TabsTrigger 
          value="secondary" 
          className="data-[state=active]:bg-purple-600 data-[state=active]:text-white rounded-lg px-4 py-2 font-semibold text-sm transition-all flex-shrink-0"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Chuyển nhượng (Thứ cấp)
          <Badge variant="secondary" className="ml-2 text-[10px] h-5 px-1.5 bg-white/20 text-white">
            {counts.secondary}
          </Badge>
        </TabsTrigger>

        <TabsTrigger 
          value="upcoming" 
          className="data-[state=active]:bg-blue-500 data-[state=active]:text-white rounded-lg px-4 py-2 font-semibold text-sm transition-all flex-shrink-0"
        >
          <Clock className="w-4 h-4 mr-2" />
          Sắp mở bán
          <Badge variant="secondary" className="ml-2 text-[10px] h-5 px-1.5 bg-white/20 text-white">
            {counts.upcoming}
          </Badge>
        </TabsTrigger>

        <TabsTrigger 
          value="stats" 
          className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg px-4 py-2 font-semibold text-sm transition-all flex-shrink-0 ml-auto"
        >
          <BarChart3 className="w-4 h-4 mr-2" />
          Thống kê
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
};

export default MarketTabs;