"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Project } from "@/types/project";
import { projectsData } from "@/data/projectsData";
import { useNavigate } from "react-router-dom";
import { 
  GitCompare, 
  MapPin, 
  DollarSign, 
  Shield, 
  TrendingUp,
  Building2,
  CheckCircle,
  XCircle,
  ArrowRight
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from "recharts";

interface ProjectComparisonProps {
  currentProject: Project;
}

const ProjectComparison = ({ currentProject }: ProjectComparisonProps) => {
  const navigate = useNavigate();

  // Find similar projects (same city, similar price range)
  const similarProjects = projectsData
    .filter(p => 
      p.id !== currentProject.id && 
      p.city === currentProject.city &&
      Math.abs(p.pricePerSqm - currentProject.pricePerSqm) < currentProject.pricePerSqm * 0.5
    )
    .slice(0, 3);

  // Prepare comparison data
  const comparisonProjects = [currentProject, ...similarProjects];

  // Price comparison data
  const priceComparisonData = comparisonProjects.map(p => ({
    name: p.name.length > 20 ? p.name.substring(0, 20) + '...' : p.name,
    price: p.pricePerSqm / 1000000,
    legal: p.legalScore,
    roi: p.rentalYield || 0
  }));

  // Radar chart data for multi-dimensional comparison
  const radarData = [
    {
      metric: 'Giá cả',
      [currentProject.name]: normalizeScore(currentProject.pricePerSqm, 30000000, 120000000, true),
      ...similarProjects.reduce((acc, p) => ({
        ...acc,
        [p.name]: normalizeScore(p.pricePerSqm, 30000000, 120000000, true)
      }), {})
    },
    {
      metric: 'Pháp lý',
      [currentProject.name]: currentProject.legalScore * 10,
      ...similarProjects.reduce((acc, p) => ({
        ...acc,
        [p.name]: p.legalScore * 10
      }), {})
    },
    {
      metric: 'ROI',
      [currentProject.name]: (currentProject.rentalYield || 0) * 20,
      ...similarProjects.reduce((acc, p) => ({
        ...acc,
        [p.name]: (p.rentalYield || 0) * 20
      }), {})
    },
    {
      metric: 'Tiến độ',
      [currentProject.name]: currentProject.soldUnits && currentProject.totalUnits 
        ? (currentProject.soldUnits / currentProject.totalUnits) * 100
        : 50,
      ...similarProjects.reduce((acc, p) => ({
        ...acc,
        [p.name]: p.soldUnits && p.totalUnits ? (p.soldUnits / p.totalUnits) * 100 : 50
      }), {})
    },
    {
      metric: 'Vị trí',
      [currentProject.name]: getLocationScore(currentProject.district),
      ...similarProjects.reduce((acc, p) => ({
        ...acc,
        [p.name]: getLocationScore(p.district)
      }), {})
    }
  ];

  function normalizeScore(value: number, min: number, max: number, inverse: boolean = false): number {
    const normalized = ((value - min) / (max - min)) * 100;
    return inverse ? 100 - normalized : normalized;
  }

  function getLocationScore(district: string): number {
    const premiumDistricts = ['Quận 1', 'Quận 2', 'Quận 3', 'Quận 7', 'Quận Hoàn Kiếm', 'Quận Ba Đình'];
    const goodDistricts = ['Quận 9', 'Quận Bình Thạnh', 'Quận Thanh Xuân', 'Quận Hai Bà Trưng'];
    
    if (premiumDistricts.includes(district)) return 90;
    if (goodDistricts.includes(district)) return 70;
    return 50;
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0
    }).format(price);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-emerald-700 bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
      case 'warning': return 'text-amber-700 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800';
      case 'danger': return 'text-red-700 bg-red-100 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800';
      default: return 'text-slate-700 bg-slate-100 dark:bg-slate-800 dark:text-slate-300 border-slate-200';
    }
  };

  const colors = ['hsl(var(--primary))', '#10b981', '#f59e0b', '#8b5cf6'];

  return (
    <Card className="rounded-2xl shadow-lg border-0 bg-card">
      <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50/30 dark:from-slate-900/50 dark:to-blue-900/20 rounded-t-2xl border-b border-border/50">
        <CardTitle className="flex items-center gap-2 text-foreground">
          <GitCompare className="w-5 h-5 text-primary" />
          So sánh với dự án tương tự
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {similarProjects.length === 0 ? (
          <div className="text-center py-12">
            <GitCompare className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground">Không tìm thấy dự án tương tự để so sánh</p>
          </div>
        ) : (
          <>
            {/* Radar Chart - Multi-dimensional comparison */}
            <div className="space-y-3">
              <h3 className="font-semibold text-foreground">Phân tích đa chiều</h3>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="hsl(var(--border))" />
                    <PolarAngleAxis 
                      dataKey="metric" 
                      stroke="hsl(var(--muted-foreground))"
                      style={{ fontSize: '12px' }}
                    />
                    <PolarRadiusAxis 
                      angle={90} 
                      domain={[0, 100]}
                      stroke="hsl(var(--muted-foreground))"
                      style={{ fontSize: '10px' }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        borderRadius: '12px', 
                        border: '1px solid hsl(var(--border))',
                        backgroundColor: 'hsl(var(--card))',
                        color: 'hsl(var(--foreground))'
                      }}
                    />
                    <Legend wrapperStyle={{ color: 'hsl(var(--foreground))' }} />
                    {comparisonProjects.map((project, index) => (
                      <Radar
                        key={project.id}
                        name={project.name.length > 20 ? project.name.substring(0, 20) + '...' : project.name}
                        dataKey={project.name}
                        stroke={colors[index]}
                        fill={colors[index]}
                        fillOpacity={index === 0 ? 0.6 : 0.2}
                        strokeWidth={index === 0 ? 3 : 2}
                      />
                    ))}
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Detailed Comparison Table */}
            <div className="space-y-3">
              <h3 className="font-semibold text-foreground">So sánh chi tiết</h3>
              <div className="overflow-x-auto rounded-xl border border-border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/50 border-b border-border">
                      <th className="text-left p-4 font-semibold text-foreground min-w-[120px]">Tiêu chí</th>
                      {comparisonProjects.map((project, index) => (
                        <th 
                          key={project.id} 
                          className={`text-center p-4 font-semibold min-w-[160px] ${
                            index === 0 ? 'bg-primary/5 text-primary' : 'text-foreground'
                          }`}
                        >
                          {project.name.length > 15 ? project.name.substring(0, 15) + '...' : project.name}
                          {index === 0 && (
                            <Badge className="ml-2 bg-primary text-primary-foreground text-[10px] h-5 px-1.5">Hiện tại</Badge>
                          )}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    <tr className="hover:bg-muted/20 transition-colors">
                      <td className="p-4 font-medium text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          Vị trí
                        </div>
                      </td>
                      {comparisonProjects.map((project, index) => (
                        <td key={project.id} className={`p-4 text-center text-foreground ${index === 0 ? 'bg-primary/5 font-medium' : ''}`}>
                          {project.district}
                        </td>
                      ))}
                    </tr>

                    <tr className="hover:bg-muted/20 transition-colors">
                      <td className="p-4 font-medium text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4" />
                          Giá/m²
                        </div>
                      </td>
                      {comparisonProjects.map((project, index) => (
                        <td key={project.id} className={`p-4 text-center font-semibold ${index === 0 ? 'bg-primary/5 text-primary' : 'text-foreground'}`}>
                          {formatPrice(project.pricePerSqm)}
                        </td>
                      ))}
                    </tr>

                    <tr className="hover:bg-muted/20 transition-colors">
                      <td className="p-4 font-medium text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Shield className="w-4 h-4" />
                          Pháp lý
                        </div>
                      </td>
                      {comparisonProjects.map((project, index) => (
                        <td key={project.id} className={`p-4 text-center ${index === 0 ? 'bg-primary/5' : ''}`}>
                          <Badge variant="outline" className={`border ${getStatusColor(project.status)}`}>
                            {project.legalScore}/10
                          </Badge>
                        </td>
                      ))}
                    </tr>

                    <tr className="hover:bg-muted/20 transition-colors">
                      <td className="p-4 font-medium text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4" />
                          ROI
                        </div>
                      </td>
                      {comparisonProjects.map((project, index) => (
                        <td key={project.id} className={`p-4 text-center font-semibold ${index === 0 ? 'bg-primary/5' : ''}`}>
                          <span className={project.rentalYield ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"}>
                            {project.rentalYield ? `${project.rentalYield}%` : 'N/A'}
                          </span>
                        </td>
                      ))}
                    </tr>

                    <tr className="hover:bg-muted/20 transition-colors">
                      <td className="p-4 font-medium text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4" />
                          Chủ đầu tư
                        </div>
                      </td>
                      {comparisonProjects.map((project, index) => (
                        <td key={project.id} className={`p-4 text-center text-foreground ${index === 0 ? 'bg-primary/5' : ''}`}>
                          {project.developer}
                        </td>
                      ))}
                    </tr>

                    <tr className="hover:bg-muted/20 transition-colors">
                      <td className="p-4 font-medium text-muted-foreground">Cảnh báo</td>
                      {comparisonProjects.map((project, index) => (
                        <td key={project.id} className={`p-4 text-center ${index === 0 ? 'bg-primary/5' : ''}`}>
                          {project.warnings.length === 0 ? (
                            <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mx-auto" />
                          ) : (
                            <div className="flex items-center justify-center gap-1">
                              <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                              <span className="text-xs font-bold text-red-600 dark:text-red-400">{project.warnings.length}</span>
                            </div>
                          )}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Quick Links to Similar Projects */}
            <div className="space-y-3">
              <h3 className="font-semibold text-foreground">Xem chi tiết dự án tương tự</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {similarProjects.map(project => (
                  <Card 
                    key={project.id}
                    className="rounded-xl shadow-sm border border-border hover:shadow-md transition-all cursor-pointer overflow-hidden group"
                    onClick={() => navigate(`/projects/${project.id}`)}
                  >
                    <div 
                      className="h-28 bg-cover bg-center relative"
                      style={{ backgroundImage: `url(${project.image})` }}
                    >
                      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors" />
                      <div className="absolute inset-0 flex items-end p-3">
                        <h4 className="text-white font-bold text-sm line-clamp-1">{project.name}</h4>
                      </div>
                    </div>
                    <CardContent className="p-3 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground truncate max-w-[80px]">{project.district}</span>
                        <Badge variant="outline" className={`text-[10px] px-1.5 border ${getStatusColor(project.status)}`}>
                          {project.legalScore}/10
                        </Badge>
                      </div>
                      <div className="text-sm font-bold text-primary">
                        {formatPrice(project.pricePerSqm)}/m²
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="w-full h-8 text-xs mt-1 bg-muted/50 hover:bg-accent"
                      >
                        Xem chi tiết
                        <ArrowRight className="w-3 h-3 ml-1" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default ProjectComparison;