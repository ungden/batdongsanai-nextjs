"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Building2, DollarSign, BarChart3, Users } from "lucide-react";
import { Project } from "@/types/project";

interface MarketStatsCardProps {
  projects: Project[];
}

const MarketStatsCard = ({ projects }: MarketStatsCardProps) => {
  const totalProjects = projects.length;
  const activeProjects = projects.filter(p => p.completionDate !== "Đã hoàn thành").length;
  
  const avgPrice = projects.reduce((sum, p) => sum + p.pricePerSqm, 0) / projects.length;
  
  const totalValue = projects.reduce((sum, p) => {
    const priceRange = p.priceRange.split(" - ");
    const maxPrice = parseFloat(priceRange[1]?.replace(/[^\d.]/g, "") || "0");
    return sum + maxPrice;
  }, 0);

  const avgLegalScore = projects.reduce((sum, p) => sum + p.legalScore, 0) / projects.length;

  const projectsWithROI = projects.filter(p => p.launchPrice && p.currentPrice);
  const avgROI = projectsWithROI.length > 0
    ? projectsWithROI.reduce((sum, p) => {
        const roi = ((p.currentPrice! - p.launchPrice!) / p.launchPrice!) * 100;
        return sum + roi;
      }, 0) / projectsWithROI.length
    : 0;

  const formatPrice = (price: number) => {
    if (price >= 1000000000) {
      return `${(price / 1000000000).toFixed(1)} tỷ`;
    }
    return `${(price / 1000000).toFixed(0)} tr`;
  };

  const stats = [
    {
      title: "Tổng dự án",
      value: totalProjects,
      subtitle: `${activeProjects} đang mở bán`,
      icon: Building2,
      color: "text-primary",
      bgColor: "bg-primary/10"
    },
    {
      title: "Giá trung bình",
      value: `${formatPrice(avgPrice)}/m²`,
      subtitle: avgROI > 0 ? `+${avgROI.toFixed(1)}% ROI TB` : `${avgROI.toFixed(1)}% ROI TB`,
      icon: DollarSign,
      color: avgROI > 0 ? "text-success" : "text-destructive",
      bgColor: avgROI > 0 ? "bg-success/10" : "bg-destructive/10",
      trend: avgROI > 0 ? "up" : "down"
    },
    {
      title: "Tổng giá trị",
      value: `${totalValue.toFixed(0)} tỷ`,
      subtitle: "Tổng vốn hóa thị trường",
      icon: BarChart3,
      color: "text-accent",
      bgColor: "bg-accent/10"
    },
    {
      title: "Điểm pháp lý TB",
      value: `${avgLegalScore.toFixed(1)}/10`,
      subtitle: projects.filter(p => p.legalScore >= 8).length + " dự án tốt",
      icon: Users,
      color: "text-warning",
      bgColor: "bg-warning/10"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <Card key={index} className="border-2 hover:shadow-lg transition-all duration-200">
          <CardContent className="p-5">
            <div className="flex items-start justify-between mb-3">
              <div className={`p-2.5 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              {stat.trend && (
                <Badge variant={stat.trend === "up" ? "default" : "destructive"} className="text-xs">
                  {stat.trend === "up" ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                </Badge>
              )}
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">{stat.title}</p>
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.subtitle}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default MarketStatsCard;