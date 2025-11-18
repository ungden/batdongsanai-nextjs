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
      case 'good': return 'text-emerald-600 bg-emerald-50';
      case 'warning': return 'text-amber-600 bg-amber-50';
      case 'danger': return 'text-red-600 bg-red-50';
      default: return 'text-slate-600 bg-slate-50';
    }
  };

  const colors = ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6'];

  return (
    <Card className="rounded-2xl shadow-lg border-0 bg-white">
      <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50/30 rounded-t-2xl border-b">
        <CardTitle className="flex items-center gap-2">
          <GitCompare className="w-5 h-5 text-primary" />
          So sánh với dự án tương tự
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {similarProjects.length === 0 ? (
          <div className="text-center py-12">
            <GitCompare className="w-16 h-16 mx-auto text-slate-300 mb-4" />
            <p className="text-slate-600">Không tìm thấy dự án tương tự để so sánh</p>
          </div>
        ) : (
          <>
            {/* Price Comparison Chart */}
            <div className="space-y-3">
              <h3 className="font-semibold text-slate-900">So sánh giá & điểm số</h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={priceComparisonData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis 
                      dataKey="name" 
                      stroke="#64748b" 
                      style={{ fontSize: '11px' }}
                      angle={-15}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis stroke="#64748b" style={{ fontSize: '12px' }} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: '2px solid #e2e8f0' }}
                      formatter={(value: number, name: string) => {
                        if (name === 'price') return [`${value.toFixed(1)}M VNĐ/m²`, 'Giá'];
                        if (name === 'legal') return [value, 'Điểm pháp lý'];
                        if (name === 'roi') return [`${value}%`, 'ROI'];
                        return value;
                      }}
                    />
                    <Legend />
                    <Bar dataKey="price" fill="#2563eb" name="Giá (triệu/m²)" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="legal" fill="#10b981" name="Điểm pháp lý" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="roi" fill="#f59e0b" name="ROI (%)" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Radar Chart - Multi-dimensional comparison */}
            <div className="space-y-3">
              <h3 className="font-semibold text-slate-900">Phân tích đa chiều</h3>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis 
                      dataKey="metric" 
                      stroke="#64748b"
                      style={{ fontSize: '12px' }}
                    />
                    <PolarRadiusAxis 
                      angle={90} 
                      domain={[0, 100]}
                      stroke="#64748b"
                      style={{ fontSize: '10px' }}
                    />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: '2px solid #e2e8f0' }}
                    />
                    <Legend />
                    {comparisonProjects.map((project, index) => (
                      <Radar
                        key={project.id}
                        name={project.name.length > 20 ? project.name.substring(0, 20) + '...' : project.name}
                        dataKey={project.name}
                        stroke={colors[index]}
                        fill={colors[index]}
                        fillOpacity={index === 0 ? 0.6 : 0.3}
                        strokeWidth={index === 0 ? 3 : 2}
                      />
                    ))}
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Detailed Comparison Table */}
            <div className="space-y-3">
              <h3 className="font-semibold text-slate-900">So sánh chi tiết</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-slate-200">
                      <th className="text-left p-3 text-sm font-semibold text-slate-700">Tiêu chí</th>
                      {comparisonProjects.map((project, index) => (
                        <th 
                          key={project.id} 
                          className={`text-center p-3 text-sm font-semibold ${
                            index === 0 ? 'text-primary bg-blue-50' : 'text-slate-700'
                          }`}
                        >
                          {project.name.length > 15 ? project.name.substring(0, 15) + '...' : project.name}
                          {index === 0 && (
                            <Badge className="ml-2 bg-primary text-white text-xs">Hiện tại</Badge>
                          )}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="p-3 text-sm font-medium text-slate-700">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-slate-500" />
                          Vị trí
                        </div>
                      </td>
                      {comparisonProjects.map((project, index) => (
                        <td key={project.id} className={`p-3 text-sm text-center ${index === 0 ? 'bg-blue-50/50' : ''}`}>
                          {project.district}
                        </td>
                      ))}
                    </tr>

                    <tr className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="p-3 text-sm font-medium text-slate-700">
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-slate-500" />
                          Giá/m²
                        </div>
                      </td>
                      {comparisonProjects.map((project, index) => (
                        <td key={project.id} className={`p-3 text-sm text-center font-semibold ${index === 0 ? 'bg-blue-50/50' : ''}`}>
                          {formatPrice(project.pricePerSqm)}
                        </td>
                      ))}
                    </tr>

                    <tr className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="p-3 text-sm font-medium text-slate-700">
                        <div className="flex items-center gap-2">
                          <Shield className="w-4 h-4 text-slate-500" />
                          Pháp lý
                        </div>
                      </td>
                      {comparisonProjects.map((project, index) => (
                        <td key={project.id} className={`p-3 text-sm text-center ${index === 0 ? 'bg-blue-50/50' : ''}`}>
                          <Badge className={getStatusColor(project.status)}>
                            {project.legalScore}/10
                          </Badge>
                        </td>
                      ))}
                    </tr>

                    <tr className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="p-3 text-sm font-medium text-slate-700">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-slate-500" />
                          ROI
                        </div>
                      </td>
                      {comparisonProjects.map((project, index) => (
                        <td key={project.id} className={`p-3 text-sm text-center font-semibold ${index === 0 ? 'bg-blue-50/50' : ''}`}>
                          {project.rentalYield ? `${project.rentalYield}%` : 'N/A'}
                        </td>
                      ))}
                    </tr>

                    <tr className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="p-3 text-sm font-medium text-slate-700">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-slate-500" />
                          Chủ đầu tư
                        </div>
                      </td>
                      {comparisonProjects.map((project, index) => (
                        <td key={project.id} className={`p-3 text-sm text-center ${index === 0 ? 'bg-blue-50/50' : ''}`}>
                          {project.developer}
                        </td>
                      ))}
                    </tr>

                    <tr className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="p-3 text-sm font-medium text-slate-700">Bàn giao</td>
                      {comparisonProjects.map((project, index) => (
                        <td key={project.id} className={`p-3 text-sm text-center ${index === 0 ? 'bg-blue-50/50' : ''}`}>
                          {project.completionDate}
                        </td>
                      ))}
                    </tr>

                    <tr className="hover:bg-slate-50">
                      <td className="p-3 text-sm font-medium text-slate-700">Cảnh báo</td>
                      {comparisonProjects.map((project, index) => (
                        <td key={project.id} className={`p-3 text-sm text-center ${index === 0 ? 'bg-blue-50/50' : ''}`}>
                          {project.warnings.length === 0 ? (
                            <CheckCircle className="w-5 h-5 text-emerald-600 mx-auto" />
                          ) : (
                            <div className="flex items-center justify-center gap-1">
                              <XCircle className="w-5 h-5 text-red-600" />
                              <span className="text-xs text-red-600">{project.warnings.length}</span>
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
              <h3 className="font-semibold text-slate-900">Xem chi tiết dự án tương tự</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {similarProjects.map(project => (
                  <Card 
                    key={project.id}
                    className="rounded-xl shadow-md border-0 hover:shadow-xl transition-all cursor-pointer overflow-hidden"
                    onClick={() => navigate(`/projects/${project.id}`)}
                  >
                    <div 
                      className="h-32 bg-cover bg-center"
                      style={{ backgroundImage: `url(${project.image})` }}
                    >
                      <div className="h-full bg-gradient-to-t from-black/60 to-transparent flex items-end p-3">
                        <h4 className="text-white font-bold text-sm">{project.name}</h4>
                      </div>
                    </div>
                    <CardContent className="p-4 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-600">{project.district}</span>
                        <Badge className={getStatusColor(project.status)}>
                          {project.legalScore}/10
                        </Badge>
                      </div>
                      <div className="text-sm font-bold text-primary">
                        {formatPrice(project.pricePerSqm)}/m²
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full rounded-lg text-xs"
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