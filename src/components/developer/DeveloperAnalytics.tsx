"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend } from "recharts";
import { TrendingUp, TrendingDown, DollarSign, Building2, Target, AlertTriangle } from "lucide-react";
import { Project } from "@/types/project";
import { Developer } from "@/types/developer";
import { calculateROI, formatROIDisplay, getROIStatus } from "@/utils/roiCalculations";

interface DeveloperAnalyticsProps {
  developer: Developer;
  projects: Project[];
}

const chartConfig = {
  roi: {
    label: "ROI (%)",
    color: "hsl(var(--primary))",
  },
  price: {
    label: "Giá (triệu/m²)",
    color: "hsl(var(--accent))",
  },
  launch: {
    label: "Giá mở bán",
    color: "hsl(var(--warning))",
  },
  current: {
    label: "Giá hiện tại", 
    color: "hsl(var(--success))",
  },
  good: {
    label: "Tốt",
    color: "hsl(var(--success))",
  },
  warning: {
    label: "Cảnh báo",
    color: "hsl(var(--warning))",
  },
  danger: {
    label: "Rủi ro",
    color: "hsl(var(--destructive))",
  },
};

export const DeveloperAnalytics = ({ developer, projects }: DeveloperAnalyticsProps) => {
  // Financial metrics calculations
  const portfolioMetrics = useMemo(() => {
    const projectsWithROI = projects.filter(p => p.launchPrice && p.currentPrice);
    
    const totalPortfolioValue = projects.reduce((sum, p) => 
      sum + ((p.currentPrice || p.pricePerSqm) * (p.totalUnits || 0)), 0
    );
    
    const totalLaunchValue = projects.reduce((sum, p) => 
      sum + ((p.launchPrice || p.pricePerSqm) * (p.totalUnits || 0)), 0
    );
    
    const avgROI = projectsWithROI.length > 0 
      ? projectsWithROI.reduce((sum, p) => sum + calculateROI(p.launchPrice!, p.currentPrice!), 0) / projectsWithROI.length
      : 0;
    
    const totalSoldUnits = projects.reduce((sum, p) => sum + (p.soldUnits || 0), 0);
    const totalUnits = projects.reduce((sum, p) => sum + (p.totalUnits || 0), 0);
    const salesRate = totalUnits > 0 ? (totalSoldUnits / totalUnits) * 100 : 0;
    
    return {
      totalPortfolioValue,
      totalLaunchValue,
      avgROI,
      salesRate,
      totalProjects: projects.length,
      totalUnits,
      totalSoldUnits,
    };
  }, [projects]);

  // ROI trend data
  const roiTrendData = useMemo(() => {
    return projects
      .filter(p => p.launchPrice && p.currentPrice && p.launchDate)
      .map(p => ({
        name: p.name.length > 15 ? p.name.substring(0, 15) + '...' : p.name,
        roi: calculateROI(p.launchPrice!, p.currentPrice!),
        launchPrice: p.launchPrice! / 1000000, // Convert to millions
        currentPrice: p.currentPrice! / 1000000,
        launchDate: p.launchDate,
      }))
      .sort((a, b) => new Date(a.launchDate!).getTime() - new Date(b.launchDate!).getTime());
  }, [projects]);

  // Status distribution
  const statusData = useMemo(() => {
    const statusCounts = {
      good: projects.filter(p => p.status === "good").length,
      warning: projects.filter(p => p.status === "warning").length,
      danger: projects.filter(p => p.status === "danger").length,
    };
    
    return [
      { name: "Tốt", value: statusCounts.good, color: "hsl(var(--success))" },
      { name: "Cảnh báo", value: statusCounts.warning, color: "hsl(var(--warning))" },
      { name: "Rủi ro", value: statusCounts.danger, color: "hsl(var(--destructive))" },
    ].filter(item => item.value > 0);
  }, [projects]);

  // Price comparison data
  const priceComparisonData = useMemo(() => {
    return projects
      .filter(p => p.launchPrice && p.currentPrice)
      .map(p => ({
        name: p.name.length > 12 ? p.name.substring(0, 12) + '...' : p.name,
        launch: p.launchPrice! / 1000000,
        current: p.currentPrice! / 1000000,
      }));
  }, [projects]);

  const formatCurrency = (value: number) => {
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}B`;
    }
    return `${value.toFixed(0)}M`;
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Key Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <Card className="card-elevated group hover:shadow-glow transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-caption text-muted-foreground">Tổng giá trị danh mục</p>
                <p className="text-2xl font-black text-primary">
                  {formatCurrency(portfolioMetrics.totalPortfolioValue / 1000000000)}
                </p>
              </div>
              <div className="p-3 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-colors">
                <DollarSign className="w-6 h-6 text-primary" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              {portfolioMetrics.avgROI > 0 ? (
                <TrendingUp className="w-4 h-4 text-success" />
              ) : (
                <TrendingDown className="w-4 h-4 text-destructive" />
              )}
              <span className="text-sm font-medium">
                {formatROIDisplay(portfolioMetrics.avgROI)} ROI TB
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="card-elevated group hover:shadow-glow transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-caption text-muted-foreground">Tỷ lệ bán hàng</p>
                <p className="text-2xl font-black text-success">
                  {portfolioMetrics.salesRate.toFixed(1)}%
                </p>
              </div>
              <div className="p-3 bg-success/10 rounded-xl group-hover:bg-success/20 transition-colors">
                <Target className="w-6 h-6 text-success" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              {portfolioMetrics.totalSoldUnits.toLocaleString()}/{portfolioMetrics.totalUnits.toLocaleString()} căn
            </p>
          </CardContent>
        </Card>

        <Card className="card-elevated group hover:shadow-glow transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-caption text-muted-foreground">Dự án đang triển khai</p>
                <p className="text-2xl font-black text-accent">
                  {portfolioMetrics.totalProjects}
                </p>
              </div>
              <div className="p-3 bg-accent/10 rounded-xl group-hover:bg-accent/20 transition-colors">
                <Building2 className="w-6 h-6 text-accent" />
              </div>
            </div>
            <div className="mt-4">
              <Badge variant="outline" className="text-xs">
                {developer.completedProjects} hoàn thành
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="card-elevated group hover:shadow-glow transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-caption text-muted-foreground">Điểm rủi ro</p>
                <p className="text-2xl font-black text-warning">
                  {developer.avgLegalScore}/10
                </p>
              </div>
              <div className="p-3 bg-warning/10 rounded-xl group-hover:bg-warning/20 transition-colors">
                <AlertTriangle className="w-6 h-6 text-warning" />
              </div>
            </div>
            <div className="mt-4">
              <Badge 
                variant={developer.avgLegalScore >= 8 ? "secondary" : developer.avgLegalScore >= 6 ? "outline" : "destructive"}
                className="text-xs"
              >
                {developer.avgLegalScore >= 8 ? "An toàn" : developer.avgLegalScore >= 6 ? "Trung bình" : "Rủi ro cao"}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* ROI Trend Chart */}
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-headline-3">
              <TrendingUp className="w-5 h-5 text-primary" />
              Xu hướng ROI theo dự án
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[250px] md:h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={roiTrendData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="name" 
                    className="text-xs"
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis className="text-xs" />
                  <ChartTooltip 
                    content={<ChartTooltipContent />}
                    formatter={(value: any) => [`${(value || 0).toFixed(1)}%`, "ROI"]}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="roi" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={3}
                    dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-headline-3">
              <AlertTriangle className="w-5 h-5 text-warning" />
              Phân bố trạng thái dự án
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[250px] md:h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Price Comparison Chart */}
      {priceComparisonData.length > 0 && (
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-headline-3">
              <DollarSign className="w-5 h-5 text-accent" />
              So sánh giá mở bán vs hiện tại
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[250px] md:h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={priceComparisonData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="name" 
                    className="text-xs"
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis 
                    className="text-xs"
                    tickFormatter={(value) => `${value}M`}
                  />
                  <ChartTooltip 
                    content={<ChartTooltipContent />}
                    formatter={(value: any, name: any) => [
                      `${(value || 0).toFixed(1)}M VNĐ/m²`, 
                      name === "launch" ? "Giá mở bán" : "Giá hiện tại"
                    ]}
                  />
                  <Legend />
                  <Bar dataKey="launch" fill="hsl(var(--warning))" name="Giá mở bán" />
                  <Bar dataKey="current" fill="hsl(var(--success))" name="Giá hiện tại" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
};