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
  CheckCircle2,
  XCircle,
  Star,
  Info
} from 'lucide-react';
import { formatCurrency } from '@/utils/formatCurrency';
import { useNavigate } from 'react-router-dom';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import SEO from '@/components/seo/SEO';

const Compare = () => {
  const { compareList, removeFromCompare, clearCompare } = useCompareStore();
  const navigate = useNavigate();

  if (compareList.length === 0) {
    return (
      <>
        <SEO
          title="So sánh dự án"
          description="So sánh chi tiết các dự án bất động sản"
        />
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
            <div className="text-center space-y-4">
              <Building2 className="h-20 w-20 mx-auto text-muted-foreground" />
              <h1 className="text-3xl font-bold">Chưa có dự án để so sánh</h1>
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
      <SEO
        title={`So sánh ${compareList.length} dự án`}
        description="So sánh chi tiết các dự án bất động sản về giá, vị trí, tiện ích"
      />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">
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

        <ScrollArea className="w-full">
          <div className="min-w-max">
            {/* Project Cards Row */}
            <div className="grid gap-4 mb-8" style={{ gridTemplateColumns: `repeat(${compareList.length}, 300px)` }}>
              {compareList.map((project) => (
                <Card key={project.id} className="relative">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 z-10"
                    onClick={() => removeFromCompare(project.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>

                  {project.imageUrl && (
                    <div className="h-48 overflow-hidden rounded-t-lg">
                      <img
                        src={project.imageUrl}
                        alt={project.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  <CardHeader>
                    <CardTitle className="text-lg line-clamp-2">
                      {project.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => navigate(`/projects/${project.id}`)}
                    >
                      Xem chi tiết
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Comparison Table */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  So sánh chi tiết
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  {comparisonFields.map((field) => {
                    const Icon = field.icon;

                    return (
                      <div key={field.key} className="grid" style={{ gridTemplateColumns: `200px repeat(${compareList.length}, 300px)` }}>
                        {/* Field Label */}
                        <div className="p-4 bg-muted/50 font-semibold flex items-center gap-2">
                          <Icon className="h-4 w-4 text-muted-foreground" />
                          {field.label}
                        </div>

                        {/* Values */}
                        {compareList.map((project) => {
                          const value = project[field.key];
                          const isWinner = field.highlight && field.key === 'pricePerSqm' && value === priceWinner && value > 0;

                          return (
                            <div
                              key={project.id}
                              className={`p-4 ${isWinner ? 'bg-green-50 dark:bg-green-950/20 font-semibold' : ''}`}
                            >
                              {field.renderBadge && value ? (
                                <Badge variant={value === 'Sổ đỏ' ? 'default' : 'secondary'}>
                                  {field.format(value)}
                                </Badge>
                              ) : (
                                <span className="flex items-center gap-2">
                                  {field.format(value)}
                                  {isWinner && <Star className="h-4 w-4 text-green-600 fill-current" />}
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Investment Comparison */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  So sánh đầu tư
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${compareList.length}, 1fr)` }}>
                  {compareList.map((project) => {
                    const totalPrice = project.pricePerSqm * (project.area || 70); // Assume 70m² if no area
                    const monthlyRent = totalPrice * 0.004; // Assume 4% annual yield / 12
                    const annualYield = 4.8; // Default yield

                    return (
                      <div key={project.id} className="space-y-3 p-4 bg-muted/50 rounded-lg">
                        <h4 className="font-semibold text-sm line-clamp-1">{project.name}</h4>

                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Tổng giá trị</span>
                            <span className="font-semibold">{formatCurrency(totalPrice)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Thu nhập thuê/tháng</span>
                            <span className="font-semibold text-green-600">
                              {formatCurrency(monthlyRent)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Lợi nhuận năm</span>
                            <span className="font-semibold">{annualYield}%</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>

        {/* Add more hint */}
        {compareList.length < 4 && (
          <Card className="mt-6 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900">
            <CardContent className="p-4 flex items-center gap-3">
              <Info className="h-5 w-5 text-blue-600" />
              <p className="text-sm">
                Bạn có thể thêm tối đa {4 - compareList.length} dự án nữa để so sánh
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
};

export default Compare;
