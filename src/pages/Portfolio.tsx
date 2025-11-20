import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DesktopLayout from '@/components/layout/DesktopLayout';
import BottomNavigation from '@/components/layout/BottomNavigation';
import { useIsMobile } from '@/hooks/use-mobile';
import { usePortfolio } from '@/hooks/usePortfolio';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ProjectListSkeleton } from '@/components/ui/skeleton-card';
import { EmptyState } from '@/components/ui/empty-state';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChart,
  Plus,
  Trash2,
  Edit,
  Building2,
  Lock
} from 'lucide-react';
import { formatCurrency } from '@/utils/formatCurrency';

const Portfolio = () => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { portfolio, loading, totalValue, totalInvestment, totalROI, removeFromPortfolio } = usePortfolio();

  if (!user) {
    return (
      <DesktopLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 text-center animate-fade-in">
          <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center">
            <Lock className="w-12 h-12 text-primary" />
          </div>
          <div className="space-y-2 max-w-md">
            <h1 className="text-2xl font-bold">Đăng nhập để quản lý danh mục</h1>
            <p className="text-muted-foreground">
              Theo dõi hiệu quả đầu tư, quản lý tài sản và nhận phân tích chuyên sâu về danh mục bất động sản của bạn.
            </p>
          </div>
          <div className="flex gap-4">
            <Button onClick={() => navigate('/auth')} size="lg" className="px-8">
              Đăng nhập ngay
            </Button>
            <Button variant="outline" onClick={() => navigate('/market-overview')} size="lg">
              Khám phá thị trường
            </Button>
          </div>
        </div>
      </DesktopLayout>
    );
  }

  const content = (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Danh mục đầu tư</h1>
          <p className="text-muted-foreground mt-1">
            Theo dõi và quản lý danh mục bất động sản của bạn
          </p>
        </div>
        <Button onClick={() => navigate('/market-overview')}>
          <Plus className="h-4 w-4 mr-2" />
          Thêm dự án
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-card to-card/50 border-border/50 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tổng vốn đầu tư
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {formatCurrency(totalInvestment)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Trong {portfolio.length} tài sản
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-card to-card/50 border-border/50 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Giá trị thị trường
            </CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {formatCurrency(totalValue)}
            </div>
            <div className={`text-xs mt-1 flex items-center font-medium ${totalValue >= totalInvestment ? 'text-emerald-500' : 'text-destructive'}`}>
              {totalValue >= totalInvestment ? (
                <TrendingUp className="h-3 w-3 mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 mr-1" />
              )}
              {formatCurrency(Math.abs(totalValue - totalInvestment))}
              <span className="ml-1 opacity-80">
                ({((Math.abs(totalValue - totalInvestment) / (totalInvestment || 1)) * 100).toFixed(1)}%)
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-card to-card/50 border-border/50 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tỷ suất lợi nhuận (ROI)
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totalROI >= 0 ? 'text-emerald-500' : 'text-destructive'}`}>
              {totalROI >= 0 ? '+' : ''}{totalROI.toFixed(2)}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Hiệu suất trung bình
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Portfolio Items */}
      {loading ? (
        <ProjectListSkeleton count={3} />
      ) : portfolio.length === 0 ? (
        <EmptyState
          icon={<Building2 className="h-12 w-12 text-muted-foreground" />}
          title="Chưa có danh mục đầu tư"
          description="Bắt đầu xây dựng danh mục đầu tư của bạn bằng cách thêm các dự án bạn quan tâm hoặc đã sở hữu."
          action={{
            label: "Thêm dự án mới",
            onClick: () => navigate('/market-overview')
          }}
        />
      ) : (
        <div className="grid gap-4">
          {portfolio.map((item) => {
            const currentValue = item.current_value || item.purchase_price;
            const profit = (currentValue - item.purchase_price) * item.quantity;
            const roi = ((currentValue - item.purchase_price) / item.purchase_price) * 100;

            return (
              <Card key={item.id} className="group hover:shadow-md transition-all duration-300 border-border/60">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-primary/5 rounded-xl group-hover:bg-primary/10 transition-colors">
                          <Building2 className="h-8 w-8 text-primary/80" />
                        </div>
                        <div className="flex-1 space-y-1">
                          <h3
                            className="text-lg font-bold hover:text-primary cursor-pointer transition-colors"
                            onClick={() => navigate(`/projects/${item.project_id}`)}
                          >
                            {item.project_name}
                          </h3>
                          
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-2 text-sm mt-2">
                            <div className="flex flex-col">
                              <span className="text-muted-foreground text-xs">Giá mua vào</span>
                              <span className="font-medium">{formatCurrency(item.purchase_price)}</span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-muted-foreground text-xs">Số lượng</span>
                              <span className="font-medium">{item.quantity}</span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-muted-foreground text-xs">Ngày đầu tư</span>
                              <span className="font-medium">{new Date(item.purchase_date).toLocaleDateString('vi-VN')}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {item.notes && (
                        <div className="mt-4 ml-16 p-3 bg-muted/30 rounded-md text-sm text-muted-foreground italic">
                          "{item.notes}"
                        </div>
                      )}
                    </div>

                    <div className="flex flex-row md:flex-col items-center md:items-end justify-between gap-4 md:gap-1 min-w-[180px] pt-4 md:pt-0 border-t md:border-t-0">
                      <div className="text-right">
                        <div className="text-xs text-muted-foreground mb-0.5">Tổng giá trị hiện tại</div>
                        <div className="text-xl font-bold text-foreground">
                          {formatCurrency(currentValue * item.quantity)}
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end gap-1">
                        <div className={`flex items-center text-sm font-medium ${profit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                           {profit >= 0 ? '+' : ''}{formatCurrency(profit)}
                        </div>
                        <Badge variant={roi >= 0 ? "outline" : "destructive"} className={roi >= 0 ? "border-emerald-200 text-emerald-700 bg-emerald-50" : ""}>
                          ROI: {roi >= 0 ? '+' : ''}{roi.toFixed(2)}%
                        </Badge>
                      </div>

                      <div className="flex gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 hover:text-destructive hover:bg-destructive/10"
                          onClick={() => removeFromPortfolio(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );

  if (isMobile) {
    return (
      <div className="min-h-screen bg-background pb-20">
        {/* Mobile Header */}
        <div className="bg-background sticky top-0 z-10 border-b border-border/50 px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold">Danh mục</h1>
           <Button size="sm" variant="ghost" onClick={() => navigate('/market-overview')}>
            <Plus className="h-5 w-5" />
          </Button>
        </div>
        <div className="p-4">{content}</div>
        <BottomNavigation />
      </div>
    );
  }

  return <DesktopLayout>{content}</DesktopLayout>;
};

export default Portfolio;