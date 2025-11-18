import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DesktopLayout from '@/components/layout/DesktopLayout';
import BottomNavigation from '@/components/layout/BottomNavigation';
import { useIsMobile } from '@/hooks/use-mobile';
import { usePortfolio } from '@/hooks/usePortfolio';
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
  Building2
} from 'lucide-react';
import { formatCurrency } from '@/utils/formatCurrency';

const Portfolio = () => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { portfolio, loading, totalValue, totalInvestment, totalROI, removeFromPortfolio } = usePortfolio();

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
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tổng đầu tư
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalInvestment)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {portfolio.length} dự án
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Giá trị hiện tại
            </CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalValue)}
            </div>
            <p className={`text-xs mt-1 flex items-center ${totalValue >= totalInvestment ? 'text-success' : 'text-destructive'}`}>
              {totalValue >= totalInvestment ? (
                <TrendingUp className="h-3 w-3 mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 mr-1" />
              )}
              {formatCurrency(Math.abs(totalValue - totalInvestment))}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              ROI
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totalROI >= 0 ? 'text-success' : 'text-destructive'}`}>
              {totalROI >= 0 ? '+' : ''}{totalROI.toFixed(2)}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Lợi nhuận trung bình
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
          title="Chưa có dự án trong danh mục"
          description="Thêm dự án vào danh mục đầu tư để theo dõi hiệu suất và ROI"
          action={{
            label: "Khám phá dự án",
            onClick: () => navigate('/market-overview')
          }}
        />
      ) : (
        <div className="grid gap-6">
          {portfolio.map((item) => {
            const currentValue = item.current_value || item.purchase_price;
            const profit = (currentValue - item.purchase_price) * item.quantity;
            const roi = ((currentValue - item.purchase_price) / item.purchase_price) * 100;

            return (
              <Card key={item.id} className="hover-lift">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-start gap-3">
                        <div className="p-3 bg-primary/10 rounded-xl">
                          <Building2 className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h3
                            className="text-xl font-semibold hover:text-primary cursor-pointer transition-colors"
                            onClick={() => navigate(`/projects/${item.project_id}`)}
                          >
                            {item.project_name}
                          </h3>
                          <div className="flex flex-wrap gap-4 mt-3 text-sm">
                            <div>
                              <span className="text-muted-foreground">Giá mua:</span>
                              <span className="font-semibold ml-1">
                                {formatCurrency(item.purchase_price)}
                              </span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Số lượng:</span>
                              <span className="font-semibold ml-1">{item.quantity}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Ngày mua:</span>
                              <span className="font-semibold ml-1">
                                {new Date(item.purchase_date).toLocaleDateString('vi-VN')}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {item.notes && (
                        <p className="text-sm text-muted-foreground mt-3 ml-14">
                          {item.notes}
                        </p>
                      )}
                    </div>

                    <div className="text-right space-y-2">
                      <div>
                        <div className="text-sm text-muted-foreground">Giá trị hiện tại</div>
                        <div className="text-xl font-bold">
                          {formatCurrency(currentValue * item.quantity)}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={profit >= 0 ? "default" : "destructive"}>
                          {profit >= 0 ? '+' : ''}{formatCurrency(profit)}
                        </Badge>
                        <Badge variant={roi >= 0 ? "default" : "destructive"}>
                          {roi >= 0 ? '+' : ''}{roi.toFixed(2)}%
                        </Badge>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFromPortfolio(item.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
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
        <div className="p-4">{content}</div>
        <BottomNavigation />
      </div>
    );
  }

  return <DesktopLayout>{content}</DesktopLayout>;
};

export default Portfolio;
