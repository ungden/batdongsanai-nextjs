"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Building2, TrendingUp, Clock, CheckCircle, BarChart3, Award } from "lucide-react";

interface MarketTabsProps {
  activeTab: string;
  onTabChange: (value: string) => void;
  counts: {
    all: number;
    active: number;
    upcoming: number;
    completed: number;
  };
}

const MarketTabs = ({ activeTab, onTabChange, counts }: MarketTabsProps) => {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
      <TabsList className="w-full justify-start h-auto p-1 bg-muted/30 rounded-xl border-2 border-border/50">
        <TabsTrigger 
          value="all" 
          className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg px-4 py-2.5 font-semibold text-sm transition-all"
        >
          <Building2 className="w-4 h-4 mr-2" />
          Tất cả dự án
          <Badge variant="secondary" className="ml-2 text-xs">
            {counts.all}
          </Badge>
        </TabsTrigger>

        <TabsTrigger 
          value="active" 
          className="data-[state=active]:bg-success data-[state=active]:text-white rounded-lg px-4 py-2.5 font-semibold text-sm transition-all"
        >
          <TrendingUp className="w-4 h-4 mr-2" />
          Đang mở bán
          <Badge variant="secondary" className="ml-2 text-xs">
            {counts.active}
          </Badge>
        </TabsTrigger>

        <TabsTrigger 
          value="upcoming" 
          className="data-[state=active]:bg-warning data-[state=active]:text-white rounded-lg px-4 py-2.5 font-semibold text-sm transition-all"
        >
          <Clock className="w-4 h-4 mr-2" />
          Sắp mở bán
          <Badge variant="secondary" className="ml-2 text-xs">
            {counts.upcoming}
          </Badge>
        </TabsTrigger>

        <TabsTrigger 
          value="completed" 
          className="data-[state=active]:bg-accent data-[state=active]:text-white rounded-lg px-4 py-2.5 font-semibold text-sm transition-all"
        >
          <CheckCircle className="w-4 h-4 mr-2" />
          Đã bàn giao
          <Badge variant="secondary" className="ml-2 text-xs">
            {counts.completed}
          </Badge>
        </TabsTrigger>

        <TabsTrigger 
          value="stats" 
          className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg px-4 py-2.5 font-semibold text-sm transition-all"
        >
          <BarChart3 className="w-4 h-4 mr-2" />
          Thống kê
        </TabsTrigger>

        <TabsTrigger 
          value="premium" 
          className="data-[state=active]:bg-gradient-primary data-[state=active]:text-white rounded-lg px-4 py-2.5 font-semibold text-sm transition-all"
        >
          <Award className="w-4 h-4 mr-2" />
          CĐT uy tín
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
};

export default MarketTabs;