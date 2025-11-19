import { useCompareStore } from '@/stores/compareStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  X,
  ArrowRight,
  TrendingUp,
  Home,
  MapPin,
  Calendar,
  DollarSign,
  Building2,
  Award,
  Star,
  Info
} from 'lucide-react';
import { formatCurrency } from '@/utils/formatCurrency';
import { useNavigate } from 'react-router-dom';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import SEOHead from '@/components/seo/SEOHead';

const Compare = () => {
  const { compareList, removeFromCompare, clearCompare } = useCompareStore();
  const navigate = useNavigate();

  if (compareList.length === 0) {
    return (
      <>
        <SEOHead
          title="So sánh dự án"
          description="So sánh chi tiết các dự án bất động sản"
        />
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
            <div className="text-center space-y-4">
              <Building2 className="h-20 w-20 mx-auto text-muted-foreground/30" />
              <h1 className="text-3xl font-bold text-foreground">Chưa có dự án để so sánh</h1>
              <p className="text-muted-foreground max-w-md">
                Thêm tối đa 4 dự án để so sánh chi tiết về giá, vị trí, tiện ích và nhiều hơn nữa
              </p>
            </div>
            <Button onClick={() => navigate('/projects')} size="lg">
              <ArrowRight className="mr-2 h-5 w-5" />
              Khám phá dự án
            </Button>
          </div>
        </div>
      </>
    );
  }

  const comparisonFields = [
    {
      label: 'Giá/m²',
      key: 'pricePerSqm',
      icon: DollarSign,
      format: (val: any) => formatCurrency(val),
      highlight: true
    },
    {
      label: 'Vị trí',
      key: 'location',
      icon: MapPin,
      format: (val: any) => val
    },
    {
      label: 'Chủ đầu tư',
      key: 'developer',
      icon: Building2,
      format: (val: any) => val
    },
    {
      label: 'Loại hình',
      key: 'type',
      icon: Home,
      format: (val: any) => val || 'N/A'
    },
    {
      label: 'Tổng số căn',
      key: 'totalUnits',
      icon: Building2,
      format: (val: any) => val?.toLocaleString() || 'N/A'
    },
    {
      label: 'Hoàn thành',
      key: 'completionDate',
      icon: Calendar,
      format: (val: any) => val ? new Date(val).toLocaleDateString('vi-VN') : 'N/A'
    },
    {
      label: 'Diện tích',
      key: 'area',
      icon: Home,
      format: (val: any) => val ? `${val} m²` : 'N/A'
    },
    {
      label: 'Pháp lý',
      key: 'legalStatus',
      icon: Award,
      format: (val: any) => val || 'N/A',
      renderBadge: true
    },
  ];

  // Calculate winner for price (lowest wins)
  const getPriceWinner = () => {
    const prices = compareList.map(p => p.pricePerSqm).filter(p => p > 0);
    if (prices.length === 0) return null;
    return Math.min(...prices);
  };

  const priceWinner = getPriceWinner();

  return (
    <>
      <SEOHead
        title={`So sánh ${compareList.length} dự án`}
        description="So sánh chi tiết các dự án bất động sản về giá, vị trí, tiện ích"
      />

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2 text-foreground">
              So sánh dự án
            </h1>
            <p className="text-muted-foreground">
              Đang so sánh {compareList.length} dự án
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={clearCompare}>
              <X className="mr-2 h-4 w-4" />
              Xóa tất cả
            </Button>
            <Button onClick={() => navigate('/projects')}>
              <ArrowRight className="mr-2 h-4 w-4" />
              Thêm dự án
            </Button>
          </div>
        </div>

        <ScrollArea className="w-full border border-border rounded-xl bg-card shadow-sm">
          <div className="min-w-max">
            {/* Project Cards Row */}
            <div className="grid gap-0 divide-x divide-border bg-muted/30" style={{ gridTemplateColumns: `240px repeat(${compareList.length}, 300px)` }}>
              
              {/* Empty Corner Cell */}
              <div className="p-4 flex items-end pb-6">
                <span className="font-semibold text-muted-foreground">Dự án</span>
              </div>

              {compareList.map((project) => (
                <div key={project.id} className="relative p-4 pb-6 flex flex-col gap-4 bg-card">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 z-10 hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => removeFromCompare(project.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>

                  {project.imageUrl ? (
                    <div className="h-40 overflow-hidden rounded-lg border border-border">
                      <img
                        src={project.imageUrl}
                        alt={project.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                     <div className="h-40 bg-muted rounded-lg border border-border flex items-center justify-center">
                       <Building2 className="h-12 w-12 text-muted-foreground/30" />
                     </div>
                  )}

                  <div className="space-y-2">
                    <h3 className="text-lg font-bold line-clamp-2 leading-tight h-12 text-foreground">
                      {project.name}
                    </h3>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => navigate(`/projects/${project.id}`)}
                    >
                      Xem chi tiết
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Comparison Rows */}
            <div className="divide-y divide-border border-t border-border">
              {comparisonFields.map((field) => {
                const Icon = field.icon;

                return (
                  <div key={field.key} className="grid divide-x divide-border hover:bg-muted/20 transition-colors" style={{ gridTemplateColumns: `240px repeat(${compareList.length}, 300px)` }}>
                    {/* Field Label */}
                    <div className="p-4 font-medium text-muted-foreground flex items-center gap-2 bg-muted/5">
                      <Icon className="h-4 w-4" />
                      {field.label}
                    </div>

                    {/* Values */}
                    {compareList.map((project) => {
                      const value = project[field.key];
                      const isWinner = field.highlight && field.key === 'pricePerSqm' && value === priceWinner && value > 0;

                      return (
                        <div
                          key={project.id}
                          className={`p-4 flex items-center ${isWinner ? 'bg-green-50/50 dark:bg-green-950/10' : ''}`}
                        >
                          {field.renderBadge && value ? (
                            <Badge variant={value === 'Sổ đỏ' ? 'default' : 'secondary'}>
                              {field.format(value)}
                            </Badge>
                          ) : (
                            <span className={`text-sm flex items-center gap-2 ${isWinner ? 'font-bold text-green-600 dark:text-green-400' : 'text-foreground'}`}>
                              {field.format(value)}
                              {isWinner && <Star className="h-4 w-4 fill-current" />}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>

            {/* Investment Comparison Row */}
            <div className="grid divide-x divide-border border-t border-border" style={{ gridTemplateColumns: `240px repeat(${compareList.length}, 300px)` }}>
               <div className="p-4 font-medium text-muted-foreground flex items-center gap-2 bg-muted/5">
                 <DollarSign className="h-4 w-4" />
                 Phân tích đầu tư
               </div>

               {compareList.map((project) => {
                 const totalPrice = project.pricePerSqm * (project.area || 70);
                 const monthlyRent = totalPrice * 0.004; 

                 return (
                   <div key={project.id} className="p-4 bg-card">
                     <div className="p-3 bg-muted/30 rounded-lg space-y-2 border border-border">
                       <div className="flex justify-between text-xs">
                         <span className="text-muted-foreground">Tổng giá</span>
                         <span className="font-medium text-foreground">{formatCurrency(totalPrice)}</span>
                       </div>
                       <div className="flex justify-between text-xs">
                         <span className="text-muted-foreground">Thuê/tháng</span>
                         <span className="font-bold text-green-600">{formatCurrency(monthlyRent)}</span>
                       </div>
                     </div>
                   </div>
                 );
               })}
            </div>
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>

        {/* Add more hint */}
        {compareList.length < 4 && (
          <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg flex items-center gap-3 max-w-2xl mx-auto">
            <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <p className="text-sm text-blue-800 dark:text-blue-300">
              Mẹo: Bạn có thể thêm <strong>{4 - compareList.length}</strong> dự án nữa để so sánh toàn diện hơn.
            </p>
          </div>
        )}
      </div>
    </>
  );
};

export default Compare;